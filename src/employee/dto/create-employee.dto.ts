import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  IsDateString,
  IsUUID,
  IsBoolean,
  IsInt,
  MaxLength,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Gender, CivilStatus, EmploymentStatus, AddressType, EducationLevel, ProficiencyLevel } from '../../generated/prisma/enums';

// ── Nested Address DTO ──

export class CreateAddressDto {
  @IsEnum(AddressType)
  type: AddressType;

  @IsOptional() @IsString() @MaxLength(255)
  street?: string;

  @IsOptional() @IsString() @MaxLength(100)
  barangay?: string;

  @IsOptional() @IsString() @MaxLength(100)
  cityMunicipality?: string;

  @IsOptional() @IsString() @MaxLength(100)
  province?: string;

  @IsOptional() @IsString() @MaxLength(100)
  region?: string;

  @IsOptional() @IsString() @MaxLength(4)
  zipCode?: string;

  @IsOptional() @IsString() @MaxLength(50)
  country?: string;

  @IsOptional() @IsBoolean()
  isPrimary?: boolean;
}

// ── Nested Government ID DTO ──

export class CreateGovernmentIdDto {
  @IsOptional() @IsString() @MaxLength(20)
  sssNumber?: string;

  @IsOptional() @IsString() @MaxLength(20)
  philhealthNumber?: string;

  @IsOptional() @IsString() @MaxLength(20)
  pagibigNumber?: string;

  @IsOptional() @IsString() @MaxLength(20)
  tin?: string;

  @IsOptional() @IsString() @MaxLength(20)
  umidNumber?: string;

  @IsOptional() @IsString() @MaxLength(30)
  passportNumber?: string;

  @IsOptional() @IsString() @MaxLength(30)
  driverLicenseNumber?: string;

  @IsOptional() @IsString() @MaxLength(30)
  voterId?: string;

  @IsOptional() @IsString() @MaxLength(30)
  prcLicenseNumber?: string;

  @IsOptional() @IsString() @MaxLength(10)
  taxStatusCode?: string;
}

// ── Nested Emergency Contact DTO ──

export class CreateEmergencyContactDto {
  @IsString() @MaxLength(200)
  fullName: string;

  @IsString() @MaxLength(50)
  relationship: string;

  @IsString() @MaxLength(20)
  mobileNumber: string;

  @IsOptional() @IsString() @MaxLength(20)
  homePhone?: string;

  @IsOptional() @IsEmail() @MaxLength(255)
  email?: string;

  @IsOptional() @IsString()
  address?: string;

  @IsOptional() @IsBoolean()
  isPrimary?: boolean;
}

// ── Main Create Employee DTO ──

export class CreateEmployeeDto {
  @IsOptional() @IsString() @MaxLength(20)
  employeeCode?: string;

  @IsString() @MaxLength(100)
  firstName: string;

  @IsOptional() @IsString() @MaxLength(100)
  middleName?: string;

  @IsString() @MaxLength(100)
  lastName: string;

  @IsOptional() @IsString() @MaxLength(10)
  nameExtension?: string;

  @IsDateString()
  birthDate: string;

  @IsOptional() @IsString() @MaxLength(255)
  birthPlace?: string;

  @IsEnum(Gender)
  gender: Gender;

  @IsEnum(CivilStatus)
  civilStatus: CivilStatus;

  @IsOptional() @IsString() @MaxLength(50)
  nationality?: string;

  @IsOptional() @IsString() @MaxLength(50)
  religion?: string;

  @IsOptional() @IsString() @MaxLength(5)
  bloodType?: string;

  @IsOptional() @IsString() @MaxLength(500)
  photoUrl?: string;

  @IsOptional() @IsEmail() @MaxLength(255)
  personalEmail?: string;

  @IsOptional() @IsString() @MaxLength(20)
  mobileNumber?: string;

  @IsOptional() @IsString() @MaxLength(20)
  homePhone?: string;

  @IsDateString()
  dateHired: string;

  @IsOptional() @IsDateString()
  dateRegularized?: string;

  @IsUUID()
  employmentTypeId: string;

  @IsOptional() @IsEnum(EmploymentStatus)
  employmentStatus?: EmploymentStatus;

