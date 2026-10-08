import { 
  GymMember, 
  EmployeeAccount, 
  EmployeeAttendanceRecord, 
  CashShift, 
  FinancialTransaction,
  SystemActivityLog,
  ArchivedReport,
  DeletedRecordItem,
  AccountModificationLog,
  WorkoutProgram,
  ManagerNotification
} from '../types/gym';

export const INITIAL_MANAGER_ACCOUNTS: EmployeeAccount[] = [
  {
    id: 'mgr-1',
    role: 'manager',
    nameAr: 'كابتن محمود الغندور (المدير العام)',
    nameEn: 'Capt. Mahmoud El-Ghandour (General Manager)',
    phone: '01011223344',
    username: 'gm',
    password: '9999',
    accessCode: '9999',
    attendanceCode: '9001',
    specialty: 'إدارة وتطوير الأندية الرياضية المتقدمة',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    status: 'active',
    hiredDate: '2023-01-01',
    baseSalary: 18000
  },
  {
    id: 'mgr-2',
    role: 'manager',
    nameAr: 'كابتن كريم هنداوي (مدير الصالة)',
    nameEn: 'Capt. Karim Hendawy (Gym Manager)',
    phone: '01022334455',
    username: 'karim',
    password: '8888',
    accessCode: '8888',
    attendanceCode: '9002',
    specialty: 'مدير الصالة والإشراف الميداني',
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    status: 'active',
    hiredDate: '2023-03-01',
    baseSalary: 12000
  },
  {
    id: 'mgr-3',
    role: 'manager',
    nameAr: 'كابتن أحمد جابر (مدير الصالة)',
    nameEn: 'Capt. Ahmed Jaber (Gym Manager)',
    phone: '01033445566',
    username: 'ahmedjaber',
    password: '7777',
    accessCode: '7777',
    attendanceCode: '9003',
    specialty: 'مدير الصالة والمناوبة الإدارية',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    status: 'active',
    hiredDate: '2023-04-01',
    baseSalary: 12000
  }
];

export const INITIAL_COACH_ACCOUNTS: EmployeeAccount[] = [
  {
    id: 'coach-1',
    role: 'coach',
    nameAr: 'كابتن أحمد عز الدين',
    nameEn: 'Capt. Ahmed Ezz El-Din',
    phone: '01122334455',
    username: 'coach1',
    password: '1111',
    accessCode: '1111',
    attendanceCode: '1001',
    specialty: 'كمال أجسام ورفع أثقال وتأهيل إصابات',
    avatarUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=150&auto=format&fit=crop&q=80',
    status: 'active',
    hiredDate: '2023-06-15',
    baseSalary: 7500,
    totalTraineesCount: 14,
    commissionRate: 35,
    customPermissions: {
      canManageMembers: false,
      canIssueDiscounts: false,
      canFreezeMemberships: false,
      canOpenCloseShifts: false,
      canRecordTransactions: false,
      canViewPayroll: false,
      canManagePayroll: false,
      canViewReports: false,
      canEditWorkouts: true,
      canAccessAuditLogs: false,
      canAccessRecycleBin: false,
      canManageAccounts: false,
      canManageServices: false,
      canExportPDF: true
    }
  },
  {
    id: 'coach-2',
    role: 'coach',
    nameAr: 'كابتن طارق الشناوي',
    nameEn: 'Capt. Tarek El-Shenawy',
    phone: '01233445566',
    username: 'coach2',
    password: '2222',
    accessCode: '2222',
    attendanceCode: '1002',
    specialty: 'تنشيف ولياقة بدنية وكارديو HIIT',
    avatarUrl: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=150&auto=format&fit=crop&q=80',
    status: 'active',
    hiredDate: '2023-09-01',
    baseSalary: 7000,
    totalTraineesCount: 9,
    commissionRate: 30,
    customPermissions: {
      canManageMembers: false,
      canIssueDiscounts: false,
      canFreezeMemberships: false,
      canOpenCloseShifts: false,
      canRecordTransactions: false,
      canViewPayroll: false,
      canManagePayroll: false,
      canViewReports: false,
      canEditWorkouts: true,
      canAccessAuditLogs: false,
      canAccessRecycleBin: false,
      canManageAccounts: false,
      canManageServices: false,
      canExportPDF: true
    }
  },
  {
    id: 'coach-3',
    role: 'coach',
    nameAr: 'كابتن مريم النجار',
    nameEn: 'Capt. Mariam El-Naggar',
    phone: '01544556677',
    username: 'coach3',
    password: '3333',
    accessCode: '3333',
    attendanceCode: '1003',
    specialty: 'كروس فيت وإعداد بدني وتغذية رياضية',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    status: 'active',
    hiredDate: '2024-01-10',
    baseSalary: 7200,
    totalTraineesCount: 11,
    commissionRate: 30,
    customPermissions: {
      canManageMembers: false,
      canIssueDiscounts: false,
      canFreezeMemberships: false,
      canOpenCloseShifts: false,
      canRecordTransactions: false,
      canViewPayroll: false,
      canManagePayroll: false,
      canViewReports: false,
      canEditWorkouts: true,
      canAccessAuditLogs: false,
      canAccessRecycleBin: false,
      canManageAccounts: false,
      canManageServices: false,
      canExportPDF: true
    }
  }
];

export const INITIAL_STAFF_ACCOUNTS: EmployeeAccount[] = [
  {
    id: 'staff-1',
    role: 'staff',
    nameAr: 'عمر خالد (استقبال الفترة الصباحية)',
    nameEn: 'Omar Khaled (Morning Reception)',
    phone: '01099887766',
    username: 'staff1',
    password: '4444',
    accessCode: '4444',
    attendanceCode: '2001',
    specialty: 'استقبال، بيع مكملات والبار، تسجيل أعضاء الخزينة',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    status: 'active',
    hiredDate: '2024-02-01',
    baseSalary: 5500,
    customPermissions: {
      canManageMembers: true,
      canIssueDiscounts: false,
      canFreezeMemberships: true,
      canOpenCloseShifts: true,
      canRecordTransactions: true,
      canViewPayroll: false,
      canManagePayroll: false,
      canViewReports: false,
      canEditWorkouts: false,
      canAccessAuditLogs: false,
      canAccessRecycleBin: false,
      canManageAccounts: false,
      canManageServices: true,
      canExportPDF: true
    }
  },
  {
    id: 'staff-2',
    role: 'staff',
    nameAr: 'زياد السعيد (استقبال الفترة المسائية)',
    nameEn: 'Ziad El-Saeed (Evening Reception)',
    phone: '01188776655',
    username: 'staff2',
    password: '5555',
    accessCode: '5555',
    attendanceCode: '2002',
    specialty: 'إدارة المناوبات، بيع المكملات والبار والاشتراكات',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    status: 'active',
    hiredDate: '2024-03-15',
    baseSalary: 5500,
    customPermissions: {
      canManageMembers: true,
      canIssueDiscounts: false,
      canFreezeMemberships: true,
      canOpenCloseShifts: true,
      canRecordTransactions: true,
      canViewPayroll: false,
      canManagePayroll: false,
      canViewReports: false,
      canEditWorkouts: false,
      canAccessAuditLogs: false,
      canAccessRecycleBin: false,
      canManageAccounts: false,
      canManageServices: true,
      canExportPDF: true
    }
  },
  {
    id: 'staff-3',
    role: 'staff',
    nameAr: 'حسام البدري (موظف استقبال)',
    nameEn: 'Hossam El-Badry (Reception Staff)',
    phone: '01077665544',
    username: 'hossam',
    password: '6666',
    accessCode: '6666',
    attendanceCode: '2003',
    specialty: 'خدمة العملاء واستقبال الأعضاء',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    status: 'active',
    hiredDate: '2024-03-01',
    baseSalary: 5500,
    customPermissions: {
      canManageMembers: true,
      canIssueDiscounts: false,
      canFreezeMemberships: true,
      canOpenCloseShifts: true,
      canRecordTransactions: true,
      canViewPayroll: false,
      canManagePayroll: false,
      canViewReports: false,
      canEditWorkouts: false,
      canAccessAuditLogs: false,
      canAccessRecycleBin: false,
      canManageAccounts: false,
      canManageServices: true,
      canExportPDF: true
    }
  }
];

export const INITIAL_ACCOUNTANT_ACCOUNTS: EmployeeAccount[] = [
  {
    id: 'acc-1',
    role: 'accountant',
    nameAr: 'أستاذ ياسر ممدوح (مسؤول الحسابات والمالية)',
    nameEn: 'Yasser Mamdouh (Chief Accountant)',
    phone: '01033445566',
    username: 'finance',
    password: '7777',
    accessCode: '7777',
    attendanceCode: '3001',
    specialty: 'إدارة حسابات الموظفين والأجور ونسب الكباتن والتقارير المالية',
    avatarUrl: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=150&auto=format&fit=crop&q=80',
    status: 'active',
    hiredDate: '2023-03-01',
    baseSalary: 12000
  }
];

export const INITIAL_VIEWER_ACCOUNTS: EmployeeAccount[] = [
  {
    id: 'view-1',
    role: 'viewer',
    nameAr: 'أستاذ حازم رضوان (مستثمر / مراقب عرض فقط)',
    nameEn: 'Hazem Radwan (Investor / Read-Only Observer)',
    phone: '01088990011',
    username: 'viewer',
    password: '7777',
    accessCode: '7777',
    attendanceCode: '7001',
    specialty: 'عرض ومتابعة وتقييم أداء الصالة الرياضية بدون صلاحيات تعديل',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    status: 'active',
    hiredDate: '2025-01-01',
    customPermissions: {
      canManageMembers: false,
      canIssueDiscounts: false,
      canFreezeMemberships: false,
      canOpenCloseShifts: false,
      canRecordTransactions: false,
      canViewPayroll: false,
      canManagePayroll: false,
      canViewReports: true,
      canEditWorkouts: false,
      canAccessAuditLogs: false,
      canAccessRecycleBin: false,
      canManageAccounts: false,
      canManageServices: false,
      canExportPDF: true
    }
  }
];

export const INITIAL_SECURITY_ALERTS: any[] = [
  {
    id: 'alert-1',
    timestamp: '2026-09-30T22:15:00.000Z',
    date: '2026-09-30',
    time: '22:15:00',
    usernameOrPhone: '01099887766',
    attemptsCount: 2,
    reasonAr: 'محاولة تسجيل دخول فاشلة بكلمة مرور غير مطابقة (موظف الاستقبال عمر خالد)',
    reasonEn: 'Failed login attempt with wrong password',
    status: 'unread',
    accountFound: true,
    accountName: 'عمر خالد (استقبال)',
    accountRole: 'staff',
    accountPhone: '01099887766',
    accountType: 'staff'
  }
];

