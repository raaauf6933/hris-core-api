-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('Male', 'Female');

-- CreateEnum
CREATE TYPE "CivilStatus" AS ENUM ('Single', 'Married', 'Widowed', 'Separated', 'Annulled');

-- CreateEnum
CREATE TYPE "EmploymentStatus" AS ENUM ('Active', 'OnLeave', 'Suspended', 'Resigned', 'Terminated', 'Retired');

-- CreateEnum
CREATE TYPE "AddressType" AS ENUM ('Permanent', 'Current');

-- CreateEnum
CREATE TYPE "EducationLevel" AS ENUM ('Elementary', 'HighSchool', 'Vocational', 'Associate', 'Bachelors', 'Masters', 'Doctorate');

-- CreateEnum
CREATE TYPE "RelationshipType" AS ENUM ('Spouse', 'Parent', 'Sibling', 'Child', 'Friend', 'Other');

-- CreateEnum
CREATE TYPE "ProficiencyLevel" AS ENUM ('Beginner', 'Intermediate', 'Advanced', 'Expert');

-- CreateEnum
CREATE TYPE "LeaveStatus" AS ENUM ('Pending', 'Approved', 'Rejected', 'Cancelled', 'Withdrawn');

-- CreateEnum
CREATE TYPE "LeaveApplicableTo" AS ENUM ('All', 'Male', 'Female', 'MarriedMale', 'SoloParent');

-- CreateEnum
CREATE TYPE "HalfDayPeriod" AS ENUM ('AM', 'PM');

-- CreateEnum
CREATE TYPE "HolidayType" AS ENUM ('Regular', 'SpecialNonWorking', 'SpecialWorking');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('Present', 'Absent', 'Late', 'HalfDay', 'OnLeave', 'Holiday', 'RestDay');

-- CreateEnum
CREATE TYPE "AttendanceSource" AS ENUM ('Biometric', 'Manual', 'Mobile', 'Web');

-- CreateEnum
CREATE TYPE "AdjustmentType" AS ENUM ('TimeIn', 'TimeOut', 'StatusChange', 'AddRecord');

-- CreateEnum
CREATE TYPE "AdjustmentStatus" AS ENUM ('Pending', 'Approved', 'Rejected');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('Active', 'Expired', 'Archived');

-- CreateEnum
CREATE TYPE "BenefitType" AS ENUM ('SSS', 'PhilHealth', 'PagIBIG', 'HMO', 'Insurance', 'Retirement');

-- CreateEnum
CREATE TYPE "ContributionTableType" AS ENUM ('SSS', 'PhilHealth', 'PagIBIG');

-- CreateEnum
CREATE TYPE "PayrollPeriodType" AS ENUM ('SemiMonthly', 'Monthly', 'Weekly');

-- CreateEnum
CREATE TYPE "PayrollPeriodStatus" AS ENUM ('Open', 'Processing', 'Completed', 'Closed');

-- CreateEnum
CREATE TYPE "PayslipStatus" AS ENUM ('Draft', 'Final', 'Cancelled');

-- CreateEnum
CREATE TYPE "PayslipItemType" AS ENUM ('Earning', 'Deduction');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('Info', 'Success', 'Warning', 'Error');

