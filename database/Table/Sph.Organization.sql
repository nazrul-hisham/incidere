
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[Sph].[Organization]') AND type in (N'U'))
DROP TABLE [Sph].[Organization]
GO



 CREATE TABLE [Sph].[Organization]
(
	[Id] VARCHAR(255) PRIMARY KEY NOT NULL
	,[Name] VARCHAR(255) NOT NULL
	,[IdSsmNo] VARCHAR(255) NULL
	,[RegistrationNo] VARCHAR(255) NULL
	,[Json] VARCHAR(MAX) NOT NULL
	,[CreatedDate] SMALLDATETIME NOT NULL DEFAULT GETDATE()
	,[CreatedBy] VARCHAR(255) NULL
	,[ChangedDate] SMALLDATETIME NOT NULL DEFAULT GETDATE()
	,[ChangedBy] VARCHAR(255) NULL

)
