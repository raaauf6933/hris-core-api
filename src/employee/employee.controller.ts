import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { QueryEmployeeDto } from './dto/query-employee.dto';

@Controller('employees')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Get()
  findAll(@Query() query: QueryEmployeeDto) {
    return this.employeeService.findAll(query);
  }

  @Get('select')
  findForSelect(@Query('departmentId') departmentId?: string) {
    return this.employeeService.findForSelect(departmentId);
  }

  @Get('hierarchy')
  getHierarchy(@Query('departmentId') departmentId?: string) {
    return this.employeeService.getHierarchy(departmentId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.employeeService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateEmployeeDto) {
    return this.employeeService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEmployeeDto,
  ) {
    return this.employeeService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  softDelete(@Param('id', ParseUUIDPipe) id: string) {
    return this.employeeService.softDelete(id);
  }

  @Patch(':id/restore')
  restore(@Param('id', ParseUUIDPipe) id: string) {
    return this.employeeService.restore(id);
  }
}