  @IsOptional() @IsUUID()
  departmentId?: string;

  @IsOptional() @IsUUID()
  positionId?: string;

  @IsOptional() @IsUUID()
  managerId?: string;

  @IsOptional() @IsUUID()
  reportsToId?: string;

  // ── Nested sub-records (all optional) ──

  @IsOptional() @IsArray() @ValidateNested({ each: true })
  @Type(() => CreateAddressDto)
  addresses?: CreateAddressDto[];

  @IsOptional() @ValidateNested()
  @Type(() => CreateGovernmentIdDto)
  governmentId?: CreateGovernmentIdDto;

  @IsOptional() @IsArray() @ValidateNested({ each: true })
  @Type(() => CreateEmergencyContactDto)
  emergencyContacts?: CreateEmergencyContactDto[];

  @IsOptional() @IsArray() @ValidateNested({ each: true })
  @Type(() => CreateEducationDto)
  education?: CreateEducationDto[];

  @IsOptional() @IsArray() @ValidateNested({ each: true })
  @Type(() => CreateWorkHistoryDto)
  workHistory?: CreateWorkHistoryDto[];

  @IsOptional() @IsArray() @ValidateNested({ each: true })
  @Type(() => CreateSkillDto)
  skills?: CreateSkillDto[];

  @IsOptional() @IsArray() @ValidateNested({ each: true })
  @Type(() => CreateCertificationDto)
  certifications?: CreateCertificationDto[];

  @IsOptional() @IsArray() @ValidateNested({ each: true })
  @Type(() => CreateDependentDto)
  dependents?: CreateDependentDto[];

  @IsOptional() @IsArray() @ValidateNested({ each: true })
  @Type(() => CreateSalaryDto)
  salaries?: CreateSalaryDto[];

  @IsOptional() @IsArray() @ValidateNested({ each: true })
  @Type(() => CreateShiftAssignmentDto)
  shifts?: CreateShiftAssignmentDto[];
}

// ── Education ──

export class CreateEducationDto {
  @IsEnum(EducationLevel)
  level: EducationLevel;

  @IsString() @MaxLength(255)
  schoolName: string;

  @IsString() @MaxLength(255)
  degreeCourse: string;

  @IsOptional() @IsInt()
  yearStarted?: number;

  @IsOptional() @IsInt()
  yearGraduated?: number;

  @IsOptional() @IsString() @MaxLength(255)
  honors?: string;
}

// ── Work History ──

export class CreateWorkHistoryDto {
  @IsString() @MaxLength(255)
  companyName: string;

  @IsString() @MaxLength(150)
  position: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional() @IsString() @MaxLength(255)
  reasonForLeaving?: string;
}

// ── Skill ──

export class CreateSkillDto {
  @IsString() @MaxLength(100)
  skillName: string;

  @IsEnum(ProficiencyLevel)
  proficiency: ProficiencyLevel;

  @IsOptional() @IsInt()
  yearsExperience?: number;
}

// ── Certification ──

export class CreateCertificationDto {
  @IsString() @MaxLength(255)
  name: string;

  @IsString() @MaxLength(255)
  issuingOrganization: string;

  @IsDateString()
  dateObtained: string;

  @IsOptional() @IsDateString()
  expiryDate?: string;
}

// ── Dependent ──

export class CreateDependentDto {
  @IsString() @MaxLength(200)
  fullName: string;

  @IsString() @MaxLength(50)
  relationship: string;

  @IsDateString()
  birthDate: string;

  @IsOptional() @IsBoolean()
  isQualifiedDependent?: boolean;
}

// ── Salary ──

export class CreateSalaryDto {
  @IsString()
  basicSalary: string;

  @IsOptional() @IsString()
  hourlyRate?: string;

  @IsOptional() @IsString()
  allowances?: string;

  @IsOptional() @IsString()
  taxableAllowances?: string;

  @IsDateString()
  effectiveDate: string;

  @IsString() @MaxLength(255)
  changeReason: string;
}

// ── Shift Assignment ──

export class CreateShiftAssignmentDto {
  @IsUUID()
  shiftId: string;

  @IsDateString()
  effectiveDate: string;
}
