Param(
       [string]$WorkingCopy = ".",
       [string]$ApplicationName = "",
       [string]$Port = 0,
       [string]$SqlServer = "Projects",
       [string]$RabbitMqUserName = "guest",
       [string]$RabbitMqPassword = "guest",
       [string]$RabbitMqBase = "",
       [string]$ElasticSearchHost = "http://localhost:9200",
       [string]$ElasticSearchUserName = "",
       [string]$ElasticSearchPassword = "",
	   [switch]$Help = $false
     )


if(($Help -eq $true) -or ($ApplicationName -eq ""))
{
	Write-Output "	A script to help to create new SPH appp in your working copy, `
	You'll need to provide the path to your working copy and the application name`
	"	
	
	exit;
}
$WorkingCopy = pwd
if($RabbitMqBase -ne ""){
    [Environment]::SetEnvironmentVariable("RABBITMQ_BASE", "$RabbitMqBase", "Process")
    if((Test-Path("$RabbitMqBase")) -eq $false)
    {
        mkdir "$RabbitMqBase"
    }
}

if(!(Get-Command sqllocaldb -ErrorAction SilentlyContinue))
{
    Write-Warning "Cannot find sqllocaldb  in your path"
    exit;
}


Write-Debug "Seting up Rx Developer- $ApplicationName project in $WorkingCopy"

Import-Module .\utils\sqlcmd.dll

if(!(Get-Command Invoke-WebRequest -ErrorAction SilentlyContinue))
{
    Write-Warning "You will need at least powershell version 3.0"
    exit;
}


if(!(Test-Path("C:\Windows\Microsoft.NET\Framework\v4.0.30319\aspnet_regsql.exe")))
{
    Write-Warning "Cannot find aspnet_regsql in your path, you may not have .Net 4.5.1 SDK installed"
    Start-Process "http://www.bespoke.com.my/download"
    exit;
}


#verify the tools are in the path
if(!(Test-Path(".\rabbitmq_server\sbin\rabbitmqctl.bat")))
{
    Write-Warning "Cannot find rabbitmqctl"
    exit;
}
Try
{
   & SqlLocalDB create "$SqlServer"
   Invoke-SqlCmdRx -E -S "(localdb)\$SqlServer" -Q "SELECT * FROM sysdatabases"
}
Catch
{
    Write-Warning "Cannot cannot to $SqlServer , Please make sure the server instance is correct and trusted connection can be used"
    exit;
}


if($Port -eq 0)
{
	Write-Warning "Please provide a port no for your web app"	
	exit;
}
if($ApplicationName -eq "Dev")
{
	Write-Warning "Please provide a different name, Dev is a reserved keyword"	
	exit;
}

#remove all the configs from subscribers
ls -Path .\subscribers -Filter *.config | Remove-Item




if((Test-Path("$WorkingCopy\StartAspnetAdminWeb.bat")) -eq $false)
{
    $c0 = (gc "$WorkingCopy\StartAspnetAdminWeb.bat").replace("WorkingCopyPath","$WorkingCopy\web")
    Set-Content "$WorkingCopy\StartAspnetAdminWeb.bat" -Value $c0
}



#creates databases
Write-Debug "Creating database $ApplicationName"
Invoke-SqlCmdRx -S "(localdb)\$SqlServer" -E -d master -Q "IF  EXISTS (
	SELECT name 
		FROM sys.databases 
		WHERE name = N'$ApplicationName'
)
DROP DATABASE [$ApplicationName]"

Invoke-SqlCmdRx -S "(localdb)\$SqlServer" -E -d master -Q "CREATE DATABASE [$ApplicationName]"
Write-Debug "Created database $ApplicationName"
#Start-Sleep -Seconds 10
Invoke-SqlCmdRx -S "(localdb)\$SqlServer" -E -d "$ApplicationName" -Q "CREATE SCHEMA [Sph] AUTHORIZATION [dbo]"
Invoke-SqlCmdRx -S "(localdb)\$SqlServer" -E -d "$ApplicationName" -Q "CREATE SCHEMA [$ApplicationName] AUTHORIZATION [dbo]"
Write-Debug "Created schema [SPH]"

Get-ChildItem -Filter *.sql -Path $WorkingCopy\database\Table `
| %{
    Write-Debug "Creating table $_"
    $sqlFileName = $_.FullName    
    Invoke-SqlCmdRx -S "(localdb)\$SqlServer" -E -d "$ApplicationName" -i "$sqlFileName"
}


#Rabbitmqctl
& .\rabbitmq_server\sbin\rabbitmqctl.bat add_vhost "$ApplicationName"
& .\rabbitmq_server\sbin\rabbitmqctl.bat set_permissions -p "$ApplicationName" $RabbitMqUserName ".*" ".*" ".*"
& .\rabbitmq_server\sbin\rabbitmq-plugins.bat enable "rabbitmq_management"

#elastic search mappings
$esindex = $ElasticSearchHost + "/" + $ApplicationName.ToLowerInvariant() + "_sys"
Invoke-WebRequest -Method Put -Body "" -Uri $esindex  -ContentType "application/javascript"

Get-ChildItem -Filter *.json -Path .\database\mapping `
| %{
    $mappingUri = $esindex + "/" + $_.Name.ToLowerInvariant().Replace(".json", "") + "/_mapping"
    Write-Debug "Creating elastic search mapping for $mappingUri"
    Invoke-WebRequest -Method PUT -Uri $mappingUri -InFile $_.FullName -ContentType "application/javascript"
}


