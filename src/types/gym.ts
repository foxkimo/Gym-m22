export type AppRole = 'member' | 'coach' | 'staff' | 'accountant' | 'manager' | 'viewer';

export type MembershipTier = 'standard' | 'vip' | 'gold' | 'diamond';

export interface Exercise {
  id: string;
  nameAr: string;
  nameEn: string;
  targetMuscle: string;
  targetMuscleEn: string;
  equipment: string;
  sets: number;
  reps: string;
  restSeconds: number;
  videoUrl?: string;
  videoType?: 'file' | 'youtube' | 'vimeo' | 'link';
  videoUploadedBy?: string;
  videoUploadedAt?: string;
  gifUrl?: string;
  coachTipsAr?: string;
  coachTipsEn?: string;
  targetWeightKg?: number;
}

export interface WorkoutDay {
  id: string;
  dayNumber: number;
  titleAr: string;
  titleEn: string;
  focusMuscles: string[];
  exercises: Exercise[];
}

export interface WorkoutProgram {
  id: string;
  titleAr: string;
  titleEn: string;
  coachName: string;
  coachId?: string;
  createdAt: string;
  days: WorkoutDay[];
}

export interface SetRecord {
  setNumber: number;
  reps: number;
  weightKg: number;
  completed: boolean;
  notes?: string;
}

export interface ExerciseProgress {
  exerciseId: string;
  exerciseNameAr: string;
  sets: SetRecord[];
  notes?: string;
}

export interface WorkoutSession {
  id: string;
  memberId: string;
  membershipNumber: string;
  date: string;
  dayId: string;
  dayTitle: string;
  startedAt: string;
  completedAt?: string;
  durationMinutes?: number;
  exercisesProgress: ExerciseProgress[];
  rating?: number; // 1-5
  notes?: string;
}

export interface FinancialTransaction {
  id: string;
  memberId?: string;
  memberName?: string;
  membershipNumber?: string;
  type: 'subscription' | 'renewal' | 'pt_package' | 'locker' | 'supplement' | 'expense' | 'refund' | 'product_sale';
  voucherKind?: 'receipt' | 'payment'; // 'receipt' (سند قبض) | 'payment' (سند صرف)
  voucherSequenceNumber?: number; // الرقم التسلسلي للسند يبدأ من 1 ولا يتكرر إطلاقاً
  voucherCode?: string; // كود السند مثل #1 أو #2
  amount: number;
  paymentMethod: 'cash' | 'card' | 'transfer' | 'instapay' | 'vodafone_cash';
  date: string;
  recordedBy: string;
  notes?: string;
  shiftId?: string;
  invoiceNumber?: string;
  beneficiaryName?: string; // اسم المستفيد / المصروف إليه أو المستلم منه
  items?: { nameAr: string; quantity: number; unitPrice: number; total: number }[]; // Breakdown for granular reporting
}

export interface CashShift {
  id: string;
  staffId: string;
  staffName: string;
  openedAt: string;
  closedAt?: string;
  startingCash: number;
  expectedCash: number;
  actualCash?: number;
  cashDifference?: number;
  status: 'open' | 'closed';
  totalIncome: number;
  totalExpense: number;
  notes?: string;
}

export interface EmployeeAccount {
  id: string;
  role: 'coach' | 'staff' | 'accountant' | 'manager' | 'viewer';
  nameAr: string;
  nameEn: string;
  phone: string;
  username?: string;
  password?: string;
  accessCode: string;
  attendanceCode?: string; // كود تسجيل الحضور والانصراف السريع (مثال: 842105)
  specialty?: string;
  avatarUrl?: string;
  status: 'active' | 'suspended';
  hiredDate: string;
  baseSalary?: number;
  hourlyRate?: number; // Hourly wage rate e.g. 30 EGP/hour
  totalTraineesCount?: number;
  commissionRate?: number; // PT percentage e.g. 30%
  customPermissions?: Partial<RolePermissions>;
  createdTimestamp?: string; // Exact date and time when employee account was created
}

export interface EmployeeAttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  role: AppRole;
  date: string; // YYYY-MM-DD
  checkInTime: string; // HH:mm:ss
  checkOutTime?: string; // HH:mm:ss
  totalHoursWorked?: number;
  status: 'present' | 'late' | 'absent' | 'completed';
  notes?: string;
  recordedBy?: string;
  attendanceCodeUsed?: string;
  isEarlyDeparture?: boolean;
  earlyDepartureReason?: string;
}