const DEFAULT_PROGRAM_1: WorkoutProgram = {
  id: 'prog-1',
  titleAr: 'برنامج الضخامة العضلية الاحترافي (4 أيام - دفع وسحب وأرجل وبطن)',
  titleEn: 'Pro Hypertrophy 4-Day PPL & Core',
  coachName: 'كابتن أحمد عز الدين',
  coachId: 'coach-1',
  createdAt: '2026-09-01',
  days: [
    {
      id: 'day-1',
      dayNumber: 1,
      titleAr: 'اليوم الأول: الصدر والترايسبس - تمارين الدفع',
      titleEn: 'Day 1: Chest & Triceps Push',
      focusMuscles: ['الصدر', 'الترايسبس', 'الأكتاف الأمامية'],
      exercises: [
        {
          id: 'ex-1',
          nameAr: 'بنش بريس مستوي بالبار',
          nameEn: 'Barbell Flat Bench Press',
          targetMuscle: 'الصدر الأوسط والكامل',
          targetMuscleEn: 'Middle & Full Chest',
          equipment: 'بنش مستوي + بار أولمبي',
          sets: 4,
          reps: '8-10',
          restSeconds: 90,
          targetWeightKg: 75,
          videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-working-out-with-a-barbell-on-a-bench-42841-large.mp4',
          coachTipsAr: 'تثبيت الأكتاف للخلف وأسفل المقعد، النزول لمنتصف الصدر بدون ارتداد سريع.',
          coachTipsEn: 'Retract scapula, slow eccentric, touch mid-chest.'
        },
        {
          id: 'ex-2',
          nameAr: 'تجميع دمبل مائل عالي للصدر',
          nameEn: 'Incline Dumbbell Press',
          targetMuscle: 'الصدر العلوي',
          targetMuscleEn: 'Upper Chest',
          equipment: 'دكة مائلة بزاوية 30° + دمبل',
          sets: 3,
          reps: '10-12',
          restSeconds: 75,
          targetWeightKg: 26,
          videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-training-arms-with-dumbbells-in-a-gym-42840-large.mp4',
          coachTipsAr: 'عصر العضلة العلوية للصدر في قمة الحركة وتفادي صدم الدمبل ببعضه.',
          coachTipsEn: 'Squeeze upper chest at top peak.'
        },
        {
          id: 'ex-3',
          nameAr: 'تفتيح كيبل مائل كروس أوفر',
          nameEn: 'Cable Chest Flyes',
          targetMuscle: 'عزل الصدر والخط الفاصل',
          targetMuscleEn: 'Chest Isolation & Inner Line',
          equipment: 'جهاز كروس كيبل مزدوج',
          sets: 3,
          reps: '12-15',
          restSeconds: 60,
          targetWeightKg: 20,
          videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-athlete-training-arms-in-the-gym-42838-large.mp4',
          coachTipsAr: 'ثني المرفقين قليلاً والحفاظ على مسار القوس الثابت.',
          coachTipsEn: 'Keep slight elbow bend and smooth arc.'
        },
        {
          id: 'ex-4',
          nameAr: 'سحب ترايسبس بالحبل على الكيبل',
          nameEn: 'Rope Triceps Pushdown',
          targetMuscle: 'الرأس الجانبي والطويل للترايسبس',
          targetMuscleEn: 'Lateral & Long Triceps Head',
          equipment: 'بكرة كيبل علوية + حبل',
          sets: 4,
          reps: '12-15',
          restSeconds: 60,
          targetWeightKg: 25,
          videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-arm-exercises-with-gym-equipment-42839-large.mp4',
          coachTipsAr: 'فتح الحبل عند الأسفل وعصر الترايسبس لثانية واحدة مع تثبيت الكوعين بجانب الجذع.',
          coachTipsEn: 'Flourish rope outward at bottom, hold 1s peak contraction.'
        }
      ]
    },
    {
      id: 'day-2',
      dayNumber: 2,
      titleAr: 'اليوم الثاني: الظهر والبايسبس - تمارين السحب',
      titleEn: 'Day 2: Back & Biceps Pull',
      focusMuscles: ['الظهر العلوي', 'عضلات المجنص', 'البايسبس'],
      exercises: [
        {
          id: 'ex-5',
          nameAr: 'سحب مجنص عالي قبضة واسعة',
          nameEn: 'Wide Grip Lat Pulldown',
          targetMuscle: 'عضلات الظهر العريضة (المجنص)',
          targetMuscleEn: 'Latissimus Dorsi',
          equipment: 'جهاز السحب العالي + مقبض واسع',
          sets: 4,
          reps: '10-12',
          restSeconds: 75,
          targetWeightKg: 65,
          videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-pull-ups-in-a-gym-42843-large.mp4',
          coachTipsAr: 'السحب باتجاه عظمة الترقوة مع سحب الأكتاف لأسفل وعصر الظهر.',
          coachTipsEn: 'Pull to upper clavicle and squeeze lats.'
        },
        {
          id: 'ex-6',
          nameAr: 'تجديف سحب أرضي مقبض ضيق',
          nameEn: 'Seated Cable Row (Close Grip)',
          targetMuscle: 'منتصف الظهر وسُمك العضلات',
          targetMuscleEn: 'Mid Back Thickness & Rhomboids',
          equipment: 'جهاز السحب الأرضي + مقبض سحب',
          sets: 3,
          reps: '10-12',
          restSeconds: 75,
          targetWeightKg: 55,
          videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-athlete-doing-exercises-on-a-rowing-machine-42844-large.mp4',
          coachTipsAr: 'استقامة العمود الفقري وعدم التمايل بالظهر للأمام والخلف.',
          coachTipsEn: 'Maintain upright spine, no momentum.'
        },
        {
          id: 'ex-7',
          nameAr: 'تبادل بايسبس بالدمبل واقف',
          nameEn: 'Standing DB Alternate Curls',
          targetMuscle: 'رأسي عضلة البايسبس',
          targetMuscleEn: 'Biceps Brachii',
          equipment: 'زوج دمبل 14 كجم',
          sets: 3,
          reps: '12 لكل ذراع',
          restSeconds: 60,
          targetWeightKg: 14,
          videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-bodybuilder-working-out-with-dumbbells-42847-large.mp4',
          coachTipsAr: 'لف المعصم للخارج في الأعلى لتفعيل كامل العضلة.',
          coachTipsEn: 'Supinate wrist at peak.'
        }
      ]
    },
    {
      id: 'day-3',
      dayNumber: 3,
      titleAr: 'اليوم الثالث: الأرجل والسمانة - الجزء السفلي',
      titleEn: 'Day 3: Legs & Calves',
      focusMuscles: ['الأفخاذ الأمامية', 'الخلفيات', 'السمانة'],
      exercises: [
        {
          id: 'ex-8',
          nameAr: 'سكوات بالبار الحر للأفخاذ',
          nameEn: 'Barbell Back Squat',
          targetMuscle: 'الأفخاذ الأمامية والمؤخرة',
          targetMuscleEn: 'Quadriceps & Glutes',
          equipment: 'راك سكوات + بار أولمبي',
          sets: 4,
          reps: '8-10',
          restSeconds: 120,
          targetWeightKg: 90,
          videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-muscular-man-doing-squats-with-a-barbell-42846-large.mp4',
          coachTipsAr: 'النزول لزاوية 90 درجة مع دفع الركبتين للخارج بمحاذاة أصابع القدم.',
          coachTipsEn: 'Hit parallel depth, push knees out.'
        },
        {
          id: 'ex-9',
          nameAr: 'دفع جهاز الأرجل 45 درجة',
          nameEn: '45-Degree Leg Press',
          targetMuscle: 'عضلات الفخذ الكاملة',
          targetMuscleEn: 'Full Quad & Glute Loading',
          equipment: 'جهاز مكبس الأرجل',
          sets: 3,
          reps: '10-12',
          restSeconds: 90,
          targetWeightKg: 160,
          videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-athlete-working-out-with-a-machine-in-the-gym-42845-large.mp4',
          coachTipsAr: 'عدم قفل مفصل الركبة تماماً في الأعلى لحماية الأربطة.',
          coachTipsEn: 'Do not lock out knees at top.'
        }
      ]
    },
    {
      id: 'day-4',
      dayNumber: 4,
      titleAr: 'اليوم الرابع: الأكتاف والبطن - الجزء العلوي',
      titleEn: 'Day 4: Shoulders & Core',
      focusMuscles: ['الأكتاف الجانبية والخلفية', 'عضلات البطن'],
      exercises: [
        {
          id: 'ex-10',
          nameAr: 'ضغط أكتاف بالبار جالس',
          nameEn: 'Seated Overhead Barbell Press',
          targetMuscle: 'الكتف الأمامي والجانبي',
          targetMuscleEn: 'Anterior & Lateral Deltoid',
          equipment: 'دكة أكتاف + بار أولمبي',
          sets: 4,
          reps: '8-10',
          restSeconds: 90,
          targetWeightKg: 45,
          videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-shoulder-exercises-with-dumbbells-42842-large.mp4',
          coachTipsAr: 'دفع البار باستقامة فوق الرأس والنزول أسفل الذقن مباشرة.',
          coachTipsEn: 'Press directly overhead, lock core.'
        },
        {
          id: 'ex-11',
          nameAr: 'رفرفة جانبي بالدمبل للأكتاف',
          nameEn: 'Dumbbell Lateral Raises',
          targetMuscle: 'الكتف الجانبي وتوسيع الكادر',
          targetMuscleEn: 'Lateral Deltoids Width',
          equipment: 'زوج دمبل 10 كجم',
          sets: 4,
          reps: '12-15',
          restSeconds: 60,
          targetWeightKg: 10,
          videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-man-exercising-shoulders-with-dumbbells-42848-large.mp4',
          coachTipsAr: 'رفع المرفقين للأعلى والتركيز على العضلة الجانبية بدون هزة الظهر.',
          coachTipsEn: 'Lead with elbows, controlled tempo.'
        }
      ]
    }
  ]
};

