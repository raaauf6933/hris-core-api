import { Module } from '@nestjs/common';
import { EmploymentTypeController } from './employment-type.controller';
import { EmploymentTypeService } from './employment-type.service';

@Module({
  controllers: [EmploymentTypeController],
  providers: [EmploymentTypeService],
})
export class EmploymentTypeModule {}
