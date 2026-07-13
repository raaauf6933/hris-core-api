import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { QueryLeaveRequestDto } from './dto/query-leave-request.dto';
import { Prisma } from '../generated/prisma/client';

@Injectable()
export class LeaveService {
  constructor(private readonly prisma: PrismaService) {}

  // ──────────────────────────────────────────────
  // Leave Types
  // ──────────────────────────────────────────────

  async getLeaveTypes() {
    return this.prisma.leaveType.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  // ──────────────────────────────────────────────
  // Holidays
  // ──────────────────────────────────────────────

  async getHolidays(year?: number) {
    return this.prisma.holiday.findMany({
      where: year ? { year } : undefined,
      orderBy: { date: 'asc' },
    });
  }

  // ──────────────────────────────────────────────
  // Balances
  // ──────────────────────────────────────────────

  async getMyBalances(employeeId: string, year?: number) {
    if (!employeeId) return [];
    const targetYear = year ?? new Date().getFullYear();
    return this.prisma.leaveBalance.findMany({
      where: { employeeId, year: targetYear },
      include: { leaveType: true },
      orderBy: { leaveType: { name: 'asc' } },
    });
  }

  async getEmployeeBalances(employeeId: string, year?: number) {
    // Verify employee exists
    const employee = await this.prisma.employee.findFirst({
      where: { id: employeeId, isDeleted: false },
    });
    if (!employee) throw new NotFoundException('Employee not found');
    return this.getMyBalances(employeeId, year);
  }

  // ──────────────────────────────────────────────
  // Ensure balance record exists
  // ──────────────────────────────────────────────

  private async ensureBalance(
    employeeId: string,
    leaveTypeId: string,
    year: number,
  ) {
    const existing = await this.prisma.leaveBalance.findUnique({
      where: {
        employeeId_leaveTypeId_year: { employeeId, leaveTypeId, year },
      },
    });
    if (existing) return existing;

    const leaveType = await this.prisma.leaveType.findUnique({
      where: { id: leaveTypeId },
    });
    if (!leaveType) throw new NotFoundException('Leave type not found');

    return this.prisma.leaveBalance.create({
      data: {
        employeeId,
        leaveTypeId,
        year,
        initialBalance: leaveType.defaultDaysPerYear,
        currentBalance: leaveType.defaultDaysPerYear,
      },
    });
  }

  // ──────────────────────────────────────────────
  // Calculate working days (exclude weekends + PH holidays)
  // ──────────────────────────────────────────────

  private async calculateWorkingDays(
    startDate: Date,
    endDate: Date,
    halfDay?: boolean,
  ): Promise<number> {
    const year = startDate.getFullYear();
    const holidays = await this.prisma.holiday.findMany({
      where: {
        year,
        type: { in: ['Regular', 'SpecialNonWorking'] },
      },
      select: { date: true },
    });
    const holidayDates = new Set(
      holidays.map((h) => h.date.toISOString().split('T')[0]),
    );

    let count = 0;
    const cur = new Date(startDate);
    while (cur <= endDate) {
      const day = cur.getDay();
      const dateStr = cur.toISOString().split('T')[0];
      // Exclude weekends and holidays
      if (day !== 0 && day !== 6 && !holidayDates.has(dateStr)) {
        count++;
      }
      cur.setDate(cur.getDate() + 1);
    }

    return halfDay ? count - 0.5 : count;
  }

  // ──────────────────────────────────────────────
  // Create Leave Request
  // ──────────────────────────────────────────────

  async createRequest(dto: CreateLeaveRequestDto, employeeId: string) {
    const employee = await this.prisma.employee.findFirst({
      where: { id: employeeId, isDeleted: false },
    });
    if (!employee) throw new NotFoundException('Employee not found');
    if (employee.employmentStatus === 'Terminated' || employee.employmentStatus === 'Resigned') {
      throw new BadRequestException('Inactive employees cannot file leave');
    }

    // Validate leave type
    const leaveType = await this.prisma.leaveType.findUnique({
      where: { id: dto.leaveTypeId },
    });
    if (!leaveType || !leaveType.isActive) {
      throw new BadRequestException('Leave type not found or inactive');
    }

    // Check dates
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);
    if (endDate < startDate) {
      throw new BadRequestException('End date must be after start date');
    }

    // Calculate actual working days
    const totalDays = await this.calculateWorkingDays(
      startDate,
      endDate,
      dto.halfDay,
    );
    if (totalDays <= 0) {
      throw new BadRequestException(
        'No working days in selected range (weekends/holidays excluded)',
      );
    }

    // Check balance
    const year = startDate.getFullYear();
    const balance = await this.ensureBalance(employeeId, dto.leaveTypeId, year);

    // Sum pending requests for this leave type
    const pendingResult = await this.prisma.leaveRequest.aggregate({
      where: {
        employeeId,
        leaveTypeId: dto.leaveTypeId,
        status: 'Pending',
      },
      _sum: { totalDays: true },
    });
    const pendingDays = Number(pendingResult._sum.totalDays ?? 0);

    if (Number(balance.currentBalance) - pendingDays < totalDays) {
      throw new BadRequestException(
        `Insufficient balance: ${Number(balance.currentBalance)} remaining, ${pendingDays} pending, ${totalDays} requested`,
      );
    }

    // Check overlap with existing approved/pending requests
    const overlap = await this.prisma.leaveRequest.findFirst({
      where: {
        employeeId,
        status: { in: ['Pending', 'Approved'] },
        AND: [
          { startDate: { lte: endDate } },
          { endDate: { gte: startDate } },
        ],
      },
    });
    if (overlap) {
      throw new ConflictException(
        `Overlapping leave request exists: ${overlap.startDate.toISOString().split('T')[0]} → ${overlap.endDate.toISOString().split('T')[0]}`,
      );
    }

    // Create the request
    return this.prisma.leaveRequest.create({
      data: {
        employeeId,
        leaveTypeId: dto.leaveTypeId,
        startDate,
        endDate,
        totalDays,
        halfDay: dto.halfDay ?? false,
        halfDayPeriod: dto.halfDayPeriod ?? null,
        reason: dto.reason,
        isEmergency: dto.isEmergency ?? false,
        status: 'Pending',
      },
      include: {
        leaveType: true,
        employee: {
          select: { id: true, firstName: true, lastName: true, employeeCode: true, department: { select: { id: true, name: true } } },
        },
      },
    });
  }