export interface GymMember {
  id: string;
  membershipNumber: string; // unique 4 to 6 digit
  fullNameAr: string;
  fullNameEn: string;
  phone: string;
  username?: string;
  password?: string;
  passwordPin?: string; // 4-digit PIN / password for member personal login
  emergencyPhone?: string;
  gender: 'male' | 'female';
  birthDate?: string;
  address?: string;
  nationalId?: string;
  tier: MembershipTier;
  startDate: string;
  endDate: string;
  remainingDays: number;
  status: 'active' | 'expired' | 'frozen';
  assignedCoachId?: string;
  assignedCoachName?: string;
  currentProgram: WorkoutProgram;
  history: WorkoutSession[];
  attendanceCount: number;
  lastAttendanceDate?: string;
  avatarUrl?: string;
  inbodyScores?: {
    date: string;
    weightKg: number;
    muscleMassKg: number;
    bodyFatPercent: number;
    notes?: string;
  }[];
  financialHistory?: FinancialTransaction[];
  balanceDue?: number;
  notes?: string;
  customPermissions?: Partial<RolePermissions>;
  createdTimestamp?: string; // Exact date and time when member was created in system
  email?: string;
}

export interface SecurityAlert {
  id: string;
  timestamp: string; // ISO string
  date: string; // YYYY-MM-DD
  time: string; // HH:mm:ss
  usernameOrPhone: string;
  enteredPassword?: string;
  attemptsCount: number;
  reasonAr: string;
  reasonEn: string;
  status: 'unread' | 'read' | 'resolved';
  accountFound: boolean;
  accountName?: string;
  accountRole?: string;
  accountPhone?: string;
  accountType?: 'manager' | 'accountant' | 'staff' | 'coach' | 'member';
}

export type ManagerNotificationType = 
  | 'employee_checkin' 
  | 'employee_checkout' 
  | 'report_printed' 
  | 'report_downloaded' 
  | 'security_alert'
  | 'shift_open'
  | 'shift_close'
  | 'warning'
  | 'system';

export interface ManagerNotification {
  id: string;
  timestamp: string; // ISO string
  date: string; // YYYY-MM-DD
  time: string; // HH:mm:ss
  type: ManagerNotificationType;
  titleAr: string;
  titleEn: string;
  employeeId?: string;
  employeeName: string;
  employeeRole: string;
  shiftId?: string;
  reportType?: string;
  reportTitle?: string;
  workedHours?: number;
  workedHoursFormatted?: string;
  detailsAr: string;
  detailsEn?: string;
  status: 'unread' | 'read' | 'resolved';
}

export interface CurrentUser {
  role: AppRole;
  id: string;
  nameAr: string;
  nameEn: string;
  phone?: string;
  avatarUrl?: string;
  customPermissions?: Partial<RolePermissions>;
}

export interface MemberCheckInRecord {
  id: string;
  memberId: string;
  membershipNumber: string;
  memberNameAr: string;
  memberNameEn?: string;
  phone: string;
  avatarUrl?: string;
  tier: MembershipTier;
  checkInDate: string; // YYYY-MM-DD
  checkInTime: string; // HH:mm:ss
  checkInTimestamp: string; // ISO String
  statusAtCheckIn: 'active' | 'expired' | 'frozen';
  gateOrMethod: 'reception_qr' | 'manual_staff' | 'self_portal' | 'face_scan';
  performedByName: string;
  performedByRole: AppRole;
  remainingDaysAtCheckIn: number;
}

export interface CheckInEligibility {
  allowed: boolean;
  isWithin12Hours: boolean;
  remainingMs: number;
  remainingHours: number;
  remainingMinutes: number;
  remainingSeconds: number;
  lastCheckInTimestamp?: string;
  lastCheckInDate?: string;
  lastCheckInTime?: string;
  nextAllowedTimestamp?: string;
  nextAllowedTimeStr?: string;
  reasonAr: string;
  reasonEn: string;
}

export interface CheckInResult {
  success: boolean;
  record?: MemberCheckInRecord;
  isCooldownBlocked?: boolean;
  remainingHours?: number;
  remainingMinutes?: number;
  remainingSeconds?: number;
  nextAllowedTime?: string;
  lastCheckInTime?: string;
  errorAr?: string;
  errorEn?: string;
  messageAr?: string;
  messageEn?: string;
}