#configs value
$allConfigs = @("$WorkingCopy\web\web.config"
, "$WorkingCopy\schedulers\scheduler.delayactivity.exe.config"
, "$WorkingCopy\schedulers\scheduler.workflow.trigger.exe.config"
, "$WorkingCopy\subscribers.host\workers.console.runner.exe.config"
, "$WorkingCopy\subscribers.host\workers.windowsservice.runner.exe.config"
, "$WorkingCopy\tools\sph.builder.exe.config"
)

foreach($configFile in $allConfigs){
    Write-Debug "Processing $configFile"

    $xml = (Get-Content $configFile) -as [xml]

    $xml.SelectSingleNode('//appSettings/add[@key="sph:BaseUrl"]/@value').'#text' = 'http://localhost:' + $Port
    $xml.SelectSingleNode('//appSettings/add[@key="sph:BaseDirectory"]/@value').'#text' = $WorkingCopy
    $xml.SelectSingleNode('//appSettings/add[@key="sph:ApplicationName"]/@value').'#text' = $ApplicationName
    $xml.SelectSingleNode('//appSettings/add[@key="sph:ApplicationFullName"]/@value').'#text' = $ApplicationName

    $connectionString = 'Data Source=(localdb)\' + $SqlServer +';Initial Catalog='+ $ApplicationName +';Integrated Security=True;Connect Timeout=30;Encrypt=False;TrustServerCertificate=False'

    $xml.SelectSingleNode('//connectionStrings/add[@name="Sph"]/@connectionString').'#text' = $connectionString

    $nsmgr = New-Object System.Xml.XmlNamespaceManager($xml.NameTable)
    $nsmgr.AddNamespace("sp", "http://www.springframework.net")
    Write-Debug $nsmgr

    $xml.DocumentElement.SelectSingleNode('/configuration/spring/sp:objects/sp:object[@name="IBrokerConnection"]/sp:property[@name="VirtualHost"]/@value', $nsmgr).'#text' = $ApplicationName
    $xml.DocumentElement.SelectSingleNode('/configuration/spring/sp:objects/sp:object[@name="IBrokerConnection"]/sp:property[@name="UserName"]/@value', $nsmgr).'#text' = $RabbitMqUserName
    $xml.DocumentElement.SelectSingleNode('/configuration/spring/sp:objects/sp:object[@name="IBrokerConnection"]/sp:property[@name="Password"]/@value', $nsmgr).'#text' = $RabbitMqPassword
    $xml.DocumentElement.SelectSingleNode('/configuration/spring/sp:objects/sp:object[@name="IPersistence"]/sp:constructor-arg[@name="connectionString"]/@value', $nsmgr).'#text' = $connectionString
    
    Try{
        $taskscheduler = $WorkingCopy   + "\schedulers\scheduler.delayactivity.exe"  
        $xml.SelectSingleNode('//spring/objects/object[@name="ITaskScheduler"]/constructor-arg[@name="executable"]/@value').'#text' = $taskscheduler
    }Catch{}
    $xml.Save($configFile)
}
#set the IIS config
$apc = (Get-Content .\config\applicationhost.config) -as [xml]
$site = $apc.SelectSingleNode("//configuration/system.applicationHost/sites/site[@id=1]")
$site.SetAttribute("name", "web.$ApplicationName")
$site.SelectSingleNode("application/virtualDirectory").SetAttribute("physicalPath", "$WorkingCopy\web")
$bindingInformation = "*:" + $Port.ToString() + ":localhost"
$site.SelectSingleNode("bindings/binding").SetAttribute("bindingInformation","$bindingInformation")
$apc.Save("$WorkingCopy\config\applicationhost.config")



#asp.net memberships
Write-Debug "Executing Aspnet membership provider"
Start-Process -RedirectStandardOutput "v1.log" -Wait -WindowStyle Hidden -FilePath "C:\Windows\Microsoft.NET\Framework\v4.0.30319\aspnet_regsql.exe" `
-ArgumentList  @("-E","-S",'"(localdb)\' + $SqlServer+ '"',"-d " + $ApplicationName,"-A mr")


Write-Debug "Aspnet membership has been added"
Write-Debug "Please wait....."

#roles
& .\utils\mru.exe -r administrators -r developers -r can_edit_entity -r can_edit_workflow -c "$WorkingCopy\web\web.config"
& .\utils\mru.exe -u admin -p 123456 -e admin@$ApplicationName.com -r administrators -r developers -r can_edit_entity -r can_edit_workflow -c "$WorkingCopy\web\web.config"



#delete all accidentally added config
$rubbishConfigs = @("$WorkingCopy\subscribers\subscriber.workflow.dll.config"
,"$WorkingCopy\schedulers\scheduler.delayactivity.config"
,"$WorkingCopy\schedulers\razor.template.dll.config"
,"$WorkingCopy\schedulers\scheduler.workflow.trigger.config"
,"$WorkingCopy\schedulers\sql.repository.dll.config"
,"$WorkingCopy\subscribers\razor.template.dll.config"
,"$WorkingCopy\subscribers\sql.repository.dll.config"
)
foreach($ucon in $rubbishConfigs)
{
    if((Test-Path $ucon) -eq $true){
        Remove-Item $ucon
    }
}