  // ──────────────────────────────────────────────
  // Get My Requests
  // ──────────────────────────────────────────────

  async getMyRequests(employeeId: string, query: QueryLeaveRequestDto) {
    if (!employeeId) return { data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } };

    const { status, leaveTypeId, page = 1, limit = 20 } = query;

    const where: Prisma.LeaveRequestWhereInput = {
      employeeId,
      ...(status && { status }),
      ...(leaveTypeId && { leaveTypeId }),
    };

    const [data, total] = await Promise.all([
      this.prisma.leaveRequest.findMany({
        where,
        include: {
          leaveType: true,
          employee: {
            select: { id: true, firstName: true, lastName: true, employeeCode: true, department: { select: { id: true, name: true } } },
          },
          approvedBy: { select: { id: true, username: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.leaveRequest.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  // ──────────────────────────────────────────────
  // Get Single Request
  // ──────────────────────────────────────────────

  async getRequest(id: string) {
    const request = await this.prisma.leaveRequest.findUnique({
      where: { id },
      include: {
        leaveType: true,
        employee: {
          select: { id: true, firstName: true, lastName: true, employeeCode: true, department: { select: { id: true, name: true } } },
        },
        approvedBy: { select: { id: true, username: true } },
        cancelledBy: { select: { id: true, username: true } },
        attachments: true,
      },
    });
    if (!request) throw new NotFoundException('Leave request not found');
    return request;
  }

  // ──────────────────────────────────────────────
  // Cancel Own Request
  // ──────────────────────────────────────────────

  async cancelRequest(id: string, employeeId: string) {
    const request = await this.prisma.leaveRequest.findUnique({ where: { id } });
    if (!request) throw new NotFoundException('Leave request not found');
    if (request.employeeId !== employeeId) {
      throw new ForbiddenException('You can only cancel your own requests');
    }
    if (request.status === 'Approved') {
      // If already approved, check start date hasn't passed
      if (new Date(request.startDate) <= new Date()) {
        throw new BadRequestException('Cannot cancel a leave that has already started');
      }
    }
    if (request.status !== 'Pending' && request.status !== 'Approved') {
      throw new BadRequestException(`Cannot cancel a request with status: ${request.status}`);
    }

    return this.prisma.leaveRequest.update({
      where: { id },
      data: {
        status: 'Cancelled',
        cancelledAt: new Date(),
      },
      include: { leaveType: true },
    });
  }

  // ──────────────────────────────────────────────
  // Get Pending Approvals (for manager / HR)
  // ──────────────────────────────────────────────

  async getPendingApprovals(userId: string, employeeId: string) {
    // Try to resolve admin/HR role from userId (if it's a valid UUID with a linked user)
    let isAdmin = false;
    if (userId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { userRoles: { include: { role: true } } },
      });
      if (user) {
        isAdmin = user.userRoles.some((ur) =>
          ['system_admin', 'hr_admin'].includes(ur.role.name),
        );
      }
    }

    if (isAdmin) {
      // Admin/HR sees all pending
      return this.prisma.leaveRequest.findMany({
        where: { status: 'Pending' },
        include: {
          leaveType: true,
          employee: {
            select: { id: true, firstName: true, lastName: true, employeeCode: true, department: { select: { id: true, name: true } } },
          },
        },
        orderBy: { createdAt: 'asc' },
      });
    }

    // Manager: get direct reports
    if (!employeeId) return [];
    const subordinates = await this.prisma.employee.findMany({
      where: { managerId: employeeId, isDeleted: false },
      select: { id: true },
    });
    const subordinateIds = subordinates.map((s) => s.id);

    if (subordinateIds.length === 0) return [];

    return this.prisma.leaveRequest.findMany({
      where: {
        status: 'Pending',
        employeeId: { in: subordinateIds },
      },
      include: {
        leaveType: true,
        employee: {
          select: { id: true, firstName: true, lastName: true, employeeCode: true, department: { select: { id: true, name: true } } },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  // ──────────────────────────────────────────────
  // Approve a Request
  // ──────────────────────────────────────────────

  async approveRequest(
    id: string,
    approverUserId: string,
    approverEmployeeId: string,
    comment?: string,
  ) {
    const request = await this.prisma.leaveRequest.findUnique({
      where: { id },
      include: { employee: true },
    });
    if (!request) throw new NotFoundException('Leave request not found');
    if (request.status !== 'Pending') {
      throw new BadRequestException(`Cannot approve a request with status: ${request.status}`);
    }

    // Check authorization: only if approverUserId is a real UUID
    const isValidUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(approverUserId);
    let isAdmin = false;

    if (isValidUuid) {
      const user = await this.prisma.user.findUnique({
        where: { id: approverUserId },
        include: { userRoles: { include: { role: true } } },
      });
      isAdmin = user?.userRoles.some((ur) =>
        ['system_admin', 'hr_admin'].includes(ur.role.name),
      ) ?? false;
    }

    if (!isAdmin) {
      // Manager check: is the requester a direct report?
      if (request.employee.managerId !== approverEmployeeId) {
        throw new ForbiddenException('You are not the direct manager of this employee');
      }
    }

    // Approve and deduct balance
    return this.prisma.$transaction(async (tx) => {
      // Update request status (only set approvedById if valid UUID)
      const updated = await tx.leaveRequest.update({
        where: { id },
        data: {
          status: 'Approved',
          approvedById: isValidUuid ? approverUserId : null,
          approvedAt: new Date(),
        },
        include: {
          leaveType: true,
          employee: {
            select: { id: true, firstName: true, lastName: true, employeeCode: true },
          },
        },
      });

      // Deduct from balance
      const year = new Date(request.startDate).getFullYear();
      const balance = await this.ensureBalance(
        request.employeeId,
        request.leaveTypeId,
        year,
      );

      await tx.leaveBalance.update({
        where: { id: balance.id },
        data: {
          used: { increment: request.totalDays },
          currentBalance: { decrement: request.totalDays },
        },
      });

      return updated;
    });
  }

  // ──────────────────────────────────────────────
  // Reject a Request
  // ──────────────────────────────────────────────

  async rejectRequest(
    id: string,
    approverUserId: string,
    approverEmployeeId: string,
    reason: string,
  ) {
    const request = await this.prisma.leaveRequest.findUnique({
      where: { id },
      include: { employee: true },
    });
    if (!request) throw new NotFoundException('Leave request not found');
    if (request.status !== 'Pending') {
      throw new BadRequestException(`Cannot reject a request with status: ${request.status}`);
    }

    // Check authorization (same logic as approve — skip if not valid UUID)
    const isValidUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(approverUserId);
    let isAdmin = false;

    if (isValidUuid) {
      const user = await this.prisma.user.findUnique({
        where: { id: approverUserId },
        include: { userRoles: { include: { role: true } } },
      });
      isAdmin = user?.userRoles.some((ur) =>
        ['system_admin', 'hr_admin'].includes(ur.role.name),
      ) ?? false;
    }
    if (!isAdmin && request.employee.managerId !== approverEmployeeId) {
      throw new ForbiddenException('You are not the direct manager of this employee');
    }

    return this.prisma.leaveRequest.update({
      where: { id },
      data: {
        status: 'Rejected',
        approvedById: isValidUuid ? approverUserId : null,
        approvedAt: new Date(),
        rejectionReason: reason,
      },
      include: {
        leaveType: true,
        employee: {
          select: { id: true, firstName: true, lastName: true, employeeCode: true },
        },
      },
    });
  }

  // ──────────────────────────────────────────────
  // Get All Requests (HR/Admin only)
  // ──────────────────────────────────────────────

  async getAllRequests(query: QueryLeaveRequestDto) {
    const { status, leaveTypeId, page = 1, limit = 20 } = query;

    const where: Prisma.LeaveRequestWhereInput = {
      ...(status && { status }),
      ...(leaveTypeId && { leaveTypeId }),
    };

    const [data, total] = await Promise.all([
      this.prisma.leaveRequest.findMany({
        where,
        include: {
          leaveType: true,
          employee: {
            select: { id: true, firstName: true, lastName: true, employeeCode: true, department: { select: { id: true, name: true } } },
          },
          approvedBy: { select: { id: true, username: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.leaveRequest.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  // ──────────────────────────────────────────────
  // Leave Calendar
  // ──────────────────────────────────────────────

  async getLeaveCalendar(startDate: string, endDate: string, employeeId?: string) {
    const where: Prisma.LeaveRequestWhereInput = {
      status: { in: ['Pending', 'Approved'] },
      AND: [
        { startDate: { lte: new Date(endDate) } },
        { endDate: { gte: new Date(startDate) } },
      ],
    };

    if (employeeId) {
      where.employeeId = employeeId;
    }

    return this.prisma.leaveRequest.findMany({
      where,
      include: {
        leaveType: { select: { id: true, name: true, code: true } },
        employee: {
          select: { id: true, firstName: true, lastName: true, employeeCode: true },
        },
      },
      orderBy: { startDate: 'asc' },
    });
  }
}
