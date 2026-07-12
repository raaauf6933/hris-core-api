import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EmploymentTypeService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.employmentType.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, description: true },
    });
  }
}