export const FAHD_PROGRAM: WorkoutProgram = {
  id: 'prog-fahd-1',
  titleAr: 'برنامج الكابتن لفهد كريم (صدر/ضهر/كتف/رجلين)',
  titleEn: 'Fahd Kareem Custom Routine',
  coachName: 'كابتن الصالة الرياضية',
  createdAt: '2026-10-07',
  days: [
    {
      id: 'fahd-day-1',
      dayNumber: 1,
      titleAr: 'اليوم الأول: صدر + تراي',
      titleEn: 'Day 1: Chest & Triceps',
      focusMuscles: ['الصدر', 'الترايسبس', 'البطن'],
      exercises: [
        { id: 'f-ex-1', nameAr: 'جهاز دفع صدر مستوي (Horizontal Press)', nameEn: 'Horizontal Press', targetMuscle: 'الصدر', targetMuscleEn: 'Chest', equipment: 'جهاز', sets: 4, reps: '10-15', restSeconds: 60, targetWeightKg: 50, coachTipsAr: 'الجولات ٣ إلى ٤، التكرار ١٠ إلى ١٥، الراحة ٤٥ث إلى ١ دقيقة. الوزن بتقدير اللاعب للوصول للتكرار المستهدف بدرجة صعوبة متوسطة.' },
        { id: 'f-ex-2', nameAr: 'جهاز دفع صدر عالي (Incline Press)', nameEn: 'Incline Press', targetMuscle: 'الصدر العلوي', targetMuscleEn: 'Upper Chest', equipment: 'جهاز', sets: 4, reps: '10-15', restSeconds: 60, targetWeightKg: 45 },
        { id: 'f-ex-3', nameAr: 'فراشة تفتيح جالس (Fly Chest)', nameEn: 'Fly Chest', targetMuscle: 'الصدر', targetMuscleEn: 'Chest', equipment: 'جهاز', sets: 3, reps: '10-15', restSeconds: 45, targetWeightKg: 30 },
        { id: 'f-ex-4', nameAr: 'جهاز دفع صدر سفلي (Decline Press / Dips)', nameEn: 'Decline Press', targetMuscle: 'الصدر السفلي', targetMuscleEn: 'Lower Chest', equipment: 'جهاز', sets: 3, reps: '10-15', restSeconds: 60, targetWeightKg: 40 },
        { id: 'f-ex-5', nameAr: 'تراي سيبس حبل امامي (Elbow Extension Rope)', nameEn: 'Elbow Extension Rope', targetMuscle: 'الترايسبس', targetMuscleEn: 'Triceps', equipment: 'كيبل', sets: 3, reps: '10-15', restSeconds: 45, targetWeightKg: 20 },
        { id: 'f-ex-6', nameAr: 'تراي جهاز جالس (Dips Machine)', nameEn: 'Dips Machine', targetMuscle: 'الترايسبس', targetMuscleEn: 'Triceps', equipment: 'جهاز', sets: 3, reps: '10-15', restSeconds: 45, targetWeightKg: 40 },
        { id: 'f-ex-7', nameAr: 'بطن (Sit-Up)', nameEn: 'Sit-Up', targetMuscle: 'البطن', targetMuscleEn: 'Abs', equipment: 'بدون', sets: 3, reps: '15-20', restSeconds: 45, targetWeightKg: 0 }
      ]
    },
    {
      id: 'fahd-day-2',
      dayNumber: 2,
      titleAr: 'اليوم الثاني: ضهر + باي',
      titleEn: 'Day 2: Back & Biceps',
      focusMuscles: ['الظهر', 'البايسبس', 'القطنية'],
      exercises: [
        { id: 'f-ex-8', nameAr: 'سحب عالي ضهر (Lat Pull Down)', nameEn: 'Lat Pull Down', targetMuscle: 'الظهر العلوي', targetMuscleEn: 'Lats', equipment: 'جهاز', sets: 4, reps: '10-15', restSeconds: 60, targetWeightKg: 45 },
        { id: 'f-ex-9', nameAr: 'سحب ارضي ضيق (Seated Row Close Grip)', nameEn: 'Seated Row', targetMuscle: 'الظهر الأوسط', targetMuscleEn: 'Mid Back', equipment: 'جهاز', sets: 4, reps: '10-15', restSeconds: 60, targetWeightKg: 45 },
        { id: 'f-ex-10', nameAr: 'جهاز تجديف تي بار واسع (T-Bar Row)', nameEn: 'T-Bar Row', targetMuscle: 'الظهر', targetMuscleEn: 'Back', equipment: 'جهاز', sets: 3, reps: '10-15', restSeconds: 60, targetWeightKg: 35 },
        { id: 'f-ex-11', nameAr: 'قطانية جهاز حر (Back Extension)', nameEn: 'Back Extension', targetMuscle: 'القطنية', targetMuscleEn: 'Lower Back', equipment: 'جهاز', sets: 3, reps: '12-15', restSeconds: 45, targetWeightKg: 0 },
        { id: 'f-ex-12', nameAr: 'دمبل تبادل باي (Curl Dumbbell)', nameEn: 'Curl Dumbbell', targetMuscle: 'البايسبس', targetMuscleEn: 'Biceps', equipment: 'دمبل', sets: 3, reps: '10-15', restSeconds: 45, targetWeightKg: 12 },
        { id: 'f-ex-13', nameAr: 'دمبل هامر (Hammer Dumbbell)', nameEn: 'Hammer Dumbbell', targetMuscle: 'البايسبس', targetMuscleEn: 'Biceps', equipment: 'دمبل', sets: 3, reps: '10-15', restSeconds: 45, targetWeightKg: 12 }
      ]
    },
    {
      id: 'fahd-day-3',
      dayNumber: 3,
      titleAr: 'اليوم الرابع: كتف + سواعد + بطن',
      titleEn: 'Day 3: Shoulders, Forearms & Abs',
      focusMuscles: ['الكتف', 'السواعد', 'البطن'],
      exercises: [
        { id: 'f-ex-14', nameAr: 'جهاز كتف امامي جالس (Shoulder Press)', nameEn: 'Shoulder Press', targetMuscle: 'الكتف', targetMuscleEn: 'Shoulder', equipment: 'جهاز', sets: 4, reps: '10-15', restSeconds: 60, targetWeightKg: 35 },
        { id: 'f-ex-15', nameAr: 'رفرفة جانبي دمبل (Lateral Raises Dumbbell)', nameEn: 'Lateral Raises', targetMuscle: 'الكتف الجانبي', targetMuscleEn: 'Side Delt', equipment: 'دمبل', sets: 4, reps: '10-15', restSeconds: 45, targetWeightKg: 10 },
        { id: 'f-ex-16', nameAr: 'كتف خلفي جهاز فراشة معكوس (Rear Fly)', nameEn: 'Rear Fly', targetMuscle: 'الكتف الخلفي', targetMuscleEn: 'Rear Delt', equipment: 'جهاز', sets: 3, reps: '10-15', restSeconds: 45, targetWeightKg: 30 },
        { id: 'f-ex-17', nameAr: 'كتف امامي رفرفة دمبل (Front Raises Dumbbell)', nameEn: 'Front Raises', targetMuscle: 'الكتف الأمامي', targetMuscleEn: 'Front Delt', equipment: 'دمبل', sets: 3, reps: '10-15', restSeconds: 45, targetWeightKg: 10 },
        { id: 'f-ex-18', nameAr: 'ترباس بالدمبل (Dumbbell Shrug)', nameEn: 'Dumbbell Shrug', targetMuscle: 'الترباس', targetMuscleEn: 'Traps', equipment: 'دمبل', sets: 3, reps: '12-15', restSeconds: 45, targetWeightKg: 20 },
        { id: 'f-ex-19', nameAr: 'سواعد جهاز كابل امامي (Forearm Cable Curl)', nameEn: 'Forearm Curl', targetMuscle: 'السواعد', targetMuscleEn: 'Forearms', equipment: 'كيبل', sets: 3, reps: '12-15', restSeconds: 45, targetWeightKg: 15 },
        { id: 'f-ex-20', nameAr: 'بطن (V-Ups)', nameEn: 'V-Ups', targetMuscle: 'البطن', targetMuscleEn: 'Abs', equipment: 'بدون', sets: 3, reps: '12-15', restSeconds: 45, targetWeightKg: 0 }
      ]
    },
    {
      id: 'fahd-day-4',
      dayNumber: 4,
      titleAr: 'اليوم الخامس: رجلين',
      titleEn: 'Day 4: Legs',
      focusMuscles: ['الأرجل', 'السمانات'],
      exercises: [
        { id: 'f-ex-21', nameAr: 'مرجحة امامي (Leg Extension)', nameEn: 'Leg Extension', targetMuscle: 'الأمامي', targetMuscleEn: 'Quads', equipment: 'جهاز', sets: 4, reps: '10-15', restSeconds: 60, targetWeightKg: 40 },
        { id: 'f-ex-22', nameAr: 'مرجحة خلفي نايم (Leg Curl)', nameEn: 'Leg Curl', targetMuscle: 'الخلفي', targetMuscleEn: 'Hamstrings', equipment: 'جهاز', sets: 4, reps: '10-15', restSeconds: 60, targetWeightKg: 35 },
        { id: 'f-ex-23', nameAr: 'سكوات حر بدون وزن تكرار عالي (Bodyweight / Free Squats)', nameEn: 'Free Squats', targetMuscle: 'الأرجل', targetMuscleEn: 'Legs', equipment: 'بدون وزن', sets: 4, reps: '15-20', restSeconds: 60, targetWeightKg: 0 },
        { id: 'f-ex-24', nameAr: 'دفع جالس أو نايم (Leg Press)', nameEn: 'Leg Press', targetMuscle: 'الأرجل', targetMuscleEn: 'Legs', equipment: 'جهاز', sets: 4, reps: '10-15', restSeconds: 60, targetWeightKg: 80 },
        { id: 'f-ex-25', nameAr: 'بطات واقف (Calves Raise)', nameEn: 'Calves Raise', targetMuscle: 'السمانات', targetMuscleEn: 'Calves', equipment: 'جهاز', sets: 4, reps: '15-20', restSeconds: 45, targetWeightKg: 30 }
      ]
    }
  ]
};

export const INITIAL_MEMBERS: GymMember[] = [
  {
    id: 'mem-fahd-1',
    membershipNumber: '1015',
    fullNameAr: 'فهد كريم',
    fullNameEn: 'Fahd Kareem',
    phone: '01099887766',
    passwordPin: '1234',
    gender: 'male',
    tier: 'gold',
    startDate: '2026-10-01',
    endDate: '2026-12-31',
    remainingDays: 85,
    status: 'active',
    assignedCoachId: 'coach-1',
    assignedCoachName: 'كابتن الصالة الرياضية',
    currentProgram: FAHD_PROGRAM,
    attendanceCount: 3,
    lastAttendanceDate: '2026-10-06',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    balanceDue: 0,
    history: []
  },
  {
    id: 'mem-1001',
    membershipNumber: '1001',
    fullNameAr: 'كريم أحمد حسني',
    fullNameEn: 'Kareem Ahmed Hosny',
    phone: '01012345678',
    passwordPin: '1234',
    emergencyPhone: '01123456789',
    gender: 'male',
    birthDate: '1995-05-14',
    nationalId: '29505140102345',
    tier: 'gold',
    startDate: '2026-09-01',
    endDate: '2026-11-30',
    remainingDays: 62,
    status: 'active',
    assignedCoachId: 'coach-1',
    assignedCoachName: 'كابتن أحمد عز الدين',
    currentProgram: DEFAULT_PROGRAM_1,
    attendanceCount: 6,
    lastAttendanceDate: '2026-10-04',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    balanceDue: 0,
    inbodyScores: [
      { date: '2026-09-01', weightKg: 84.5, muscleMassKg: 41.2, bodyFatPercent: 17.8 }
    ],
    history: []
  },
  {
    id: 'mem-1002',
    membershipNumber: '1002',
    fullNameAr: 'محمد سامي عبد الرحمن',
    fullNameEn: 'Mohamed Samy Abdelrahman',
    phone: '01198765432',
    passwordPin: '1234',
    emergencyPhone: '01098765432',
    gender: 'male',
    birthDate: '1998-11-20',
    tier: 'vip',
    startDate: '2026-08-15',
    endDate: '2026-11-15',
    remainingDays: 47,
    status: 'active',
    assignedCoachId: 'coach-2',
    assignedCoachName: 'كابتن طارق الشناوي',
    currentProgram: DEFAULT_PROGRAM_1,
    attendanceCount: 5,
    lastAttendanceDate: '2026-10-04',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    balanceDue: 0,
    history: []
  },
  {
    id: 'mem-1003',
    membershipNumber: '1003',
    fullNameAr: 'يوسف مصطفى عثمان',
    fullNameEn: 'Youssef Mostafa Osman',
    phone: '01255566677',
    passwordPin: '1234',
    gender: 'male',
    tier: 'diamond',
    startDate: '2026-09-10',
    endDate: '2027-03-10',
    remainingDays: 162,
    status: 'active',
    assignedCoachId: 'coach-1',
    assignedCoachName: 'كابتن أحمد عز الدين',
    currentProgram: DEFAULT_PROGRAM_1,
    attendanceCount: 4,
    lastAttendanceDate: '2026-10-03',
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    balanceDue: 350,
    notes: 'متبقي 350 ج من ثمن باقة التدريب الخاص PT',
    history: []
  },
  {
    id: 'mem-1004',
    membershipNumber: '1004',
    fullNameAr: 'هاني فريد النجار',
    fullNameEn: 'Hany Farid El-Naggar',
    phone: '01033322211',
    passwordPin: '1234',
    gender: 'male',
    tier: 'standard',
    startDate: '2026-08-01',
    endDate: '2026-08-31',
    remainingDays: 0,
    status: 'expired',
    assignedCoachId: 'coach-3',
    assignedCoachName: 'كابتن مريم النجار',
    currentProgram: DEFAULT_PROGRAM_1,
    attendanceCount: 6,
    lastAttendanceDate: '2026-08-30',
    avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    balanceDue: 0,
    history: []
  }
];

