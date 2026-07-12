import { Controller, Get, Query } from '@nestjs/common';
import { PositionService } from './position.service';

@Controller('positions')
export class PositionController {
  constructor(private readonly positionService: PositionService) {}

  @Get()
  findAll(@Query('departmentId') departmentId?: string) {
    return this.positionService.findAll(departmentId);
  }
}
