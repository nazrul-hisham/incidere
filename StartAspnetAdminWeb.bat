start "C:\Program Files\Internet Explorer\iexplore.exe" "http://localhost:4437/asp.netwebadminfiles/default.aspx?applicationPhysicalPath=workingcopy-web&applicationUrl=/"
"C:\Program Files (x86)\IIS Express\iisexpress.exe" /path:"C:\Windows\Microsoft.NET\Framework\v4.0.30319\ASP.NETWebAdminFiles" /vpath:"/ASP.NETWebAdminFiles" /port:4437 /clr:"4.0" /ntlm
@rem ” using the following values for the [param]:
@rem [port] – any port you have free in IISExpress (I use 8082 in the example below)
@rem This should launch an IISExpress instance of the Configuration Manager Site<br/>clip_image002
@rem Open your browser
@rem In the URL enter the following “http://localhost:8082/asp.netwebadminfiles/default.aspx?applicationPhysicalPath=[appPath]&applicationUrl=/” substituting the [appPath] with the absolute path to the Visual Studio Project folder with the solution file in it.
