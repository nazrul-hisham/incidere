 -- =============================================
-- Create database template
-- =============================================
USE master
GO

-- Drop the database if it already exists
IF  EXISTS (
	SELECT name 
		FROM sys.databases 
		WHERE name = N'DevV1'
)
DROP DATABASE DevV1
GO

CREATE DATABASE [DevV1]
ON
PRIMARY  
    (NAME = Arch1,
    FILENAME = 'c:\data\devv1.mdf',
    SIZE = 100MB,
    MAXSIZE = 200,
    FILEGROWTH = 20),
    ( NAME = Arch2,
    FILENAME = 'c:\data\devv1_2.ndf',
    SIZE = 100MB,
    MAXSIZE = 200,
    FILEGROWTH = 20),
    ( NAME = Arch3,
    FILENAME = 'c:\data\devv1_3.ndf',
    SIZE = 100MB,
    MAXSIZE = 200,
    FILEGROWTH = 20)
LOG ON 
   (NAME = Archlog1,
    FILENAME = 'c:\data\devv1_log1.ldf',
    SIZE = 100MB,
    MAXSIZE = 200,
    FILEGROWTH = 20),
   (NAME = Archlog2,
    FILENAME = 'c:\data\devv1_log2.ldf',
    SIZE = 100MB,
    MAXSIZE = 200,
    FILEGROWTH = 20) ;
GO
