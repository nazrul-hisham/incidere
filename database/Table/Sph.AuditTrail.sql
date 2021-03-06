IF OBJECT_ID('Sph.AuditTrail', 'U') IS NOT NULL
  DROP TABLE Sph.AuditTrail
GO

CREATE TABLE Sph.AuditTrail
(
	[Id] VARCHAR(255) PRIMARY KEY NOT NULL
	,[Json] VARCHAR(MAX) NOT NULL
	,[User] VARCHAR(255) NULL
	,[DateTime] SMALLDATETIME NOT NULL DEFAULT GETDATE()
	,[Operation] VARCHAR(255) NULL
	,[Type] VARCHAR(255) NULL
	,[EntityId] VARCHAR(255) NULL
	,[CreatedDate] SMALLDATETIME NOT NULL DEFAULT GETDATE()
	,[CreatedBy] VARCHAR(255) NULL
	,[ChangedDate] SMALLDATETIME NOT NULL DEFAULT GETDATE()
	,[ChangedBy] VARCHAR(255) NULL
)
GO 
