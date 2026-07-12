import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { DepartmentService } from './department.service';

@Controller('departments')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Get()
  findAll() {
    return this.departmentService.findAll();
  }

  @Get('tree')
  findTree() {
    return this.departmentService.findTree();
  }

  @Get(':parentId/children')
  findChildren(@Param('parentId', ParseUUIDPipe) parentId: string) {
    return this.departmentService.findChildren(parentId);
  }
}
