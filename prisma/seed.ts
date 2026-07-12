// ─────────────────────────────────────────────────────────
// HRIS Database Seeder
// Creates: EmploymentTypes → Departments → SalaryGrades →
//          Positions → Employees + sub-records
// ─────────────────────────────────────────────────────────

import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Gender, CivilStatus, EmploymentStatus, AddressType } from '../src/generated/prisma/enums';
import * as dotenv from 'dotenv';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('❌ DATABASE_URL is not set in .env');
  process.exit(1);
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: databaseUrl }),
});

// ── Helpers ──

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function futureDate(daysFromNow: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d;
}

function pastDate(daysAgo: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d;
}

function birthDate(age: number): Date {
  const d = new Date();
  d.setFullYear(d.getFullYear() - age);
  d.setMonth(randInt(0, 11));
  d.setDate(randInt(1, 28));
  return d;
}

function generateMobile(): string {
  return `09${randInt(10, 99)}${randInt(100, 999)}${randInt(1000, 9999)}`;
}

function generateSSS(): string {
  return `${randInt(10, 99)}-${randInt(1000000, 9999999)}-${randInt(0, 9)}`;
}

function generatePhilHealth(): string {
  return `${randInt(10, 99)}-${randInt(100000000, 999999999)}-${randInt(0, 9)}`;
}

function generatePagIBIG(): string {
  return `${randInt(1000, 9999)}-${randInt(1000, 9999)}-${randInt(1000, 9999)}`;
}

function generateTIN(): string {
  return `${randInt(100, 999)}-${randInt(100, 999)}-${randInt(100, 999)}`;
}

