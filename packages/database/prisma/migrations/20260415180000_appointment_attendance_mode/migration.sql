-- CreateEnum
CREATE TYPE "AppointmentAttendance" AS ENUM ('IN_PERSON', 'ONLINE');

-- AlterTable
ALTER TABLE "appointments" ADD COLUMN "attendance_mode" "AppointmentAttendance";
