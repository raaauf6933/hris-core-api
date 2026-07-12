import { IsString, IsOptional, IsBoolean, IsDateString, IsEnum, IsUUID, MaxLength } from 'class-validator';
import { HalfDayPeriod } from '../../generated/prisma/enums';

export class CreateLeaveRequestDto {
  @IsUUID()
  leaveTypeId: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsBoolean()
  halfDay?: boolean;

  @IsOptional()
  @IsEnum(HalfDayPeriod)
  halfDayPeriod?: HalfDayPeriod;

  @IsString()
  @MaxLength(1000)
  reason: string;

  @IsOptional()
  @IsBoolean()
  isEmergency?: boolean;
}
