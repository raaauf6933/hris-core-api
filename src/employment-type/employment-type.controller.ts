import { Controller, Get } from '@nestjs/common';
import { EmploymentTypeService } from './employment-type.service';

@Controller('employment-types')
export class EmploymentTypeController {
  constructor(private readonly service: EmploymentTypeService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }
}
