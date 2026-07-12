import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { QueryEmployeeDto } from './dto/query-employee.dto';
import { Prisma } from '../generated/prisma/client';

@Injectable()
export class EmployeeService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly defaultInclude = {
    employmentType: true,
    department: true,
    manager: true,
    addresses: true,
    governmentId: true,
    emergencyContacts: true,
  } satisfies Prisma.EmployeeInclude;

  async findAll(query: QueryEmployeeDto) {
    const {
      search,
      departmentId,
      employmentStatus,
      page = 1,
      limit = 20,
      sortBy = 'lastName',
      sortOrder = 'asc',
    } = query;

    const where: Prisma.EmployeeWhereInput = {
      isDeleted: false,
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { employeeCode: { contains: search, mode: 'insensitive' } },
          { personalEmail: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(departmentId && { departmentId }),
      ...(employmentStatus && { employmentStatus }),
    };

    const [data, total] = await Promise.all([
      this.prisma.employee.findMany({
        where,
        include: this.defaultInclude,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.prisma.employee.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const employee = await this.prisma.employee.findFirst({
      where: { id, isDeleted: false },
      include: {
        ...this.defaultInclude,
        education: true,
        dependents: true,
        workHistory: true,
        skills: true,
        certifications: true,
        positions: {
          include: { position: true, department: true },
          orderBy: { startDate: 'desc' },
        },
        salaries: {
          orderBy: { effectiveDate: 'desc' },
          take: 5,
        },
        shifts: {
          include: { shift: true },
          orderBy: { effectiveDate: 'desc' },
          take: 5,
        },
        benefits: true,
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            isActive: true,
            lastLoginAt: true,
            userRoles: { include: { role: true } },
          },
        },
      },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    return employee;
  }

  async create(dto: CreateEmployeeDto) {
    const employeeCode = dto.employeeCode || (await this.generateEmployeeCode());
    const { positionId, addresses, governmentId, emergencyContacts, education, workHistory, skills, certifications, dependents, salaries, shifts, ...employeeData } = dto as CreateEmployeeDto & Record<string, any>;

    // Check for duplicate employee code
    const existing = await this.prisma.employee.findUnique({
      where: { employeeCode },
    });

    if (existing) {
      throw new ConflictException(
        `Employee code ${employeeCode} already exists`,
      );
    }

    // Use a transaction to create employee + all sub-records
    const employee = await this.prisma.$transaction(async (tx) => {
      const emp = await tx.employee.create({
        data: {
          ...employeeData,
          employeeCode,
          birthDate: new Date(dto.birthDate),
          dateHired: new Date(dto.dateHired),
          dateRegularized: dto.dateRegularized
            ? new Date(dto.dateRegularized)
            : undefined,
        },
        include: this.defaultInclude,
      });

      // Create nested addresses
      if (addresses && addresses.length > 0) {
        await tx.employeeAddress.createMany({
          data: addresses.map((addr) => ({
            ...addr,
            employeeId: emp.id,
          })),
        });
      }

      // Create nested government ID
      if (governmentId) {
        await tx.employeeGovernmentId.create({
          data: { ...governmentId, employeeId: emp.id },
        });
      }

      // Create nested emergency contacts
      if (emergencyContacts && emergencyContacts.length > 0) {
        await tx.employeeEmergencyContact.createMany({
          data: emergencyContacts.map((contact) => ({
            ...contact,
            employeeId: emp.id,
          })),
        });
      }

      // Create initial position assignment if positionId provided
      if (positionId) {
        const position = await tx.position.findUnique({
          where: { id: positionId },
          select: { departmentId: true },
        });

        await tx.employeePosition.create({
          data: {
            employeeId: emp.id,
            positionId,
            departmentId: emp.departmentId ?? position?.departmentId ?? '',
            startDate: new Date(dto.dateHired),
            isPrimary: true,
            changeReason: 'Initial appointment',
          },
        });
      }

      // Create education records
      if (education && education.length > 0) {
        await tx.employeeEducation.createMany({
          data: education.map((e) => ({ ...e, employeeId: emp.id })),
        });
      }

      // Create work history
      if (workHistory && workHistory.length > 0) {
        await tx.employeeWorkHistory.createMany({
          data: workHistory.map((w) => ({
            ...w,
            startDate: new Date(w.startDate),
            endDate: new Date(w.endDate),
            employeeId: emp.id,
          })),
        });
      }

      // Create skills
      if (skills && skills.length > 0) {
        await tx.employeeSkill.createMany({
          data: skills.map((s) => ({ ...s, employeeId: emp.id })),
        });
      }

      // Create certifications
      if (certifications && certifications.length > 0) {
        await tx.employeeCertification.createMany({
          data: certifications.map((c) => ({
            ...c,
            dateObtained: new Date(c.dateObtained),
            expiryDate: c.expiryDate ? new Date(c.expiryDate) : undefined,
            employeeId: emp.id,
          })),
        });
      }

      // Create dependents
      if (dependents && dependents.length > 0) {
        await tx.employeeDependent.createMany({
          data: dependents.map((d) => ({
            ...d,
            birthDate: new Date(d.birthDate),
            employeeId: emp.id,
          })),
        });
      }

      // Create salary
      if (salaries && salaries.length > 0) {
        await tx.employeeSalary.createMany({
          data: salaries.map((s) => ({
            ...s,
            basicSalary: s.basicSalary,
            allowances: s.allowances || '0',
            taxableAllowances: s.taxableAllowances || '0',
            effectiveDate: new Date(s.effectiveDate),
            employeeId: emp.id,
          })),
        });
      }

      // Create shift assignments
      if (shifts && shifts.length > 0) {
        await tx.employeeShift.createMany({
          data: shifts.map((s) => ({
            shiftId: s.shiftId,
            effectiveDate: new Date(s.effectiveDate),
            employeeId: emp.id,
          })),
        });
      }

      return emp;
    });

    // Re-fetch with full includes since transaction returns limited relations
    return this.findOne(employee.id);
  }

  /** Auto-generate employee code: EMP-XXXX (next sequential) */
  private async generateEmployeeCode(): Promise<string> {
    const last = await this.prisma.employee.findFirst({
      where: { employeeCode: { startsWith: 'EMP-' } },
      orderBy: { employeeCode: 'desc' },
      select: { employeeCode: true },
    });

    if (!last) {
      return 'EMP-0001';
    }

    const num = parseInt(last.employeeCode.replace('EMP-', ''), 10);
    const next = (num || 0) + 1;
    return `EMP-${String(next).padStart(4, '0')}`;
  }

  /** Lightweight employee list for select dropdowns */
  async findForSelect(departmentId?: string) {
    return this.prisma.employee.findMany({
      where: {
        isDeleted: false,
        ...(departmentId ? { departmentId } : {}),
      },
      select: {
        id: true,
        employeeCode: true,
        firstName: true,
        lastName: true,
        department: { select: { id: true, name: true } },
      },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
      take: 500,
    });
  }

  async update(id: string, dto: UpdateEmployeeDto) {
    await this.findOne(id); // throws if not found

    // Strip nested fields not part of EmployeeUpdateInput
    const { addresses, governmentId, emergencyContacts, positionId, ...cleanDto } = dto as any;
    const data: Prisma.EmployeeUpdateInput = { ...cleanDto };

    // Convert date strings to Date objects
    if (cleanDto.birthDate) data.birthDate = new Date(cleanDto.birthDate);
    if (cleanDto.dateHired) data.dateHired = new Date(cleanDto.dateHired);
    if (cleanDto.dateRegularized)
      data.dateRegularized = new Date(cleanDto.dateRegularized);

    return this.prisma.employee.update({
      where: { id },
      data,
      include: this.defaultInclude,
    });
  }

  async softDelete(id: string) {
    await this.findOne(id);

    return this.prisma.employee.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        employmentStatus: 'Terminated',
      },
    });
  }

  async restore(id: string) {
    const employee = await this.prisma.employee.findFirst({
      where: { id, isDeleted: true },
    });

    if (!employee) {
      throw new NotFoundException(
        `Deleted employee with ID ${id} not found`,
      );
    }

    return this.prisma.employee.update({
      where: { id },
      data: {
        isDeleted: false,
        deletedAt: null,
        employmentStatus: 'Active',
      },
      include: this.defaultInclude,
    });
  }

  /**
   * Build the reporting hierarchy (org chart).
   * Returns top-level employees (no manager) with nested subordinates.
   * Optionally filter by department.
   */
  async getHierarchy(departmentId?: string) {
    const where: Prisma.EmployeeWhereInput = {
      isDeleted: false,
      employmentStatus: 'Active',
      ...(departmentId ? { departmentId } : {}),
    };

    const employees = await this.prisma.employee.findMany({
      where,
      select: {
        id: true,
        employeeCode: true,
        firstName: true,
        lastName: true,
        photoUrl: true,
        managerId: true,
        departmentId: true,
        department: { select: { id: true, name: true } },
        positions: {
          where: { endDate: null, isPrimary: true },
          take: 1,
          select: {
            position: { select: { id: true, title: true, code: true } },
          },
        },
      },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    });

    // Build a lookup map: managerId → subordinates[]
    const byManager = new Map<string | null, typeof employees>();
    for (const emp of employees) {
      const key = emp.managerId ?? null;
      if (!byManager.has(key)) byManager.set(key, []);
      byManager.get(key)!.push(emp);
    }

    // Map each employee to a tree node
    const mapNode = (emp: (typeof employees)[number]) => ({
      id: emp.id,
      employeeCode: emp.employeeCode,
      firstName: emp.firstName,
      lastName: emp.lastName,
      photoUrl: emp.photoUrl,
      department: emp.department,
      position: emp.positions[0]?.position ?? null,
      subordinates: (byManager.get(emp.id) ?? []).map(mapNode),
    });

    // Top-level = employees with no manager (null key)
    return (byManager.get(null) ?? []).map(mapNode);
  }
}