export const INITIAL_TRANSACTIONS: FinancialTransaction[] = [
  {
    id: 'tx-101',
    memberId: 'mem-1001',
    memberName: 'كريم أحمد حسني',
    membershipNumber: '1001',
    type: 'renewal',
    voucherKind: 'receipt',
    voucherSequenceNumber: 1,
    voucherCode: '#1',
    amount: 1200,
    paymentMethod: 'cash',
    date: '2026-09-01 10:15:00',
    recordedBy: 'عمر خالد (استقبال)',
    notes: 'تجديد اشتراك 3 شهور باقة ذهبية',
    invoiceNumber: '#1'
  },
  {
    id: 'tx-102',
    memberId: 'mem-1003',
    memberName: 'يوسف مصطفى عثمان',
    membershipNumber: '1003',
    type: 'subscription',
    voucherKind: 'receipt',
    voucherSequenceNumber: 2,
    voucherCode: '#2',
    amount: 2500,
    paymentMethod: 'instapay',
    date: '2026-09-10 16:30:00',
    recordedBy: 'زياد السعيد (استقبال)',
    notes: 'اشتراك 6 شهور دايموند + خصم كاش',
    invoiceNumber: '#2'
  },
  {
    id: 'tx-103',
    memberName: 'مصروفات نظافة وتشغيل',
    type: 'expense',
    voucherKind: 'payment',
    voucherSequenceNumber: 1,
    voucherCode: '#1',
    beneficiaryName: 'مورد المنظفات والمطهرات',
    amount: 350,
    paymentMethod: 'cash',
    date: '2026-09-28 14:00:00',
    recordedBy: 'عمر خالد (استقبال)',
    notes: 'شراء أدوات نظافة ومطهرات لصالة الجيم',
    invoiceNumber: '#1'
  }
];

export const INITIAL_SHIFTS: CashShift[] = [
  {
    id: 'shift-1',
    staffId: 'staff-1',
    staffName: 'عمر خالد',
    openedAt: '2026-09-28 07:00:00',
    closedAt: '2026-09-28 15:30:00',
    startingCash: 500,
    expectedCash: 2450,
    actualCash: 2450,
    cashDifference: 0,
    status: 'closed',
    totalIncome: 2300,
    totalExpense: 350,
    notes: 'تمت مطابقة الخزينة واستلام الإيرادات بنجاح'
  }
];

export const INITIAL_ATTENDANCES: EmployeeAttendanceRecord[] = [
  {
    id: 'att-1',
    employeeId: 'coach-1',
    employeeName: 'كابتن أحمد عز الدين',
    role: 'coach',
    date: '2026-09-28',
    checkInTime: '08:45:12',
    checkOutTime: '17:15:30',
    totalHoursWorked: 8.5,
    status: 'completed'
  },
  {
    id: 'att-2',
    employeeId: 'staff-1',
    employeeName: 'عمر خالد',
    role: 'staff',
    date: '2026-09-28',
    checkInTime: '06:55:00',
    checkOutTime: '15:35:00',
    totalHoursWorked: 8.6,
    status: 'completed'
  }
];

export const INITIAL_ACTIVITY_LOGS: SystemActivityLog[] = [
  {
    id: 'log-101',
    timestamp: '2026-09-28T07:00:00Z',
    date: '2026-09-28',
    time: '07:00:00',
    performerId: 'staff-1',
    performerName: 'عمر خالد (استقبال)',
    performerRole: 'staff',
    category: 'shift',
    actionType: 'shift_open',
    titleAr: 'فتح وردية صباحية جديدة',
    titleEn: 'Opened Morning Shift',
    detailsAr: 'فتح الخزينة بعهدة نقدية افتتاحية بقيمة 500 ج.م',
    detailsEn: 'Shift opened with initial cash float 500 EGP',
    targetId: 'shift-1',
    targetName: 'وردية عمر خالد الصباحية',
    targetType: 'shift'
  },
  {
    id: 'log-102',
    timestamp: '2026-09-28T10:15:20Z',
    date: '2026-09-28',
    time: '10:15:20',
    performerId: 'staff-1',
    performerName: 'عمر خالد (استقبال)',
    performerRole: 'staff',
    category: 'financial',
    actionType: 'payment',
    titleAr: 'تسجيل سند قبض تجديد اشتراك',
    titleEn: 'Subscription Renewal Payment',
    detailsAr: 'استلام مبلغ 1,200 ج.م نقداً من العضو كريم حسني (#1001)',
    detailsEn: 'Received 1,200 EGP cash for subscription renewal #1001',
    targetId: 'mem-1001',
    targetName: 'كريم أحمد حسني',
    targetType: 'member'
  },
  {
    id: 'log-103',
    timestamp: '2026-09-28T11:45:00Z',
    date: '2026-09-28',
    time: '11:45:00',
    performerId: 'coach-1',
    performerName: 'كابتن أحمد عز الدين',
    performerRole: 'coach',
    category: 'workout',
    actionType: 'update',
    titleAr: 'تحديث برنامج تدريبي لعضو',
    titleEn: 'Updated Member Workout Program',
    detailsAr: 'تم إضافة تمارين التركيز على الصدر والترايسبس للعضو كريم حسني',
    detailsEn: 'Added chest & triceps focus exercises to member program',
    targetId: 'mem-1001',
    targetName: 'كريم أحمد حسني',
    targetType: 'program'
  },
  {
    id: 'log-104',
    timestamp: '2026-09-28T14:00:00Z',
    date: '2026-09-28',
    time: '14:00:00',
    performerId: 'staff-1',
    performerName: 'عمر خالد (استقبال)',
    performerRole: 'staff',
    category: 'financial',
    actionType: 'payment',
    titleAr: 'تسجيل سند صرف مصاريف تشغيلية',
    titleEn: 'Operational Expense Voucher',
    detailsAr: 'صرف مبلغ 350 ج.م لشراء أدوات نظافة وتعقيم لصالة الجيم',
    detailsEn: 'Disbursed 350 EGP for gym cleaning & sanitation supplies',
    targetId: 'tx-103',
    targetName: 'أدوات نظافة ومطهرات',
    targetType: 'transaction'
  },
  {
    id: 'log-105',
    timestamp: '2026-09-28T15:30:00Z',
    date: '2026-09-28',
    time: '15:30:00',
    performerId: 'staff-1',
    performerName: 'عمر خالد (استقبال)',
    performerRole: 'staff',
    category: 'shift',
    actionType: 'shift_close',
    titleAr: 'إغلاق وتسليم الوردية الصباحية',
    titleEn: 'Closed Morning Shift',
    detailsAr: 'إغلاق الوردية بمطابقة نقدية تامة (المتوقع 2,450 ج.م - الفعلي 2,450 ج.م)',
    detailsEn: 'Shift closed with zero cash difference (2,450 EGP)',
    targetId: 'shift-1',
    targetName: 'وردية عمر خالد',
    targetType: 'shift'
  }
];

export const INITIAL_ARCHIVED_REPORTS: ArchivedReport[] = [
  {
    id: 'rpt-arch-1',
    reportNumber: 'RPT-2026-W38',
    periodTitleAr: 'التقرير المالي والإداري للأسبوع الثالث - سبتمبر 2026',
    periodTitleEn: 'Financial & Administrative Report - Week 38 (Sep 2026)',
    dateRange: {
      start: '2026-09-14',
      end: '2026-09-20'
    },
    archivedAt: '2026-09-21 09:30:00',
    archivedBy: 'كابتن محمود الغندور',
    archivedByRole: 'المدير العام',
    metrics: {
      totalRevenue: 28450,
      totalExpenses: 4200,
      netProfit: 24250,
      cashAmount: 18200,
      electronicAmount: 10250,
      activeMembersCount: 142,
      renewalsCount: 18,
      newMembersCount: 11,
      totalAttendances: 495,
      completedShiftsCount: 14
    },
    notesAr: 'أسبوع قياسي في نسبة تجديد الاشتراكات الذهبية، مع الالتزام التام بنظافة الصالة والأجهزة.'
  },
  {
    id: 'rpt-arch-2',
    reportNumber: 'RPT-2026-M08',
    periodTitleAr: 'التقرير الختامي المعتمد لشهر أغسطس 2026',
    periodTitleEn: 'Certified Monthly Financial Closure - August 2026',
    dateRange: {
      start: '2026-08-01',
      end: '2026-08-31'
    },
    archivedAt: '2026-09-01 10:00:00',
    archivedBy: 'كابتن محمود الغندور',
    archivedByRole: 'المدير العام',
    metrics: {
      totalRevenue: 115800,
      totalExpenses: 21300,
      netProfit: 94500,
      cashAmount: 72000,
      electronicAmount: 43800,
      activeMembersCount: 138,
      renewalsCount: 65,
      newMembersCount: 42,
      totalAttendances: 2140,
      completedShiftsCount: 62
    },
    notesAr: 'اعتماد صرف مكافآت الأداء المالي للكباتن وفريق الاستقبال للشهر الماضي.'
  }
];

export const INITIAL_DELETED_RECORDS: DeletedRecordItem[] = [
  {
    id: 'del-101',
    originalId: 'mem-999',
    itemType: 'member',
    titleAr: 'حساب مشترك: سامح جلال الشريف',
    titleEn: 'Member Account: Sameh Galal El-Sherif',
    identifier: 'رقم العضوية: #999 | 01099988877',
    deletedAt: '2026-09-25 18:20:00',
    deletedBy: 'كابتن محمود الغندور (المدير العام)',
    deletedByRole: 'manager',
    reason: 'طلب العضو إلغاء العضوية ونقل السكن إلى محافظة أخرى',
    canRestore: true,
    snapshotData: {
      id: 'mem-999',
      membershipNumber: '999',
      fullNameAr: 'سامح جلال الشريف',
      fullNameEn: 'Sameh Galal El-Sherif',
      phone: '01099988877',
      tier: 'standard',
      status: 'expired',
      remainingDays: 0,
      attendanceCount: 3
    }
  },
  {
    id: 'del-102',
    originalId: 'tx-901',
    itemType: 'transaction',
    titleAr: 'معاملة مالية ملغاة: فاتورة مكملات غذائية خاطئة',
    titleEn: 'Cancelled Transaction: Incorrect Supplement Invoice',
    identifier: 'فاتورة: INV-2026-0881 | 450 ج.م',
    deletedAt: '2026-09-24 12:10:00',
    deletedBy: 'كابتن محمود الغندور (المدير العام)',
    deletedByRole: 'manager',
    reason: 'تم إدخال القيمة بطريق الخطأ مرتين وتم تصحيحها بفاتورة جديدة',
    canRestore: false,
    snapshotData: {
      id: 'tx-901',
      amount: 450,
      type: 'supplement',
      paymentMethod: 'cash',
      invoiceNumber: 'INV-2026-0881'
    }
  }
];

