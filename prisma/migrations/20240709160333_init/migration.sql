/*
  Warnings:

  - You are about to alter the column `date_cutoff` on the `health_id_dashboards` table. The data in that column could be lost. The data in that column will be cast from `DateTime2` to `Time`.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[health_id_dashboards] ALTER COLUMN [date_cutoff] TIME NULL;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
