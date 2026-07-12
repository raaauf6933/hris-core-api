import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DepartmentService {
  constructor(private readonly prisma: PrismaService) {}

  /** Rich list for Organization page — includes headcount, budget, manager */
  async findAll() {
    return this.prisma.department.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        code: true,
        description: true,
        budget: true,
        costCenterCode: true,
        parentDepartmentId: true,
        parentDepartment: { select: { id: true, name: true } },
        manager: {
          select: { id: true, firstName: true, lastName: true },
        },
        _count: {
          select: { employees: { where: { isDeleted: false } } },
        },
      },
    });
  }

  /** Top-level departments with their children — for cascading dropdowns / org tree */
  async findTree() {
    return this.prisma.department.findMany({
      where: { isActive: true, parentDepartmentId: null },
      orderBy: { name: 'asc' },
      include: {
        childDepartments: {
          where: { isActive: true },
          orderBy: { name: 'asc' },
          select: {
            id: true,
            name: true,
            code: true,
            description: true,
            budget: true,
            manager: {
              select: { id: true, firstName: true, lastName: true },
            },
            _count: {
              select: { employees: { where: { isDeleted: false } } },
            },
          },
        },
        manager: {
          select: { id: true, firstName: true, lastName: true },
        },
        _count: {
          select: { employees: { where: { isDeleted: false } } },
        },
      },
    });
  }

  /** Sections under a specific department */
  async findChildren(parentId: string) {
    return this.prisma.department.findMany({
      where: { isActive: true, parentDepartmentId: parentId },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        code: true,
        description: true,
        budget: true,
        manager: {
          select: { id: true, firstName: true, lastName: true },
        },
        _count: {
          select: { employees: { where: { isDeleted: false } } },
        },
      },
    });
  }
}