export const INITIAL_ACCOUNT_MODIFICATIONS: AccountModificationLog[] = [
  {
    id: 'mod-101',
    timestamp: '2026-09-27T16:20:00Z',
    date: '2026-09-27',
    time: '16:20:00',
    targetType: 'member',
    targetId: 'mem-1003',
    targetName: 'يوسف مصطفى عثمان',
    fieldName: 'balanceDue',
    fieldNameAr: 'المبلغ المتبقي على العضو',
    oldValue: '700 ج.م',
    newValue: '350 ج.م',
    changedBy: 'كابتن محمود الغندور',
    changedByRole: 'manager',
    reasonAr: 'سداد نصف المتبقي نقداً بالخزينة',
    approvedByManager: true
  },
  {
    id: 'mod-102',
    timestamp: '2026-09-26T11:10:00Z',
    date: '2026-09-26',
    time: '11:10:00',
    targetType: 'staff',
    targetId: 'staff-1',
    targetName: 'عمر خالد (استقبال)',
    fieldName: 'accessCode',
    fieldNameAr: 'كود تسجيل الدخول السري',
    oldValue: '•••• (كود قديم)',
    newValue: '•••• (تم التحديث 4444)',
    changedBy: 'كابتن محمود الغندور',
    changedByRole: 'manager',
    reasonAr: 'تحديث أمني دوري لكود الاستقبال',
    approvedByManager: true
  }
];

// =============================================================
// INITIAL PERMISSIONS MATRIX FOR ROLES
// =============================================================
export const INITIAL_DEFAULT_ROLE_PERMISSIONS: Record<string, any> = {
  manager: {
    canManageMembers: true,
    canManageMemberPermissions: true,
    canIssueDiscounts: true,
    canFreezeMemberships: true,
    canOpenCloseShifts: true,
    canRecordTransactions: true,
    canViewPayroll: true,
    canManagePayroll: true,
    canViewReports: true,
    canEditWorkouts: true,
    canAccessAuditLogs: true,
    canAccessRecycleBin: true,
    canManageAccounts: true,
    canManageServices: true,
    canExportPDF: true
  },
  accountant: {
    canManageMembers: false,
    canManageMemberPermissions: false,
    canIssueDiscounts: true,
    canFreezeMemberships: false,
    canOpenCloseShifts: false,
    canRecordTransactions: true,
    canViewPayroll: true,
    canManagePayroll: true,
    canViewReports: true,
    canEditWorkouts: false,
    canAccessAuditLogs: false,
    canAccessRecycleBin: false,
    canManageAccounts: false,
    canManageServices: true,
    canExportPDF: true
  },
  staff: {
    canManageMembers: true,
    canManageMemberPermissions: true,
    canIssueDiscounts: false,
    canFreezeMemberships: true,
    canOpenCloseShifts: true,
    canRecordTransactions: true,
    canViewPayroll: false,
    canManagePayroll: false,
    canViewReports: false,
    canEditWorkouts: false,
    canAccessAuditLogs: false,
    canAccessRecycleBin: false,
    canManageAccounts: false,
    canManageServices: true,
    canExportPDF: true
  },
  coach: {
    canManageMembers: false,
    canManageMemberPermissions: false,
    canIssueDiscounts: false,
    canFreezeMemberships: false,
    canOpenCloseShifts: false,
    canRecordTransactions: false,
    canViewPayroll: false,
    canManagePayroll: false,
    canViewReports: false,
    canEditWorkouts: true,
    canAccessAuditLogs: false,
    canAccessRecycleBin: false,
    canManageAccounts: false,
    canManageServices: false,
    canExportPDF: true
  },
  member: {
    canManageMembers: false,
    canManageMemberPermissions: false,
    canIssueDiscounts: false,
    canFreezeMemberships: false,
    canOpenCloseShifts: false,
    canRecordTransactions: false,
    canViewPayroll: false,
    canManagePayroll: false,
    canViewReports: false,
    canEditWorkouts: false,
    canAccessAuditLogs: false,
    canAccessRecycleBin: false,
    canManageAccounts: false,
    canManageServices: false,
    canExportPDF: true
  }
};

// =============================================================
// INITIAL EMPLOYEE TASKS
// =============================================================
export const INITIAL_EMPLOYEE_TASKS: any[] = [
  {
    id: 'task-1',
    titleAr: 'متابعة المشتركين المنتهية اشتراكاتهم وتجديدها',
    titleEn: 'Follow up on expired members and renewals',
    assignedToId: 'staff-1',
    assignedToName: 'عمر خالد (استقبال)',
    assignedRole: 'staff',
    priority: 'urgent',
    status: 'in_progress',
    dueDate: '2026-10-03',
    notes: 'الاتصال بالأعضاء في قائمة الاشتراكات المنتهية وتقديم عروض التجديد الذهبية',
    createdBy: 'كابتن محمود الغندور (المدير العام)',
    createdAt: '2026-09-30'
  },
  {
    id: 'task-2',
    titleAr: 'إعداد وتجهيز جداول التمارين للمشتركين الجدد',
    titleEn: 'Prepare workout programs for new athletes',
    assignedToId: 'coach-1',
    assignedToName: 'كابتن أحمد عز الدين',
    assignedRole: 'coach',
    priority: 'high',
    status: 'pending',
    dueDate: '2026-10-02',
    notes: 'تصميم برنامج بناء الأجسام لـ 3 مشتركين جدد بعد تقييم فحص InBody',
    createdBy: 'كابتن محمود الغندور (المدير العام)',
    createdAt: '2026-09-30'
  },
  {
    id: 'task-3',
    titleAr: 'مطابقة قيود الخزينة الشهرية وإعداد كشف الرواتب',
    titleEn: 'Monthly cash balancing and payroll roster',
    assignedToId: 'acc-1',
    assignedToName: 'أستاذ ياسر ممدوح (الحسابات)',
    assignedRole: 'accountant',
    priority: 'high',
    status: 'in_progress',
    dueDate: '2026-10-05',
    notes: 'مراجعة نسب تدريب الكباتن واحتساب بدلات الورديات لشهر أكتوبر',
    createdBy: 'كابتن محمود الغندور (المدير العام)',
    createdAt: '2026-09-30'
  }
];

// =============================================================
// INITIAL CLUB SERVICES & PRODUCTS (تطبيق الخدمات والمنتجات)
// =============================================================
export const INITIAL_CLUB_SERVICES: any[] = [
  // 1. باقات العضوية والاشتراكات
  {
    id: 'srv-sub-1',
    nameAr: 'اشتراك الباقة الذهبية السنوية (VIP Gold Year)',
    nameEn: 'Annual Gold VIP Membership',
    category: 'subscription',
    price: 6500,
    durationDays: 365,
    descriptionAr: 'دخول غير محدود للصالة طوال العام + 12 جلسة InBody + خزينة خاصة + تجميد شهرين',
    badge: 'الأكثر طلباً ⭐',
    iconType: 'Crown'
  },
  {
    id: 'srv-sub-2',
    nameAr: 'اشتراك باقة 6 شهور (Silver Semi-Annual)',
    nameEn: 'Semi-Annual Membership (6 Months)',
    category: 'subscription',
    price: 3600,
    durationDays: 180,
    descriptionAr: 'دخول يومي كامل + 6 فحوصات قياس InBody + استشارات تدريبية مجانية',
    badge: 'عرض خاص',
    iconType: 'Flame'
  },
  {
    id: 'srv-sub-3',
    nameAr: 'اشتراك شهري شامل (Monthly Full Access)',
    nameEn: 'Monthly Gym Membership',
    category: 'subscription',
    price: 850,
    durationDays: 30,
    descriptionAr: 'دخول مفتوح للأجهزة ورفع الأثقال والكارديو وفحص InBody مجاني',
    badge: 'مرن',
    iconType: 'Calendar'
  },

  // 2. باقات التدريب الخاص (Private PT Sessions)
  {
    id: 'srv-pt-1',
    nameAr: 'باقة تدريب خاص كابتن (12 جلسة 1-on-1 PT)',
    nameEn: '12 Private PT Coaching Sessions',
    category: 'pt_session',
    price: 1800,
    sessionsCount: 12,
    descriptionAr: '12 تمرين خاص مكثف مع كابتن معتمد وتصميم خطة تغذية رياضية كاملة',
    badge: 'نتائج مضمونة 🔥',
    iconType: 'Dumbbell'
  },
  {
    id: 'srv-pt-2',
    nameAr: 'باقة تدريب خاص VIP (24 جلسة PT مكثفة)',
    nameEn: '24 VIP PT Coaching Package',
    category: 'pt_session',
    price: 3200,
    sessionsCount: 24,
    descriptionAr: 'إشراف يومي ومتابعة غذائية حصرية وتدريب فردي كامل للبطولات واللياقة',
    badge: 'VIP Elite',
    iconType: 'Sparkles'
  },

  // 3. قياس وتحليل الجسم InBody
  {
    id: 'srv-inbody-1',
    nameAr: 'فحص قياسات الجسم الشامل (InBody Composition Scan)',
    nameEn: 'Full InBody Scan & Report',
    category: 'inbody',
    price: 150,
    descriptionAr: 'تحليل دقيق للكتلة العضلية، نسبة الدهون، السوائل، ومعدل الحرق BMR مع تقرير مطبوع',
    badge: 'طبي معتمد',
    iconType: 'Activity'
  },

  // 4. بار البروتين والمكملات (Bar & Supplements)
  {
    id: 'srv-sup-1',
    nameAr: 'شيك واي بروتين مثلج (Iso Whey Protein Shake 30g)',
    nameEn: 'Iced Whey Protein Shake 30g',
    category: 'bar_supplements',
    price: 85,
    stock: 48,
    descriptionAr: 'شيك بروتين منعش بنكهة الشوكولاتة البلجيكية أو الفانيليا مدعم بـ 30 جرام بروتين صافي',
    badge: 'Fresh Bar',
    iconType: 'Coffee'
  },
  {
    id: 'srv-sup-2',
    nameAr: 'مشروب طاقة وطاقة تركيز بري ورك أوت (Pre-Workout Energy)',
    nameEn: 'Pre-Workout Energy Drink Booster',
    category: 'bar_supplements',
    price: 65,
    stock: 60,
    descriptionAr: 'جرعة طاقة ونشاط عالي قبل التمرين لتعزيز الأداء والتحمل العضلي',
    badge: 'طاقة قصوى',
    iconType: 'Zap'
  },
  {
    id: 'srv-sup-3',
    nameAr: 'عبوة مكمل كرياتين ميكرونايزد (Creatine Monohydrate 300g)',
    nameEn: 'Creatine Monohydrate 300g Tub',
    category: 'bar_supplements',
    price: 650,
    stock: 15,
    descriptionAr: 'كرياتين نقي 100% لزيادة القوة والحجم العضلي وتسريع الاستشفاء',
    badge: 'أصلي 100%',
    iconType: 'ShieldCheck'
  },

  // 5. السبا والاستشفاء والمساج (Recovery Spa & Sauna)
  {
    id: 'srv-spa-1',
    nameAr: 'جلسة مساج رياضي علاجي وفك عضلات (Sports Recovery Massage 45m)',
    nameEn: '45-Min Sports Recovery Massage',
    category: 'recovery_spa',
    price: 350,
    descriptionAr: 'مساج عضلي عميق لإزالة التشنجات وحمض اللاكتيك وتسريع الاستشفاء بعد التمرين',
    badge: 'استشفاء فوري',
    iconType: 'HeartHandshake'
  },
  {
    id: 'srv-spa-2',
    nameAr: 'جلسة ساونا وجاكوزي وبخار (Sauna & Steam Session)',
    nameEn: 'Sauna, Jacuzzi & Steam Session',
    category: 'recovery_spa',
    price: 180,
    descriptionAr: 'استرخاء عضلي كامل، تنظيف سموم، وتحسين الدورة الدموية',
    badge: 'سبا',
    iconType: 'Waves'
  },

  // 6. الخزائن والمستلزمات (Lockers & Gear)
  {
    id: 'srv-gear-1',
    nameAr: 'حجز خزينة خاصة مؤمنة لمدة 3 شهور (VIP Locker 3M)',
    nameEn: 'Private Secured Locker (3 Months)',
    category: 'locker_gear',
    price: 450,
    durationDays: 90,
    descriptionAr: 'خزينة خاصة مقفلة برقم سري لحفظ الملابس والمستلزمات الرياضية',
    badge: 'خزائن VIP',
    iconType: 'Lock'
  },
  {
    id: 'srv-gear-2',
    nameAr: 'حقيبة وجير جيم رياضية براند النادي (M22 Gym Shaker & Towel)',
    nameEn: 'M22 Gym Gear (Shaker + Towel)',
    category: 'locker_gear',
    price: 220,
    stock: 25,
    descriptionAr: 'شيكر بروتين مانع للتسريب + فوطة قطنية أصلية مطرزة بشعار الجيم',
    badge: 'Gear',
    iconType: 'ShoppingBag'
  }
];

