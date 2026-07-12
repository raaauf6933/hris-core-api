import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  Req,
  Inject,
} from '@nestjs/common';
import { Request } from 'express';
import { LeaveService } from './leave.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { QueryLeaveRequestDto } from './dto/query-leave-request.dto';
import { ApproveLeaveDto, RejectLeaveDto } from './dto/approve-leave.dto';

// ── Temporary auth helper (until JWT guard is implemented) ──
// Resolves dev headers (x-user-id, x-employee-code) to real UUIDs

interface DevUser {
  userId: string;
  employeeId: string; // always a valid UUID after resolution
}

async function resolveDevUser(req: Request, prisma: PrismaService): Promise<DevUser> {
  const userId = (req.headers['x-user-id'] as string) || '';
  const employeeCode = (req.headers['x-employee-code'] as string) || '';

  let employeeId = '';

  // If x-employee-code is provided (e.g. "EMP-0003"), look up the real UUID
  if (employeeCode) {
    const emp = await prisma.employee.findUnique({
      where: { employeeCode },
      select: { id: true },
    });
    if (emp) {
      employeeId = emp.id;
    }
  }

  // Fallback: try x-employee-id directly (for API testing with real UUIDs)
  if (!employeeId) {
    const rawId = (req.headers['x-employee-id'] as string) || '';
    if (rawId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rawId)) {
      employeeId = rawId;
    }
  }

  return { userId, employeeId };
}

@Controller('leave')
export class LeaveController {
  constructor(
    private readonly leaveService: LeaveService,
    private readonly prisma: PrismaService,
  ) {}

  // ── Leave Types ──

  @Get('types')
  getLeaveTypes() {
    return this.leaveService.getLeaveTypes();
  }

  // ── Holidays ──

  @Get('holidays')
  getHolidays(@Query('year') year?: string) {
    return this.leaveService.getHolidays(year ? parseInt(year, 10) : undefined);
  }

  // ── My Balances ──

  @Get('balances')
  async getMyBalances(@Req() req: Request, @Query('year') year?: string) {
    const user = await resolveDevUser(req, this.prisma);
    return this.leaveService.getMyBalances(user.employeeId, year ? parseInt(year, 10) : undefined);
  }

  // ── Specific Employee Balances (manager/HR) ──

  @Get('balances/:employeeId')
  getEmployeeBalances(
    @Param('employeeId', ParseUUIDPipe) employeeId: string,
    @Query('year') year?: string,
  ) {
    return this.leaveService.getEmployeeBalances(employeeId, year ? parseInt(year, 10) : undefined);
  }

  // ── My Requests ──

  @Get('requests')
  async getMyRequests(@Req() req: Request, @Query() query: QueryLeaveRequestDto) {
    const user = await resolveDevUser(req, this.prisma);
    return this.leaveService.getMyRequests(user.employeeId, query);
  }

  // ── All Requests (HR/Admin) — MUST be before :id route ──

  @Get('requests/all')
  getAllRequests(@Query() query: QueryLeaveRequestDto) {
    return this.leaveService.getAllRequests(query);
  }

  // ── Single Request ──

  @Get('requests/:id')
  getRequest(@Param('id', ParseUUIDPipe) id: string) {
    return this.leaveService.getRequest(id);
  }

  // ── Create Request ──

  @Post('requests')
  @HttpCode(HttpStatus.CREATED)
  async createRequest(@Req() req: Request, @Body() dto: CreateLeaveRequestDto) {
    const user = await resolveDevUser(req, this.prisma);
    return this.leaveService.createRequest(dto, user.employeeId);
  }

  // ── Cancel Own Request ──

  @Delete('requests/:id')
  async cancelRequest(@Req() req: Request, @Param('id', ParseUUIDPipe) id: string) {
    const user = await resolveDevUser(req, this.prisma);
    return this.leaveService.cancelRequest(id, user.employeeId);
  }

  // ── Pending Approvals (manager/HR) ──

  @Get('approvals/pending')
  async getPendingApprovals(@Req() req: Request) {
    const user = await resolveDevUser(req, this.prisma);
    return this.leaveService.getPendingApprovals(user.userId, user.employeeId);
  }

  // ── Approve ──

  @Post('requests/:id/approve')
  async approveRequest(
    @Req() req: Request,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ApproveLeaveDto,
  ) {
    const user = await resolveDevUser(req, this.prisma);
    return this.leaveService.approveRequest(id, user.userId, user.employeeId, dto.comment);
  }

  // ── Reject ──

  @Post('requests/:id/reject')
  async rejectRequest(
    @Req() req: Request,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RejectLeaveDto,
  ) {
    const user = await resolveDevUser(req, this.prisma);
    return this.leaveService.rejectRequest(id, user.userId, user.employeeId, dto.reason);
  }

  // ── Calendar ──

  @Get('calendar')
  getLeaveCalendar(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('employeeId') employeeId?: string,
  ) {
    return this.leaveService.getLeaveCalendar(startDate, endDate, employeeId);
  }
}
