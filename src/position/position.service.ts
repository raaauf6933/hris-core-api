import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PositionService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(departmentId?: string) {
    return this.prisma.position.findMany({
      where: {
        isActive: true,
        ...(departmentId ? { departmentId } : {}),
      },
      orderBy: { title: 'asc' },
      select: {
        id: true,
        title: true,
        code: true,
        departmentId: true,
        minSalary: true,
        maxSalary: true,
        description: true,
        salaryGrade: { select: { id: true, name: true } },
        department: { select: { id: true, name: true } },
        _count: {
          select: {
            employeePositions: {
              where: { endDate: null, employee: { isDeleted: false } },
            },
          },
        },
      },
    });
  }
}
