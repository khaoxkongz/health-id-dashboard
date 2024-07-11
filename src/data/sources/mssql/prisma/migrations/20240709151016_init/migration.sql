BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[regions] (
    [id] VARCHAR(10) NOT NULL,
    [name] NVARCHAR(100) NOT NULL,
    CONSTRAINT [regions_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[provinces] (
    [id] VARCHAR(10) NOT NULL,
    [name_th] NVARCHAR(100) NOT NULL,
    [name_en] VARCHAR(100) NOT NULL,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [provinces_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL,
    [deleted_at] DATETIME2,
    [regionId] VARCHAR(10) NOT NULL,
    CONSTRAINT [provinces_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[districts] (
    [id] VARCHAR(10) NOT NULL,
    [name_th] NVARCHAR(100) NOT NULL,
    [name_en] VARCHAR(100) NOT NULL,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [districts_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL,
    [deleted_at] DATETIME2,
    [provinceId] VARCHAR(10) NOT NULL,
    CONSTRAINT [districts_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[subdistricts] (
    [id] VARCHAR(10) NOT NULL,
    [zipcode] VARCHAR(5) NOT NULL,
    [name_th] NVARCHAR(100) NOT NULL,
    [name_en] VARCHAR(100) NOT NULL,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [subdistricts_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL,
    [deleted_at] DATETIME2,
    [districtId] VARCHAR(10) NOT NULL,
    CONSTRAINT [subdistricts_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[health_id_dashboards] (
    [id] INT NOT NULL IDENTITY(1,1),
    [organization_code] VARCHAR(20) NOT NULL,
    [organization_name] NVARCHAR(255),
    [department_health] NVARCHAR(100),
    [service_area_health] NVARCHAR(100),
    [office_type_health] NVARCHAR(100),
    [affiliation_health] NVARCHAR(100),
    [created_at] DATETIME2 NOT NULL CONSTRAINT [health_id_dashboards_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL,
    [deleted_at] DATETIME2,
    [subdistrictId] VARCHAR(10),
    [ial_status] NVARCHAR(50),
    [count_ial] INT,
    [ekyc_confirm_token_count] INT,
    [is_moph_personnel] BIT,
    [offset_unit_ten_thousand_idp] INT,
    [offset_unit_ten_thousand_ial] INT,
    [total_population] INT,
    [date_cutoff] DATETIME2,
    [week_no] INT,
    [time_date_cutoff] TIME,
    CONSTRAINT [health_id_dashboards_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[provinces] ADD CONSTRAINT [provinces_regionId_fkey] FOREIGN KEY ([regionId]) REFERENCES [dbo].[regions]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[districts] ADD CONSTRAINT [districts_provinceId_fkey] FOREIGN KEY ([provinceId]) REFERENCES [dbo].[provinces]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[subdistricts] ADD CONSTRAINT [subdistricts_districtId_fkey] FOREIGN KEY ([districtId]) REFERENCES [dbo].[districts]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[health_id_dashboards] ADD CONSTRAINT [health_id_dashboards_subdistrictId_fkey] FOREIGN KEY ([subdistrictId]) REFERENCES [dbo].[subdistricts]([id]) ON DELETE SET NULL ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