// ─────────────────────────────────────────────────────────
// Main Seed
// ─────────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Starting HRIS database seed...\n');

  // 1. Clear existing data in reverse dependency order
  console.log('🧹 Cleaning existing data...');
  await prisma.leaveAttachment.deleteMany();
  await prisma.leaveRequest.deleteMany();
  await prisma.leaveBalance.deleteMany();
  await prisma.leaveType.deleteMany();
  await prisma.holiday.deleteMany();
  await prisma.employeePosition.deleteMany();
  await prisma.employeeGovernmentId.deleteMany();
  await prisma.employeeEmergencyContact.deleteMany();
  await prisma.employeeAddress.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.position.deleteMany();
  await prisma.salaryGrade.deleteMany();
  await prisma.department.deleteMany();
  await prisma.employmentType.deleteMany();

  // ───────────────────────────────────────────────────
  // 2. Employment Types
  // ───────────────────────────────────────────────────
  console.log('📋 Creating employment types...');

  const employmentTypes = await Promise.all([
    prisma.employmentType.create({ data: { name: 'Regular', description: 'Permanent full-time employee' } }),
    prisma.employmentType.create({ data: { name: 'Probationary', description: 'Under probation period (6 months)' } }),
    prisma.employmentType.create({ data: { name: 'Contractual', description: 'Fixed-term contract basis' } }),
    prisma.employmentType.create({ data: { name: 'Project-based', description: 'Hired for specific project duration' } }),
  ]);

  const [etRegular, etProbationary, etContractual, etProject] = employmentTypes;
  console.log(`  ✅ Created ${employmentTypes.length} employment types`);

  // ───────────────────────────────────────────────────
  // 3. Departments
  // ───────────────────────────────────────────────────
  console.log('🏢 Creating departments...');

  const departments = await Promise.all([
    prisma.department.create({
      data: { name: 'Executive Office', code: 'EXEC', description: 'Executive leadership & corporate governance', costCenterCode: 'CC-001', budget: '5000000.00' },
    }),
    prisma.department.create({
      data: { name: 'Human Resources', code: 'HR', description: 'Talent acquisition, employee relations & development', costCenterCode: 'CC-002', budget: '2500000.00' },
    }),
    prisma.department.create({
      data: { name: 'Engineering', code: 'ENG', description: 'Software development, infrastructure & DevOps', costCenterCode: 'CC-003', budget: '15000000.00' },
    }),
    prisma.department.create({
      data: { name: 'Finance & Accounting', code: 'FIN', description: 'Financial planning, payroll, accounting & treasury', costCenterCode: 'CC-004', budget: '3000000.00' },
    }),
    prisma.department.create({
      data: { name: 'Marketing', code: 'MKT', description: 'Brand management, digital marketing & communications', costCenterCode: 'CC-005', budget: '4000000.00' },
    }),
    prisma.department.create({
      data: { name: 'Operations', code: 'OPS', description: 'Facilities, admin support & logistics', costCenterCode: 'CC-006', budget: '3500000.00' },
    }),
  ]);

  const [deptExec, deptHR, deptEng, deptFin, deptMkt, deptOps] = departments;
  console.log(`  ✅ Created ${departments.length} departments`);

  // ── 3b. Department Sections (child departments) ──
  console.log('🏢 Creating department sections...');

  const sections = await Promise.all([
    // HR Sections
    prisma.department.create({
      data: { name: 'Talent Acquisition', code: 'HR-TA', description: 'Recruitment & onboarding', parentDepartmentId: deptHR.id, costCenterCode: 'CC-002-01' },
    }),
    prisma.department.create({
      data: { name: 'Employee Relations', code: 'HR-ER', description: 'Labor relations & employee engagement', parentDepartmentId: deptHR.id, costCenterCode: 'CC-002-02' },
    }),
    prisma.department.create({
      data: { name: 'Compensation & Benefits', code: 'HR-CB', description: 'Payroll, benefits & compliance', parentDepartmentId: deptHR.id, costCenterCode: 'CC-002-03' },
    }),
    // Engineering Sections
    prisma.department.create({
      data: { name: 'Frontend Engineering', code: 'ENG-FE', description: 'React, Vue & web applications', parentDepartmentId: deptEng.id, costCenterCode: 'CC-003-01' },
    }),
    prisma.department.create({
      data: { name: 'Backend Engineering', code: 'ENG-BE', description: 'NestJS, APIs & microservices', parentDepartmentId: deptEng.id, costCenterCode: 'CC-003-02' },
    }),
    prisma.department.create({
      data: { name: 'DevOps & Infrastructure', code: 'ENG-DO', description: 'CI/CD, cloud & monitoring', parentDepartmentId: deptEng.id, costCenterCode: 'CC-003-03' },
    }),
    // Finance Sections
    prisma.department.create({
      data: { name: 'Accounting', code: 'FIN-ACC', description: 'General ledger, AP, AR & financial reporting', parentDepartmentId: deptFin.id, costCenterCode: 'CC-004-01' },
    }),
    prisma.department.create({
      data: { name: 'Treasury', code: 'FIN-TRY', description: 'Cash management & banking', parentDepartmentId: deptFin.id, costCenterCode: 'CC-004-02' },
    }),
    // Marketing Sections
    prisma.department.create({
      data: { name: 'Digital Marketing', code: 'MKT-DIG', description: 'SEO, SEM & social media', parentDepartmentId: deptMkt.id, costCenterCode: 'CC-005-01' },
    }),
    prisma.department.create({
      data: { name: 'Brand & Communications', code: 'MKT-BC', description: 'PR, brand strategy & content', parentDepartmentId: deptMkt.id, costCenterCode: 'CC-005-02' },
    }),
    // Operations Sections
    prisma.department.create({
      data: { name: 'Facilities Management', code: 'OPS-FM', description: 'Office maintenance & utilities', parentDepartmentId: deptOps.id, costCenterCode: 'CC-006-01' },
    }),
    prisma.department.create({
      data: { name: 'Admin Support', code: 'OPS-AD', description: 'Clerical support & office services', parentDepartmentId: deptOps.id, costCenterCode: 'CC-006-02' },
    }),
  ]);

  const [secHR_TA, secHR_ER, secHR_CB, secEng_FE, secEng_BE, secEng_DO, secFin_ACC, secFin_TRY, secMkt_DIG, secMkt_BC, secOps_FM, secOps_AD] = sections;
  console.log(`  ✅ Created ${sections.length} department sections`);

  // ───────────────────────────────────────────────────
  // 4. Salary Grades
  // ───────────────────────────────────────────────────
  console.log('💰 Creating salary grades...');

  const salaryGrades = await Promise.all([
    prisma.salaryGrade.create({ data: { name: 'Executive', step: 1, monthlyMin: '150000.00', monthlyMax: '350000.00' } }),
    prisma.salaryGrade.create({ data: { name: 'Director', step: 2, monthlyMin: '100000.00', monthlyMax: '180000.00' } }),
    prisma.salaryGrade.create({ data: { name: 'Manager', step: 3, monthlyMin: '60000.00', monthlyMax: '110000.00' } }),
    prisma.salaryGrade.create({ data: { name: 'Senior', step: 4, monthlyMin: '45000.00', monthlyMax: '75000.00' } }),
    prisma.salaryGrade.create({ data: { name: 'Junior', step: 5, monthlyMin: '25000.00', monthlyMax: '50000.00' } }),
    prisma.salaryGrade.create({ data: { name: 'Staff', step: 6, monthlyMin: '18000.00', monthlyMax: '30000.00' } }),
  ]);

  const [sgExec, sgDir, sgMgr, sgSr, sgJr, sgStaff] = salaryGrades;
  console.log(`  ✅ Created ${salaryGrades.length} salary grades`);

  // ───────────────────────────────────────────────────
  // 5. Positions
  // ───────────────────────────────────────────────────
  console.log('💼 Creating positions...');

  const positions = await Promise.all([
    // Executive
    prisma.position.create({ data: { title: 'Chief Executive Officer', code: 'CEO', departmentId: deptExec.id, salaryGradeId: sgExec.id, minSalary: '250000.00', maxSalary: '400000.00', description: 'Highest-ranking executive' } }),
    prisma.position.create({ data: { title: 'Chief Technology Officer', code: 'CTO', departmentId: deptExec.id, salaryGradeId: sgExec.id, minSalary: '200000.00', maxSalary: '350000.00', description: 'Technology strategy lead' } }),
    // HR
    prisma.position.create({ data: { title: 'HR Director', code: 'HRD', departmentId: deptHR.id, salaryGradeId: sgDir.id, minSalary: '100000.00', maxSalary: '160000.00', description: 'HR department head' } }),
    prisma.position.create({ data: { title: 'HR Manager', code: 'HRM', departmentId: deptHR.id, salaryGradeId: sgMgr.id, minSalary: '65000.00', maxSalary: '95000.00', description: 'HR operations manager' } }),
    prisma.position.create({ data: { title: 'HR Specialist', code: 'HRS', departmentId: deptHR.id, salaryGradeId: sgSr.id, minSalary: '40000.00', maxSalary: '65000.00', description: 'HR operations specialist' } }),
    // Engineering
    prisma.position.create({ data: { title: 'VP Engineering', code: 'VPE', departmentId: deptEng.id, salaryGradeId: sgDir.id, minSalary: '160000.00', maxSalary: '250000.00', description: 'Engineering department head' } }),
    prisma.position.create({ data: { title: 'Engineering Manager', code: 'EM', departmentId: deptEng.id, salaryGradeId: sgMgr.id, minSalary: '85000.00', maxSalary: '130000.00', description: 'Engineering team lead' } }),
    prisma.position.create({ data: { title: 'Senior Software Engineer', code: 'SSE', departmentId: deptEng.id, salaryGradeId: sgSr.id, minSalary: '65000.00', maxSalary: '100000.00', description: 'Experienced full-stack developer' } }),
    prisma.position.create({ data: { title: 'Software Engineer', code: 'SE', departmentId: deptEng.id, salaryGradeId: sgJr.id, minSalary: '35000.00', maxSalary: '65000.00', description: 'Software developer' } }),
    prisma.position.create({ data: { title: 'Junior Software Engineer', code: 'JSE', departmentId: deptEng.id, salaryGradeId: sgJr.id, minSalary: '25000.00', maxSalary: '40000.00', description: 'Entry-level developer' } }),
    // Finance
    prisma.position.create({ data: { title: 'Finance Manager', code: 'FM', departmentId: deptFin.id, salaryGradeId: sgMgr.id, minSalary: '70000.00', maxSalary: '110000.00', description: 'Finance team lead' } }),
    prisma.position.create({ data: { title: 'Accountant', code: 'ACC', departmentId: deptFin.id, salaryGradeId: sgSr.id, minSalary: '40000.00', maxSalary: '65000.00', description: 'General accountant' } }),
    // Marketing
    prisma.position.create({ data: { title: 'Marketing Manager', code: 'MM', departmentId: deptMkt.id, salaryGradeId: sgMgr.id, minSalary: '60000.00', maxSalary: '95000.00', description: 'Marketing team lead' } }),
    prisma.position.create({ data: { title: 'Marketing Specialist', code: 'MS', departmentId: deptMkt.id, salaryGradeId: sgJr.id, minSalary: '30000.00', maxSalary: '50000.00', description: 'Digital marketing specialist' } }),
    // Operations
    prisma.position.create({ data: { title: 'Operations Manager', code: 'OM', departmentId: deptOps.id, salaryGradeId: sgMgr.id, minSalary: '60000.00', maxSalary: '95000.00', description: 'Operations team lead' } }),
    prisma.position.create({ data: { title: 'Admin Assistant', code: 'AA', departmentId: deptOps.id, salaryGradeId: sgStaff.id, minSalary: '18000.00', maxSalary: '28000.00', description: 'Administrative support' } }),
  ]);

  const [posCEO, posCTO, posHRD, posHRM, posHRS, posVPE, posEM, posSSE, posSE, posJSE, posFM, posACC, posMM, posMS, posOM, posAA] = positions;
  console.log(`  ✅ Created ${positions.length} positions`);

  // ───────────────────────────────────────────────────
  // 6. Employees (10)
  // ───────────────────────────────────────────────────
  console.log('👤 Creating employees...');

  const employeeData = [
    {
      employeeCode: 'EMP-0001', firstName: 'Juan', middleName: 'Santos', lastName: 'Dela Cruz',
      birthDate: birthDate(52), birthPlace: 'Manila', gender: Gender.Male, civilStatus: CivilStatus.Married,
      religion: 'Roman Catholic', bloodType: 'O+',
      personalEmail: 'juan.delacruz@email.com', mobileNumber: generateMobile(),
      dateHired: pastDate(2555), dateRegularized: pastDate(2370),
      employmentTypeId: etRegular.id, employmentStatus: EmploymentStatus.Active,
      departmentId: deptExec.id, position: posCEO,
    },
    {
      employeeCode: 'EMP-0002', firstName: 'Maria', middleName: null, lastName: 'Reyes',
      birthDate: birthDate(45), birthPlace: 'Cebu City', gender: Gender.Female, civilStatus: CivilStatus.Married,
      religion: 'Roman Catholic', bloodType: 'A+',
      personalEmail: 'maria.reyes@email.com', mobileNumber: generateMobile(),
      dateHired: pastDate(2190), dateRegularized: pastDate(2005),
      employmentTypeId: etRegular.id, employmentStatus: EmploymentStatus.Active,
      departmentId: deptExec.id, position: posCTO,
    },
    {
      employeeCode: 'EMP-0003', firstName: 'Carlos', middleName: 'Miguel', lastName: 'Gonzales',
      birthDate: birthDate(38), birthPlace: 'Davao City', gender: Gender.Male, civilStatus: CivilStatus.Single,
      religion: 'Iglesia ni Cristo', bloodType: 'B+',
      personalEmail: 'carlos.gonzales@email.com', mobileNumber: generateMobile(),
      dateHired: pastDate(1460), dateRegularized: pastDate(1275),
      employmentTypeId: etRegular.id, employmentStatus: EmploymentStatus.Active,
      departmentId: deptHR.id, position: posHRD,
    },
    {
      employeeCode: 'EMP-0004', firstName: 'Angelica', middleName: 'Mae', lastName: 'Santos',
      birthDate: birthDate(32), birthPlace: 'Quezon City', gender: Gender.Female, civilStatus: CivilStatus.Single,
      religion: 'Roman Catholic', bloodType: 'AB+',
      personalEmail: 'angelica.santos@email.com', mobileNumber: generateMobile(),
      dateHired: pastDate(1095), dateRegularized: pastDate(910),
      employmentTypeId: etRegular.id, employmentStatus: EmploymentStatus.Active,
      departmentId: deptHR.id, position: posHRM,
    },
    {
      employeeCode: 'EMP-0005', firstName: 'Rafael', middleName: null, lastName: 'Cruz',
      birthDate: birthDate(28), birthPlace: 'Makati', gender: Gender.Male, civilStatus: CivilStatus.Single,
      religion: 'Roman Catholic', bloodType: 'O-',
      personalEmail: 'rafael.cruz@email.com', mobileNumber: generateMobile(),
      dateHired: pastDate(730), dateRegularized: pastDate(545),
      employmentTypeId: etRegular.id, employmentStatus: EmploymentStatus.Active,
      departmentId: deptHR.id, position: posHRS,
    },
    {
      employeeCode: 'EMP-0006', firstName: 'Paolo', middleName: 'Angelo', lastName: 'Villar',
      birthDate: birthDate(40), birthPlace: 'Pasig', gender: Gender.Male, civilStatus: CivilStatus.Married,
      religion: 'Born Again Christian', bloodType: 'A-',
      personalEmail: 'paolo.villar@email.com', mobileNumber: generateMobile(),
      dateHired: pastDate(1825), dateRegularized: pastDate(1640),
      employmentTypeId: etRegular.id, employmentStatus: EmploymentStatus.Active,
      departmentId: deptEng.id, position: posVPE,
    },
    {
      employeeCode: 'EMP-0007', firstName: 'Sofia', middleName: 'Marie', lastName: 'Lim',
      birthDate: birthDate(35), birthPlace: 'Taguig', gender: Gender.Female, civilStatus: CivilStatus.Married,
      religion: 'Roman Catholic', bloodType: 'B-',
      personalEmail: 'sofia.lim@email.com', mobileNumber: generateMobile(),
      dateHired: pastDate(1460), dateRegularized: pastDate(1275),
      employmentTypeId: etRegular.id, employmentStatus: EmploymentStatus.Active,
      departmentId: deptEng.id, position: posEM,
    },
    {
      employeeCode: 'EMP-0008', firstName: 'Gabriel', middleName: null, lastName: 'Tan',
      birthDate: birthDate(26), birthPlace: 'Mandaluyong', gender: Gender.Male, civilStatus: CivilStatus.Single,
      religion: 'Roman Catholic', bloodType: 'O+',
      personalEmail: 'gabriel.tan@email.com', mobileNumber: generateMobile(),
      dateHired: pastDate(365), dateRegularized: pastDate(180),
      employmentTypeId: etProbationary.id, employmentStatus: EmploymentStatus.Active,
      departmentId: deptEng.id, position: posSE,
    },
    {
      employeeCode: 'EMP-0009', firstName: 'Patricia', middleName: 'Anne', lastName: 'Rivera',
      birthDate: birthDate(29), birthPlace: 'Pasay', gender: Gender.Female, civilStatus: CivilStatus.Single,
      religion: 'Roman Catholic', bloodType: 'A+',
      personalEmail: 'patricia.rivera@email.com', mobileNumber: generateMobile(),
      dateHired: pastDate(545), dateRegularized: pastDate(360),
      employmentTypeId: etRegular.id, employmentStatus: EmploymentStatus.Active,
      departmentId: deptFin.id, position: posFM,
    },
    {
      employeeCode: 'EMP-0010', firstName: 'Miguel', middleName: 'Luis', lastName: 'Bautista',
      birthDate: birthDate(24), birthPlace: 'San Juan', gender: Gender.Male, civilStatus: CivilStatus.Single,
      religion: 'Aglipayan', bloodType: 'AB-',
      personalEmail: 'miguel.bautista@email.com', mobileNumber: generateMobile(),
      dateHired: pastDate(180), dateRegularized: null,
      employmentTypeId: etProbationary.id, employmentStatus: EmploymentStatus.Active,
      departmentId: deptEng.id, position: posJSE,
    },
  ];

  interface CreatedEmployee {
    id: string;
    departmentId: string | null;
    dateHired: Date;
    position: (typeof positions)[number];
  }

  const createdEmployees: CreatedEmployee[] = [];

  for (const emp of employeeData) {
    const { position, ...empFields } = emp;

    const employee = await prisma.employee.create({
      data: empFields,
    });

    createdEmployees.push({ ...employee, position } as CreatedEmployee);
  }

  console.log(`  ✅ Created ${createdEmployees.length} employees`);

  // ───────────────────────────────────────────────────
  // 7. Employee Sub-Records
  // ───────────────────────────────────────────────────

  // 7a. Employee Positions (link each employee to their position)
  console.log('🔗 Creating employee position assignments...');
  for (const emp of createdEmployees) {
    const dept = departments.find((d) => d.id === emp.departmentId);
    await prisma.employeePosition.create({
      data: {
        employeeId: emp.id,
        positionId: emp.position.id,
        departmentId: dept!.id,
        startDate: emp.dateHired,
        isPrimary: true,
        changeReason: 'Initial appointment',
      },
    });
  }
  console.log(`  ✅ Created ${createdEmployees.length} employee position links`);

  // 7b. Employee Addresses (Permanent + Current for each employee)
  console.log('📍 Creating employee addresses...');
  const barangays = ['San Antonio', 'Poblacion', 'Bagong Silang', 'Holy Spirit', 'Batasan Hills', 'Santo Niño'];
  const streets = ['123 Rizal St.', '456 Mabini Ave.', '789 Bonifacio Blvd.', '321 Aguinaldo Rd.', '654 Quezon Ave.'];

  for (const emp of createdEmployees) {
    // Permanent address
    await prisma.employeeAddress.create({
      data: {
        employeeId: emp.id,
        type: AddressType.Permanent,
        street: pick(streets),
        barangay: pick(barangays),
        cityMunicipality: pick(['Quezon City', 'Manila', 'Makati', 'Pasig', 'Taguig', 'Mandaluyong', 'Cebu City', 'Davao City']),
        province: pick(['Metro Manila', 'Cebu', 'Davao del Sur', 'Laguna', 'Cavite']),
        region: 'NCR',
        zipCode: `${randInt(1000, 9999)}`,
        country: 'Philippines',
        isPrimary: true,
      },
    });
    // Current address (same as permanent for most)
    await prisma.employeeAddress.create({
      data: {
        employeeId: emp.id,
        type: AddressType.Current,
        street: pick(streets),
        barangay: pick(barangays),
        cityMunicipality: pick(['Quezon City', 'Manila', 'Makati', 'Pasig', 'Taguig', 'Mandaluyong']),
        province: 'Metro Manila',
        region: 'NCR',
        zipCode: `${randInt(1000, 9999)}`,
        country: 'Philippines',
        isPrimary: false,
      },
    });
  }
  console.log(`  ✅ Created ${createdEmployees.length * 2} employee addresses`);

  // 7c. Employee Government IDs
  console.log('🆔 Creating employee government IDs...');
  const taxStatusCodes = ['S', 'ME1', 'ME2', 'ME3', 'ME4'];

  for (const emp of createdEmployees) {
    await prisma.employeeGovernmentId.create({
      data: {
        employeeId: emp.id,
        sssNumber: generateSSS(),
        philhealthNumber: generatePhilHealth(),
        pagibigNumber: generatePagIBIG(),
        tin: generateTIN(),
        taxStatusCode: pick(taxStatusCodes),
      },
    });
  }
  console.log(`  ✅ Created ${createdEmployees.length} government ID records`);

  // 7d. Emergency Contacts (1-2 per employee)
  console.log('🚨 Creating emergency contacts...');
  const contactNames = [
    { fullName: 'Maria Dela Cruz', relationship: 'Spouse' },
    { fullName: 'Pedro Reyes', relationship: 'Spouse' },
    { fullName: 'Juanita Gonzales', relationship: 'Parent' },
    { fullName: 'Roberto Santos', relationship: 'Parent' },
    { fullName: 'Ana Cruz', relationship: 'Sibling' },
    { fullName: 'Jose Villar', relationship: 'Spouse' },
    { fullName: 'Eduardo Lim', relationship: 'Spouse' },
    { fullName: 'Rosario Tan', relationship: 'Parent' },
    { fullName: 'Fernando Rivera', relationship: 'Sibling' },
    { fullName: 'Teresa Bautista', relationship: 'Parent' },
  ];

  for (let i = 0; i < createdEmployees.length; i++) {
    const emp = createdEmployees[i];

    // Primary emergency contact
    await prisma.employeeEmergencyContact.create({
      data: {
        employeeId: emp.id,
        fullName: contactNames[i].fullName,
        relationship: contactNames[i].relationship,
        mobileNumber: generateMobile(),
        isPrimary: true,
      },
    });

    // Secondary emergency contact (for some)
    if (i % 2 === 0) {
      await prisma.employeeEmergencyContact.create({
        data: {
          employeeId: emp.id,
          fullName: contactNames[(i + 1) % contactNames.length].fullName,
          relationship: 'Sibling',
          mobileNumber: generateMobile(),
          isPrimary: false,
        },
      });
    }
  }
  console.log(`  ✅ Created emergency contacts`);

  // ───────────────────────────────────────────────────
  // 8. Manager Relationships
  // ───────────────────────────────────────────────────
  console.log('👔 Assigning manager relationships...');

  // EMP-0001 (CEO) has no manager
  // EMP-0002 (CTO) reports to CEO
  await prisma.employee.update({ where: { id: createdEmployees[1].id }, data: { managerId: createdEmployees[0].id } });
  // EMP-0003 (HR Director) reports to CEO
  await prisma.employee.update({ where: { id: createdEmployees[2].id }, data: { managerId: createdEmployees[0].id } });
  // EMP-0004 (HR Manager) reports to HR Director
  await prisma.employee.update({ where: { id: createdEmployees[3].id }, data: { managerId: createdEmployees[2].id } });
  // EMP-0005 (HR Specialist) reports to HR Manager
  await prisma.employee.update({ where: { id: createdEmployees[4].id }, data: { managerId: createdEmployees[3].id } });
  // EMP-0006 (VP Eng) reports to CTO
  await prisma.employee.update({ where: { id: createdEmployees[5].id }, data: { managerId: createdEmployees[1].id } });
  // EMP-0007 (Eng Manager) reports to VP Eng
  await prisma.employee.update({ where: { id: createdEmployees[6].id }, data: { managerId: createdEmployees[5].id } });
  // EMP-0008 (SE) reports to Eng Manager
  await prisma.employee.update({ where: { id: createdEmployees[7].id }, data: { managerId: createdEmployees[6].id } });
  // EMP-0009 (Finance Manager) reports to CEO
  await prisma.employee.update({ where: { id: createdEmployees[8].id }, data: { managerId: createdEmployees[0].id } });
  // EMP-0010 (JSE) reports to Eng Manager
  await prisma.employee.update({ where: { id: createdEmployees[9].id }, data: { managerId: createdEmployees[6].id } });

  console.log(`  ✅ Assigned manager relationships`);

  // Also update department managers
  await prisma.department.update({ where: { id: deptExec.id }, data: { managerId: createdEmployees[0].id } });
  await prisma.department.update({ where: { id: deptHR.id }, data: { managerId: createdEmployees[2].id } });
  await prisma.department.update({ where: { id: deptEng.id }, data: { managerId: createdEmployees[5].id } });
  await prisma.department.update({ where: { id: deptFin.id }, data: { managerId: createdEmployees[8].id } });

  console.log(`  ✅ Updated department managers`);

  // ───────────────────────────────────────────────────
  // 9. Leave Types (PH Labor Code + company-discretionary)
  // ───────────────────────────────────────────────────
  console.log('📅 Creating leave types...');

  const leaveTypes = await Promise.all([
    // PH-Mandated
    prisma.leaveType.create({
      data: { name: 'Service Incentive Leave', code: 'SIL', isPaid: true, defaultDaysPerYear: 5, maxCarryoverDays: 5, requiresAttachment: false, applicableTo: 'All', isMandatedByLaw: true, description: 'Labor Code Art. 95 — 5 days after 1 year of service; convertible to cash' },
    }),
    prisma.leaveType.create({
      data: { name: 'Maternity Leave', code: 'ML', isPaid: true, defaultDaysPerYear: 105, maxCarryoverDays: 0, requiresAttachment: true, applicableTo: 'Female', isMandatedByLaw: true, description: 'RA 11210 — 105 days (120 for solo parent); SSS-funded' },
    }),
    prisma.leaveType.create({
      data: { name: 'Paternity Leave', code: 'PL', isPaid: true, defaultDaysPerYear: 7, maxCarryoverDays: 0, requiresAttachment: false, applicableTo: 'MarriedMale', isMandatedByLaw: true, description: 'RA 8187 — 7 days for married male employees; first 4 deliveries' },
    }),
    prisma.leaveType.create({
      data: { name: 'Solo Parent Leave', code: 'SPL', isPaid: true, defaultDaysPerYear: 7, maxCarryoverDays: 0, requiresAttachment: true, applicableTo: 'SoloParent', isMandatedByLaw: true, description: 'RA 8972 / RA 11861 — 7 days for solo parents with valid ID' },
    }),
    prisma.leaveType.create({
      data: { name: 'VAWC Leave', code: 'VAWC', isPaid: true, defaultDaysPerYear: 10, maxCarryoverDays: 0, requiresAttachment: true, applicableTo: 'Female', isMandatedByLaw: true, description: 'RA 9262 — 10 days for women victims of violence' },
    }),
    prisma.leaveType.create({
      data: { name: 'Special Leave for Women', code: 'SLW', isPaid: true, defaultDaysPerYear: 60, maxCarryoverDays: 0, requiresAttachment: true, applicableTo: 'Female', isMandatedByLaw: true, description: 'RA 9710 — 2 months for gynecological surgery' },
    }),
    // Company-Discretionary
    prisma.leaveType.create({
      data: { name: 'Vacation Leave', code: 'VL', isPaid: true, defaultDaysPerYear: 15, maxCarryoverDays: 5, requiresAttachment: false, applicableTo: 'All', isMandatedByLaw: false, description: 'Paid vacation leave for rest and recreation' },
    }),
    prisma.leaveType.create({
      data: { name: 'Sick Leave', code: 'SL', isPaid: true, defaultDaysPerYear: 12, maxCarryoverDays: 0, requiresAttachment: false, applicableTo: 'All', isMandatedByLaw: false, description: 'Medical leave for illness or injury; 3+ days requires med cert' },
    }),
    prisma.leaveType.create({
      data: { name: 'Emergency Leave', code: 'EL', isPaid: true, defaultDaysPerYear: 5, maxCarryoverDays: 0, requiresAttachment: false, applicableTo: 'All', isMandatedByLaw: false, description: 'For natural calamities and family emergencies' },
    }),
    prisma.leaveType.create({
      data: { name: 'Bereavement Leave', code: 'BL', isPaid: true, defaultDaysPerYear: 5, maxCarryoverDays: 0, requiresAttachment: false, applicableTo: 'All', isMandatedByLaw: false, description: 'Leave for death in immediate family' },
    }),
  ]);

  const [ltSIL, ltML, ltPL, ltSPL, ltVAWC, ltSLW, ltVL, ltSL, ltEL, ltBL] = leaveTypes;
  console.log(`  ✅ Created ${leaveTypes.length} leave types`);

  // ───────────────────────────────────────────────────
  // 10. PH Holidays (2026)
  // ───────────────────────────────────────────────────
  console.log('🎌 Creating PH holidays (2026)...');

  const holidays = await Promise.all([
    prisma.holiday.create({ data: { name: "New Year's Day", date: new Date('2026-01-01'), type: 'Regular', isRecurringYearly: true, year: 2026 } }),
    prisma.holiday.create({ data: { name: 'Araw ng Kagitingan', date: new Date('2026-04-09'), type: 'Regular', isRecurringYearly: true, year: 2026 } }),
    prisma.holiday.create({ data: { name: 'Maundy Thursday', date: new Date('2026-04-02'), type: 'Regular', isRecurringYearly: true, year: 2026 } }),
    prisma.holiday.create({ data: { name: 'Good Friday', date: new Date('2026-04-03'), type: 'Regular', isRecurringYearly: true, year: 2026 } }),
    prisma.holiday.create({ data: { name: 'Labor Day', date: new Date('2026-05-01'), type: 'Regular', isRecurringYearly: true, year: 2026 } }),
    prisma.holiday.create({ data: { name: 'Independence Day', date: new Date('2026-06-12'), type: 'Regular', isRecurringYearly: true, year: 2026 } }),
    prisma.holiday.create({ data: { name: 'National Heroes Day', date: new Date('2026-08-31'), type: 'Regular', isRecurringYearly: true, year: 2026 } }),
    prisma.holiday.create({ data: { name: 'Bonifacio Day', date: new Date('2026-11-30'), type: 'Regular', isRecurringYearly: true, year: 2026 } }),
    prisma.holiday.create({ data: { name: 'Christmas Day', date: new Date('2026-12-25'), type: 'Regular', isRecurringYearly: true, year: 2026 } }),
    prisma.holiday.create({ data: { name: 'Rizal Day', date: new Date('2026-12-30'), type: 'Regular', isRecurringYearly: true, year: 2026 } }),
    prisma.holiday.create({ data: { name: "Eid'l Fitr", date: new Date('2026-03-20'), type: 'Regular', isRecurringYearly: false, year: 2026, description: 'Provisional date — subject to proclamation' } }),
    prisma.holiday.create({ data: { name: 'Chinese New Year', date: new Date('2026-02-17'), type: 'SpecialNonWorking', isRecurringYearly: false, year: 2026 } }),
    prisma.holiday.create({ data: { name: 'EDSA People Power Anniversary', date: new Date('2026-02-25'), type: 'SpecialNonWorking', isRecurringYearly: true, year: 2026 } }),
    prisma.holiday.create({ data: { name: 'Black Saturday', date: new Date('2026-04-04'), type: 'SpecialNonWorking', isRecurringYearly: true, year: 2026 } }),
    prisma.holiday.create({ data: { name: 'Ninoy Aquino Day', date: new Date('2026-08-21'), type: 'SpecialNonWorking', isRecurringYearly: true, year: 2026 } }),
    prisma.holiday.create({ data: { name: 'All Saints Day', date: new Date('2026-11-01'), type: 'SpecialNonWorking', isRecurringYearly: true, year: 2026 } }),
    prisma.holiday.create({ data: { name: 'Feast of Immaculate Conception', date: new Date('2026-12-08'), type: 'SpecialNonWorking', isRecurringYearly: true, year: 2026 } }),
    prisma.holiday.create({ data: { name: 'Christmas Eve', date: new Date('2026-12-24'), type: 'SpecialNonWorking', isRecurringYearly: true, year: 2026 } }),
    prisma.holiday.create({ data: { name: 'New Year\'s Eve', date: new Date('2026-12-31'), type: 'SpecialNonWorking', isRecurringYearly: true, year: 2026 } }),
  ]);

  console.log(`  ✅ Created ${holidays.length} holidays for 2026`);

  // ───────────────────────────────────────────────────
  // 11. Leave Balances (for each employee + VL + SL + SIL)
  // ───────────────────────────────────────────────────
  console.log('📊 Creating leave balances...');

  let balanceCount = 0;
  for (const emp of createdEmployees) {
    const year = 2026;
    // Every employee gets VL, SL, SIL, EL, BL
    for (const lt of [ltVL, ltSL, ltSIL, ltEL, ltBL]) {
      const used = randInt(0, Math.floor(Number(lt.defaultDaysPerYear) * 0.4));
      await prisma.leaveBalance.create({
        data: {
          employeeId: emp.id,
          leaveTypeId: lt.id,
          year,
          initialBalance: lt.defaultDaysPerYear,
          used,
          currentBalance: Number(lt.defaultDaysPerYear) - used,
        },
      });
      balanceCount++;
    }
  }
  console.log(`  ✅ Created ${balanceCount} leave balances`);

  // ───────────────────────────────────────────────────
  // 12. Sample Leave Requests
  // ───────────────────────────────────────────────────
  console.log('📝 Creating sample leave requests...');

  // Helper: next weekday date
  function nextWeekday(daysFromNow: number): Date {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + 1);
    return d;
  }

  const sampleRequests = [
    // EMP-0008 (SE, reports to EMP-0007 Eng Manager): VL
    { empIdx: 7, lt: ltVL, start: nextWeekday(5), end: nextWeekday(9), reason: 'Family vacation to Baguio', status: 'Pending' as const },
    // EMP-0008: SL
    { empIdx: 7, lt: ltSL, start: nextWeekday(1), end: nextWeekday(1), reason: 'Dental appointment', status: 'Approved' as const },
    // EMP-0010 (JSE, reports to EMP-0007 Eng Manager): VL
    { empIdx: 9, lt: ltVL, start: nextWeekday(12), end: nextWeekday(15), reason: 'Beach trip with family', status: 'Pending' as const },
    // EMP-0010: EL
    { empIdx: 9, lt: ltEL, start: nextWeekday(2), end: nextWeekday(2), reason: 'Bank errand — urgent', status: 'Rejected' as const },
    // EMP-0005 (HR Specialist, reports to EMP-0004 HR Manager): VL
    { empIdx: 4, lt: ltVL, start: nextWeekday(7), end: nextWeekday(8), reason: 'Anniversary celebration', status: 'Pending' as const },
    // EMP-0005: SL
    { empIdx: 4, lt: ltSL, start: nextWeekday(3), end: nextWeekday(4), reason: 'Flu — doctor advised rest', status: 'Approved' as const },
    // EMP-0007 (Eng Manager, reports to EMP-0006 VP Eng): VL
    { empIdx: 6, lt: ltVL, start: nextWeekday(18), end: nextWeekday(22), reason: 'Annual family leave', status: 'Approved' as const },
    // EMP-0007: BL
    { empIdx: 6, lt: ltBL, start: nextWeekday(6), end: nextWeekday(6), reason: 'Attend funeral of a relative', status: 'Approved' as const },
    // EMP-0004 (HR Manager, reports to EMP-0003 HR Director): VL
    { empIdx: 3, lt: ltVL, start: nextWeekday(30), end: nextWeekday(34), reason: 'International trip', status: 'Pending' as const },
    // EMP-0003 (HR Director, reports to EMP-0001 CEO): VL
    { empIdx: 2, lt: ltVL, start: nextWeekday(25), end: nextWeekday(29), reason: 'Family event in Cebu', status: 'Approved' as const },
  ];

  for (const req of sampleRequests) {
    const emp = createdEmployees[req.empIdx];
    const days = Math.ceil((req.end.getTime() - req.start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    // Count only weekdays
    let workingDays = 0;
    const cur = new Date(req.start);
    while (cur <= req.end) {
      const dow = cur.getDay();
      if (dow !== 0 && dow !== 6) workingDays++;
      cur.setDate(cur.getDate() + 1);
    }

    await prisma.leaveRequest.create({
      data: {
        employeeId: emp.id,
        leaveTypeId: req.lt.id,
        startDate: req.start,
        endDate: req.end,
        totalDays: workingDays,
        reason: req.reason,
        status: req.status,
        isEmergency: req.lt === ltEL,
      },
    });
  }
  console.log(`  ✅ Created ${sampleRequests.length} sample leave requests`);

  // ───────────────────────────────────────────────────
  // Summary
  // ───────────────────────────────────────────────────
  console.log('\n✨ Seed completed successfully!');
  console.log('───────────────────────────────────────');
  console.log(`  Employment Types:    ${employmentTypes.length}`);
  console.log(`  Departments:         ${departments.length} (${departments.length + sections.length} incl. sections)`);
  console.log(`  Salary Grades:       ${salaryGrades.length}`);
  console.log(`  Positions:           ${positions.length}`);
  console.log(`  Employees:           ${createdEmployees.length}`);
  console.log(`  Employee Positions:  ${createdEmployees.length}`);
  console.log(`  Addresses:           ${createdEmployees.length * 2}`);
  console.log(`  Government IDs:      ${createdEmployees.length}`);
  console.log(`  Leave Types:         ${leaveTypes.length}`);
  console.log(`  Holidays:            ${holidays.length}`);
  console.log(`  Leave Balances:      ${balanceCount}`);
  console.log(`  Leave Requests:      ${sampleRequests.length}`);
  console.log('───────────────────────────────────────');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
