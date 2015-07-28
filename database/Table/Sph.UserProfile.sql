
IF OBJECT_ID('Sph.UserProfile', 'U') IS NOT NULL
  DROP TABLE [Sph].[UserProfile]

CREATE TABLE [Sph].[UserProfile](
	
	[Id] VARCHAR(255) PRIMARY KEY NOT NULL,
	[UserName] VARCHAR(50) NOT NULL,
	[FullName] VARCHAR(100) NULL,
	[Designation] VARCHAR(50) NULL,
	[Department] VARCHAR(50) NULL,
	[Email] VARCHAR(50) NULL,
	[Json] VARCHAR(MAX) NOT NULL,
	[ChangedDate] SMALLDATETIME NOT NULL,
	[ChangedBy] VARCHAR(50) NOT NULL,
	[CreatedDate] SMALLDATETIME NOT NULL,
	[CreatedBy] VARCHAR(50) NOT NULL,
)

GO
INSERT INTO [Sph].[UserProfile] ([Id], [UserName], [FullName], [Designation], [Department], [Email], [Json], [ChangedDate], [ChangedBy], [CreatedDate], [CreatedBy]) 
VALUES (N'admin', N'admin', N'admin', NULL, NULL, N'admin@yourcompany.com', N'{"$type":"Bespoke.Sph.Domain.UserProfile, domain.sph","UserName":"admin","FullName":"admin","Designation":null,"Telephone":"-","Mobile":"-","RoleTypes":null,"StartModule":"dev.home","Email":"admin@yourcompany.com","Department":null,"HasChangedDefaultPassword":false,"IsLockedOut":false,"CreatedBy":null,"Id":"admin","CreatedDate":"2015-01-01T00:00:00","ChangedBy":"admin","ChangedDate":"2015-01-30T06:54:55.1305243+08:00","WebId":"12dcc69c-d00b-4160-939d-23b974f6dcc7"}', N'2015-01-30 06:55:00', N'admin', N'2015-01-30 06:55:00', N'admin')