// =============================================================
// INITIAL EXERCISE VIDEO LIBRARY / FOLDERS (مكتبة ومجلد فيديوهات التمارين والأجهزة)
// =============================================================
export const INITIAL_EXERCISE_LIBRARY = [
  {
    id: 'vid-lib-1',
    titleAr: 'تمرين ضغط الصدر المستوي بالجهاز',
    titleEn: 'Flat Chest Press Machine',
    targetMuscle: 'عضلات الصدر',
    folderCategory: 'مجلد عضلات الصدر',
    descriptionAr: 'ضبط ارتفاع المقعد بحيث يكون المقبض في محاذاة منتصف الصدر، الدفع للأمام مع فرد الذراعين دون قفل الكوعين، والرجوع ببطء في 3 ثوانٍ.',
    durationMinutes: 15,
    machineNumber: '#01',
    machineName: 'جهاز دفع الصدر المعزول',
    difficultyLevel: 'beginner' as const,
    videoUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500',
    videoType: 'link' as const,
    addedBy: 'كابتن محمود الغندور (المدير العام)',
    addedByRole: 'manager' as const,
    createdAt: '2026-09-01 10:00:00',
    targetSets: 4,
    targetReps: '10-12',
    equipment: 'جهاز هيدروليكي أوزان'
  },
  {
    id: 'vid-lib-2',
    titleAr: 'سحب عالي للظهر قبضة واسعة',
    titleEn: 'Wide Grip Lat Pulldown',
    targetMuscle: 'عضلات الظهر',
    folderCategory: 'مجلد عضلات الظهر',
    descriptionAr: 'تثبيت الفخذين أسفل الوسادة، الإمساك بالبار أوسع من الكتفين، سحب البار نحو أعلى الصدر مع عصر عضلات الظهر والنزول بالكتفين لأسفل.',
    durationMinutes: 12,
    machineNumber: '#05',
    machineName: 'جهاز السحب العالي بالكيبل',
    difficultyLevel: 'intermediate' as const,
    videoUrl: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=500',
    videoType: 'link' as const,
    addedBy: 'كابتن محمود الغندور (المدير العام)',
    addedByRole: 'manager' as const,
    createdAt: '2026-09-02 11:30:00',
    targetSets: 4,
    targetReps: '12-15',
    equipment: 'كيبل وبكرات'
  },
  {
    id: 'vid-lib-3',
    titleAr: 'دفع الأرجل على الجهاز بزاوية 45 درجة',
    titleEn: '45-Degree Incline Leg Press',
    targetMuscle: 'عضلات الأرجل',
    folderCategory: 'مجلد عضلات الأرجل',
    descriptionAr: 'وضع القدمين بعرض الكتفين في منتصف المنصة، النزول حتى زاوية 90 درجة بالركبتين دون رفع أسفل الظهر عن المسند، ثم الدفع بكعب القدم بقوة.',
    durationMinutes: 20,
    machineNumber: '#12',
    machineName: 'جهاز دفع الأرجل المائل 45 درجة',
    difficultyLevel: 'intermediate' as const,
    videoUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500',
    videoType: 'link' as const,
    addedBy: 'كابتن محمود الغندور (المدير العام)',
    addedByRole: 'manager' as const,
    createdAt: '2026-09-05 14:00:00',
    targetSets: 4,
    targetReps: '10-12',
    equipment: 'طارات وأوزان حرة'
  },
  {
    id: 'vid-lib-4',
    titleAr: 'ضغط أكتاف أمامي بجهاز السميث',
    titleEn: 'Smith Machine Shoulder Press',
    targetMuscle: 'عضلات الأكتاف',
    folderCategory: 'مجلد عضلات الأكتاف',
    descriptionAr: 'ضبط الدكة بزاوية 75-80 درجة، الإمساك بالبار أوسع من الكتفين بقليل، النزول لمستوى الذقن ثم الدفع للأعلى مع تفريغ الهواء والتحكم الكامل.',
    durationMinutes: 15,
    machineNumber: '#08',
    machineName: 'جهاز سميث متعدد الاستخدام',
    difficultyLevel: 'advanced' as const,
    videoUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500',
    videoType: 'link' as const,
    addedBy: 'كابتن محمود الغندور (المدير العام)',
    addedByRole: 'manager' as const,
    createdAt: '2026-09-10 16:00:00',
    targetSets: 3,
    targetReps: '8-10',
    equipment: 'جهاز سميث'
  },
  {
    id: 'vid-lib-5',
    titleAr: 'كارديو حرق دهون عالي الكثافة على المشاية',
    titleEn: 'Treadmill HIIT Cardio Sprint',
    targetMuscle: 'كارديو ولياقة',
    folderCategory: 'مجلد الكارديو واللياقة',
    descriptionAr: 'جري سريع لمدة 30 ثانية بسرعة 12 كم/س وميل 2%، يليه مشي استشفائي لمدة 60 ثانية بسرعة 5 كم/س، وتكرار ذلك 8 جولات متتالية.',
    durationMinutes: 20,
    machineNumber: '#22',
    machineName: 'مشاية كهربائية تجارية متطورة',
    difficultyLevel: 'beginner' as const,
    videoUrl: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=500',
    videoType: 'link' as const,
    addedBy: 'كابتن محمود الغندور (المدير العام)',
    addedByRole: 'manager' as const,
    createdAt: '2026-09-15 09:30:00',
    targetSets: 8,
    targetReps: '30ث جري / 60ث مشي',
    equipment: 'مشاية كهربائية'
  }
];