-- CreateEnum
CREATE TYPE "OvertimeStatus" AS ENUM ('Pending', 'Approved', 'Rejected');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "employeeId" UUID,
    "username" VARCHAR(50) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "passwordHash" VARCHAR(255) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "lockedUntil" TIMESTAMPTZ,
    "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
    "passwordChangedAt" TIMESTAMPTZ,
    "requirePasswordChange" BOOLEAN NOT NULL DEFAULT false,
    "lastLoginAt" TIMESTAMPTZ,
    "lastLoginIp" VARCHAR(45),
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "deletedAt" TIMESTAMPTZ,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" UUID NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "description" VARCHAR(255),
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" UUID NOT NULL,
    "module" VARCHAR(50) NOT NULL,
    "action" VARCHAR(50) NOT NULL,
    "description" VARCHAR(255),

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "roleId" UUID NOT NULL,
    "permissionId" UUID NOT NULL,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("roleId","permissionId")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "userId" UUID NOT NULL,
    "roleId" UUID NOT NULL,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("userId","roleId")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "tokenHash" VARCHAR(255) NOT NULL,
    "expiresAt" TIMESTAMPTZ NOT NULL,
    "revokedAt" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "tokenHash" VARCHAR(255) NOT NULL,
    "expiresAt" TIMESTAMPTZ NOT NULL,
    "usedAt" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employment_types" (
    "id" UUID NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "description" VARCHAR(255),

    CONSTRAINT "employment_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employees" (
    "id" UUID NOT NULL,
    "employeeCode" VARCHAR(20) NOT NULL,
    "firstName" VARCHAR(100) NOT NULL,
    "middleName" VARCHAR(100),
    "lastName" VARCHAR(100) NOT NULL,
    "nameExtension" VARCHAR(10),
    "birthDate" DATE NOT NULL,
    "birthPlace" VARCHAR(255),
    "gender" "Gender" NOT NULL,
    "civilStatus" "CivilStatus" NOT NULL,
    "nationality" VARCHAR(50) NOT NULL DEFAULT 'Filipino',
    "religion" VARCHAR(50),
    "bloodType" VARCHAR(5),
    "photoUrl" VARCHAR(500),
    "personalEmail" VARCHAR(255),
    "mobileNumber" VARCHAR(20),
    "homePhone" VARCHAR(20),
    "dateHired" DATE NOT NULL,
    "dateRegularized" DATE,
    "dateResigned" DATE,
    "dateTerminated" DATE,
    "employmentTypeId" UUID NOT NULL,
    "employmentStatus" "EmploymentStatus" NOT NULL DEFAULT 'Active',
    "departmentId" UUID,
    "managerId" UUID,
    "reportsToId" UUID,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "deletedAt" TIMESTAMPTZ,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_addresses" (
    "id" UUID NOT NULL,
    "employeeId" UUID NOT NULL,
    "type" "AddressType" NOT NULL,
    "street" VARCHAR(255),
    "barangay" VARCHAR(100),
    "cityMunicipality" VARCHAR(100),
    "province" VARCHAR(100),
    "region" VARCHAR(100),
    "zipCode" VARCHAR(4),
    "country" VARCHAR(50) NOT NULL DEFAULT 'Philippines',
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "employee_addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_government_ids" (
    "id" UUID NOT NULL,
    "employeeId" UUID NOT NULL,
    "sssNumber" VARCHAR(20),
    "philhealthNumber" VARCHAR(20),
    "pagibigNumber" VARCHAR(20),
    "tin" VARCHAR(20),
    "umidNumber" VARCHAR(20),
    "passportNumber" VARCHAR(30),
    "driverLicenseNumber" VARCHAR(30),
    "voterId" VARCHAR(30),
    "prcLicenseNumber" VARCHAR(30),
    "taxStatusCode" VARCHAR(10),

    CONSTRAINT "employee_government_ids_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_emergency_contacts" (
    "id" UUID NOT NULL,
    "employeeId" UUID NOT NULL,
    "fullName" VARCHAR(200) NOT NULL,
    "relationship" VARCHAR(50) NOT NULL,
    "mobileNumber" VARCHAR(20) NOT NULL,
    "homePhone" VARCHAR(20),
    "email" VARCHAR(255),
    "address" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "employee_emergency_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_education" (
    "id" UUID NOT NULL,
    "employeeId" UUID NOT NULL,
    "level" "EducationLevel" NOT NULL,
    "schoolName" VARCHAR(255) NOT NULL,
    "degreeCourse" VARCHAR(255) NOT NULL,
    "yearStarted" INTEGER,
    "yearGraduated" INTEGER,
    "honors" VARCHAR(255),

    CONSTRAINT "employee_education_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_dependents" (
    "id" UUID NOT NULL,
    "employeeId" UUID NOT NULL,
    "fullName" VARCHAR(200) NOT NULL,
    "relationship" VARCHAR(50) NOT NULL,
    "birthDate" DATE NOT NULL,
    "isQualifiedDependent" BOOLEAN NOT NULL DEFAULT false,
    "isDisabled" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "employee_dependents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_work_history" (
    "id" UUID NOT NULL,
    "employeeId" UUID NOT NULL,
    "companyName" VARCHAR(255) NOT NULL,
    "position" VARCHAR(150) NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "reasonForLeaving" VARCHAR(255),
    "referenceName" VARCHAR(200),
    "referenceContact" VARCHAR(20),

    CONSTRAINT "employee_work_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_skills" (
    "id" UUID NOT NULL,
    "employeeId" UUID NOT NULL,
    "skillName" VARCHAR(100) NOT NULL,
    "proficiency" "ProficiencyLevel" NOT NULL,
    "yearsExperience" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "employee_skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_certifications" (
    "id" UUID NOT NULL,
    "employeeId" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "issuingOrganization" VARCHAR(255) NOT NULL,
    "dateObtained" DATE NOT NULL,
    "expiryDate" DATE,

    CONSTRAINT "employee_certifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departments" (
    "id" UUID NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "description" TEXT,
    "parentDepartmentId" UUID,
    "managerId" UUID,
    "costCenterCode" VARCHAR(20),
    "budget" DECIMAL(15,2),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "deletedAt" TIMESTAMPTZ,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "positions" (
    "id" UUID NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "departmentId" UUID,
    "salaryGradeId" UUID,
    "minSalary" DECIMAL(12,2),
    "maxSalary" DECIMAL(12,2),
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "positions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_positions" (
    "id" UUID NOT NULL,
    "employeeId" UUID NOT NULL,
    "positionId" UUID NOT NULL,
    "departmentId" UUID NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE,
    "isPrimary" BOOLEAN NOT NULL DEFAULT true,
    "changeReason" VARCHAR(255),
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "employee_positions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "salary_grades" (
    "id" UUID NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "step" INTEGER NOT NULL,
    "monthlyMin" DECIMAL(12,2) NOT NULL,
    "monthlyMax" DECIMAL(12,2) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "salary_grades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leave_types" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "isPaid" BOOLEAN NOT NULL DEFAULT true,
    "defaultDaysPerYear" DECIMAL(4,1) NOT NULL,
    "maxCarryoverDays" DECIMAL(4,1) NOT NULL DEFAULT 0,
    "requiresAttachment" BOOLEAN NOT NULL DEFAULT false,
    "applicableTo" "LeaveApplicableTo" NOT NULL DEFAULT 'All',
    "isMandatedByLaw" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "leave_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leave_balances" (
    "id" UUID NOT NULL,
    "employeeId" UUID NOT NULL,
    "leaveTypeId" UUID NOT NULL,
    "year" INTEGER NOT NULL,
    "initialBalance" DECIMAL(4,1) NOT NULL,
    "earned" DECIMAL(4,1) NOT NULL DEFAULT 0,
    "used" DECIMAL(4,1) NOT NULL DEFAULT 0,
    "expired" DECIMAL(4,1) NOT NULL DEFAULT 0,
    "adjusted" DECIMAL(4,1) NOT NULL DEFAULT 0,
    "carriedOver" DECIMAL(4,1) NOT NULL DEFAULT 0,
    "currentBalance" DECIMAL(4,1) NOT NULL,

    CONSTRAINT "leave_balances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leave_requests" (
    "id" UUID NOT NULL,
    "employeeId" UUID NOT NULL,
    "leaveTypeId" UUID NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "totalDays" DECIMAL(4,1) NOT NULL,
    "halfDay" BOOLEAN NOT NULL DEFAULT false,
    "halfDayPeriod" "HalfDayPeriod",
    "reason" TEXT NOT NULL,
    "status" "LeaveStatus" NOT NULL DEFAULT 'Pending',
    "approvedById" UUID,
    "approvedAt" TIMESTAMPTZ,
    "rejectionReason" TEXT,
    "cancelledById" UUID,
    "cancelledAt" TIMESTAMPTZ,
    "isEmergency" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "leave_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leave_attachments" (
    "id" UUID NOT NULL,
    "leaveRequestId" UUID NOT NULL,
    "fileName" VARCHAR(255) NOT NULL,
    "filePath" VARCHAR(500) NOT NULL,
    "fileSize" BIGINT NOT NULL,
    "mimeType" VARCHAR(100) NOT NULL,
    "uploadedById" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "leave_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "holidays" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "date" DATE NOT NULL,
    "type" "HolidayType" NOT NULL,
    "isRecurringYearly" BOOLEAN NOT NULL DEFAULT true,
    "applicableToAll" BOOLEAN NOT NULL DEFAULT true,
    "region" VARCHAR(100),
    "description" TEXT,
    "year" INTEGER NOT NULL,

    CONSTRAINT "holidays_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shifts" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "startTime" VARCHAR(5) NOT NULL,
    "endTime" VARCHAR(5) NOT NULL,
    "gracePeriodMinutes" INTEGER NOT NULL DEFAULT 0,
    "breakDurationMinutes" INTEGER NOT NULL DEFAULT 60,
    "expectedHours" DECIMAL(3,1) NOT NULL,
    "isNightShift" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "shifts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_shifts" (
    "id" UUID NOT NULL,
    "employeeId" UUID NOT NULL,
    "shiftId" UUID NOT NULL,
    "effectiveDate" DATE NOT NULL,
    "endDate" DATE,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "employee_shifts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance_records" (
    "id" UUID NOT NULL,
    "employeeId" UUID NOT NULL,
    "date" DATE NOT NULL,
    "shiftId" UUID,
    "timeIn" VARCHAR(8),
    "timeOut" VARCHAR(8),
    "hoursWorked" DECIMAL(4,2) NOT NULL,
    "overtimeHours" DECIMAL(4,2) NOT NULL DEFAULT 0,
    "nightDiffHours" DECIMAL(4,2) NOT NULL DEFAULT 0,
    "lateMinutes" INTEGER NOT NULL DEFAULT 0,
    "undertimeMinutes" INTEGER NOT NULL DEFAULT 0,
    "status" "AttendanceStatus" NOT NULL,
    "source" "AttendanceSource" NOT NULL,
    "remarks" TEXT,
    "isHoliday" BOOLEAN NOT NULL DEFAULT false,
    "holidayId" UUID,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "attendance_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance_adjustments" (
    "id" UUID NOT NULL,
    "attendanceId" UUID NOT NULL,
    "requestedById" UUID NOT NULL,
    "adjustmentType" "AdjustmentType" NOT NULL,
    "oldValue" VARCHAR(50) NOT NULL,
    "newValue" VARCHAR(50) NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "AdjustmentStatus" NOT NULL DEFAULT 'Pending',
    "reviewedById" UUID,
    "reviewedAt" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "attendance_adjustments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "overtime_requests" (
    "id" UUID NOT NULL,
    "employeeId" UUID NOT NULL,
    "date" DATE NOT NULL,
    "hours" DECIMAL(4,2) NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "OvertimeStatus" NOT NULL DEFAULT 'Pending',
    "approvedById" UUID,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "overtime_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_categories" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "document_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" UUID NOT NULL,
    "employeeId" UUID NOT NULL,
    "categoryId" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "fileName" VARCHAR(255) NOT NULL,
    "filePath" VARCHAR(500) NOT NULL,
    "fileSize" BIGINT NOT NULL,
    "mimeType" VARCHAR(100) NOT NULL,
    "uploadedById" UUID NOT NULL,
    "expiryDate" DATE,
    "isConfidential" BOOLEAN NOT NULL DEFAULT false,
    "status" "DocumentStatus" NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "deletedAt" TIMESTAMPTZ,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_salaries" (
    "id" UUID NOT NULL,
    "employeeId" UUID NOT NULL,
    "basicSalary" DECIMAL(12,2) NOT NULL,
    "hourlyRate" DECIMAL(10,2),
    "allowances" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "taxableAllowances" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "effectiveDate" DATE NOT NULL,
    "endDate" DATE,
    "changeReason" VARCHAR(255) NOT NULL,
    "approvedById" UUID,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "employee_salaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_benefits" (
    "id" UUID NOT NULL,
    "employeeId" UUID NOT NULL,
    "benefitType" "BenefitType" NOT NULL,
    "enrolledAt" DATE NOT NULL,
    "terminatedAt" DATE,
    "referenceNumber" VARCHAR(50),
    "monthlyEmployeeShare" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "monthlyEmployerShare" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "provider" VARCHAR(100),

    CONSTRAINT "employee_benefits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contribution_tables" (
    "id" UUID NOT NULL,
    "type" "ContributionTableType" NOT NULL,
    "salaryFrom" DECIMAL(12,2) NOT NULL,
    "salaryTo" DECIMAL(12,2) NOT NULL,
    "monthlySalaryCredit" DECIMAL(12,2) NOT NULL,
    "employeeShare" DECIMAL(10,2) NOT NULL,
    "employerShare" DECIMAL(10,2) NOT NULL,
    "effectiveDate" DATE NOT NULL,
    "expiryDate" DATE,

    CONSTRAINT "contribution_tables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_periods" (
    "id" UUID NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "periodStart" DATE NOT NULL,
    "periodEnd" DATE NOT NULL,
    "paymentDate" DATE NOT NULL,
    "type" "PayrollPeriodType" NOT NULL,
    "status" "PayrollPeriodStatus" NOT NULL DEFAULT 'Open',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "payroll_periods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payslips" (
    "id" UUID NOT NULL,
    "employeeId" UUID NOT NULL,
    "payrollPeriodId" UUID NOT NULL,
    "grossPay" DECIMAL(12,2) NOT NULL,
    "totalDeductions" DECIMAL(12,2) NOT NULL,
    "netPay" DECIMAL(12,2) NOT NULL,
    "basicPay" DECIMAL(12,2) NOT NULL,
    "overtimePay" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "holidayPay" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "nightDiffPay" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "allowances" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "thirteenthMonthPay" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "sssDeduction" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "philhealthDeduction" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "pagibigDeduction" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "taxWithheld" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "otherDeductions" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "loanDeductions" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "lateDeductions" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "status" "PayslipStatus" NOT NULL DEFAULT 'Draft',
    "generatedById" UUID NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payslips_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payslip_items" (
    "id" UUID NOT NULL,
    "payslipId" UUID NOT NULL,
    "itemType" "PayslipItemType" NOT NULL,
    "category" VARCHAR(50) NOT NULL,
    "label" VARCHAR(100) NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "sequence" INTEGER NOT NULL,

    CONSTRAINT "payslip_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL,
    "recipientId" UUID NOT NULL,
    "senderId" UUID,
    "type" "NotificationType" NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "message" TEXT NOT NULL,
    "link" VARCHAR(500),
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_preferences" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "notificationType" VARCHAR(50) NOT NULL,
    "inApp" BOOLEAN NOT NULL DEFAULT true,
    "email" BOOLEAN NOT NULL DEFAULT false,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "userId" UUID,
    "action" VARCHAR(50) NOT NULL,
    "entityType" VARCHAR(50) NOT NULL,
    "entityId" UUID,
    "oldValues" JSONB,
    "newValues" JSONB,
    "description" TEXT NOT NULL,
    "ipAddress" VARCHAR(45) NOT NULL,
    "userAgent" VARCHAR(500),
    "requestMethod" VARCHAR(10),
    "requestPath" VARCHAR(500),
    "status" VARCHAR(20) NOT NULL,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "login_attempts" (
    "id" UUID NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "ipAddress" VARCHAR(45) NOT NULL,
    "userAgent" VARCHAR(500),
    "isSuccessful" BOOLEAN NOT NULL,
    "failureReason" VARCHAR(255),
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" UUID,

    CONSTRAINT "login_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_configurations" (
    "id" UUID NOT NULL,
    "key" VARCHAR(100) NOT NULL,
    "value" TEXT NOT NULL,
    "description" VARCHAR(255),
    "isEncrypted" BOOLEAN NOT NULL DEFAULT false,
    "updatedById" UUID,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "system_configurations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_employeeId_key" ON "users"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_employeeId_idx" ON "users"("employeeId");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_module_action_key" ON "permissions"("module", "action");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_tokenHash_key" ON "refresh_tokens"("tokenHash");

-- CreateIndex
CREATE INDEX "refresh_tokens_userId_idx" ON "refresh_tokens"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_tokenHash_key" ON "password_reset_tokens"("tokenHash");

-- CreateIndex
CREATE INDEX "password_reset_tokens_userId_idx" ON "password_reset_tokens"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "employment_types_name_key" ON "employment_types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "employees_employeeCode_key" ON "employees"("employeeCode");

-- CreateIndex
CREATE INDEX "employees_employeeCode_idx" ON "employees"("employeeCode");

-- CreateIndex
CREATE INDEX "employees_departmentId_idx" ON "employees"("departmentId");

-- CreateIndex
CREATE INDEX "employees_managerId_idx" ON "employees"("managerId");

-- CreateIndex
CREATE INDEX "employees_employmentStatus_idx" ON "employees"("employmentStatus");

-- CreateIndex
CREATE INDEX "employees_isDeleted_idx" ON "employees"("isDeleted");

-- CreateIndex
CREATE INDEX "employee_addresses_employeeId_idx" ON "employee_addresses"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "employee_government_ids_employeeId_key" ON "employee_government_ids"("employeeId");

-- CreateIndex
CREATE INDEX "employee_emergency_contacts_employeeId_idx" ON "employee_emergency_contacts"("employeeId");

-- CreateIndex
CREATE INDEX "employee_education_employeeId_idx" ON "employee_education"("employeeId");

-- CreateIndex
CREATE INDEX "employee_dependents_employeeId_idx" ON "employee_dependents"("employeeId");

-- CreateIndex
CREATE INDEX "employee_work_history_employeeId_idx" ON "employee_work_history"("employeeId");

-- CreateIndex
CREATE INDEX "employee_skills_employeeId_idx" ON "employee_skills"("employeeId");

-- CreateIndex
CREATE INDEX "employee_certifications_employeeId_idx" ON "employee_certifications"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "departments_code_key" ON "departments"("code");

-- CreateIndex
CREATE INDEX "departments_parentDepartmentId_idx" ON "departments"("parentDepartmentId");

-- CreateIndex
CREATE INDEX "departments_code_idx" ON "departments"("code");

-- CreateIndex
CREATE UNIQUE INDEX "positions_code_key" ON "positions"("code");

-- CreateIndex
CREATE INDEX "positions_departmentId_idx" ON "positions"("departmentId");

-- CreateIndex
CREATE INDEX "positions_code_idx" ON "positions"("code");

-- CreateIndex
CREATE INDEX "employee_positions_employeeId_idx" ON "employee_positions"("employeeId");

-- CreateIndex
CREATE INDEX "employee_positions_positionId_idx" ON "employee_positions"("positionId");

-- CreateIndex
CREATE UNIQUE INDEX "salary_grades_name_key" ON "salary_grades"("name");

-- CreateIndex
CREATE UNIQUE INDEX "leave_types_code_key" ON "leave_types"("code");

-- CreateIndex
CREATE INDEX "leave_balances_employeeId_idx" ON "leave_balances"("employeeId");

-- CreateIndex
CREATE INDEX "leave_balances_leaveTypeId_idx" ON "leave_balances"("leaveTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "leave_balances_employeeId_leaveTypeId_year_key" ON "leave_balances"("employeeId", "leaveTypeId", "year");

-- CreateIndex
CREATE INDEX "leave_requests_employeeId_idx" ON "leave_requests"("employeeId");

-- CreateIndex
CREATE INDEX "leave_requests_status_idx" ON "leave_requests"("status");

-- CreateIndex
CREATE INDEX "leave_requests_approvedById_idx" ON "leave_requests"("approvedById");

-- CreateIndex
CREATE INDEX "leave_attachments_leaveRequestId_idx" ON "leave_attachments"("leaveRequestId");

-- CreateIndex
CREATE INDEX "holidays_date_idx" ON "holidays"("date");

-- CreateIndex
CREATE INDEX "holidays_year_idx" ON "holidays"("year");

-- CreateIndex
CREATE UNIQUE INDEX "shifts_code_key" ON "shifts"("code");

-- CreateIndex
CREATE INDEX "employee_shifts_employeeId_idx" ON "employee_shifts"("employeeId");

-- CreateIndex
CREATE INDEX "employee_shifts_shiftId_idx" ON "employee_shifts"("shiftId");

-- CreateIndex
CREATE INDEX "attendance_records_employeeId_date_idx" ON "attendance_records"("employeeId", "date");

-- CreateIndex
CREATE INDEX "attendance_records_status_idx" ON "attendance_records"("status");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_records_employeeId_date_key" ON "attendance_records"("employeeId", "date");

-- CreateIndex
CREATE INDEX "attendance_adjustments_attendanceId_idx" ON "attendance_adjustments"("attendanceId");

-- CreateIndex
CREATE INDEX "attendance_adjustments_status_idx" ON "attendance_adjustments"("status");

-- CreateIndex
CREATE INDEX "overtime_requests_employeeId_idx" ON "overtime_requests"("employeeId");

-- CreateIndex
CREATE INDEX "overtime_requests_status_idx" ON "overtime_requests"("status");

-- CreateIndex
CREATE UNIQUE INDEX "document_categories_code_key" ON "document_categories"("code");

-- CreateIndex
CREATE INDEX "documents_employeeId_idx" ON "documents"("employeeId");

-- CreateIndex
CREATE INDEX "documents_categoryId_idx" ON "documents"("categoryId");

-- CreateIndex
CREATE INDEX "documents_status_idx" ON "documents"("status");

-- CreateIndex
CREATE INDEX "employee_salaries_employeeId_idx" ON "employee_salaries"("employeeId");

-- CreateIndex
CREATE INDEX "employee_salaries_effectiveDate_idx" ON "employee_salaries"("effectiveDate");

-- CreateIndex
CREATE INDEX "employee_benefits_employeeId_idx" ON "employee_benefits"("employeeId");

-- CreateIndex
CREATE INDEX "employee_benefits_benefitType_idx" ON "employee_benefits"("benefitType");

-- CreateIndex
CREATE INDEX "contribution_tables_type_idx" ON "contribution_tables"("type");

-- CreateIndex
CREATE INDEX "contribution_tables_effectiveDate_idx" ON "contribution_tables"("effectiveDate");

-- CreateIndex
CREATE INDEX "payroll_periods_status_idx" ON "payroll_periods"("status");

-- CreateIndex
CREATE INDEX "payslips_employeeId_idx" ON "payslips"("employeeId");

-- CreateIndex
CREATE INDEX "payslips_payrollPeriodId_idx" ON "payslips"("payrollPeriodId");

-- CreateIndex
CREATE INDEX "payslip_items_payslipId_idx" ON "payslip_items"("payslipId");

-- CreateIndex
CREATE INDEX "notifications_recipientId_isRead_idx" ON "notifications"("recipientId", "isRead");

-- CreateIndex
CREATE INDEX "notifications_createdAt_idx" ON "notifications"("createdAt");

-- CreateIndex
CREATE INDEX "notification_preferences_userId_idx" ON "notification_preferences"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "notification_preferences_userId_notificationType_key" ON "notification_preferences"("userId", "notificationType");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_entityType_entityId_idx" ON "audit_logs"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "login_attempts_username_idx" ON "login_attempts"("username");

-- CreateIndex
CREATE INDEX "login_attempts_createdAt_idx" ON "login_attempts"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "system_configurations_key_key" ON "system_configurations"("key");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_employmentTypeId_fkey" FOREIGN KEY ("employmentTypeId") REFERENCES "employment_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_reportsToId_fkey" FOREIGN KEY ("reportsToId") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_addresses" ADD CONSTRAINT "employee_addresses_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_government_ids" ADD CONSTRAINT "employee_government_ids_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_emergency_contacts" ADD CONSTRAINT "employee_emergency_contacts_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_education" ADD CONSTRAINT "employee_education_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_dependents" ADD CONSTRAINT "employee_dependents_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_work_history" ADD CONSTRAINT "employee_work_history_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_skills" ADD CONSTRAINT "employee_skills_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_certifications" ADD CONSTRAINT "employee_certifications_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_parentDepartmentId_fkey" FOREIGN KEY ("parentDepartmentId") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "positions" ADD CONSTRAINT "positions_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "positions" ADD CONSTRAINT "positions_salaryGradeId_fkey" FOREIGN KEY ("salaryGradeId") REFERENCES "salary_grades"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_positions" ADD CONSTRAINT "employee_positions_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_positions" ADD CONSTRAINT "employee_positions_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "positions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_positions" ADD CONSTRAINT "employee_positions_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_balances" ADD CONSTRAINT "leave_balances_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_balances" ADD CONSTRAINT "leave_balances_leaveTypeId_fkey" FOREIGN KEY ("leaveTypeId") REFERENCES "leave_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_leaveTypeId_fkey" FOREIGN KEY ("leaveTypeId") REFERENCES "leave_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_cancelledById_fkey" FOREIGN KEY ("cancelledById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_attachments" ADD CONSTRAINT "leave_attachments_leaveRequestId_fkey" FOREIGN KEY ("leaveRequestId") REFERENCES "leave_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_attachments" ADD CONSTRAINT "leave_attachments_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_shifts" ADD CONSTRAINT "employee_shifts_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_shifts" ADD CONSTRAINT "employee_shifts_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "shifts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "shifts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_holidayId_fkey" FOREIGN KEY ("holidayId") REFERENCES "holidays"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_adjustments" ADD CONSTRAINT "attendance_adjustments_attendanceId_fkey" FOREIGN KEY ("attendanceId") REFERENCES "attendance_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_adjustments" ADD CONSTRAINT "attendance_adjustments_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_adjustments" ADD CONSTRAINT "attendance_adjustments_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "overtime_requests" ADD CONSTRAINT "overtime_requests_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "overtime_requests" ADD CONSTRAINT "overtime_requests_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "document_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_salaries" ADD CONSTRAINT "employee_salaries_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_salaries" ADD CONSTRAINT "employee_salaries_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_benefits" ADD CONSTRAINT "employee_benefits_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payslips" ADD CONSTRAINT "payslips_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payslips" ADD CONSTRAINT "payslips_payrollPeriodId_fkey" FOREIGN KEY ("payrollPeriodId") REFERENCES "payroll_periods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payslips" ADD CONSTRAINT "payslips_generatedById_fkey" FOREIGN KEY ("generatedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payslip_items" ADD CONSTRAINT "payslip_items_payslipId_fkey" FOREIGN KEY ("payslipId") REFERENCES "payslips"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "login_attempts" ADD CONSTRAINT "login_attempts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system_configurations" ADD CONSTRAINT "system_configurations_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
