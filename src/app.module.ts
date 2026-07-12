import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { configs } from '../config';
import { PrismaModule } from './prisma/prisma.module';
import { EmployeeModule } from './employee/employee.module';
import { DepartmentModule } from './department/department.module';
import { EmploymentTypeModule } from './employment-type/employment-type.module';
import { PositionModule } from './position/position.module';
import { LeaveModule } from './leave/leave.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: configs,
      envFilePath: '.env',
    }),
    PrismaModule,
    EmployeeModule,
    DepartmentModule,
    EmploymentTypeModule,
    PositionModule,
    LeaveModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