// =============================================================
// INITIAL MEMBERSHIP PLANS & OFFERS (باقات وخطط وأسعار الاشتراكات والخصومات)
// =============================================================
export const INITIAL_MEMBERSHIP_PLANS = [
  {
    id: 'plan-std-1m',
    tierKey: 'standard',
    nameAr: 'باقة اللياقة القياسية (Standard)',
    nameEn: 'Standard Fitness Package',
    durationMonths: 1,
    durationDays: 30,
    originalPrice: 650,
    discountPercentage: 0,
    finalPrice: 650,
    badgeAr: 'الاشتراك الشهري',
    badgeEn: 'Monthly Pass',
    featuresAr: [
      'دخول يومي غير محدود للصالة وصالة الأوزان الحرة',
      'استخدام كافة أجهزة الكارديو واللياقة البدنية',
      'خزانة يومية لحفظ الأمتعة + شاور وسبا خفيف',
      'فحص قياس مكونات الجسم InBody لمرة واحدة'
    ],
    featuresEn: [
      'Unlimited gym access',
      'Full cardio & free weights access',
      '1 Free InBody composition test',
      'Daily locker usage & showers'
    ],
    freeInBodyCount: 1,
    freePTSessionsCount: 0,
    freeFreezeDays: 5,
    freeSpaSessions: 0,
    isPopular: false,
    isActive: true
  },
  {
    id: 'plan-vip-3m',
    tierKey: 'vip',
    nameAr: 'باقة النخبة الذهبية 3 شهور (VIP Gold)',
    nameEn: 'VIP Gold Quarterly Package',
    durationMonths: 3,
    durationDays: 90,
    originalPrice: 1800,
    discountPercentage: 20,
    finalPrice: 1440,
    badgeAr: 'الأكثر مبيعاً 🔥 (خصم 20%)',
    badgeEn: 'Best Seller (20% OFF)',
    featuresAr: [
      'دخول شامل للصالة وكافة أجهزة الأوزان والكارديو',
      'عدد 3 فحوصات InBody مجانية طوال فترة الاشتراك',
      'عدد 1 حصة تدريب شخصي وتوجيه PT خاص مع كابتن',
      'إمكانية تجميد العضوية مجاناً لمدة 15 يوماً',
      'خصم 10% على البار والمشروبات والمكملات'
    ],
    featuresEn: [
      'Full gym access for 90 days',
      '3 Free InBody tests',
      '1 Free PT personal training session',
      '15 Days free membership freeze',
      '10% Discount on gym bar & supplements'
    ],
    freeInBodyCount: 3,
    freePTSessionsCount: 1,
    freeFreezeDays: 15,
    freeSpaSessions: 1,
    isPopular: true,
    isActive: true
  },
  {
    id: 'plan-gold-6m',
    tierKey: 'gold',
    nameAr: 'باقة الرياضي المحترف 6 شهور (Pro Diamond)',
    nameEn: 'Pro Diamond Semi-Annual',
    durationMonths: 6,
    durationDays: 180,
    originalPrice: 3400,
    discountPercentage: 25,
    finalPrice: 2550,
    badgeAr: 'عرض الصيف ☀️ (خصم 25%)',
    badgeEn: 'Summer Offer (25% OFF)',
    featuresAr: [
      'دخول مميز 6 شهور لجميع الصالات والمرافق',
      'عدد 6 فحوصات InBody مجانية ومتابعة دورية',
      'عدد 3 حصص تدريب شخصي وتكنيك احترافي PT',
      'إمكانية تجميد العضوية مجاناً لمدة 30 يوماً',
      'جلسة مساج وسبا استشفائي مجانية',
      'خصم 15% على المكملات الغذائية والبار'
    ],
    featuresEn: [
      '6 Months full gym access',
      '6 Free InBody body composition tests',
      '3 Free PT personal training sessions',
      '30 Days free freeze allowance',
      '1 Free Recovery Spa & Massage session'
    ],
    freeInBodyCount: 6,
    freePTSessionsCount: 3,
    freeFreezeDays: 30,
    freeSpaSessions: 2,
    isPopular: false,
    isActive: true
  },
  {
    id: 'plan-annual-12m',
    tierKey: 'diamond',
    nameAr: 'العضوية السنوية الملكية الشاملة (Black Diamond VIP)',
    nameEn: 'Black Diamond Annual VIP Pass',
    durationMonths: 12,
    durationDays: 365,
    originalPrice: 6500,
    discountPercentage: 35,
    finalPrice: 4225,
    badgeAr: 'أقوى توفير 👑 (وفر 2275 ج.م)',
    badgeEn: 'Mega Saver (35% OFF)',
    featuresAr: [
      'اشتراك سنوي كامل 365 يوماً بدون انقطاع',
      'فحوصات InBody مجانية غير محدودة شهرياً',
      'عدد 6 حصص تدريب خاص PT كاملة مع كبار الكباتن',
      'إمكانية تجميد العضوية مجاناً لمدة 60 يوماً مقسمة',
      'خزينة شخصية مؤمنة مجانية بالكامل طوال العام',
      'دخول مجاني غير محدود لخدمات الساونا والجاكوزي والبخار',
      'خصم 20% على متجر المكملات الغذائية وكافيه النادي',
      'دعوة تدريب VIP مجانية شهرياً لأحد أصدقائك'
    ],
    featuresEn: [
      'Full 1 Year 365 days unlimited access',
      'Unlimited monthly InBody body composition checks',
      '6 Free Personal Training PT sessions',
      '60 Days total flexible freeze allowance',
      'Free private VIP locker for whole year',
      'Unlimited Spa, Sauna & Jacuzzi access',
      'Free VIP guest invitation pass every month'
    ],
    freeInBodyCount: 12,
    freePTSessionsCount: 6,
    freeFreezeDays: 60,
    freeSpaSessions: 12,
    isPopular: true,
    isActive: true
  },
  {
    id: 'plan-student-1m',
    tierKey: 'student',
    nameAr: 'باقة الطلبة والشباب الرياضي (Student Fit)',
    nameEn: 'Student Athletic Package',
    durationMonths: 1,
    durationDays: 30,
    originalPrice: 550,
    discountPercentage: 18,
    finalPrice: 450,
    badgeAr: 'خصم الكارنيه الطلابي 🎓',
    badgeEn: 'Student ID Discount',
    featuresAr: [
      'دخول الصالة للطلبة من الصباح حتى 5 مساءً',
      'استخدام كافة أجهزة اللياقة وبناء الأجسام',
      'فحص قياس InBody مجاني شهرياً',
      'توجيه وإرشاد تكنيك التمارين مع الكباتن'
    ],
    featuresEn: [
      'Student gym access morning to 5pm',
      'Full access to bodybuilding & cardio equipment',
      '1 Free InBody check per month'
    ],
    freeInBodyCount: 1,
    freePTSessionsCount: 0,
    freeFreezeDays: 5,
    freeSpaSessions: 0,
    isPopular: false,
    isActive: true
  }
];

// =============================================================
// INITIAL MEMBER CHECK-INS / ATTENDANCE LOGS (سجل دخول وحضور الأعضاء لحظة بلحظة)
// =============================================================
export const INITIAL_MEMBER_CHECKINS = [
  // Member 1001 (كريم أحمد حسني) - 6 زيارات متتالية
  {
    id: 'checkin-1001-6',
    memberId: 'mem-1001',
    membershipNumber: '1001',
    memberNameAr: 'كريم أحمد حسني',
    memberNameEn: 'Kareem Ahmed Hosny',
    phone: '01012345678',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    tier: 'gold' as const,
    checkInDate: '2026-10-04',
    checkInTime: '18:15:20',
    checkInTimestamp: '2026-10-04T18:15:20.000Z',
    statusAtCheckIn: 'active' as const,
    gateOrMethod: 'reception_qr' as const,
    performedByName: 'بوابة الاستقبال - مسح كود QR',
    performedByRole: 'member' as const,
    remainingDaysAtCheckIn: 62
  },
  {
    id: 'checkin-1001-5',
    memberId: 'mem-1001',
    membershipNumber: '1001',
    memberNameAr: 'كريم أحمد حسني',
    memberNameEn: 'Kareem Ahmed Hosny',
    phone: '01012345678',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    tier: 'gold' as const,
    checkInDate: '2026-10-03',
    checkInTime: '17:45:10',
    checkInTimestamp: '2026-10-03T17:45:10.000Z',
    statusAtCheckIn: 'active' as const,
    gateOrMethod: 'manual_staff' as const,
    performedByName: 'موظف الاستقبال: كريم ممدوح',
    performedByRole: 'staff' as const,
    remainingDaysAtCheckIn: 63
  },
  {
    id: 'checkin-1001-4',
    memberId: 'mem-1001',
    membershipNumber: '1001',
    memberNameAr: 'كريم أحمد حسني',
    memberNameEn: 'Kareem Ahmed Hosny',
    phone: '01012345678',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    tier: 'gold' as const,
    checkInDate: '2026-10-02',
    checkInTime: '18:00:00',
    checkInTimestamp: '2026-10-02T18:00:00.000Z',
    statusAtCheckIn: 'active' as const,
    gateOrMethod: 'reception_qr' as const,
    performedByName: 'بوابة الاستقبال - مسح كود QR',
    performedByRole: 'member' as const,
    remainingDaysAtCheckIn: 64
  },
  {
    id: 'checkin-1001-3',
    memberId: 'mem-1001',
    membershipNumber: '1001',
    memberNameAr: 'كريم أحمد حسني',
    memberNameEn: 'Kareem Ahmed Hosny',
    phone: '01012345678',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    tier: 'gold' as const,
    checkInDate: '2026-10-01',
    checkInTime: '17:30:45',
    checkInTimestamp: '2026-10-01T17:30:45.000Z',
    statusAtCheckIn: 'active' as const,
    gateOrMethod: 'manual_staff' as const,
    performedByName: 'موظف الاستقبال: كريم ممدوح',
    performedByRole: 'staff' as const,
    remainingDaysAtCheckIn: 65
  },
  {
    id: 'checkin-1001-2',
    memberId: 'mem-1001',
    membershipNumber: '1001',
    memberNameAr: 'كريم أحمد حسني',
    memberNameEn: 'Kareem Ahmed Hosny',
    phone: '01012345678',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    tier: 'gold' as const,
    checkInDate: '2026-09-30',
    checkInTime: '19:10:00',
    checkInTimestamp: '2026-09-30T19:10:00.000Z',
    statusAtCheckIn: 'active' as const,
    gateOrMethod: 'reception_qr' as const,
    performedByName: 'بوابة الاستقبال - مسح كود QR',
    performedByRole: 'member' as const,
    remainingDaysAtCheckIn: 66
  },
  {
    id: 'checkin-1001-1',
    memberId: 'mem-1001',
    membershipNumber: '1001',
    memberNameAr: 'كريم أحمد حسني',
    memberNameEn: 'Kareem Ahmed Hosny',
    phone: '01012345678',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    tier: 'gold' as const,
    checkInDate: '2026-09-28',
    checkInTime: '18:05:00',
    checkInTimestamp: '2026-09-28T18:05:00.000Z',
    statusAtCheckIn: 'active' as const,
    gateOrMethod: 'manual_staff' as const,
    performedByName: 'موظف الاستقبال: كريم ممدوح',
    performedByRole: 'staff' as const,
    remainingDaysAtCheckIn: 68
  },

  // Member 1002 (محمد سامي عبد الرحمن) - 5 زيارات
  {
    id: 'checkin-1002-5',
    memberId: 'mem-1002',
    membershipNumber: '1002',
    memberNameAr: 'محمد سامي عبد الرحمن',
    memberNameEn: 'Mohamed Samy Abdelrahman',
    phone: '01198765432',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
    tier: 'vip' as const,
    checkInDate: '2026-10-04',
    checkInTime: '16:40:12',
    checkInTimestamp: '2026-10-04T16:40:12.000Z',
    statusAtCheckIn: 'active' as const,
    gateOrMethod: 'reception_qr' as const,
    performedByName: 'بوابة الاستقبال - مسح كود QR',
    performedByRole: 'member' as const,
    remainingDaysAtCheckIn: 47
  },
  {
    id: 'checkin-1002-4',
    memberId: 'mem-1002',
    membershipNumber: '1002',
    memberNameAr: 'محمد سامي عبد الرحمن',
    memberNameEn: 'Mohamed Samy Abdelrahman',
    phone: '01198765432',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
    tier: 'vip' as const,
    checkInDate: '2026-10-02',
    checkInTime: '17:15:40',
    checkInTimestamp: '2026-10-02T17:15:40.000Z',
    statusAtCheckIn: 'active' as const,
    gateOrMethod: 'self_portal' as const,
    performedByName: 'بوابة الدخول الذاتي - QR Code',
    performedByRole: 'member' as const,
    remainingDaysAtCheckIn: 49
  },
  {
    id: 'checkin-1002-3',
    memberId: 'mem-1002',
    membershipNumber: '1002',
    memberNameAr: 'محمد سامي عبد الرحمن',
    memberNameEn: 'Mohamed Samy Abdelrahman',
    phone: '01198765432',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
    tier: 'vip' as const,
    checkInDate: '2026-09-30',
    checkInTime: '18:20:00',
    checkInTimestamp: '2026-09-30T18:20:00.000Z',
    statusAtCheckIn: 'active' as const,
    gateOrMethod: 'manual_staff' as const,
    performedByName: 'موظف الاستقبال: كريم ممدوح',
    performedByRole: 'staff' as const,
    remainingDaysAtCheckIn: 51
  },
  {
    id: 'checkin-1002-2',
    memberId: 'mem-1002',
    membershipNumber: '1002',
    memberNameAr: 'محمد سامي عبد الرحمن',
    memberNameEn: 'Mohamed Samy Abdelrahman',
    phone: '01198765432',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
    tier: 'vip' as const,
    checkInDate: '2026-09-28',
    checkInTime: '16:55:00',
    checkInTimestamp: '2026-09-28T16:55:00.000Z',
    statusAtCheckIn: 'active' as const,
    gateOrMethod: 'reception_qr' as const,
    performedByName: 'بوابة الاستقبال - مسح كود QR',
    performedByRole: 'member' as const,
    remainingDaysAtCheckIn: 53
  },
  {
    id: 'checkin-1002-1',
    memberId: 'mem-1002',
    membershipNumber: '1002',
    memberNameAr: 'محمد سامي عبد الرحمن',
    memberNameEn: 'Mohamed Samy Abdelrahman',
    phone: '01198765432',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
    tier: 'vip' as const,
    checkInDate: '2026-09-26',
    checkInTime: '17:00:00',
    checkInTimestamp: '2026-09-26T17:00:00.000Z',
    statusAtCheckIn: 'active' as const,
    gateOrMethod: 'manual_staff' as const,
    performedByName: 'موظف الاستقبال: كريم ممدوح',
    performedByRole: 'staff' as const,
    remainingDaysAtCheckIn: 55
  },

  // Member 1003 (يوسف مصطفى عثمان) - 4 زيارات
  {
    id: 'checkin-1003-4',
    memberId: 'mem-1003',
    membershipNumber: '1003',
    memberNameAr: 'يوسف مصطفى عثمان',
    memberNameEn: 'Youssef Mostafa Osman',
    phone: '01255566677',
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
    tier: 'diamond' as const,
    checkInDate: '2026-10-03',
    checkInTime: '15:05:00',
    checkInTimestamp: '2026-10-03T15:05:00.000Z',
    statusAtCheckIn: 'active' as const,
    gateOrMethod: 'manual_staff' as const,
    performedByName: 'موظف الاستقبال: كريم ممدوح',
    performedByRole: 'staff' as const,
    remainingDaysAtCheckIn: 162
  },
  {
    id: 'checkin-1003-3',
    memberId: 'mem-1003',
    membershipNumber: '1003',
    memberNameAr: 'يوسف مصطفى عثمان',
    memberNameEn: 'Youssef Mostafa Osman',
    phone: '01255566677',
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
    tier: 'diamond' as const,
    checkInDate: '2026-10-01',
    checkInTime: '16:15:00',
    checkInTimestamp: '2026-10-01T16:15:00.000Z',
    statusAtCheckIn: 'active' as const,
    gateOrMethod: 'reception_qr' as const,
    performedByName: 'بوابة الاستقبال - مسح كود QR',
    performedByRole: 'member' as const,
    remainingDaysAtCheckIn: 164
  },
  {
    id: 'checkin-1003-2',
    memberId: 'mem-1003',
    membershipNumber: '1003',
    memberNameAr: 'يوسف مصطفى عثمان',
    memberNameEn: 'Youssef Mostafa Osman',
    phone: '01255566677',
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
    tier: 'diamond' as const,
    checkInDate: '2026-09-28',
    checkInTime: '15:45:00',
    checkInTimestamp: '2026-09-28T15:45:00.000Z',
    statusAtCheckIn: 'active' as const,
    gateOrMethod: 'manual_staff' as const,
    performedByName: 'موظف الاستقبال: كريم ممدوح',
    performedByRole: 'staff' as const,
    remainingDaysAtCheckIn: 167
  },
  {
    id: 'checkin-1003-1',
    memberId: 'mem-1003',
    membershipNumber: '1003',
    memberNameAr: 'يوسف مصطفى عثمان',
    memberNameEn: 'Youssef Mostafa Osman',
    phone: '01255566677',
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
    tier: 'diamond' as const,
    checkInDate: '2026-09-26',
    checkInTime: '16:00:00',
    checkInTimestamp: '2026-09-26T16:00:00.000Z',
    statusAtCheckIn: 'active' as const,
    gateOrMethod: 'reception_qr' as const,
    performedByName: 'بوابة الاستقبال - مسح كود QR',
    performedByRole: 'member' as const,
    remainingDaysAtCheckIn: 169
  },

  // Member 1004 (هاني فريد النجار) - 6 زيارات
  {
    id: 'checkin-1004-6',
    memberId: 'mem-1004',
    membershipNumber: '1004',
    memberNameAr: 'هاني فريد النجار',
    memberNameEn: 'Hany Farid El-Naggar',
    phone: '01033322211',
    avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150',
    tier: 'standard' as const,
    checkInDate: '2026-08-30',
    checkInTime: '19:00:00',
    checkInTimestamp: '2026-08-30T19:00:00.000Z',
    statusAtCheckIn: 'active' as const,
    gateOrMethod: 'manual_staff' as const,
    performedByName: 'موظف الاستقبال: كريم ممدوح',
    performedByRole: 'staff' as const,
    remainingDaysAtCheckIn: 1
  },
  {
    id: 'checkin-1004-5',
    memberId: 'mem-1004',
    membershipNumber: '1004',
    memberNameAr: 'هاني فريد النجار',
    memberNameEn: 'Hany Farid El-Naggar',
    phone: '01033322211',
    avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150',
    tier: 'standard' as const,
    checkInDate: '2026-08-28',
    checkInTime: '18:30:00',
    checkInTimestamp: '2026-08-28T18:30:00.000Z',
    statusAtCheckIn: 'active' as const,
    gateOrMethod: 'reception_qr' as const,
    performedByName: 'بوابة الاستقبال - مسح كود QR',
    performedByRole: 'member' as const,
    remainingDaysAtCheckIn: 3
  },
  {
    id: 'checkin-1004-4',
    memberId: 'mem-1004',
    membershipNumber: '1004',
    memberNameAr: 'هاني فريد النجار',
    memberNameEn: 'Hany Farid El-Naggar',
    phone: '01033322211',
    avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150',
    tier: 'standard' as const,
    checkInDate: '2026-08-25',
    checkInTime: '17:45:00',
    checkInTimestamp: '2026-08-25T17:45:00.000Z',
    statusAtCheckIn: 'active' as const,
    gateOrMethod: 'manual_staff' as const,
    performedByName: 'موظف الاستقبال: كريم ممدوح',
    performedByRole: 'staff' as const,
    remainingDaysAtCheckIn: 6
  },
  {
    id: 'checkin-1004-3',
    memberId: 'mem-1004',
    membershipNumber: '1004',
    memberNameAr: 'هاني فريد النجار',
    memberNameEn: 'Hany Farid El-Naggar',
    phone: '01033322211',
    avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150',
    tier: 'standard' as const,
    checkInDate: '2026-08-20',
    checkInTime: '18:10:00',
    checkInTimestamp: '2026-08-20T18:10:00.000Z',
    statusAtCheckIn: 'active' as const,
    gateOrMethod: 'reception_qr' as const,
    performedByName: 'بوابة الاستقبال - مسح كود QR',
    performedByRole: 'member' as const,
    remainingDaysAtCheckIn: 11
  },
  {
    id: 'checkin-1004-2',
    memberId: 'mem-1004',
    membershipNumber: '1004',
    memberNameAr: 'هاني فريد النجار',
    memberNameEn: 'Hany Farid El-Naggar',
    phone: '01033322211',
    avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150',
    tier: 'standard' as const,
    checkInDate: '2026-08-15',
    checkInTime: '17:15:00',
    checkInTimestamp: '2026-08-15T17:15:00.000Z',
    statusAtCheckIn: 'active' as const,
    gateOrMethod: 'manual_staff' as const,
    performedByName: 'موظف الاستقبال: كريم ممدوح',
    performedByRole: 'staff' as const,
    remainingDaysAtCheckIn: 16
  },
  {
    id: 'checkin-1004-1',
    memberId: 'mem-1004',
    membershipNumber: '1004',
    memberNameAr: 'هاني فريد النجار',
    memberNameEn: 'Hany Farid El-Naggar',
    phone: '01033322211',
    avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150',
    tier: 'standard' as const,
    checkInDate: '2026-08-10',
    checkInTime: '18:00:00',
    checkInTimestamp: '2026-08-10T18:00:00.000Z',
    statusAtCheckIn: 'active' as const,
    gateOrMethod: 'manual_staff' as const,
    performedByName: 'موظف الاستقبال: كريم ممدوح',
    performedByRole: 'staff' as const,
    remainingDaysAtCheckIn: 21
  }
];