// -------------------------------------------------------------
// AUDIT & GOVERNANCE TYPES (سجل حركات النظام، المحذوفات، والتقارير)
// -------------------------------------------------------------

export type ActivityCategory = 
  | 'membership' 
  | 'financial' 
  | 'workout' 
  | 'shift' 
  | 'account' 
  | 'attendance' 
  | 'system'
  | 'deletion';

export type ActivityActionType =
  | 'create'
  | 'update'
  | 'delete'
  | 'restore'
  | 'login'
  | 'checkout'
  | 'shift_open'
  | 'shift_close'
  | 'payment'
  | 'freeze';

export interface SystemActivityLog {
  id: string;
  timestamp: string; // ISO date string
  date: string; // YYYY-MM-DD
  time: string; // HH:mm:ss
  performerId: string;
  performerName: string;
  performerRole: AppRole;
  category: ActivityCategory;
  actionType: ActivityActionType;
  titleAr: string;
  titleEn: string;
  detailsAr: string;
  detailsEn: string;
  targetId?: string;
  targetName?: string;
  targetType?: 'member' | 'staff' | 'coach' | 'transaction' | 'shift' | 'program' | 'membership';
  ipAddress?: string;
  deviceInfo?: string;
  oldValueSummary?: string;
  newValueSummary?: string;
}

export interface ArchivedReport {
  id: string;
  reportNumber: string; // e.g. RPT-2026-W38
  periodTitleAr: string;
  periodTitleEn: string;
  dateRange: {
    start: string;
    end: string;
  };
  archivedAt: string;
  archivedBy: string;
  archivedByRole: string;
  metrics: {
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    cashAmount: number;
    electronicAmount: number;
    activeMembersCount: number;
    renewalsCount: number;
    newMembersCount: number;
    totalAttendances: number;
    completedShiftsCount: number;
  };
  notesAr?: string;
  notesEn?: string;
}

export interface DeletedRecordItem {
  id: string;
  originalId: string;
  itemType: 'member' | 'staff' | 'coach' | 'transaction' | 'shift' | 'program';
  titleAr: string;
  titleEn: string;
  identifier: string; // e.g. membership number, phone, invoice #
  deletedAt: string;
  deletedBy: string;
  deletedByRole: AppRole;
  reason?: string;
  snapshotData: Record<string, any>;
  canRestore: boolean;
  restoredAt?: string;
  restoredBy?: string;
}

export interface AccountModificationLog {
  id: string;
  timestamp: string;
  date: string;
  time: string;
  targetType: 'member' | 'staff' | 'coach';
  targetId: string;
  targetName: string;
  fieldName: string;
  fieldNameAr: string;
  oldValue: string | number;
  newValue: string | number;
  changedBy: string;
  changedByRole: AppRole;
  reasonAr?: string;
  approvedByManager?: boolean;
}

// -------------------------------------------------------------
// PERMISSIONS & TASKS (تخصيص الأذونات والمهام)
// -------------------------------------------------------------
export interface RolePermissions {
  canManageMembers: boolean;
  canManageMemberPermissions?: boolean;
  canIssueDiscounts: boolean;
  canFreezeMemberships: boolean;
  canOpenCloseShifts: boolean;
  canRecordTransactions: boolean;
  canViewPayroll: boolean;
  canManagePayroll: boolean;
  canViewReports: boolean;
  canEditWorkouts: boolean;
  canAccessAuditLogs: boolean;
  canAccessRecycleBin: boolean;
  canManageAccounts: boolean;
  canManageServices: boolean;
  canExportPDF: boolean;
}

export interface EmployeeTaskItem {
  id: string;
  titleAr: string;
  titleEn: string;
  assignedToId: string;
  assignedToName: string;
  assignedRole: AppRole;
  priority: 'urgent' | 'high' | 'normal';
  status: 'pending' | 'in_progress' | 'completed';
  dueDate: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
}

// -------------------------------------------------------------
// CLUB SERVICES & PRODUCTS (تطبيق الخدمات والمنتجات)
// -------------------------------------------------------------
export interface ClubServiceItem {
  id: string;
  nameAr: string;
  nameEn: string;
  category: 'subscription' | 'pt_session' | 'inbody' | 'bar_supplements' | 'recovery_spa' | 'locker_gear';
  price: number;
  costPrice?: number;
  durationDays?: number;
  sessionsCount?: number;
  stock?: number;
  descriptionAr: string;
  badge?: string;
  iconType: string;
}