// =============================================================
// INITIAL MANAGER NOTIFICATIONS (سجل إشعارات حضور وانصراف الموظفين والمطبوعات)
// =============================================================
export const INITIAL_MANAGER_NOTIFICATIONS: ManagerNotification[] = [
  {
    id: 'notif-101',
    timestamp: '2026-10-04T09:00:00.000Z',
    date: '2026-10-04',
    time: '09:00:00',
    type: 'employee_checkin',
    titleAr: 'تسجيل حضور موظف: كريم ممدوح',
    titleEn: 'Employee Check-in: Karim Mamdouh',
    employeeId: 'stf-1',
    employeeName: 'كريم ممدوح الشريف',
    employeeRole: 'موظف استقبال',
    detailsAr: 'قام الموظف كريم ممدوح الشريف (موظف استقبال) بتسجيل الحضور في تمام الساعة 09:00 ص بتاريخ 2026-10-04 لبدء وردية العمل الصباحية.',
    detailsEn: 'Staff member Karim Mamdouh checked in at 09:00 AM.',
    status: 'unread'
  },
  {
    id: 'notif-102',
    timestamp: '2026-10-04T08:30:00.000Z',
    date: '2026-10-04',
    time: '08:30:00',
    type: 'employee_checkin',
    titleAr: 'تسجيل حضور موظف: كابتن أحمد عز الدين',
    titleEn: 'Employee Check-in: Capt. Ahmed Ezz Eldin',
    employeeId: 'cch-1',
    employeeName: 'كابتن أحمد عز الدين',
    employeeRole: 'كابتن ومدرب',
    detailsAr: 'قام الكابتن أحمد عز الدين (مدرب لياقة بدنية وبناء أجسام) بتسجيل الحضور في تمام الساعة 08:30 ص لبدء تدريب المشتركين بالصالة.',
    detailsEn: 'Coach Ahmed Ezz Eldin checked in at 08:30 AM.',
    status: 'unread'
  },
  {
    id: 'notif-103',
    timestamp: '2026-10-03T18:00:00.000Z',
    date: '2026-10-03',
    time: '18:00:00',
    type: 'employee_checkout',
    titleAr: 'تسجيل انصراف موظف: كريم ممدوح',
    titleEn: 'Employee Check-out: Karim Mamdouh',
    employeeId: 'stf-1',
    employeeName: 'كريم ممدوح الشريف',
    employeeRole: 'موظف استقبال',
    workedHours: 9,
    workedHoursFormatted: '9 ساعات و 0 دقيقة',
    detailsAr: 'قام الموظف كريم ممدوح بتسجيل الانصراف في تمام الساعة 18:00 م. إجمالي ساعات العمل اليومية المحتسبة: 9 ساعات.',
    detailsEn: 'Staff Karim Mamdouh checked out at 18:00 PM. Total hours worked: 9 hrs.',
    status: 'read'
  },
  {
    id: 'notif-104',
    timestamp: '2026-10-03T16:30:00.000Z',
    date: '2026-10-03',
    time: '16:30:00',
    type: 'report_printed',
    titleAr: 'طباعة تقرير: كشف إيرادات واشتراكات الصالة المعتمد',
    titleEn: 'Report Printed: Revenue Report',
    employeeId: 'acc-1',
    employeeName: 'طارق الصاوي النمر',
    employeeRole: 'مسؤول حسابات',
    reportType: 'تقرير مالي',
    reportTitle: 'كشف إيرادات واشتراكات الصالة المعتمد',
    detailsAr: 'قام مسؤول الحسابات طارق الصاوي بطباعة تقرير إيرادات واشتراكات الصالة وتصديره كملف رسمي في تمام الساعة 16:30.',
    detailsEn: 'Accountant Tarek El-Sawy printed the official Revenue Report at 16:30.',
    status: 'read'
  }
];