export interface ClubCartItem {
  service: ClubServiceItem;
  quantity: number;
}

export interface ClubOrderReceipt {
  id: string;
  orderNumber: string; // e.g. ORD-2026-1044
  items: {
    serviceId: string;
    nameAr: string;
    category?: 'subscription' | 'pt_session' | 'inbody' | 'bar_supplements' | 'recovery_spa' | 'locker_gear';
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  paymentMethod: 'cash' | 'card' | 'instapay' | 'vodafone_cash';
  memberId?: string;
  memberName: string;
  membershipNumber?: string;
  servedBy: string;
  servedByRole: string;
  date: string;
  time: string;
  notes?: string;
  shiftId?: string;
}

// -------------------------------------------------------------
// EMPLOYMENT CONTRACTS & OPERATIONAL DUTIES (عقود العمل والمهام التشغيلية الرسمية)
// -------------------------------------------------------------
export interface EmploymentContract {
  id: string;
  employeeId: string;
  employeeName: string;
  employeePhone: string;
  employeeRole: AppRole;
  hiredDate: string;
  contractDate: string;
  salary: number;
  agreementTerms: string;
  operationalDuties?: string[]; // قائمة المهام والمسؤوليات التشغيلية الرسمية
  dutiesAgreed?: boolean; // إقرار وموافقة الكابتن/الموظف على كافة المهام التشغيلية
  isEmployeeAgreed: boolean;
  agreeTimestamp?: string;
  status: 'active' | 'terminated' | 'rejected';
  signedPlace: string;
  customClauses?: string[];
}

// -------------------------------------------------------------
// EXERCISE VIDEO LIBRARY / FOLDERS (مكتبة ومجلد فيديوهات التمارين والأجهزة)
// -------------------------------------------------------------
export interface ExerciseLibraryItem {
  id: string;
  titleAr: string;
  titleEn?: string;
  targetMuscle: string;
  folderCategory: string; // اسم المجلد
  descriptionAr: string; // وصف وشرح التكنيك
  descriptionEn?: string;
  durationMinutes?: number; // مدة التمرين بالدقائق
  durationSeconds?: number;
  machineNumber?: string; // رقم الجهاز بالصالة
  machineName?: string; // اسم الجهاز
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  videoUrl: string;
  videoType: 'file' | 'youtube' | 'vimeo' | 'link';
  thumbnailUrl?: string;
  addedBy: string;
  addedByRole: AppRole;
  createdAt: string;
  updatedAt?: string;
  targetSets?: number;
  targetReps?: string;
  equipment?: string;
}

// -------------------------------------------------------------
// MEMBERSHIP PLANS & PRICING (باقات وخطط الاشتراكات والأسعار والخصومات والمزايا)
// -------------------------------------------------------------
export interface MembershipPlan {
  id: string;
  tierKey: string; // 'standard' | 'vip' | 'gold' | 'diamond' | 'student' | 'annual'
  nameAr: string;
  nameEn: string;
  durationMonths: number;
  durationDays: number;
  originalPrice: number;
  discountPercentage?: number;
  finalPrice: number;
  badgeAr?: string;
  badgeEn?: string;
  featuresAr: string[];
  featuresEn?: string[];
  freeInBodyCount: number;
  freePTSessionsCount: number;
  freeFreezeDays: number;
  freeSpaSessions: number;
  isPopular?: boolean;
  isActive: boolean;
  updatedAt?: string;
  updatedBy?: string;
}


// -------------------------------------------------------------
// SENSITIVE MODIFICATIONS (سجل الرقابة على التعديلات الحساسة)
// -------------------------------------------------------------
export interface SensitiveModificationLog {
  id: string;
  timestamp: string;
  date: string;
  time: string;
  category: 'price_override' | 'manual_subscription' | 'data_deletion' | 'settings_change' | 'balance_adjustment' | 'plan_update' | 'financial_override' | 'database_reset';
  titleAr: string;
  titleEn: string;
  detailsAr: string;
  detailsEn: string;
  performerId: string;
  performerName: string;
  performerRole: AppRole;
  targetId?: string;
  targetName?: string;
  oldValue?: string | number;
  newValue?: string | number;
  reason?: string;
}
