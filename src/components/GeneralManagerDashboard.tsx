import React, { useState, useEffect, useRef } from 'react';
import { 
  EmployeeAccount, 
  GymMember, 
  CashShift, 
  FinancialTransaction,
  CurrentUser,
  RolePermissions,
  AppRole,
  EmploymentContract
} from '../types/gym';
import { StorageService } from '../services/storageService';
import { audioAlertService } from '../services/audioService';
import { pdfPrintService } from '../services/pdfPrintService';
import { ManagerAuditLogs } from './ManagerAuditLogs';
import { ManagerReportsArchive } from './ManagerReportsArchive';
import { ManagerRecycleBin } from './ManagerRecycleBin';
import { ManagerAccountMods } from './ManagerAccountMods';
import { ManagerEmployeeAttendance } from './ManagerEmployeeAttendance';
import { ManagerSecurityAlerts } from './ManagerSecurityAlerts';
import { ManagerPermissionsMatrix } from './ManagerPermissionsMatrix';
import { ManagerGeneralLedger } from './ManagerGeneralLedger';
import { ManagerFinancialDetailModal, FinancialDetailType } from './ManagerFinancialDetailModal';
import { ManagerActiveMembersModal } from './ManagerActiveMembersModal';
import { ManagerDatabaseBackup } from './ManagerDatabaseBackup';
import { ManagerContracts } from './ManagerContracts';
import { ManagerExerciseVideoLibrary } from './ManagerExerciseVideoLibrary';
import { ManagerMembershipPlans } from './ManagerMembershipPlans';
import { MemberCheckInLogView } from './MemberCheckInLogView';
import { ManagerDynamicSyncReport } from './ManagerDynamicSyncReport';
import { ManagerOperationalCharterModal } from './ManagerOperationalCharterModal';
import { ManagerSensitiveMods } from './ManagerSensitiveMods';
import { ManagerMembersDirectory } from './ManagerMembersDirectory';
import { ExtendSubscriptionModal } from './ExtendSubscriptionModal';
import { ManagerVouchersView } from './ManagerVouchersView';
import { DeleteVoucherModal } from './DeleteVoucherModal';
import { MemberProfileModal } from './MemberProfileModal';
import { 
  Crown, 
  Users, 
  Clock, 
  DollarSign, 
  BarChart3, 
  History, 
  FileText, 
  Trash2, 
  ShieldCheck, 
  UserCheck, 
  PlusCircle, 
  Search, 
  Edit, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Printer, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CreditCard, 
  Building, 
  Sparkles, 
  Shield, 
  Briefcase, 
  UserPlus, 
  Eye, 
  EyeOff, 
  Phone, 
  KeyRound, 
  Calendar, 
  Wallet, 
  ShieldAlert, 
  BellRing, 
  Sliders, 
  CheckSquare, 
  Square, 
  User, 
  Power, 
  Dumbbell, 
  Receipt, 
  UserX, 
  BadgeCheck, 
  BookOpen, 
  Database, 
  UploadCloud, 
  DownloadCloud, 
  Check, 
  Signature, 
  Share2, 
  Copy,
  Film,
  Percent,
  Zap,
  Radio,
  ScrollText,
  CalendarCheck,
  AlertTriangle,
  Snowflake,
  LayoutGrid,
  Table as TableIcon,
  PauseCircle,
  Filter,
  CalendarRange,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

export type MainDashboardView = 
  | 'accounts' 
  | 'vouchers'
  | 'permissions' 
  | 'security_alerts' 
  | 'sync_report'
  | 'shifts' 
  | 'attendance' 
  | 'reports' 
  | 'activity_logs' 
  | 'report_archive' 
  | 'recycle_bin' 
  | 'account_mods' 
  | 'general_ledger' 
  | 'database_backup' 
  | 'contracts'
  | 'exercise_video_library'
  | 'membership_plans'
  | 'member_checkins'
  | 'sensitive_mods'
  | 'members';

interface GeneralManagerDashboardProps {
  currentUser: CurrentUser;
  lang: 'ar' | 'en';
  defaultSubView?: MainDashboardView;
  onUpdateCurrentUser?: (user: CurrentUser) => void;
}

export const GeneralManagerDashboard: React.FC<GeneralManagerDashboardProps> = ({ 
  currentUser, 
  lang,
  defaultSubView = 'accounts',
  onUpdateCurrentUser
}) => {
  const isAr = lang === 'ar';
  const isViewer = currentUser.role === 'viewer';
  const [mainView, setMainView] = useState<MainDashboardView>(defaultSubView);

  const tabsScrollRef = useRef<HTMLDivElement>(null);
  const [isDraggingTabs, setIsDraggingTabs] = useState(false);
  const [tabsStartX, setTabsStartX] = useState(0);
  const [tabsScrollStart, setTabsScrollStart] = useState(0);

  const scrollTabs = (dir: 'left' | 'right' | 'forward' | 'backward') => {
    if (tabsScrollRef.current) {
      const el = tabsScrollRef.current;
      const step = 320;
      // In RTL mode (Arabic), forward movement along visual list is scrollLeft negative/positive depending on browser
      let moveLeft = 0;
      if (dir === 'left') {
        moveLeft = -step;
      } else if (dir === 'right') {
        moveLeft = step;
      } else if (dir === 'forward') {
        moveLeft = isAr ? -step : step;
      } else if (dir === 'backward') {
        moveLeft = isAr ? step : -step;
      }
      el.scrollBy({ left: moveLeft, behavior: 'smooth' });
    }
  };

  const handleTabsWheel = (e: React.WheelEvent) => {
    if (tabsScrollRef.current) {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        // Prevent default page scroll and convert to horizontal tabs scroll on desktop
        tabsScrollRef.current.scrollLeft += (isAr ? -e.deltaY : e.deltaY);
      }
    }
  };

  // Data states
  const [managers, setManagers] = useState<EmployeeAccount[]>([]);
  const [coaches, setCoaches] = useState<EmployeeAccount[]>([]);
  const [staff, setStaff] = useState<EmployeeAccount[]>([]);
  const [accountants, setAccountants] = useState<EmployeeAccount[]>([]);
  const [viewers, setViewers] = useState<EmployeeAccount[]>([]);
  const [members, setMembers] = useState<GymMember[]>([]);
  const [shifts, setShifts] = useState<CashShift[]>([]);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [securityAlertsCount, setSecurityAlertsCount] = useState(0);

  // Accounts Filter & Search State
  const [accountsFilterRole, setAccountsFilterRole] = useState<'all' | 'manager' | 'accountant' | 'staff' | 'coach' | 'viewer' | 'member'>('all');
  const [accountsSearchQuery, setAccountsSearchQuery] = useState('');
  const [accountsViewMode, setAccountsViewMode] = useState<'table' | 'grid'>('table');
  const [accountsStatusFilter, setAccountsStatusFilter] = useState<'all' | 'active' | 'expiring' | 'expired' | 'suspended'>('all');
  const [accountsDateFilter, setAccountsDateFilter] = useState<'all' | 'today' | 'this_month' | 'custom'>('all');
  const [accountsDateStart, setAccountsDateStart] = useState('');
  const [accountsDateEnd, setAccountsDateEnd] = useState('');

  // Show/Hide PIN codes
  const [showManagerPin, setShowManagerPin] = useState(false);

  // Password Changer Modal for GM
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [pwdTargetType, setPwdTargetType] = useState<'employee' | 'member'>('employee');
  const [pwdTargetId, setPwdTargetId] = useState('');
  const [pwdTargetName, setPwdTargetName] = useState('');
  const [pwdTargetPhone, setPwdTargetPhone] = useState('');
  const [pwdNewValue, setPwdNewValue] = useState('');

  // Permissions and Privileges Customization Modal
  const [isPermModalOpen, setIsPermModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [shiftToCloseByManager, setShiftVoucherToCloseByManager] = useState<CashShift | null>(null);
  const [closeShiftAmountByManager, setCloseShiftAmountByManager] = useState('');
  const [permTargetUser, setPermTargetUser] = useState<{
    id: string;
    nameAr: string;
    role: AppRole;
    phone: string;
    customPermissions?: Partial<RolePermissions>;
  } | null>(null);
  const [permTargetType, setPermTargetType] = useState<'employee' | 'member'>('employee');
  const [permTargetRole, setPermTargetRole] = useState<'coach' | 'staff' | 'accountant' | 'manager' | 'member'>('coach');
  const [visiblePinId, setVisiblePinId] = useState<string | null>(null);
  const [draftPermissions, setDraftPermissions] = useState<RolePermissions>({
    canManageMembers: false,
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
    canExportPDF: false
  });

  // Modals for editing / adding employee
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<EmployeeAccount | null>(null);
  const [employeeRole, setEmployeeRole] = useState<'coach' | 'staff' | 'accountant' | 'manager' | 'viewer'>('coach');
  const [nameAr, setNameAr] = useState('');
  const [phone, setPhone] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [attendanceCode, setAttendanceCode] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [baseSalary, setBaseSalary] = useState<number | string>('');
  const [avatarUrl, setAvatarUrl] = useState('');

  // Modals for adding / editing gym member
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<GymMember | null>(null);
  const [memberFullName, setMemberFullName] = useState('');
  const [memberPhone, setMemberPhone] = useState('');
  const [memberPin, setMemberPin] = useState('');
  const [isMemberDetailModalOpen, setIsMemberDetailModalOpen] = useState(false);
  const [selectedMemberDetail, setSelectedMemberDetail] = useState<GymMember | null>(null);
  const [selectedExtendMemberModal, setSelectedExtendMemberModal] = useState<GymMember | null>(null);

  const [memberDurationMonths, setMemberDurationMonths] = useState<number | string>('');
  const [memberPricePaid, setMemberPricePaid] = useState<number | string>('');
  const [memberBirthDate, setMemberBirthDate] = useState('');
  const [memberAddress, setMemberAddress] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [memberAvatarUrl, setMemberAvatarUrl] = useState('');
  const [memberStartDate, setMemberStartDate] = useState('');
  const [memberEndDate, setMemberEndDate] = useState('');

  // Financial Detail Inspection Modal State (الإيرادات والمصروفات وصافي الربح)
  const [financialModalType, setFinancialModalType] = useState<FinancialDetailType | null>(null);

  // Active Members Inspection Modal State (كشف وبيانات الأعضاء النشطين)
  const [isActiveMembersModalOpen, setIsActiveMembersModalOpen] = useState(false);

  // General Operational Charter Modal State (اللائحة العامة للمهام واللوائح الداخلية بدون أسماء)
  const [isCharterModalOpen, setIsCharterModalOpen] = useState(false);

  // Shift Management & Audit Inspector State for GM
  const [shiftsFilterStatus, setShiftsFilterStatus] = useState<'all' | 'open' | 'closed'>('all');
  const [shiftsSearchQuery, setShiftsSearchQuery] = useState('');

  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);

  useEffect(() => {
    setOnlineUsers(StorageService.getOnlineUsers(currentUser.id));
    const interval = setInterval(() => {
      setOnlineUsers(StorageService.getOnlineUsers(currentUser.id));
    }, 8000);
    return () => clearInterval(interval);
  }, [currentUser]);
  const [selectedShiftForInspect, setSelectedShiftForInspect] = useState<CashShift | null>(null);
  const [shiftVoucherToDelete, setShiftVoucherToDelete] = useState<FinancialTransaction | null>(null);
  const [shiftToDelete, setShiftToDelete] = useState<CashShift | null>(null);
  const [shiftDeleteReason, setShiftDeleteReason] = useState<string>('');

  // Delete Account Confirmation In-App Modal State (حذف الحساب بقرار المدير العام)
  const [accountToDelete, setAccountToDelete] = useState<{
    id: string;
    name: string;
    role: AppRole;
    roleTitle: string;
    type: 'member' | 'employee';
    identifier: string;
    avatarUrl?: string;
    raw: any;
  } | null>(null);
  const [deleteReasonText, setDeleteReasonText] = useState('');
  const [deleteToastMessage, setDeleteToastMessage] = useState<string | null>(null);
  const [copiedEmpId, setCopiedEmpId] = useState<string | null>(null);

  // WhatsApp Sender states
  const [waPhone, setWaPhone] = useState('');
  const [waMessage, setWaCustomMessage] = useState('');
  const [waTemplateSelected, setWaTemplateSelected] = useState('custom');

  const handleCopyDirectLoginLink = (emp: { role: string; phone: string; accessCode?: string; nameAr: string; id: string }) => {
    try {
      const origin = window.location.origin;
      const directUrl = `${origin}/?role=${emp.role}&phone=${emp.phone}&code=${emp.accessCode || '1234'}`;
      navigator.clipboard.writeText(directUrl);
      setCopiedEmpId(emp.id);
      audioAlertService.playSuccess();
      setDeleteToastMessage(
        isAr 
          ? `✅ تم نسخ رابط الدخول المباشر للموظف (${emp.nameAr})! أرسله له على واتساب ليفتح البرنامج فوراً بدون كتابة كلمة سر.`
          : `Direct login link copied for (${emp.nameAr})!`
      );
      setTimeout(() => {
        setCopiedEmpId(null);
        setDeleteToastMessage(null);
      }, 5000);
    } catch {
      // fallback
    }
  };

  const handleSelectWaTemplate = (tplKey: string) => {
    setWaTemplateSelected(tplKey);
    if (tplKey === 'custom') {
      setWaCustomMessage('');
    } else if (tplKey === 'finance') {
      const nowStr = new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      setWaCustomMessage(
        `💰 كشف الحسابات والمالية اليومي - نادي GYM-M22 الرياضي\n` +
        `التاريخ: ${nowStr}\n` +
        `-----------------------------------------\n` +
        `• إجمالي الإيرادات اليومية: ${totalRevenue.toLocaleString()} ج.م\n` +
        `• إجمالي المصروفات والخصومات: ${totalExpenses.toLocaleString()} ج.م\n` +
        `• صافي الأرباح المحققة: ${netProfit.toLocaleString()} ج.م\n` +
        `-----------------------------------------\n` +
        `• إجمالي المشتركين الفاعلين: ${activeMembersCount} لاعب نشط\n` +
        `-----------------------------------------\n` +
        `مُرسل تلقائياً من نظام الإدارة والتشغيل المركزي.`
      );
    } else if (tplKey === 'attendance') {
      const nowStr = new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      const todayCheckInsCount = StorageService.getMemberCheckIns().filter(c => c.checkInDate === StorageService.getLocalTodayString()).length;
      setWaCustomMessage(
        `👥 تقرير حضور الكادر والأعضاء اليوم - نادي GYM-M22\n` +
        `التاريخ: ${nowStr}\n` +
        `-----------------------------------------\n` +
        `• إجمالي اللاعبين الحاضرين اليوم: ${todayCheckInsCount} لاعبين\n` +
        `• الكباتن والموظفين الحاضرين بالصالات: ${coaches.length + staff.length + accountants.length} كادر نشط\n` +
        `-----------------------------------------\n` +
        `مُرسل تلقائياً من نظام الإدارة والتشغيل المركزي.`
      );
    } else if (tplKey === 'login') {
      setWaCustomMessage(
        `🔗 رابط الدخول السريع والآمن للجوال - المدير العام\n` +
        `نادي GYM-M22 الرياضي\n` +
        `-----------------------------------------\n` +
        `${activeManager.nameAr}، اضغط على الرابط أدناه للدخول السريع والمباشر لحساب الإدارة المركزية من جوالك:\n` +
        `${window.location.origin}/?role=manager&phone=${activeManager.phone}&code=${activeManager.accessCode}\n` +
        `-----------------------------------------\n` +
        `مُرسل تلقائياً من نظام الإدارة والتشغيل المركزي.`
      );
    }
  };

  const handleSendToWhatsApp = () => {
    const targetPhone = waPhone.trim() || activeManager.phone;
    if (!targetPhone) {
      alert(isAr ? 'يرجى إدخال رقم هاتف واتساب أولاً.' : 'Please enter WhatsApp phone number.');
      return;
    }
    if (!waMessage.trim()) {
      alert(isAr ? 'يرجى كتابة نص الرسالة للإرسال.' : 'Please enter message content.');
      return;
    }

    // Map template keys to professional Arabic/English report titles for the PDF header
    const tplTitles: Record<string, string> = {
      custom: isAr ? 'مذكرة تشغيلية وملاحظات حرة' : 'Custom Operational Memo',
      finance: isAr ? 'تقرير الحسابات والإيرادات اليومية' : 'Daily Accounts & Revenue Report',
      attendance: isAr ? 'تقرير حضور وانضباط الكوادر اليوم' : 'Daily Staff Attendance Report',
      login: isAr ? 'رابط الدخول السريع للإدارة العليا' : 'General Manager Quick Login Link'
    };
    const pdfTitle = tplTitles[waTemplateSelected] || (isAr ? 'تقرير إداري معتمد' : 'Official Report');

    // 1. Generate and open the beautiful printable PDF Document first
    pdfPrintService.printManagerWhatsAppReportPDF(pdfTitle, waMessage, currentUser.nameAr || 'كابتن محمود الغندور');

    // 2. Format phone number to international WhatsApp standard
    let cleanPhone = targetPhone.replace(/\D/g, '');
    if (cleanPhone.startsWith('01')) {
      cleanPhone = '2' + cleanPhone; // Egypt country code is +20, starts with 2
    } else if (cleanPhone.startsWith('+')) {
      cleanPhone = cleanPhone.substring(1);
    }

    // 3. Prepare the customized WhatsApp share message instructing the manager to attach the downloaded PDF
    const introText = isAr
      ? `📄 [ملف PDF معتمد ومحمل بنجاح] 📄\n` +
        `📝 تقرير: *${pdfTitle}*\n` +
        `-----------------------------------------\n` +
        `✓ تم توليد ملف الـ PDF وتنزيله تلقائياً للتو على جهازك.\n` +
        `📎 يمكنك سحب الملف وإرساله كـ (Document) في هذه المحادثة لحفظه ومشاركته بواتساب بكل سهولة.\n\n`
      : `📄 [Official PDF Report Generated] 📄\n` +
        `📝 Report: *${pdfTitle}*\n` +
        `-----------------------------------------\n` +
        `✓ The PDF version has been automatically downloaded to your device.\n` +
        `📎 Please drag/attach the downloaded PDF file as a Document to this chat for your records.\n\n`;

    const fullMessage = introText + waMessage;
    const encodedText = encodeURIComponent(fullMessage);
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodedText}`;
    
    // 4. Launch WhatsApp Web/App in a new tab
    window.open(waUrl, '_blank');
    audioAlertService.playSuccess();

    StorageService.logActivity({
      performerId: currentUser.id,
      performerName: currentUser.nameAr,
      performerRole: 'manager',
      category: 'system',
      actionType: 'login',
      titleAr: `تصدير وإرسال رسالة واتساب ذاتية`,
      titleEn: `Sent custom report message to self WhatsApp`,
      detailsAr: `قام المدير العام بتصدير وإرسال رسالة تشغيلية إلى واتساب الخاص به على رقم (${targetPhone}) بصيغة PDF ومستند رسمي معتمد`,
      detailsEn: `Manager sent operational/finance report to self WhatsApp as official PDF document at ${targetPhone}.`
    });

    setDeleteToastMessage(
      isAr 
        ? '✓ تم توليد مستند الـ PDF بنجاح وجاري توجيهك للواتساب لإرساله 📄🚀' 
        : 'PDF report generated. Redirecting to WhatsApp to send...'
    );
    setTimeout(() => setDeleteToastMessage(null), 5000);
  };

  useEffect(() => {
    if (defaultSubView) setMainView(defaultSubView);
  }, [defaultSubView]);

  const refreshAllData = () => {
    setManagers(StorageService.getManagers());
    setCoaches(StorageService.getCoaches());
    setStaff(StorageService.getStaff());
    setAccountants(StorageService.getAccountants());
    setViewers(StorageService.getViewers());
    setMembers(StorageService.getMembers());
    setShifts(StorageService.getShifts());
    setTransactions(StorageService.getTransactions());
    const unreadSec = StorageService.getSecurityAlerts().filter(a => a.status === 'unread').length;
    const unreadNotifs = StorageService.getManagerNotifications().filter(n => n.status === 'unread').length;
    setSecurityAlertsCount(unreadSec + unreadNotifs);
  };

  useEffect(() => {
    refreshAllData();
    const handleSync = () => refreshAllData();
    const handleNotificationArrival = () => {
      audioAlertService.playBeep(784, 0.12);
      refreshAllData();
    };

    window.addEventListener('gym_manager_notification', handleNotificationArrival);
    window.addEventListener('gym_permissions_updated', handleSync);
    window.addEventListener('gym_storage_updated', handleSync);
    window.addEventListener('storage', handleSync);

    return () => {
      window.removeEventListener('gym_manager_notification', handleNotificationArrival);
      window.removeEventListener('gym_permissions_updated', handleSync);
      window.removeEventListener('gym_storage_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const handleOpenPasswordModal = (targetType: 'employee' | 'member', id: string, name: string, phone: string) => {
    if (isViewer) {
      alert(isAr ? 'عذراً، حساب العرض فقط لا يملك صلاحية الاطلاع على كلمات المرور أو تعديلها.' : 'Read-only viewer account cannot view or modify passwords.');
      return;
    }
    setPwdTargetType(targetType);
    setPwdTargetId(id);
    setPwdTargetName(name);
    setPwdTargetPhone(phone);
    setPwdNewValue('');
    setIsPasswordModalOpen(true);
  };

  const handleSaveNewPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pwdNewValue.trim()) return;

    if (pwdTargetType === 'employee') {
      StorageService.updateEmployeePassword(pwdTargetId, pwdNewValue.trim());
    } else {
      StorageService.updateMemberPassword(pwdTargetId, pwdNewValue.trim());
    }

    StorageService.recordAccountMod({
      targetType: pwdTargetType === 'member' ? 'member' : 'staff',
      targetId: pwdTargetId,
      targetName: pwdTargetName,
      fieldName: 'password',
      fieldNameAr: 'كلمة المرور / الرقم السري',
      oldValue: '********',
      newValue: '******** (تعديل المدير العام)',
      changedBy: currentUser.nameAr,
      changedByRole: 'manager',
      reasonAr: `تم تعديل وتعيين كلمة مرور جديدة بواسطة المدير العام للحساب: ${pwdTargetName}`
    });

    audioAlertService.playSuccess();
    setIsPasswordModalOpen(false);
    refreshAllData();
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  const activeManager = managers.find(m => m.id === currentUser.id) || managers[0] || {
    id: currentUser.id,
    role: 'manager',
    nameAr: currentUser.nameAr,
    nameEn: currentUser.nameEn,
    phone: currentUser.phone || '01011223344',
    accessCode: '9999',
    specialty: 'إدارة وتطوير الأندية الرياضية المتقدمة',
    avatarUrl: currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    status: 'active',
    hiredDate: '2023-01-01',
    baseSalary: 18000
  };

  useEffect(() => {
    if (activeManager?.phone && !waPhone) {
      setWaPhone(activeManager.phone);
    }
  }, [activeManager, waPhone]);

  const handleOpenAddEmployee = (role: 'coach' | 'staff' | 'accountant' | 'manager' | 'viewer') => {
    setEditingEmployee(null);
    setEmployeeRole(role);
    setNameAr('');
    setPhone('');
    setAccessCode(Math.floor(1000 + Math.random() * 9000).toString());
    setAttendanceCode(StorageService.generateSuggestedAttendanceCode(role));
    setBaseSalary('');
    
    if (role === 'accountant') {
      setSpecialty(isAr ? 'إدارة الحسابات العامة ومسيرات الرواتب' : 'Finance & Payroll Management');
      setAvatarUrl('https://images.unsplash.com/photo-1556157382-97eda2d62296?w=150');
    } else if (role === 'staff') {
      setSpecialty(isAr ? 'استقبال وخدمة عملاء ومناوبات' : 'Front Desk & Customer Care');
      setAvatarUrl('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150');
    } else if (role === 'manager') {
      setSpecialty(isAr ? 'إدارة العمليات والرقابة العامة' : 'Executive Operations Manager');
      setAvatarUrl('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150');
    } else if (role === 'viewer') {
      setSpecialty(isAr ? 'حساب للعرض والمطالعة فقط بدون صلاحية تعديل' : 'Read-Only Viewer Account');
      setAvatarUrl('https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150');
    } else {
      setSpecialty(isAr ? 'لياقة بدنية وتدريب خاص PT' : 'Fitness & Personal Training');
      setAvatarUrl('https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=150');
    }
    
    setIsEmployeeModalOpen(true);
  };

  const handleOpenEditEmployee = (emp: EmployeeAccount) => {
    setEditingEmployee(emp);
    setEmployeeRole(emp.role);
    setNameAr(emp.nameAr);
    setPhone(emp.phone);
    setAccessCode(emp.accessCode);
    setAttendanceCode(emp.attendanceCode || StorageService.generateSuggestedAttendanceCode(emp.role));
    setSpecialty(emp.specialty || '');
    setBaseSalary(emp.baseSalary ? emp.baseSalary : '');
    setAvatarUrl(emp.avatarUrl || '');
    setIsEmployeeModalOpen(true);
  };

  const handleSaveEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameAr.trim() || !phone.trim() || !accessCode.trim()) return;

    const parsedSalary = baseSalary !== '' ? Number(baseSalary) : undefined;
    const finalAttendanceCode = attendanceCode.trim() || StorageService.generateSuggestedAttendanceCode(employeeRole);

    if (editingEmployee) {
      const updated: EmployeeAccount = {
        ...editingEmployee,
        role: employeeRole,
        nameAr: nameAr.trim(),
        nameEn: nameAr.trim(),
        phone: phone.trim(),
        username: editingEmployee.username || phone.trim(),
        password: accessCode.trim() || editingEmployee.password || accessCode.trim(),
        accessCode: accessCode.trim(),
        attendanceCode: finalAttendanceCode,
        specialty: specialty.trim(),
        baseSalary: parsedSalary,
        avatarUrl: avatarUrl.trim() || editingEmployee.avatarUrl
      };

      if (updated.role === 'manager') {
        StorageService.saveManagerAccount(updated);
        if (onUpdateCurrentUser && updated.id === currentUser.id) {
          onUpdateCurrentUser({
            role: 'manager',
            id: updated.id,
            nameAr: updated.nameAr,
            nameEn: updated.nameEn,
            phone: updated.phone,
            avatarUrl: updated.avatarUrl
          });
        }
      } else if (updated.role === 'coach') {
        StorageService.saveCoachAccount(updated);
      } else if (updated.role === 'accountant') {
        StorageService.saveAccountantAccount(updated);
      } else if (updated.role === 'viewer') {
        StorageService.saveViewerAccount(updated);
      } else {
        StorageService.saveStaffAccount(updated);
      }

      // Record Account Modification Log
      StorageService.recordAccountMod({
        targetType: updated.role === 'coach' ? 'coach' : 'staff',
        targetId: updated.id,
        targetName: updated.nameAr,
        fieldName: 'profile',
        fieldNameAr: 'بيانات الحساب الشخصي والمالي',
        oldValue: `${editingEmployee.nameAr} (${editingEmployee.phone})`,
        newValue: `${updated.nameAr} (${updated.phone})`,
        changedBy: currentUser.nameAr,
        changedByRole: 'manager',
        reasonAr: 'تحديث بيانات الحساب بواسطة المدير العام',
        approvedByManager: true
      });

      StorageService.logActivity({
        performerId: currentUser.id,
        performerName: currentUser.nameAr,
        performerRole: 'manager',
        category: 'account',
        actionType: 'update',
        titleAr: `تعديل بيانات حساب: ${updated.nameAr}`,
        titleEn: `Updated Account: ${updated.nameAr}`,
        detailsAr: `تم تحديث بيانات الحساب (الهاتف: ${updated.phone} - الكود: ${updated.accessCode} - كود الحضور: ${updated.attendanceCode} - الراتب: ${updated.baseSalary || 'غير محدد'})`,
        detailsEn: `Updated account details`,
        targetId: updated.id,
        targetName: updated.nameAr,
        targetType: updated.role === 'coach' ? 'coach' : 'staff'
      });
    } else {
      const newEmp: EmployeeAccount = {
        id: `${employeeRole}-${Date.now()}`,
        role: employeeRole,
        nameAr: nameAr.trim(),
        nameEn: nameAr.trim(),
        phone: phone.trim(),
        username: phone.trim(),
        password: accessCode.trim(),
        accessCode: accessCode.trim(),
        attendanceCode: finalAttendanceCode,
        specialty: specialty.trim(),
        status: 'active',
        hiredDate: StorageService.getLocalTodayString(),
        createdTimestamp: new Date().toISOString(),
        baseSalary: parsedSalary,
        totalTraineesCount: 0,
        avatarUrl: avatarUrl.trim() || undefined
      };

      if (employeeRole === 'manager') StorageService.saveManagerAccount(newEmp);
      else if (employeeRole === 'coach') StorageService.saveCoachAccount(newEmp);
      else if (employeeRole === 'accountant') StorageService.saveAccountantAccount(newEmp);
      else if (employeeRole === 'viewer') StorageService.saveViewerAccount(newEmp);
      else StorageService.saveStaffAccount(newEmp);

      const roleTitles = {
        manager: isAr ? 'مدير عام' : 'Manager',
        accountant: isAr ? 'مسؤول حسابات' : 'Accountant',
        staff: isAr ? 'موظف استقبال' : 'Staff',
        coach: isAr ? 'كابتن ومدرب' : 'Coach',
        viewer: isAr ? 'حساب للعرض فقط' : 'Read-Only Viewer'
      };

      StorageService.logActivity({
        performerId: currentUser.id,
        performerName: currentUser.nameAr,
        performerRole: 'manager',
        category: 'account',
        actionType: 'create',
        titleAr: `إضافة حساب جديد: ${newEmp.nameAr} (${roleTitles[employeeRole]})`,
        titleEn: `Created Account: ${newEmp.nameAr}`,
        detailsAr: `تم إنشاء حساب جديد برتبة (${roleTitles[employeeRole]}) وكود دخول (${newEmp.accessCode}) وراتب أساسي (${newEmp.baseSalary} ج.م)`,
        detailsEn: `Created employee account`,
        targetId: newEmp.id,
        targetName: newEmp.nameAr,
        targetType: employeeRole === 'coach' ? 'coach' : 'staff'
      });
    }

    audioAlertService.playSuccess();
    setIsEmployeeModalOpen(false);
    refreshAllData();
  };

  // ==========================================
  // PERMISSIONS & PRIVILEGES HANDLERS
  // ==========================================
  const handleOpenPermissionsModal = (
    user: { id: string; nameAr: string; role: AppRole; phone: string; customPermissions?: Partial<RolePermissions> },
    targetType: 'employee' | 'member' = 'employee'
  ) => {
    setPermTargetUser(user);
    setPermTargetType(targetType);
    setPermTargetRole((user.role as any) || 'coach');
    
    // Load effective permissions or role defaults
    const effective = StorageService.getEffectiveUserPermissions(user);
    setDraftPermissions({ ...effective });
    setIsPermModalOpen(true);
  };

  const handleSelectPermRole = (role: 'coach' | 'staff' | 'accountant' | 'manager' | 'member') => {
    setPermTargetRole(role);
    if (role === 'coach') {
      handleApplyPermissionPreset('coach');
    } else if (role === 'staff') {
      handleApplyPermissionPreset('reception');
    } else if (role === 'accountant') {
      handleApplyPermissionPreset('finance');
    } else if (role === 'manager') {
      handleApplyPermissionPreset('full');
    } else if (role === 'member') {
      handleApplyPermissionPreset('none');
    }
  };

  const handleToggleDraftPermission = (permKey: keyof RolePermissions) => {
    setDraftPermissions(prev => ({
      ...prev,
      [permKey]: !prev[permKey]
    }));
    audioAlertService.playBeep(700, 0.03);
  };

  const handleApplyPermissionPreset = (preset: 'full' | 'finance' | 'reception' | 'coach' | 'none') => {
    const base: RolePermissions = {
      canManageMembers: false,
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
      canExportPDF: false
    };

    if (preset === 'full') {
      Object.keys(base).forEach(k => {
        base[k as keyof RolePermissions] = true;
      });
    } else if (preset === 'finance') {
      base.canRecordTransactions = true;
      base.canViewPayroll = true;
      base.canManagePayroll = true;
      base.canViewReports = true;
      base.canExportPDF = true;
    } else if (preset === 'reception') {
      base.canManageMembers = true;
      base.canOpenCloseShifts = true;
      base.canRecordTransactions = true;
      base.canManageServices = true;
      base.canFreezeMemberships = true;
    } else if (preset === 'coach') {
      base.canEditWorkouts = true;
      base.canManageMembers = false;
      base.canFreezeMemberships = false;
      base.canManageServices = false;
      base.canExportPDF = true;
    }

    setDraftPermissions(base);
    audioAlertService.playSuccess();
  };

  const handleSavePermissions = (e: React.FormEvent) => {
    e.preventDefault();
    if (!permTargetUser) return;

    StorageService.updateUserCustomPermissions(
      permTargetType,
      permTargetUser.id,
      draftPermissions,
      currentUser.nameAr,
      permTargetRole
    );

    // Record audit log
    const roleLabels: Record<string, string> = {
      coach: 'كابتن ومدرب 🏋️‍♂️',
      staff: 'موظف استقبال 👥',
      accountant: 'مسؤول حسابات 💼',
      manager: 'مدير عام 👑'
    };
    const newRoleTitle = roleLabels[permTargetRole] || permTargetRole;

    StorageService.recordAccountMod({
      targetType: permTargetType === 'member' ? 'member' : 'staff',
      targetId: permTargetUser.id,
      targetName: permTargetUser.nameAr,
      fieldName: 'permissions',
      fieldNameAr: 'صلاحيات ورتبة الحساب الرسمية',
      oldValue: `رتبة (${permTargetUser.role})`,
      newValue: `تعديل للرتبة (${newRoleTitle}) وتثبيت الصلاحيات`,
      changedBy: currentUser.nameAr,
      changedByRole: 'manager',
      reasonAr: `تم تعديل وتثبيت رتبة وصلاحيات المستخدم (${permTargetUser.nameAr}) إلى (${newRoleTitle}) بواسطة المدير العام`,
      approvedByManager: true
    });

    audioAlertService.playSuccess();
    setIsPermModalOpen(false);
    refreshAllData();
  };

  // ==========================================
  // MEMBER MANAGEMENT HANDLERS (إدارة الأعضاء)
  // ==========================================
  const handleOpenAddMember = () => {
    setEditingMember(null);
    setMemberFullName('');
    setMemberPhone('');
    setMemberPin(Math.floor(1000 + Math.random() * 9000).toString());
    setMemberDurationMonths('');
    setMemberPricePaid('');
    setMemberBirthDate('');
    setMemberAddress('');
    setMemberEmail('');
    setMemberAvatarUrl('');
    setIsMemberModalOpen(true);
  };

  const handleOpenEditMember = (mem: GymMember) => {
    setEditingMember(mem);
    setMemberFullName(mem.fullNameAr);
    setMemberPhone(mem.phone);
    setMemberPin(mem.passwordPin || mem.password || '1234');
    setMemberDurationMonths('');
    setMemberPricePaid('');
    setMemberBirthDate(mem.birthDate || '');
    setMemberAddress(mem.address || '');
    setMemberEmail(mem.email || '');
    setMemberAvatarUrl(mem.avatarUrl || '');
    setMemberStartDate(mem.startDate || '');
    setMemberEndDate(mem.endDate || '');
    setIsMemberModalOpen(true);
  };

  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberFullName.trim() || !memberPhone.trim()) return;

    if (editingMember) {
      const newStart = memberStartDate.trim() || editingMember.startDate;
      const newEnd = memberEndDate.trim() || editingMember.endDate;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const end = new Date(newEnd);
      end.setHours(0, 0, 0, 0);
      const diffTime = end.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const newRemDays = diffDays > 0 ? diffDays : 0;
      const newStatus = newRemDays > 0 ? 'active' : 'expired';

      const updated: GymMember = {
        ...editingMember,
        fullNameAr: memberFullName.trim(),
        fullNameEn: memberFullName.trim(),
        phone: memberPhone.trim(),
        passwordPin: memberPin.trim() || editingMember.passwordPin || '1234',
        tier: editingMember.tier,
        birthDate: memberBirthDate.trim(),
        address: memberAddress.trim(),
        email: memberEmail.trim(),
        avatarUrl: memberAvatarUrl.trim(),
        startDate: newStart,
        endDate: newEnd,
        remainingDays: newRemDays,
        status: newStatus
      };

      StorageService.saveMember(updated);

      StorageService.recordAccountMod({
        targetType: 'member',
        targetId: updated.id,
        targetName: updated.fullNameAr,
        fieldName: 'profile',
        fieldNameAr: 'بيانات عضوية المشترك',
        oldValue: `${editingMember.fullNameAr} (${editingMember.phone})`,
        newValue: `${updated.fullNameAr} (${updated.phone})`,
        changedBy: currentUser.nameAr,
        changedByRole: 'manager',
        reasonAr: 'تعديل بيانات العضو بواسطة المدير العام',
        approvedByManager: true
      });
    } else {
      const start = new Date();
      const newMembershipNumber = String(Math.floor(1000 + Math.random() * 9000));
      const newMember: GymMember = {
        id: `mem-${Date.now()}`,
        membershipNumber: newMembershipNumber,
        fullNameAr: memberFullName.trim(),
        fullNameEn: memberFullName.trim(),
        phone: memberPhone.trim(),
        passwordPin: memberPin.trim() || '1234',
        gender: 'male',
        tier: 'standard', // default standard tier
        birthDate: memberBirthDate.trim(),
        address: memberAddress.trim(),
        email: '',
        avatarUrl: memberAvatarUrl.trim(),
        startDate: start.toISOString().split('T')[0],
        endDate: start.toISOString().split('T')[0], // expired by default
        remainingDays: 0,
        status: 'expired',
        attendanceCount: 0,
        currentProgram: {
          id: 'prog-1',
          titleAr: 'البرنامج العام للمشترك',
          titleEn: 'General Fitness Program',
          coachName: 'كابتن الصالة',
          createdAt: start.toISOString().split('T')[0],
          days: []
        },
        history: []
      };

      StorageService.saveMember(newMember);

      StorageService.logActivity({
        performerId: currentUser.id,
        performerName: currentUser.nameAr,
        performerRole: 'manager',
        category: 'membership',
        actionType: 'create',
        titleAr: `تسجيل حساب عضو جديد: ${newMember.fullNameAr} (#${newMember.membershipNumber})`,
        titleEn: `New Member Account: ${newMember.fullNameAr}`,
        detailsAr: `تم تسجيل حساب عضو جديد بواسطة المدير العام، هاتف (${newMember.phone})، تاريخ ميلاد (${newMember.birthDate})، عنوان (${newMember.address})`,
        detailsEn: `Registered member account via GM`,
        targetId: newMember.id,
        targetName: newMember.fullNameAr,
        targetType: 'member'
      });
    }

    audioAlertService.playSuccess();
    setIsMemberModalOpen(false);
    refreshAllData();
  };

  const handleInitiateDeleteAccount = (acc: any) => {
    if (acc.id === currentUser.id) {
      audioAlertService.playDelete();
      setDeleteToastMessage(isAr ? '⚠️ تنبيه: لا يمكنك حذف حساب المدير العام المسجل به حالياً.' : 'Cannot delete logged in manager account.');
      setTimeout(() => setDeleteToastMessage(null), 3500);
      return;
    }

    const roleTitles: Record<AppRole, string> = {
      manager: isAr ? 'المدير العام' : 'Manager',
      accountant: isAr ? 'مسؤول الحسابات' : 'Accountant',
      staff: isAr ? 'موظف الاستقبال' : 'Staff',
      coach: isAr ? 'الكابتن والمدرب' : 'Coach',
      member: isAr ? 'عضو مشترك' : 'Member',
      viewer: isAr ? 'حساب للعرض فقط' : 'Viewer'
    };

    const isMember = acc.accountType === 'member' || acc.tier !== undefined;

    setAccountToDelete({
      id: acc.id,
      name: acc.nameAr || acc.fullNameAr,
      role: (acc.role || 'member') as AppRole,
      roleTitle: roleTitles[(acc.role || 'member') as AppRole] || (isAr ? 'حساب' : 'Account'),
      type: isMember ? 'member' : 'employee',
      identifier: isMember
        ? `${isAr ? 'عضوية' : 'Member'} #${acc.rawMember?.membershipNumber || acc.membershipNumber || '—'} • ${acc.phone}`
        : `${isAr ? 'هاتف' : 'Phone'}: ${acc.phone} • PIN: ••••`,
      avatarUrl: acc.avatarUrl,
      raw: acc.rawMember || acc
    });
    setDeleteReasonText(isAr ? 'حذف الحساب بقرار من الإدارة العامة' : 'Account deletion approved by GM');
  };

  const handleConfirmAccountDeletion = () => {
    if (!accountToDelete) return;

    const reason = deleteReasonText.trim() || (isAr ? 'حذف الحساب بقرار من الإدارة العامة' : 'Account removal by GM');

    if (accountToDelete.type === 'member') {
      StorageService.deleteMemberWithArchive(
        accountToDelete.id,
        currentUser.nameAr,
        'manager',
        reason
      );
    } else {
      const emp = accountToDelete.raw as EmployeeAccount;
      StorageService.recordDeletion({
        originalId: accountToDelete.id,
        itemType: accountToDelete.role === 'coach' ? 'coach' : 'staff',
        titleAr: `حساب ${accountToDelete.roleTitle}: ${accountToDelete.name}`,
        titleEn: `Account (${accountToDelete.role}): ${emp.nameEn || accountToDelete.name}`,
        identifier: accountToDelete.identifier,
        deletedBy: currentUser.nameAr,
        deletedByRole: 'manager',
        reason,
        snapshotData: emp,
        canRestore: true
      });

      StorageService.deleteEmployeeAccount(accountToDelete.id);
    }

    StorageService.logActivity({
      performerId: currentUser.id,
      performerName: currentUser.nameAr,
      performerRole: 'manager',
      category: 'account',
      actionType: 'delete',
      titleAr: `حذف حساب (${accountToDelete.name}) بنجاح ونقله لسلة المحذوفات`,
      titleEn: `Deleted account for ${accountToDelete.name} to recycle bin`,
      detailsAr: `سبب الحذف: ${reason}`,
      detailsEn: `Deletion reason: ${reason}`,
      targetId: accountToDelete.id,
      targetName: accountToDelete.name,
      targetType: accountToDelete.type === 'member' ? 'member' : 'staff'
    });

    audioAlertService.playDelete();
    const deletedName = accountToDelete.name;
    setAccountToDelete(null);
    refreshAllData();

    setDeleteToastMessage(isAr ? `✓ تم حذف حساب "${deletedName}" بنجاح ونقله إلى سلة المحذوفات` : `Account "${deletedName}" deleted successfully`);
    setTimeout(() => setDeleteToastMessage(null), 4000);
  };

  const handleOpenMemberDetail = (member: GymMember) => {
    setSelectedMemberDetail(member);
    setIsMemberDetailModalOpen(true);
  };

  const handleExtendSubscription = (memberId: string, days: number, label: string) => {
    StorageService.extendMemberSubscription(memberId, days);
    
    StorageService.logActivity({
      performerId: currentUser.id,
      performerName: currentUser.nameAr,
      performerRole: 'manager',
      category: 'membership',
      actionType: 'update',
      titleAr: `تمديد/تجميد اشتراك: ${selectedMemberDetail?.fullNameAr}`,
      titleEn: `Extended membership for ${selectedMemberDetail?.fullNameEn}`,
      detailsAr: `قام المدير العام بمد تاريخ انتهاء الاشتراك لمدة (${days}) أيام (${label})`,
      detailsEn: `GM extended membership by ${days} days (${label})`,
      targetType: 'member'
    });

    // LOG SENSITIVE EXTENSION
    StorageService.recordSensitiveMod({
      category: 'manual_subscription',
      titleAr: `تعديل صلاحية اشتراك: ${selectedMemberDetail?.fullNameAr}`,
      titleEn: `Manual subscription adjustment: ${selectedMemberDetail?.fullNameEn}`,
      detailsAr: `تم تمديد/تجميد الاشتراك يدوياً لمدة (${days}) أيام. الهدف: ${selectedMemberDetail?.fullNameAr}`,
      detailsEn: `Manually extended/frozen subscription by ${days} days for ${selectedMemberDetail?.fullNameEn}`,
      performerId: currentUser.id,
      performerName: currentUser.nameAr,
      performerRole: currentUser.role,
      targetId: memberId,
      targetName: selectedMemberDetail?.fullNameAr || '',
      oldValue: selectedMemberDetail?.endDate || '',
      newValue: `+${days} days`,
      reason: label || 'تعديل يدوي لصلاحية العضوية'
    });

    audioAlertService.playSuccess();
    refreshAllData();
    const updatedMembers = StorageService.getMembers();
    const updated = updatedMembers.find(m => m.id === memberId);
    if (updated) {
      setSelectedMemberDetail(updated);
    }
  };

  const handleToggleAccountStatus = (targetType: 'employee' | 'member', targetId: string, name: string) => {
    const newStatus = StorageService.toggleAccountStatus(targetType, targetId);
    audioAlertService.playSuccess();

    StorageService.logActivity({
      performerId: currentUser.id,
      performerName: currentUser.nameAr,
      performerRole: 'manager',
      category: 'account',
      actionType: 'update',
      titleAr: `تغيير حالة حساب (${name}) إلى (${newStatus === 'active' ? 'نشط' : 'معطل/مجمد'})`,
      titleEn: `Changed account status for ${name} to ${newStatus}`,
      detailsAr: `قام المدير العام بتغيير حالة الحساب`,
      detailsEn: `GM changed account status`,
      targetId,
      targetName: name,
      targetType: targetType === 'member' ? 'member' : 'staff'
    });

    refreshAllData();
  };

  const handleInitiateDeleteShift = (shift: CashShift) => {
    if (isViewer) return;
    setShiftToDelete(shift);
    setShiftDeleteReason(isAr ? 'حذف المناوبة بقرار المدير العام' : 'Shift deletion approved by GM');
  };

  const handleConfirmShiftDeletion = () => {
    if (!shiftToDelete || isViewer) return;

    const success = StorageService.deleteShift(shiftToDelete.id, currentUser.nameAr);
    if (success) {
      audioAlertService.playDelete();
      setDeleteToastMessage(
        isAr 
          ? `✅ تم حذف سجل المناوبة للموظف (${shiftToDelete.staffName}) بنجاح وتحديث كافة التقارير والخزينة.`
          : `Shift record for ${shiftToDelete.staffName} deleted successfully.`
      );
      setTimeout(() => setDeleteToastMessage(null), 4000);

      if (selectedShiftForInspect?.id === shiftToDelete.id) {
        setSelectedShiftForInspect(null);
      }
      setShiftToDelete(null);
      refreshAllData();
    }
  };

  const handleDeleteShift = handleInitiateDeleteShift;

  const handleCloseShiftByManager = (shift: CashShift) => {
    if (isViewer) return;
    setShiftVoucherToCloseByManager(shift);
    setCloseShiftAmountByManager(String(shift.expectedCash || shift.startingCash || 0));
  };

  const confirmCloseShiftByManager = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shiftToCloseByManager) return;
    
    const actualNum = Number(closeShiftAmountByManager) || 0;
    StorageService.closeShift(shiftToCloseByManager.id, currentUser.id, `${currentUser.nameAr} (المدير العام)`, actualNum);
    audioAlertService.playSuccess();
    
    setToastMessage(isAr ? `✓ تم إغلاق وردية الموظف (${shiftToCloseByManager.staffName}) يدوياً بنجاح` : 'Shift closed manually by Manager');
    setTimeout(() => setToastMessage(null), 5000);
    
    setShiftVoucherToCloseByManager(null);
    setCloseShiftAmountByManager('');
    refreshAllData();
  };

  const handleDeleteTransactionInShift = (tx: FinancialTransaction) => {
    if (isViewer) return;
    setShiftVoucherToDelete(tx);
  };

  const handleConfirmDeleteShiftVoucher = (tx: FinancialTransaction, reason: string) => {
    const success = StorageService.deleteTransaction(tx.id, currentUser.nameAr, 'manager', reason);
    if (success) {
      audioAlertService.playDelete();
      refreshAllData();
      if (selectedShiftForInspect) {
        const updatedShift = StorageService.getShifts().find(s => s.id === selectedShiftForInspect.id);
        if (updatedShift) setSelectedShiftForInspect(updatedShift);
      }
    }
  };

  // Financial summary numbers
  const totalRevenue = transactions.filter(t => t.type !== 'expense').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  const activeMembersCount = members.filter(m => m.status === 'active').length;

  const renderAccountsView = () => {
    interface SystemAccountItem {
      id: string;
      role: AppRole;
          nameAr: string;
          nameEn: string;
          phone: string;
          accessCode: string;
          specialty?: string;
          avatarUrl?: string;
          status: 'active' | 'suspended';
          hiredDate?: string;
          createdTimestamp?: string;
          customPermissions?: Partial<RolePermissions>;
          accountType: 'employee' | 'member';
          rawMember?: GymMember;
          baseSalary?: number;
          username?: string;
        }

        const rawAccounts: SystemAccountItem[] = [
          ...managers.map(m => ({ ...m, createdTimestamp: m.createdTimestamp || m.hiredDate, accountType: 'employee' as const })),
          ...accountants.map(a => ({ ...a, createdTimestamp: a.createdTimestamp || a.hiredDate, accountType: 'employee' as const })),
          ...staff.map(s => ({ ...s, createdTimestamp: s.createdTimestamp || s.hiredDate, accountType: 'employee' as const })),
          ...coaches.map(c => ({ ...c, createdTimestamp: c.createdTimestamp || c.hiredDate, accountType: 'employee' as const })),
          ...viewers.map(v => ({ ...v, createdTimestamp: v.createdTimestamp || v.hiredDate, accountType: 'employee' as const }))
        ];

        // Strictly guarantee unique accounts without duplicate keys
        const seenAccountKeys = new Set<string>();
        const allAccounts = rawAccounts.filter(acc => {
          const uKey = `${acc.accountType}-${acc.role}-${acc.id}`;
          if (seenAccountKeys.has(uKey) || seenAccountKeys.has(acc.id)) return false;
          seenAccountKeys.add(uKey);
          seenAccountKeys.add(acc.id);
          return true;
        });

        // Semantic status helper function
        const getAccountStatusInfo = (acc: typeof allAccounts[0]) => {
          if (acc.accountType === 'member' && acc.rawMember) {
            const mem = acc.rawMember;
            if (mem.status === 'frozen' || acc.status === 'suspended') {
              return {
                statusKey: 'suspended' as const,
                labelAr: 'مجمد / معطل',
                labelEn: 'Frozen / Suspended',
                badgeClass: 'bg-slate-800 text-slate-300 border-slate-700/80',
                icon: Snowflake,
                iconColor: 'text-sky-300',
                dotColor: 'bg-slate-400',
                remainingText: isAr ? 'عضوية مجمدة' : 'Frozen'
              };
            }
            if (mem.remainingDays <= 0 || mem.status === 'expired') {
              return {
                statusKey: 'expired' as const,
                labelAr: 'منتهي الصلاحية',
                labelEn: 'Expired',
                badgeClass: 'bg-rose-500/15 text-rose-300 border-rose-500/40',
                icon: AlertCircle,
                iconColor: 'text-rose-400',
                dotColor: 'bg-rose-500',
                remainingText: isAr ? 'انتهى الاشتراك' : 'Expired'
              };
            }
            if (mem.remainingDays <= 7) {
              return {
                statusKey: 'expiring' as const,
                labelAr: `ينتهي قريباً (${mem.remainingDays} يوم)`,
                labelEn: `Expiring Soon (${mem.remainingDays}d)`,
                badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
                icon: AlertTriangle,
                iconColor: 'text-amber-400 animate-pulse',
                dotColor: 'bg-amber-400 animate-ping',
                remainingText: `${mem.remainingDays} ${isAr ? 'يوم متبقي' : 'days left'}`
              };
            }
            return {
              statusKey: 'active' as const,
              labelAr: `نشط (${mem.remainingDays} يوم متبقي)`,
              labelEn: `Active (${mem.remainingDays}d)`,
              badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
              icon: CheckCircle2,
              iconColor: 'text-emerald-400',
              dotColor: 'bg-emerald-400 animate-pulse',
              remainingText: `${mem.remainingDays} ${isAr ? 'يوم متبقي' : 'days left'}`
            };
          } else {
            // Employee Accounts
            if (acc.status === 'suspended') {
              return {
                statusKey: 'suspended' as const,
                labelAr: 'حساب معطل',
                labelEn: 'Suspended Staff',
                badgeClass: 'bg-rose-500/15 text-rose-300 border-rose-500/40',
                icon: Power,
                iconColor: 'text-rose-400',
                dotColor: 'bg-rose-500',
                remainingText: isAr ? 'معطل ومحجوب' : 'Suspended'
              };
            }
            return {
              statusKey: 'active' as const,
              labelAr: 'حساب نشط ومفعل',
              labelEn: 'Active Employee',
              badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
              icon: ShieldCheck,
              iconColor: 'text-emerald-400',
              dotColor: 'bg-emerald-400 animate-pulse',
              remainingText: isAr ? 'صلاحية سارية' : 'Active'
            };
          }
        };

        // Filter accounts
        const todayStr = new Date().toISOString().slice(0, 10);
        const thisMonthStr = todayStr.slice(0, 7);

        const filteredAccounts = allAccounts.filter(acc => {
          // Role filter
          if (accountsFilterRole !== 'all' && acc.role !== accountsFilterRole) {
            return false;
          }

          const statusInfo = getAccountStatusInfo(acc);

          // Status filter
          if (accountsStatusFilter !== 'all' && statusInfo.statusKey !== accountsStatusFilter) {
            return false;
          }

          // Date filter
          const accDate = (acc.createdTimestamp ? acc.createdTimestamp.slice(0, 10) : (acc.hiredDate || (acc.accountType === 'member' ? acc.rawMember?.startDate : ''))) || '';
          if (accountsDateFilter === 'today') {
            if (accDate !== todayStr) return false;
          } else if (accountsDateFilter === 'this_month') {
            if (!accDate.startsWith(thisMonthStr)) return false;
          } else if (accountsDateFilter === 'custom') {
            if (accountsDateStart && accDate < accountsDateStart) return false;
            if (accountsDateEnd && accDate > accountsDateEnd) return false;
          }

          // Search filter
          if (accountsSearchQuery.trim()) {
            const q = accountsSearchQuery.trim().toLowerCase();
            const matchName = acc.nameAr.toLowerCase().includes(q) || (acc.nameEn && acc.nameEn.toLowerCase().includes(q));
            const matchPhone = acc.phone.includes(q);
            const matchSpecialty = acc.specialty && acc.specialty.toLowerCase().includes(q);
            const matchMemberNo = acc.accountType === 'member' && acc.rawMember?.membershipNumber && acc.rawMember.membershipNumber.toLowerCase().includes(q);
            const matchNationalId = acc.accountType === 'member' && acc.rawMember?.nationalId && acc.rawMember.nationalId.includes(q);
            return matchName || matchPhone || matchSpecialty || matchMemberNo || matchNationalId;
          }
          return true;
        });

        // Quick aggregate statistics for status summary pills
        const summaryStats = {
          total: allAccounts.length,
          active: allAccounts.filter(a => getAccountStatusInfo(a).statusKey === 'active').length,
          expiring: allAccounts.filter(a => getAccountStatusInfo(a).statusKey === 'expiring').length,
          expired: allAccounts.filter(a => getAccountStatusInfo(a).statusKey === 'expired').length,
          suspended: allAccounts.filter(a => getAccountStatusInfo(a).statusKey === 'suspended').length,
          staffTeam: allAccounts.filter(a => a.accountType === 'employee').length,
          membersCount: allAccounts.filter(a => a.accountType === 'member').length
        };

        const counts = {
          all: allAccounts.length,
          manager: managers.length,
          accountant: accountants.length,
          staff: staff.length,
          coach: coaches.length,
          viewer: viewers.length,
          member: members.length
        };

        const roleConfig: Record<AppRole, { titleAr: string; titleEn: string; color: string; bg: string; border: string; icon: any }> = {
          manager: { titleAr: 'مدير عام', titleEn: 'General Manager', color: 'text-amber-400', bg: 'bg-amber-500/15', border: 'border-amber-500/40', icon: Crown },
          accountant: { titleAr: 'مسؤول حسابات', titleEn: 'Accountant', color: 'text-emerald-400', bg: 'bg-emerald-500/15', border: 'border-emerald-500/40', icon: Wallet },
          staff: { titleAr: 'موظف استقبال', titleEn: 'Receptionist', color: 'text-sky-400', bg: 'bg-sky-500/15', border: 'border-sky-500/40', icon: Users },
          coach: { titleAr: 'كابتن ومدرب', titleEn: 'Coach / Trainer', color: 'text-orange-400', bg: 'bg-orange-500/15', border: 'border-orange-500/40', icon: Dumbbell },
          member: { titleAr: 'عضو مشترك', titleEn: 'Gym Member', color: 'text-purple-400', bg: 'bg-purple-500/15', border: 'border-purple-500/40', icon: User },
          viewer: { titleAr: 'حساب للعرض فقط', titleEn: 'Read-Only Viewer', color: 'text-slate-300', bg: 'bg-slate-800/80', border: 'border-slate-700/60', icon: Eye }
        };

        return (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* 1. GENERAL MANAGER PROFILE SPOTLIGHT CARD (بيانات المدير العام) */}
            <div className="bg-gradient-to-r from-amber-950/40 via-[#101626] to-slate-950 rounded-3xl p-6 border-2 border-amber-500/50 shadow-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={activeManager.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                    alt={activeManager.nameAr}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-500 shadow-lg"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black flex items-center gap-1">
                        <Crown className="w-3 h-3" />
                        <span>{isAr ? 'حساب المدير العام الأساسي' : 'General Manager Account'}</span>
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                        {isAr ? 'صلاحيات كاملة مطلقة' : 'Full Admin Privileges'}
                      </span>
                    </div>
                    <h3 className="text-lg font-black text-white mt-1">{activeManager.nameAr}</h3>
                    <p className="text-xs text-amber-400 font-semibold">{activeManager.specialty}</p>
                  </div>
                </div>

                {/* Edit Manager Profile Button & Permissions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenPermissionsModal(activeManager, 'employee')}
                    className="px-3.5 py-2.5 rounded-xl bg-purple-600/30 hover:bg-purple-600 text-purple-200 border border-purple-500/40 font-bold text-xs flex items-center gap-1.5 transition-all shadow"
                    title={isAr ? 'استعراض صلاحيات المدير' : 'View Permissions'}
                  >
                    <ShieldCheck className="w-4 h-4 text-purple-400" />
                    <span>{isAr ? 'صلاحيات المدير' : 'Permissions'}</span>
                  </button>

                </div>
              </div>

              {/* Manager Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800/80 text-xs">
                <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-sky-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block">{isAr ? 'رقم الهاتف' : 'Phone'}</span>
                    <strong className="text-slate-200 font-mono text-xs">{activeManager.phone}</strong>
                  </div>
                </div>

                <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <KeyRound className="w-4 h-4 text-amber-400 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-400 block">{isAr ? 'كود الدخول السري (PIN)' : 'Access PIN'}</span>
                      <strong className="text-amber-400 font-mono font-black text-xs tracking-widest">
                        {!isViewer && showManagerPin ? activeManager.accessCode : '••••'}
                      </strong>
                    </div>
                  </div>
                  {!isViewer ? (
                    <button
                      type="button"
                      onClick={() => setShowManagerPin(!showManagerPin)}
                      className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
                      title={showManagerPin ? (isAr ? 'إخفاء الكود' : 'Hide') : (isAr ? 'إظهار الكود' : 'Show')}
                    >
                      {showManagerPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  ) : (
                    <span className="text-[9px] text-slate-500 font-bold px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
                      {isAr ? 'محجوب' : 'Protected'}
                    </span>
                  )}
                </div>

                <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 flex items-center gap-2.5">
                  <Wallet className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block">{isAr ? 'الراتب الأساسي' : 'Base Salary'}</span>
                    <strong className="text-emerald-400 font-bold text-xs">{activeManager.baseSalary?.toLocaleString() || 18000} ج.م</strong>
                  </div>
                </div>

                <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-purple-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block">{isAr ? 'تاريخ التعيين' : 'Hired Date'}</span>
                    <strong className="text-slate-200 font-mono text-xs">{activeManager.hiredDate || '2023-01-01'}</strong>
                  </div>
                </div>
              </div>

              {/* WhatsApp Quick Self-Send Widget */}
              <div className="border-t border-slate-800/60 pt-4 mt-2 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-black text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>{isAr ? '💬 مساعد الإرسال السريع لواتساب الخاص بك (تصدير التقارير، الرابط السريع، والمذكرات):' : 'Self-Send WhatsApp Assistant:'}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Target WhatsApp Phone Number */}
                  <div className="space-y-1">
                    <label className="block text-slate-400 text-[10px] font-bold">{isAr ? 'رقم هاتف واتساب الخاص بك' : 'Your WhatsApp Number'}</label>
                    <input
                      type="tel"
                      value={waPhone}
                      onChange={(e) => setWaPhone(e.target.value)}
                      placeholder="01011112222"
                      className="w-full bg-slate-950/90 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono font-bold focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Template selector */}
                  <div className="space-y-1 md:col-span-2">
                    <label className="block text-slate-400 text-[10px] font-bold">{isAr ? '⚡ اختر تقرير أو كشف جاهز للإعداد السريع' : '⚡ Quick Reports'}</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      {[
                        { id: 'custom', labelAr: '✍️ مذكرات حرة' },
                        { id: 'finance', labelAr: '💰 كشف الحسابات' },
                        { id: 'attendance', labelAr: '👥 حضور اليوم' },
                        { id: 'login', labelAr: '🔗 رابط دخول' }
                      ].map(tpl => (
                        <button
                          key={tpl.id}
                          type="button"
                          onClick={() => handleSelectWaTemplate(tpl.id)}
                          className={`py-1.5 px-2 rounded-xl text-[10.5px] font-bold transition-all cursor-pointer border text-center ${
                            waTemplateSelected === tpl.id
                              ? 'bg-emerald-500 text-slate-950 font-black border-emerald-400 shadow shadow-emerald-500/10'
                              : 'bg-[#050810] text-slate-300 hover:text-white border-slate-850'
                          }`}
                        >
                          {tpl.labelAr}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Message Content Textarea with Send Button overlay */}
                <div className="relative">
                  <textarea
                    rows={4}
                    value={waMessage}
                    onChange={(e) => {
                      setWaCustomMessage(e.target.value);
                      setWaTemplateSelected('custom');
                    }}
                    placeholder={isAr ? 'اكتب هنا أي ملاحظة، أو فكرة، أو اختر كشفاً جاهزاً من الأعلى للإرسال الفوري لـ واتساب الخاص بك...' : 'Write custom text or choose template...'}
                    className="w-full bg-slate-950/90 border border-slate-800 focus:border-emerald-500/80 rounded-2xl p-3 pr-3 pb-12 text-xs text-slate-200 placeholder-slate-500 focus:outline-none font-semibold leading-relaxed"
                  />

                  {/* Send Button inside Textarea container */}
                  <div className="absolute bottom-3 left-3 rtl:left-3 ltr:right-3">
                    <button
                      type="button"
                      onClick={handleSendToWhatsApp}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-950 font-black text-xs transition-all shadow-lg shadow-emerald-500/20 cursor-pointer flex items-center gap-1.5 active:scale-95"
                    >
                      <span>{isAr ? 'إرسال لواتساب الخاص بي 🚀' : 'Send to WA'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Connected/Online Users Session Monitor Widget */}
            <div className="bg-[#0b101a] rounded-3xl p-6 border border-slate-800/90 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <span className="absolute top-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#0b101a] animate-ping"></span>
                    <span className="absolute top-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#0b101a]"></span>
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
                      <Users className="w-5 h-5" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white flex items-center gap-2">
                      <span>{isAr ? 'الأشخاص المتصلين حالياً بالنظام' : 'Live Connected Users'}</span>
                      <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {onlineUsers.length} {isAr ? 'نشط' : 'active'}
                      </span>
                    </h3>
                    <p className="text-[10.5px] text-slate-400 mt-0.5">
                      {isAr ? 'مراقبة فورية للجلسات النشطة للموظفين والكباتن والإدارة داخل نظام GYM-M22.' : 'Real-time session monitoring of all logged-in staff and coaches.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Grid of online users */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {onlineUsers.map(user => {
                  const roleColors: Record<string, string> = {
                    manager: 'from-amber-500/10 to-amber-600/5 text-amber-300 border-amber-500/20',
                    accountant: 'from-emerald-500/10 to-emerald-600/5 text-emerald-300 border-emerald-500/20',
                    staff: 'from-sky-500/10 to-sky-600/5 text-sky-300 border-sky-500/20',
                    coach: 'from-orange-500/10 to-orange-600/5 text-orange-300 border-orange-500/20',
                    viewer: 'from-slate-700/10 to-slate-800/5 text-slate-300 border-slate-700/20'
                  };

                  return (
                    <div 
                      key={user.id} 
                      className={`p-3 rounded-2xl bg-gradient-to-br ${roleColors[user.role] || 'from-slate-800/20 to-slate-900/5 text-slate-300 border-slate-800'} border flex items-center justify-between gap-3 shadow transition-all hover:scale-[1.01] hover:border-slate-700`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative shrink-0">
                          <img
                            src={user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                            alt={user.nameAr}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-700 shadow"
                          />
                          <span className={`absolute -bottom-1 -left-1 w-3 h-3 rounded-full border-2 border-[#0b101a] ${
                            user.status === 'online' ? 'bg-emerald-500' : user.status === 'away' ? 'bg-amber-500 animate-pulse' : 'bg-slate-500'
                          }`}></span>
                        </div>
                        
                        <div className="text-right rtl:text-right">
                          <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-slate-950/60 font-bold uppercase block w-fit mb-0.5">
                            {user.roleTitleAr}
                          </span>
                          <strong className="text-xs font-black text-white block">{user.nameAr}</strong>
                          <span className="text-[9.5px] text-slate-400 font-medium block mt-0.5 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 inline-block"></span>
                            <span>{user.lastActive}</span>
                          </span>
                        </div>
                      </div>

                      <div className="text-left rtl:text-left flex flex-col items-end shrink-0">
                        <span className="text-[9px] px-2 py-0.5 rounded-lg bg-slate-950 text-slate-400 border border-slate-850 font-mono block">
                          💻 {user.device}
                        </span>
                        
                        <button
                          type="button"
                          onClick={() => {
                            audioAlertService.playBeep(800, 0.05);
                            alert(isAr ? `✓ تم إرسال إشارة تنبيه وتحديث للجلسة بنجاح للمستخدم: ${user.nameAr}` : `Pinged user ${user.nameAr}`);
                          }}
                          className="mt-1.5 px-2 py-1 rounded-lg bg-slate-950/80 hover:bg-slate-900 text-[9px] font-black text-amber-400 border border-slate-800 hover:border-amber-500/30 transition-all cursor-pointer"
                        >
                          ⚡ {isAr ? 'نكز الجلسة' : 'Ping session'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. MAIN ACCOUNTS & PERMISSIONS MANAGEMENT CONTROL CENTER */}
            <div className="bg-[#0c101a] rounded-3xl p-6 border border-slate-800 shadow-2xl space-y-5">
              {/* Top Header & Quick Action Buttons */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-purple-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold shadow-lg">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base sm:text-lg font-black text-white">
                        {isAr ? 'مركز إدارة الحسابات، الإتاحات والصلاحيات' : 'Accounts, Permissions & Access Center'}
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold font-mono">
                        {allAccounts.length} {isAr ? 'حساب مسجل' : 'accounts'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {isAr ? 'قائمة مستقلة مخصصة لكادر العمل والموظفين (المدراء، الحسابات، الاستقبال، والكباتن). يمكنك التحكم بالصلاحيات وإدارة كلمات المرور.' : 'Dedicated list for staff and employee accounts (Managers, Accountants, Receptionists, Coaches). Manage permissions and access.'}
                    </p>
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleOpenAddEmployee('accountant')}
                    className="px-3 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500 hover:text-slate-950 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 transition-all shadow cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>{isAr ? '+ حساب محاسب' : '+ Add Accountant'}</span>
                  </button>

                  <button
                    onClick={() => handleOpenAddEmployee('staff')}
                    className="px-3 py-2 rounded-xl bg-sky-500/20 hover:bg-sky-500 hover:text-slate-950 text-sky-300 border border-sky-500/30 text-xs font-bold flex items-center gap-1.5 transition-all shadow cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>{isAr ? '+ حساب استقبال' : '+ Add Staff'}</span>
                  </button>

                  <button
                    onClick={() => handleOpenAddEmployee('coach')}
                    className="px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500 hover:text-slate-950 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 transition-all shadow cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>{isAr ? '+ حساب كابتن' : '+ Add Coach'}</span>
                  </button>

                  <button
                    onClick={() => handleOpenAddEmployee('viewer')}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 text-xs font-bold flex items-center gap-1.5 transition-all shadow cursor-pointer"
                  >
                    <Eye className="w-4 h-4 text-amber-400" />
                    <span>{isAr ? '+ للعرض فقط' : '+ Read-Only'}</span>
                  </button>

                  <button
                    onClick={handleOpenAddMember}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg shadow-purple-600/20 cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>{isAr ? '+ إضافة مشترك' : '+ Add Member'}</span>
                  </button>

                  <button
                    onClick={() => setMainView('permissions')}
                    className="px-3 py-2 rounded-xl bg-purple-950/40 hover:bg-purple-900/60 text-purple-300 border border-purple-800/60 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                    title={isAr ? 'فتح مصفوفة الصلاحيات العامة' : 'Open Permissions Matrix'}
                  >
                    <ShieldCheck className="w-4 h-4 text-purple-400" />
                    <span>{isAr ? 'مصفوفة الصلاحيات' : 'Permissions Matrix'}</span>
                  </button>

                  <button
                    onClick={() => setIsCharterModalOpen(true)}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-sky-400 hover:from-sky-400 hover:to-sky-300 text-slate-950 text-xs font-black flex items-center gap-1.5 transition-all shadow-lg shadow-sky-500/20 cursor-pointer active:scale-98"
                    title={isAr ? 'عرض وطباعة اللائحة العامة للمهام واللوائح الداخلية بدون أسماء (PDF)' : 'Print General Duties Charter'}
                  >
                    <ScrollText className="w-4 h-4" />
                    <span>{isAr ? '📜 لائحة المهام (PDF)' : 'Charter (PDF)'}</span>
                  </button>
                </div>
              </div>

              {/* Quick Status Stats Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setAccountsStatusFilter('all');
                    setAccountsFilterRole('all');
                  }}
                  className={`p-3 rounded-2xl border text-right transition-all cursor-pointer flex items-center justify-between ${
                    accountsStatusFilter === 'all' && accountsFilterRole === 'all'
                      ? 'bg-amber-500/20 border-amber-500/50 shadow-md ring-1 ring-amber-500/30'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">{isAr ? 'إجمالي الحسابات' : 'Total Accounts'}</span>
                    <strong className="text-base font-mono font-black text-white">{summaryStats.total}</strong>
                  </div>
                  <Users className="w-5 h-5 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => setAccountsStatusFilter('active')}
                  className={`p-3 rounded-2xl border text-right transition-all cursor-pointer flex items-center justify-between ${
                    accountsStatusFilter === 'active'
                      ? 'bg-emerald-500/20 border-emerald-500/60 shadow-md ring-1 ring-emerald-500/40'
                      : 'bg-slate-950/60 border-slate-800 hover:border-emerald-500/30'
                  }`}
                >
                  <div>
                    <span className="text-[10px] text-emerald-400 font-bold block">{isAr ? '🟢 نشط ومفعل' : 'Active'}</span>
                    <strong className="text-base font-mono font-black text-emerald-300">{summaryStats.active}</strong>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                </button>

                <button
                  type="button"
                  onClick={() => setAccountsStatusFilter('expiring')}
                  className={`p-3 rounded-2xl border text-right transition-all cursor-pointer flex items-center justify-between ${
                    accountsStatusFilter === 'expiring'
                      ? 'bg-amber-500/20 border-amber-500/60 shadow-md ring-1 ring-amber-500/40'
                      : 'bg-slate-950/60 border-slate-800 hover:border-amber-500/30'
                  }`}
                >
                  <div>
                    <span className="text-[10px] text-amber-400 font-bold block">{isAr ? '🟡 قارب على الانتهاء' : 'Expiring Soon'}</span>
                    <strong className="text-base font-mono font-black text-amber-300">{summaryStats.expiring}</strong>
                  </div>
                  <AlertTriangle className="w-5 h-5 text-amber-400 animate-pulse" />
                </button>

                <button
                  type="button"
                  onClick={() => setAccountsStatusFilter('expired')}
                  className={`p-3 rounded-2xl border text-right transition-all cursor-pointer flex items-center justify-between ${
                    accountsStatusFilter === 'expired'
                      ? 'bg-rose-500/20 border-rose-500/60 shadow-md ring-1 ring-rose-500/40'
                      : 'bg-slate-950/60 border-slate-800 hover:border-rose-500/30'
                  }`}
                >
                  <div>
                    <span className="text-[10px] text-rose-400 font-bold block">{isAr ? '🔴 منتهي الصلاحية' : 'Expired'}</span>
                    <strong className="text-base font-mono font-black text-rose-300">{summaryStats.expired}</strong>
                  </div>
                  <AlertCircle className="w-5 h-5 text-rose-400" />
                </button>

                <button
                  type="button"
                  onClick={() => setAccountsStatusFilter('suspended')}
                  className={`p-3 rounded-2xl border text-right transition-all cursor-pointer flex items-center justify-between ${
                    accountsStatusFilter === 'suspended'
                      ? 'bg-sky-500/20 border-sky-500/60 shadow-md ring-1 ring-sky-500/40'
                      : 'bg-slate-950/60 border-slate-800 hover:border-sky-500/30'
                  }`}
                >
                  <div>
                    <span className="text-[10px] text-sky-400 font-bold block">{isAr ? '❄️ معطل / مجمد' : 'Suspended'}</span>
                    <strong className="text-base font-mono font-black text-sky-300">{summaryStats.suspended}</strong>
                  </div>
                  <Snowflake className="w-5 h-5 text-sky-400" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAccountsFilterRole('staff');
                    setAccountsStatusFilter('all');
                  }}
                  className={`p-3 rounded-2xl border text-right transition-all cursor-pointer flex items-center justify-between ${
                    accountsFilterRole === 'staff'
                      ? 'bg-purple-500/20 border-purple-500/60 shadow-md ring-1 ring-purple-500/40'
                      : 'bg-slate-950/60 border-slate-800 hover:border-purple-500/30'
                  }`}
                >
                  <div>
                    <span className="text-[10px] text-purple-400 font-bold block">{isAr ? '👔 طاقم العمل' : 'Staff Team'}</span>
                    <strong className="text-base font-mono font-black text-purple-300">{summaryStats.staffTeam}</strong>
                  </div>
                  <Briefcase className="w-5 h-5 text-purple-400" />
                </button>
              </div>

              {/* Control Toolbar: Search, Date Filter, Status Filter & View Toggle */}
              <div className="bg-[#080b12] p-4 rounded-2xl border border-slate-800/90 space-y-3.5">
                <div className="flex flex-col lg:flex-row gap-3 items-center justify-between">
                  {/* Left / Top Filters: Search Bar & Date Filter */}
                  <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto flex-1">
                    {/* Search Bar */}
                    <div className="relative flex-1 min-w-[240px] max-w-md">
                      <Search className="w-4 h-4 text-slate-400 absolute right-3 rtl:right-3 ltr:left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={accountsSearchQuery}
                        onChange={(e) => setAccountsSearchQuery(e.target.value)}
                        placeholder={isAr ? 'بحث بالاسم، الهاتف، رقم العضوية، أو التخصص...' : 'Search by name, phone, member #, or specialty...'}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-9 pl-8 rtl:pr-9 rtl:pl-8 ltr:pl-9 ltr:pr-8 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 shadow-inner"
                      />
                      {accountsSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setAccountsSearchQuery('')}
                          className="absolute left-2.5 rtl:left-2.5 ltr:right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Date Filter Quick Selector */}
                    <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800 text-xs">
                      <CalendarRange className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <select
                        value={accountsDateFilter}
                        onChange={(e) => setAccountsDateFilter(e.target.value as any)}
                        aria-label={isAr ? 'فلتر التاريخ' : 'Date Filter'}
                        className="bg-transparent text-slate-200 text-xs font-bold focus:outline-none cursor-pointer"
                      >
                        <option value="all" className="bg-slate-900 text-white">{isAr ? '📅 كل التواريخ' : 'All Dates'}</option>
                        <option value="today" className="bg-slate-900 text-white">{isAr ? '⚡ مسجلو اليوم' : 'Added Today'}</option>
                        <option value="this_month" className="bg-slate-900 text-white">{isAr ? '📆 هذا الشهر' : 'This Month'}</option>
                        <option value="custom" className="bg-slate-900 text-white">{isAr ? '🔍 فترة مخصصة' : 'Custom Range'}</option>
                      </select>
                    </div>

                    {/* Custom Date Range Pickers */}
                    {accountsDateFilter === 'custom' && (
                      <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-xl border border-amber-500/40 text-xs animate-in fade-in">
                        <span className="text-[10px] text-slate-400 font-bold">{isAr ? 'من:' : 'From:'}</span>
                        <input
                          type="date"
                          value={accountsDateStart}
                          onChange={(e) => setAccountsDateStart(e.target.value)}
                          aria-label={isAr ? 'تاريخ البداية' : 'Start Date'}
                          className="bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-[11px] text-white font-mono focus:outline-none focus:border-amber-500"
                        />
                        <span className="text-[10px] text-slate-400 font-bold">{isAr ? 'إلى:' : 'To:'}</span>
                        <input
                          type="date"
                          value={accountsDateEnd}
                          onChange={(e) => setAccountsDateEnd(e.target.value)}
                          aria-label={isAr ? 'تاريخ النهاية' : 'End Date'}
                          className="bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-[11px] text-white font-mono focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    )}

                    {/* Status Filter Dropdown */}
                    <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800 text-xs">
                      <Filter className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      <select
                        value={accountsStatusFilter}
                        onChange={(e) => setAccountsStatusFilter(e.target.value as any)}
                        aria-label={isAr ? 'حالة الاشتراك أو الحساب' : 'Subscription or Account Status'}
                        className="bg-transparent text-slate-200 text-xs font-bold focus:outline-none cursor-pointer"
                      >
                        <option value="all" className="bg-slate-900 text-white">{isAr ? '📌 كافة الحالات' : 'All Statuses'}</option>
                        <option value="active" className="bg-slate-900 text-emerald-400">{isAr ? '🟢 نشط وساري' : 'Active Only'}</option>
                        <option value="expiring" className="bg-slate-900 text-amber-400">{isAr ? '🟡 قارب على الانتهاء' : 'Expiring Soon'}</option>
                        <option value="expired" className="bg-slate-900 text-rose-400">{isAr ? '🔴 منتهي الصلاحية' : 'Expired'}</option>
                        <option value="suspended" className="bg-slate-900 text-sky-400">{isAr ? '❄️ معطل أو مجمد' : 'Suspended'}</option>
                      </select>
                    </div>
                  </div>

                  {/* Right / View Mode Switcher (Table vs Grid) */}
                  <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        audioAlertService.playBeep(650, 0.02);
                        setAccountsViewMode('table');
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        accountsViewMode === 'table'
                          ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-black shadow-md'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <TableIcon className="w-3.5 h-3.5" />
                      <span>{isAr ? 'جدول منظم' : 'Table View'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        audioAlertService.playBeep(650, 0.02);
                        setAccountsViewMode('grid');
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        accountsViewMode === 'grid'
                          ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-black shadow-md'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                      <span>{isAr ? 'بطاقات' : 'Cards'}</span>
                    </button>
                  </div>
                </div>

                {/* Role Filter Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto w-full pt-1 pb-2 border-t border-slate-800/80">
                  {(
                    [
                      { id: 'all', labelAr: 'الكل', count: counts.all, color: 'text-amber-400' },
                      { id: 'manager', labelAr: 'المدراء', count: counts.manager, color: 'text-amber-400' },
                      { id: 'accountant', labelAr: 'الحسابات', count: counts.accountant, color: 'text-emerald-400' },
                      { id: 'staff', labelAr: 'الاستقبال', count: counts.staff, color: 'text-sky-400' },
                      { id: 'coach', labelAr: 'الكباتن', count: counts.coach, color: 'text-orange-400' },
                      { id: 'viewer', labelAr: 'للعرض فقط', count: counts.viewer, color: 'text-slate-300' }
                    ] as const
                  ).map(tab => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        audioAlertService.playBeep(650, 0.03);
                        setAccountsFilterRole(tab.id);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                        accountsFilterRole === tab.id
                          ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                          : 'bg-slate-900/90 text-slate-300 hover:text-white border border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <span>{tab.labelAr}</span>
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                        accountsFilterRole === tab.id ? 'bg-slate-950/25 text-slate-950' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {tab.count}
                      </span>
                    </button>
                  ))}

                  {(accountsSearchQuery || accountsDateFilter !== 'all' || accountsStatusFilter !== 'all' || accountsFilterRole !== 'all') && (
                    <button
                      type="button"
                      onClick={() => {
                        setAccountsSearchQuery('');
                        setAccountsDateFilter('all');
                        setAccountsDateStart('');
                        setAccountsDateEnd('');
                        setAccountsStatusFilter('all');
                        setAccountsFilterRole('all');
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center gap-1 shrink-0 cursor-pointer transition-all ml-auto rtl:mr-auto rtl:ml-0"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>{isAr ? 'إلغاء الفلاتر' : 'Reset'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* 3. MAIN ACCOUNTS DISPLAY: ORGANIZED TABLE VIEW OR GRID CARDS */}
              {filteredAccounts.length === 0 ? (
                <div className="py-14 text-center text-slate-500 space-y-3 bg-[#080b12] rounded-2xl border border-slate-800/80">
                  <Users className="w-12 h-12 mx-auto opacity-30 text-amber-400 animate-pulse" />
                  <p className="text-sm font-bold text-slate-300">
                    {isAr ? 'لم يتم العثور على أي حساب يطابق معايير البحث والفلاتر الحالية' : 'No matching accounts found for current criteria'}
                  </p>
                  <p className="text-xs text-slate-500">
                    {isAr ? 'جرب تغيير كلمة البحث أو إعادة ضبط فلاتر التاريخ والحالة' : 'Try adjusting search term, date range, or status filter'}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setAccountsSearchQuery('');
                      setAccountsDateFilter('all');
                      setAccountsDateStart('');
                      setAccountsDateEnd('');
                      setAccountsStatusFilter('all');
                      setAccountsFilterRole('all');
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold hover:bg-amber-500 hover:text-slate-950 transition-all cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>{isAr ? 'إعادة ضبط كافة الفلاتر' : 'Clear All Filters'}</span>
                  </button>
                </div>
              ) : accountsViewMode === 'table' ? (
                /* ORGANIZED TABLE VIEW (جدول منظم واحترافي) */
                <div className="bg-[#080b12] rounded-2xl border border-slate-800/90 overflow-hidden shadow-2xl">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[950px] text-right rtl:text-right ltr:text-left text-xs text-slate-200">
                      <thead className="bg-[#101626] border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                        <tr>
                          <th className="py-3.5 px-4">{isAr ? 'الحساب / العضو' : 'Account / User'}</th>
                          <th className="py-3.5 px-3">{isAr ? 'الرتبة والنوع' : 'Role'}</th>
                          <th className="py-3.5 px-3">{isAr ? 'الاتصال والوصول' : 'Contact & PIN'}</th>
                          <th className="py-3.5 px-3">{isAr ? 'حالة الاشتراك / الحساب' : 'Subscription / Status'}</th>
                          <th className="py-3.5 px-3">{isAr ? 'تاريخ التسجيل' : 'Created Date'}</th>
                          <th className="py-3.5 px-4 text-center">{isAr ? 'لوحة الإجراءات والتحكم' : 'Actions'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {filteredAccounts.map((acc, idx) => {
                          const rConf = roleConfig[acc.role] || roleConfig.staff;
                          const RoleIcon = rConf.icon;
                          const statusInfo = getAccountStatusInfo(acc);
                          const StatusIcon = statusInfo.icon;
                          const isManagerSelf = acc.id === currentUser.id;
                          const isSuspended = acc.status === 'suspended';

                          return (
                            <tr
                              key={`gm-table-acc-${acc.role}-${acc.id}-${idx}`}
                              className={`hover:bg-slate-900/60 transition-colors group ${
                                isSuspended ? 'bg-rose-950/10' : idx % 2 === 0 ? 'bg-[#080b12]' : 'bg-[#0c101a]/40'
                              }`}
                            >
                              {/* 1. Account / Member Profile */}
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="relative shrink-0">
                                    <img
                                      src={acc.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                                      alt={acc.nameAr}
                                      className={`w-10 h-10 rounded-xl object-cover border shadow ${rConf.border}`}
                                    />
                                    <div className={`w-2.5 h-2.5 rounded-full absolute -bottom-0.5 -right-0.5 border-2 border-[#080b12] ${statusInfo.dotColor}`} />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <h4 className="text-xs font-black text-white group-hover:text-amber-300 transition-colors truncate">
                                        {acc.nameAr}
                                      </h4>
                                      {acc.accountType === 'member' && acc.rawMember && (
                                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                          #{acc.rawMember.membershipNumber}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[11px] text-slate-400 truncate max-w-[210px] mt-0.5">
                                      {acc.specialty}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              {/* 2. Role & Type Badge */}
                              <td className="py-3 px-3">
                                <span className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full font-bold border ${rConf.bg} ${rConf.color} ${rConf.border}`}>
                                  <RoleIcon className="w-3.5 h-3.5 shrink-0" />
                                  <span>{isAr ? rConf.titleAr : rConf.titleEn}</span>
                                </span>
                              </td>

                              {/* 3. Contact & Access Details */}
                              <td className="py-3 px-3">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1.5 text-slate-300">
                                    <Phone className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                                    <span className="font-mono text-xs text-slate-200">{acc.phone}</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-[11px] text-amber-400 font-mono">
                                    <KeyRound className="w-3 h-3 shrink-0" />
                                    <span>PIN: {!isViewer && visiblePinId === acc.id ? acc.accessCode : '••••'}</span>
                                    {!isViewer && (
                                      <button
                                        type="button"
                                        onClick={() => setVisiblePinId(prev => (prev === acc.id ? null : acc.id))}
                                        className="p-0.5 hover:text-white text-slate-500 cursor-pointer transition-colors"
                                        title={visiblePinId === acc.id ? (isAr ? 'إخفاء PIN' : 'Hide PIN') : (isAr ? 'إظهار PIN' : 'Show PIN')}
                                      >
                                        {visiblePinId === acc.id ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                      </button>
                                    )}
                                  </div>
                                  {(acc as any).attendanceCode && (
                                    <div className="text-[10px] text-[#f7cb55] font-mono font-bold">
                                      {isAr ? 'كود البصمة: ' : 'Att: '}
                                      <span className="bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/30">
                                        {(acc as any).attendanceCode}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </td>

                              {/* 4. Semantic Subscription Status & Indicators */}
                              <td className="py-3 px-3">
                                <div className="space-y-1.5">
                                  {/* Semantic Status Badge with Icon */}
                                  <span className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full font-bold border ${statusInfo.badgeClass}`}>
                                    <StatusIcon className={`w-3.5 h-3.5 ${statusInfo.iconColor} shrink-0`} />
                                    <span>{isAr ? statusInfo.labelAr : statusInfo.labelEn}</span>
                                  </span>

                                  {/* Member Expiry & Remaining Days details */}
                                  {acc.accountType === 'member' && acc.rawMember && (
                                    <div className="text-[10px] text-slate-400 flex items-center gap-2">
                                      <span>{isAr ? 'ينتهي في:' : 'Exp:'}</span>
                                      <span className="font-mono text-slate-200 font-bold">{acc.rawMember.endDate || '—'}</span>
                                    </div>
                                  )}
                                </div>
                              </td>

                              {/* 5. Registration / Hire Date */}
                              <td className="py-3 px-3 text-slate-300">
                                <div className="flex items-center gap-1.5 text-[11px]">
                                  <Calendar className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                                  <span className="font-mono">
                                    {acc.createdTimestamp
                                      ? new Date(acc.createdTimestamp).toLocaleDateString('ar-EG', { dateStyle: 'short' })
                                      : (acc.hiredDate || '2024-01-01')}
                                  </span>
                                </div>
                              </td>

                              {/* 6. Operational Actions Toolbar */}
                              <td className="py-3 px-4 text-center">
                                <div className="flex items-center justify-center gap-1 flex-wrap">
                                  {/* Permissions Button */}
                                  <button
                                    type="button"
                                    onClick={() => handleOpenPermissionsModal(acc, acc.accountType)}
                                    className="p-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600 hover:text-white text-purple-300 border border-purple-500/40 transition-all cursor-pointer shadow-sm"
                                    title={isAr ? 'تخصيص الإتاحات والصلاحيات لهذا الحساب' : 'Edit Privileges & Permissions'}
                                  >
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                  </button>

                                  {/* Extend Subscription (For Members) */}
                                  {acc.accountType === 'member' && acc.rawMember && (
                                    <button
                                      type="button"
                                      onClick={() => setSelectedExtendMemberModal(acc.rawMember!)}
                                      className="px-2 py-1 rounded-xl bg-purple-500/20 hover:bg-purple-600 hover:text-white text-purple-300 border border-purple-500/40 text-[10px] font-black flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                                      title={isAr ? 'تمديد وتأخير تاريخ نهاية اشتراك العضو' : 'Extend / Postpone Subscription'}
                                    >
                                      <CalendarCheck className="w-3.5 h-3.5" />
                                      <span>{isAr ? 'تمديد' : 'Extend'}</span>
                                    </button>
                                  )}

                                  {/* View Profile (For Members) */}
                                  {acc.accountType === 'member' && acc.rawMember && (
                                    <button
                                      type="button"
                                      onClick={() => handleOpenMemberDetail(acc.rawMember!)}
                                      className="p-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500 hover:text-slate-950 text-amber-300 border border-amber-500/30 transition-all cursor-pointer shadow-sm"
                                      title={isAr ? 'عرض الملف والاشتراك الكامل' : 'View Full Profile'}
                                    >
                                      <User className="w-3.5 h-3.5" />
                                    </button>
                                  )}

                                  {/* Staff Contract & WhatsApp Magic Link */}
                                  {acc.accountType !== 'member' && (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => setMainView('contracts')}
                                        className="p-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500 hover:text-slate-950 text-amber-300 border border-amber-500/30 transition-all cursor-pointer shadow-sm"
                                        title={isAr ? 'عقد العمل الرسمي للموظف' : 'Official Contract'}
                                      >
                                        <Signature className="w-3.5 h-3.5" />
                                      </button>

                                      {!isViewer && (
                                        <button
                                          type="button"
                                          onClick={() => handleCopyDirectLoginLink({
                                            id: acc.id,
                                            role: acc.role,
                                            phone: acc.phone,
                                            accessCode: (acc as any).accessCode,
                                            nameAr: acc.nameAr
                                          })}
                                          className={`p-1.5 rounded-xl border transition-all cursor-pointer shadow-sm ${
                                            copiedEmpId === acc.id
                                              ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold scale-105'
                                              : 'bg-sky-500/20 hover:bg-sky-500 hover:text-slate-950 text-sky-300 border-sky-500/30'
                                          }`}
                                          title={isAr ? 'نسخ رابط تسجيل الدخول المباشر لواتساب' : 'Copy WhatsApp Direct Login Link'}
                                        >
                                          {copiedEmpId === acc.id ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                                        </button>
                                      )}
                                    </>
                                  )}

                                  {/* Change PIN (Hidden for Viewers) */}
                                  {!isViewer && (
                                    <button
                                      type="button"
                                      onClick={() => handleOpenPasswordModal(acc.accountType, acc.id, acc.nameAr, acc.phone)}
                                      className="p-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500 hover:text-slate-950 text-amber-300 border border-amber-500/30 transition-all cursor-pointer shadow-sm"
                                      title={isAr ? 'تغيير كلمة المرور / الرقم السري' : 'Change Password / PIN'}
                                    >
                                      <KeyRound className="w-3.5 h-3.5" />
                                    </button>
                                  )}

                                  {/* Edit Account Info */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (acc.accountType === 'member' && acc.rawMember) {
                                        handleOpenMemberDetail(acc.rawMember);
                                      } else {
                                        handleOpenEditEmployee(acc as unknown as EmployeeAccount);
                                      }
                                    }}
                                    className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 transition-all cursor-pointer shadow-sm"
                                    title={isAr ? 'تعديل بيانات الحساب' : 'Edit Account'}
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>

                                  {/* Print Member PDF */}
                                  {acc.accountType === 'member' && acc.rawMember && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        audioAlertService.playSuccess();
                                        pdfPrintService.printMemberActivityAndWorkoutReportPDF(acc.rawMember!, activeManager.nameAr);
                                      }}
                                      className="p-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500 hover:text-white text-indigo-300 border border-indigo-500/40 transition-all cursor-pointer shadow-sm"
                                      title={isAr ? 'طباعة تقرير الحضور والتمارين PDF' : 'Print Member Activity PDF'}
                                    >
                                      <FileText className="w-3.5 h-3.5" />
                                    </button>
                                  )}

                                  {/* Toggle Active / Suspended */}
                                  {!isManagerSelf && (
                                    <button
                                      type="button"
                                      onClick={() => handleToggleAccountStatus(acc.accountType, acc.id, acc.nameAr)}
                                      className={`p-1.5 rounded-xl border transition-all cursor-pointer shadow-sm ${
                                        isSuspended
                                          ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 border-emerald-500/30'
                                          : 'bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border-slate-700'
                                      }`}
                                      title={isSuspended ? (isAr ? 'تفعيل الحساب' : 'Activate') : (isAr ? 'تعطيل الحساب' : 'Suspend')}
                                    >
                                      <Power className="w-3.5 h-3.5" />
                                    </button>
                                  )}

                                  {/* Delete Account */}
                                  {!isManagerSelf && (
                                    <button
                                      type="button"
                                      onClick={() => handleInitiateDeleteAccount(acc)}
                                      className="p-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900 hover:text-white text-rose-400 border border-rose-900/50 transition-all cursor-pointer shadow-sm active:scale-95"
                                      title={isAr ? 'حذف الحساب ونقله للأرشيف' : 'Delete Account'}
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Table Footer Count */}
                  <div className="bg-[#101626] px-4 py-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                    <div>
                      {isAr ? 'يتم عرض ' : 'Showing '}
                      <strong className="text-amber-400 font-mono font-bold">{filteredAccounts.length}</strong>
                      {isAr ? ' من أصل ' : ' of '}
                      <strong className="text-slate-200 font-mono font-bold">{allAccounts.length}</strong>
                      {isAr ? ' حساب مسجل' : ' total accounts'}
                    </div>
                    <div className="flex items-center gap-3 text-[11px]">
                      <span className="flex items-center gap-1 text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {isAr ? 'نشط' : 'Active'}
                      </span>
                      <span className="flex items-center gap-1 text-amber-400">
                        <AlertTriangle className="w-3.5 h-3.5" /> {isAr ? 'ينتهي قريباً' : 'Expiring'}
                      </span>
                      <span className="flex items-center gap-1 text-rose-400">
                        <AlertCircle className="w-3.5 h-3.5" /> {isAr ? 'منتهي' : 'Expired'}
                      </span>
                      <span className="flex items-center gap-1 text-sky-400">
                        <Snowflake className="w-3.5 h-3.5" /> {isAr ? 'مجمد' : 'Frozen'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                /* GRID CARDS VIEW (عرض البطاقات المحدث والمدمج لشاشات الكمبيوتر) */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3 pt-1">
                  {filteredAccounts.map((acc, idx) => {
                    const rConf = roleConfig[acc.role] || roleConfig.staff;
                    const RoleIcon = rConf.icon;
                    const statusInfo = getAccountStatusInfo(acc);
                    const StatusIcon = statusInfo.icon;
                    const isManagerSelf = acc.id === currentUser.id;
                    const isSuspended = acc.status === 'suspended';

                    return (
                      <div
                        key={`gm-card-acc-${acc.role}-${acc.id}-${idx}`}
                        className={`bg-[#080b12] p-3 rounded-2xl border transition-all relative flex flex-col justify-between group hover:border-amber-500/40 shadow-md ${
                          isSuspended ? 'opacity-65 border-rose-900/50 bg-rose-950/10' : 'border-slate-800/80'
                        }`}
                      >
                        {/* Top: Avatar, Name, Role Badge, Status */}
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <img
                                src={acc.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                                alt={acc.nameAr}
                                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-cover border-2 shadow shrink-0 ${rConf.border}`}
                              />
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1 flex-wrap">
                                  <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold flex items-center gap-0.5 border ${rConf.bg} ${rConf.color} ${rConf.border}`}>
                                    <RoleIcon className="w-2.5 h-2.5 shrink-0" />
                                    <span>{isAr ? rConf.titleAr : rConf.titleEn}</span>
                                  </span>

                                  {/* Semantic status pill */}
                                  <span className={`text-[8.5px] px-1.5 py-0.2 rounded-full font-bold flex items-center gap-0.5 border ${statusInfo.badgeClass}`}>
                                    <StatusIcon className={`w-2.5 h-2.5 ${statusInfo.iconColor} shrink-0`} />
                                    <span>{isAr ? statusInfo.labelAr : statusInfo.labelEn}</span>
                                  </span>
                                </div>

                                <h4 className="text-xs sm:text-[13px] font-black text-white mt-0.5 group-hover:text-amber-300 transition-colors truncate">
                                  {acc.nameAr}
                                </h4>
                                <p className="text-[10px] text-slate-400 truncate max-w-[170px]">
                                  {acc.specialty}
                                </p>
                              </div>
                            </div>

                            {/* Active status indicator dot */}
                            <div className={`w-2 h-2 rounded-full shrink-0 ${statusInfo.dotColor}`} />
                          </div>

                          {/* Account Info Details */}
                          <div className="mt-2.5 pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-1.5 text-[10px]">
                            <div className="flex items-center gap-1.5 text-slate-400">
                              <Phone className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                              <span className="font-mono text-slate-300">{acc.phone}</span>
                            </div>

                            <div className="flex items-center gap-1.5 text-slate-400">
                              <KeyRound className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              <span className="font-mono font-bold text-amber-400">
                                PIN: {!isViewer && visiblePinId === acc.id ? acc.accessCode : '••••'}
                              </span>
                              {!isViewer ? (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setVisiblePinId(prev => (prev === acc.id ? null : acc.id));
                                  }}
                                  className="p-0.5 hover:text-white text-slate-500 rounded transition-colors cursor-pointer"
                                  title={visiblePinId === acc.id ? (isAr ? 'إخفاء كلمة المرور' : 'Hide PIN') : (isAr ? 'إظهار كلمة المرور' : 'Show PIN')}
                                >
                                  {visiblePinId === acc.id ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                </button>
                              ) : (
                                <span className="text-[9px] text-slate-500 font-bold px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800">
                                  {isAr ? 'محجوب' : 'Hidden'}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Member Subscription Status Details */}
                          {acc.accountType === 'member' && acc.rawMember && (
                            <div className="mt-2.5 p-2.5 rounded-xl bg-purple-950/20 border border-purple-500/30 text-[11px] space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="text-slate-400 font-bold">{isAr ? 'فئة الاشتراك:' : 'Tier:'}</span>
                                <span className="font-mono font-black text-amber-400 uppercase text-xs">
                                  {acc.rawMember.tier}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-slate-300">
                                <span>{isAr ? 'تاريخ نهاية الاشتراك:' : 'Expiry Date:'}</span>
                                <span className="font-mono font-bold text-white">{acc.rawMember.endDate || 'غير محدد'}</span>
                              </div>
                              <div className="flex items-center justify-between pt-1 border-t border-purple-500/20">
                                <span className="text-slate-400">{isAr ? 'الأيام المتبقية:' : 'Remaining:'}</span>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-black flex items-center gap-1 ${statusInfo.badgeClass}`}>
                                  <StatusIcon className={`w-3 h-3 ${statusInfo.iconColor}`} />
                                  <span>{statusInfo.remainingText}</span>
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Attendance Code Box for Staff */}
                          {(acc as any).attendanceCode && (
                            <div className="mt-2 text-[10px] text-[#f7cb55] font-bold bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-500/20 flex items-center justify-between">
                              <span>{isAr ? '⏱️ كود تسجيل الحضور والانصراف:' : 'Attendance Code:'}</span>
                              <span className="font-mono font-black text-[#f7cb55] tracking-widest bg-black/40 px-2 py-0.5 rounded border border-amber-500/30">
                                {(acc as any).attendanceCode}
                              </span>
                            </div>
                          )}

                          {/* Created Timestamp Badge */}
                          <div className="mt-2 text-[10px] text-slate-400 font-medium bg-slate-900/60 px-2.5 py-1 rounded-xl border border-slate-800 flex items-center justify-between">
                            <span>{isAr ? '📅 تاريخ وساعة الإضافة:' : 'Created At:'}</span>
                            <span className="font-mono text-white">
                              {acc.createdTimestamp 
                                ? new Date(acc.createdTimestamp).toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' }) 
                                : (acc.hiredDate || '2024-01-01 09:00 AM')}
                            </span>
                          </div>
                        </div>

                        {/* Bottom Actions Bar */}
                        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-1.5 flex-wrap">
                          {/* Permissions Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenPermissionsModal(acc, acc.accountType)}
                            className="px-2.5 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600 hover:text-white text-purple-300 border border-purple-500/40 text-[11px] font-bold flex items-center gap-1 transition-all shadow cursor-pointer"
                            title={isAr ? 'تخصيص الإتاحات والصلاحيات لهذا الحساب' : 'Edit Privileges & Permissions'}
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                            <span>{isAr ? 'الصلاحيات' : 'Privileges'}</span>
                          </button>

                          <div className="flex items-center gap-1 flex-wrap">
                            {/* Extend Subscription (For Members) */}
                            {acc.accountType === 'member' && acc.rawMember && (
                              <button
                                type="button"
                                onClick={() => setSelectedExtendMemberModal(acc.rawMember!)}
                                className="px-2.5 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-600 hover:text-white text-purple-300 border border-purple-500/40 text-[11px] font-black flex items-center gap-1 transition-all cursor-pointer shadow"
                                title={isAr ? 'تمديد وتأخير تاريخ نهاية اشتراك العضو' : 'Extend / Postpone Subscription'}
                              >
                                <CalendarCheck className="w-3.5 h-3.5" />
                                <span>{isAr ? 'تمديد' : 'Extend'}</span>
                              </button>
                            )}

                            {/* View Profile (For Members) */}
                            {acc.accountType === 'member' && acc.rawMember && (
                              <button
                                type="button"
                                onClick={() => handleOpenMemberDetail(acc.rawMember!)}
                                className="px-2 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500 hover:text-slate-950 text-amber-300 border border-amber-500/30 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow"
                                title={isAr ? 'عرض الملف والاشتراك الكامل' : 'View Full Profile'}
                              >
                                <User className="w-3.5 h-3.5 text-amber-400" />
                                <span>{isAr ? 'الملف' : 'Profile'}</span>
                              </button>
                            )}

                            {/* Staff Contract & WhatsApp Magic Link */}
                            {acc.accountType !== 'member' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => setMainView('contracts')}
                                  className="px-2 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500 hover:text-slate-950 text-amber-300 border border-amber-500/30 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow"
                                  title={isAr ? 'عقد العمل الرسمي للموظف' : 'Official Contract'}
                                >
                                  <Signature className="w-3.5 h-3.5 text-amber-400" />
                                  <span>{isAr ? 'عقد العمل' : 'Contract'}</span>
                                </button>

                                {!isViewer && (
                                  <button
                                    type="button"
                                    onClick={() => handleCopyDirectLoginLink({
                                      id: acc.id,
                                      role: acc.role,
                                      phone: acc.phone,
                                      accessCode: (acc as any).accessCode,
                                      nameAr: acc.nameAr
                                    })}
                                    className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                                      copiedEmpId === acc.id
                                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold scale-110 shadow-lg shadow-emerald-500/30'
                                        : 'bg-sky-500/20 hover:bg-sky-500 hover:text-slate-950 text-sky-300 border-sky-500/30'
                                    }`}
                                    title={isAr ? 'نسخ رابط تسجيل الدخول المباشر لواتساب' : 'Copy Direct WhatsApp Login Link'}
                                  >
                                    {copiedEmpId === acc.id ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                                  </button>
                                )}
                              </>
                            )}

                            {/* Change PIN (Hidden for Viewers) */}
                            {!isViewer && (
                              <button
                                type="button"
                                onClick={() => handleOpenPasswordModal(acc.accountType, acc.id, acc.nameAr, acc.phone)}
                                className="p-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500 hover:text-slate-950 text-amber-300 border border-amber-500/30 transition-all cursor-pointer"
                                title={isAr ? 'تغيير كلمة المرور / الرقم السري' : 'Change Password / PIN'}
                              >
                                <KeyRound className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Edit Account Info */}
                            <button
                              type="button"
                              onClick={() => {
                                if (acc.accountType === 'member' && acc.rawMember) {
                                  handleOpenMemberDetail(acc.rawMember);
                                } else {
                                  handleOpenEditEmployee(acc as unknown as EmployeeAccount);
                                }
                              }}
                              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 transition-all cursor-pointer"
                              title={isAr ? 'تعديل بيانات الحساب' : 'Edit Account'}
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>

                            {/* Print Member PDF */}
                            {acc.accountType === 'member' && acc.rawMember && (
                              <button
                                type="button"
                                onClick={() => {
                                  audioAlertService.playSuccess();
                                  pdfPrintService.printMemberActivityAndWorkoutReportPDF(acc.rawMember!, activeManager.nameAr);
                                }}
                                className="p-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500 hover:text-white text-indigo-300 border border-indigo-500/40 transition-all cursor-pointer"
                                title={isAr ? 'طباعة تقرير الحضور والتمارين PDF' : 'Print Member Activity & Workout PDF'}
                              >
                                <FileText className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Toggle Active / Suspended */}
                            {!isManagerSelf && (
                              <button
                                type="button"
                                onClick={() => handleToggleAccountStatus(acc.accountType, acc.id, acc.nameAr)}
                                className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                                  isSuspended
                                    ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 border-emerald-500/30'
                                    : 'bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border-slate-700'
                                }`}
                                title={isSuspended ? (isAr ? 'تفعيل الحساب' : 'Activate') : (isAr ? 'تعطيل الحساب' : 'Suspend')}
                              >
                                <Power className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Delete Account */}
                            {!isManagerSelf && (
                              <button
                                type="button"
                                onClick={() => handleInitiateDeleteAccount(acc)}
                                className="p-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900 hover:text-white text-rose-400 border border-rose-900/50 transition-all cursor-pointer shadow-sm active:scale-95"
                                title={isAr ? 'حذف الحساب ونقله للأرشيف' : 'Delete Account'}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );
  };

  const renderShiftsView = () => {
    const filteredShifts = shifts.filter(s => {
      if (shiftsFilterStatus === 'open' && s.status !== 'open') return false;
      if (shiftsFilterStatus === 'closed' && s.status !== 'closed') return false;
      if (shiftsSearchQuery.trim()) {
            const q = shiftsSearchQuery.toLowerCase().trim();
            return s.staffName.toLowerCase().includes(q) || (s.openedAt || '').includes(q) || (s.notes || '').toLowerCase().includes(q);
          }
          return true;
        });

        const activeShiftsCount = shifts.filter(s => s.status === 'open').length;
        const closedShiftsCount = shifts.filter(s => s.status === 'closed').length;
        const totalShiftIncome = shifts.reduce((acc, s) => acc + (s.totalIncome || 0), 0);
        const totalShiftExpense = shifts.reduce((acc, s) => acc + (s.totalExpense || 0), 0);

        const isExp = (t: FinancialTransaction) => t.voucherKind === 'payment' || ['expense', 'refund'].includes(t.type);
        const isGymSub = (t: FinancialTransaction) => {
          if (isExp(t)) return false;
          if (['subscription', 'renewal', 'pt_package', 'locker'].includes(t.type)) return true;
          const n = ((t.notes || '') + ' ' + (t.memberName || '')).toLowerCase();
          return (
            n.includes('vip') ||
            n.includes('اشتراك') ||
            n.includes('باقة') ||
            n.includes('ذهبي') ||
            n.includes('عضوية') ||
            n.includes('سنوي') ||
            n.includes('شهري') ||
            n.includes('تجديد') ||
            n.includes('تدريب') ||
            n.includes('pt') ||
            n.includes('خزائن') ||
            n.includes('locker')
          );
        };

        return (
          <div className="bg-[#0c101a] rounded-3xl p-6 border border-slate-800 shadow-xl space-y-5 animate-in fade-in">
            {/* Header & Controls */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#f7cb55] to-amber-600 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/20 shrink-0">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 font-bold uppercase">
                      {isAr ? 'صلاحية المدير العام' : 'General Manager Authority'}
                    </span>
                    {activeShiftsCount > 0 && (
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold animate-pulse flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>{activeShiftsCount} {isAr ? 'وردية نشطة الآن' : 'Active Shift'}</span>
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-black text-white mt-0.5">
                    {isAr ? 'سجل وإدارة مناوبات الموظفين والخزينة' : 'Staff Cash Shifts & Registers'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {isAr ? 'مراقبة الورديات المفتوحة والمغلقة، معاينة العمليات الداخلية، حذف وتعديل السندات، وإغلاق الورديات' : 'Inspect active/closed shifts, view internal vouchers, delete/modify records, and close shifts'}
                  </p>
                </div>
              </div>

              {/* Quick Summary Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                <div className="bg-[#080b12] p-2.5 rounded-2xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">{isAr ? 'إجمالي الورديات' : 'Total Shifts'}</span>
                  <strong className="text-white font-mono font-black text-sm">{shifts.length}</strong>
                </div>
                <div className="bg-[#080b12] p-2.5 rounded-2xl border border-emerald-500/30">
                  <span className="text-[10px] text-emerald-400 block">{isAr ? 'النشطة الآن' : 'Active'}</span>
                  <strong className="text-emerald-400 font-mono font-black text-sm">{activeShiftsCount}</strong>
                </div>
                <div className="bg-[#080b12] p-2.5 rounded-2xl border border-slate-800">
                  <span className="text-[10px] text-sky-400 block">{isAr ? 'قسم الاشتراكات' : 'Subscriptions'}</span>
                  <strong className="text-sky-400 font-mono font-black text-xs">{shifts.reduce((sum, s) => {
                    const txs = transactions.filter(t => t.shiftId === s.id);
                    return sum + txs.filter(t => !isExp(t) && isGymSub(t)).reduce((acc, t) => acc + t.amount, 0);
                  }, 0).toLocaleString()} ج</strong>
                </div>
                <div className="bg-[#080b12] p-2.5 rounded-2xl border border-slate-800">
                  <span className="text-[10px] text-amber-400 block">{isAr ? 'قسم مبيعات البار' : 'Bar Sales'}</span>
                  <strong className="text-amber-400 font-mono font-black text-xs">{shifts.reduce((sum, s) => {
                    const txs = transactions.filter(t => t.shiftId === s.id);
                    return sum + txs.filter(t => !isExp(t) && !isGymSub(t)).reduce((acc, t) => acc + t.amount, 0);
                  }, 0).toLocaleString()} ج</strong>
                </div>
                <div className="bg-[#080b12] p-2.5 rounded-2xl border border-slate-800">
                  <span className="text-[10px] text-rose-400 block">{isAr ? 'المصروفات' : 'Expenses'}</span>
                  <strong className="text-rose-400 font-mono font-black text-xs">{shifts.reduce((sum, s) => {
                    const txs = transactions.filter(t => t.shiftId === s.id);
                    return sum + txs.filter(t => isExp(t)).reduce((acc, t) => acc + t.amount, 0);
                  }, 0).toLocaleString()} ج</strong>
                </div>
              </div>
            </div>

            {/* Filter Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#080b12] p-3.5 rounded-2xl border border-slate-800/80">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 rtl:right-3 ltr:left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={shiftsSearchQuery}
                  onChange={(e) => setShiftsSearchQuery(e.target.value)}
                  placeholder={isAr ? 'بحث باسم الموظف أو التاريخ...' : 'Search staff or date...'}
                  className="w-full bg-[#0d1322] border border-slate-800 rounded-xl pr-9 pl-3 rtl:pr-9 rtl:pl-3 ltr:pl-9 ltr:pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
                {shiftsSearchQuery && (
                  <button
                    onClick={() => setShiftsSearchQuery('')}
                    className="absolute left-2.5 rtl:left-2.5 ltr:right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                <button
                  onClick={() => setShiftsFilterStatus('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    shiftsFilterStatus === 'all'
                      ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                      : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
                  }`}
                >
                  {isAr ? 'جميع المناوبات' : 'All Shifts'} ({shifts.length})
                </button>
                <button
                  onClick={() => setShiftsFilterStatus('open')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    shiftsFilterStatus === 'open'
                      ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                      : 'bg-slate-900 text-emerald-300 hover:text-white border border-slate-800'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{isAr ? 'النشطة حالياً' : 'Active'} ({activeShiftsCount})</span>
                </button>
                <button
                  onClick={() => setShiftsFilterStatus('closed')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    shiftsFilterStatus === 'closed'
                      ? 'bg-sky-500 text-slate-950 font-black shadow-md'
                      : 'bg-slate-900 text-sky-300 hover:text-white border border-slate-800'
                  }`}
                >
                  {isAr ? 'المغلقة' : 'Closed'} ({closedShiftsCount})
                </button>
              </div>
            </div>

            {/* Shifts Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-right rtl:text-right ltr:text-left text-xs">
                <thead className="bg-[#070a12] text-slate-400 font-bold border-b border-slate-800">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">{isAr ? 'مسؤول المناوبة' : 'Staff'}</th>
                    <th className="p-3 text-center">{isAr ? 'الحالة' : 'Status'}</th>
                    <th className="p-3">{isAr ? 'وقت الفتح' : 'Opened At'}</th>
                    <th className="p-3">{isAr ? 'رصيد البداية' : 'Float'}</th>
                    <th className="p-3 text-center">{isAr ? 'قسم الاشتراكات' : 'Subscriptions'}</th>
                    <th className="p-3 text-center">{isAr ? 'قسم مبيعات البار' : 'Bar Sales'}</th>
                    <th className="p-3 text-center">{isAr ? 'المصروفات' : 'Expenses'}</th>
                    <th className="p-3 text-center">{isAr ? 'الصافي المفروض بالخزنة' : 'Net in Treasury'}</th>
                    <th className="p-3">{isAr ? 'الدرج الفعلي' : 'Actual'}</th>
                    <th className="p-3 text-center">{isAr ? 'إجراءات' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredShifts.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="p-8 text-center text-slate-500 font-bold">
                        {isAr ? 'لا توجد مناوبات مطابقة للبحث أو التصفية الحالية' : 'No matching shifts found'}
                      </td>
                    </tr>
                  ) : (
                    filteredShifts.map((shift, idx) => {
                      const isOpen = shift.status === 'open';
                      const shiftTxs = transactions.filter(t => t.shiftId === shift.id);

                      return (
                        <tr key={shift.id} className="hover:bg-slate-900/60 transition-colors">
                          <td className="p-3 font-bold text-slate-500">{idx + 1}</td>
                          <td className="p-3 font-bold text-white">
                            <div className="flex items-center gap-2">
                              <span>{shift.staffName}</span>
                              {shiftTxs.length > 0 && (
                                <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-amber-400 text-[10px] font-mono">
                                  {shiftTxs.length} {isAr ? 'معاملة' : 'txs'}
                                </span>
                              )}
                            </div>
                            {shift.notes && (
                              <div className="text-[10px] text-slate-400 font-normal truncate max-w-[180px]">{shift.notes}</div>
                            )}
                          </td>
                          <td className="p-3 text-center">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${
                              isOpen 
                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 animate-pulse' 
                                : 'bg-slate-800 text-slate-400 border-slate-700'
                            }`}>
                              {isOpen ? (isAr ? '🟢 نشطة مفتوحة' : 'OPEN') : (isAr ? '🔒 مغلقة ومطابقة' : 'CLOSED')}
                            </span>
                          </td>
                          <td className="p-3 text-slate-300 font-mono text-[11px]">{shift.openedAt}</td>
                          <td className="p-3 font-mono text-slate-300">{(shift.startingCash || 0).toLocaleString()} ج</td>
                          <td className="p-3 text-sky-400 font-bold font-mono text-center">
                            {shiftTxs.filter(t => !isExp(t) && isGymSub(t)).reduce((acc, t) => acc + t.amount, 0).toLocaleString()}
                          </td>
                          <td className="p-3 text-amber-400 font-bold font-mono text-center">
                            {shiftTxs.filter(t => !isExp(t) && !isGymSub(t)).reduce((acc, t) => acc + t.amount, 0).toLocaleString()}
                          </td>
                          <td className="p-3 text-rose-400 font-bold font-mono text-center">
                            {shiftTxs.filter(t => isExp(t)).reduce((acc, t) => acc + t.amount, 0).toLocaleString()}
                          </td>
                          <td className="p-3 text-emerald-400 font-black font-mono text-center bg-emerald-500/5">
                            {(() => {
                              const s = shiftTxs.filter(t => !isExp(t) && isGymSub(t)).reduce((acc, t) => acc + t.amount, 0);
                              const b = shiftTxs.filter(t => !isExp(t) && !isGymSub(t)).reduce((acc, t) => acc + t.amount, 0);
                              const e = shiftTxs.filter(t => isExp(t)).reduce((acc, t) => acc + t.amount, 0);
                              return (s + b - e).toLocaleString();
                            })()}
                          </td>
                          <td className="p-3 text-[#f7cb55] font-bold font-mono">{(shift.actualCash || 0).toLocaleString()} ج</td>
                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center gap-1.5 flex-wrap">
                              {/* INSPECT SHIFT TRANSACTIONS (معاينة العمليات وحذف السندات) */}
                              <button
                                onClick={() => {
                                  audioAlertService.playSuccess();
                                  setSelectedShiftForInspect(shift);
                                }}
                                className="px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500 hover:text-slate-950 text-amber-300 border border-amber-500/40 text-[11px] font-black flex items-center gap-1 transition-all cursor-pointer shadow"
                                title={isAr ? 'معاينة كافة السندات والمعاملات وحذف أو تعديل أي عملية' : 'Inspect Vouchers & Shift Details'}
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>{isAr ? 'معاينة العمليات' : 'Inspect'}</span>
                              </button>

                              {/* CLOSE SHIFT (If open) */}
                              {isOpen && !isViewer && (
                                <button
                                  onClick={() => handleCloseShiftByManager(shift)}
                                  className="px-2 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-600 hover:text-white text-rose-300 border border-rose-500/40 text-[11px] font-black flex items-center gap-1 transition-all cursor-pointer shadow"
                                  title={isAr ? 'إغلاق الوردية نيابة عن الموظف ومطابقة النقدية' : 'Close Shift on behalf of staff'}
                                >
                                  <Power className="w-3.5 h-3.5" />
                                  <span>{isAr ? 'إغلاق' : 'Close'}</span>
                                </button>
                              )}

                              {/* PRINT SHIFT REPORT */}
                              <button
                                onClick={() => {
                                  audioAlertService.playSuccess();
                                  pdfPrintService.printShiftReportPDF(shift, transactions);
                                }}
                                className="p-1.5 rounded-xl bg-slate-800 hover:bg-[#e5a91b] hover:text-slate-950 text-slate-300 transition-colors cursor-pointer"
                                title={isAr ? 'طباعة تقرير الوردية المعتمد PDF' : 'Print Shift PDF'}
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>

                              {/* DELETE SHIFT RECORD (GM only) */}
                              {!isViewer && (
                                <button
                                  onClick={() => handleInitiateDeleteShift(shift)}
                                  className="px-2.5 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 hover:text-white text-rose-300 border border-rose-500/50 text-[11px] font-black flex items-center gap-1 transition-all cursor-pointer shadow-sm active:scale-95 group"
                                  title={isAr ? 'حذف سجل المناوبة بالكامل (صلاحية المدير العام)' : 'Delete Shift Record'}
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-rose-400 group-hover:text-white" />
                                  <span>{isAr ? 'حذف المناوبة' : 'Delete'}</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-20">
      {/* Executive Hero Banner */}
      <div className="bg-gradient-to-br from-[#121826] via-[#090d16] to-[#04060a] rounded-3xl p-6 border border-[#f7cb55]/40 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#f7cb55] via-[#e5a91b] to-[#b37a10] text-slate-950 flex items-center justify-center font-black shadow-xl shadow-[#e5a91b]/20">
              <Crown className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#f7cb55]/20 text-[#f7cb55] border border-[#e5a91b]/40 font-bold uppercase tracking-wider">
                  {isAr ? 'الإدارة العامة والرقابة المركزية' : 'Executive General Management'}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white mt-1 flex items-center gap-2">
                <span>{activeManager.nameAr}</span>
                <button
                  onClick={() => handleOpenEditEmployee(activeManager)}
                  className="p-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500 hover:text-slate-950 text-[#f7cb55] border border-amber-500/40 text-xs transition-all shadow"
                  title={isAr ? 'تعديل بيانات المدير العام' : 'Edit Manager Profile'}
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                {isAr ? 'مراقبة الصالة، السجلات، التقارير المعتمدة، سلة المحذوفات، وتتبع العمليات' : 'Central control over shifts, staff, audit logs, and finance'}
              </p>
            </div>
          </div>

          {/* Quick Metrics (Clickable for Executive Detailed Inspection) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
            {/* 1. REVENUE CARD */}
            <button
              type="button"
              onClick={() => {
                audioAlertService.playSuccess();
                setFinancialModalType('revenue');
              }}
              className="bg-slate-950/80 hover:bg-emerald-950/40 p-2.5 rounded-2xl border border-slate-800 hover:border-emerald-500/60 transition-all cursor-pointer group shadow-md hover:shadow-emerald-500/20 active:scale-95 text-center relative overflow-hidden"
              title={isAr ? 'اضغط لعرض تفاصيل وبيانات الإيرادات بالكامل' : 'Click to inspect revenues breakdown'}
            >
              <div className="flex items-center justify-center gap-1 mb-0.5">
                <span className="text-[10px] text-slate-400 group-hover:text-emerald-300 font-bold transition-colors">
                  {isAr ? 'الإيرادات' : 'Revenue'}
                </span>
                <ArrowUpRight className="w-3 h-3 text-emerald-400 group-hover:scale-125 transition-transform" />
              </div>
              <strong className="text-xs font-black text-emerald-400 font-mono block">
                {totalRevenue.toLocaleString()} ج
              </strong>
              <span className="text-[9px] text-emerald-400/90 font-bold block mt-0.5 opacity-80 group-hover:opacity-100 transition-opacity">
                {isAr ? '🔍 عرض البيانات' : 'View Details'}
              </span>
            </button>

            {/* 2. EXPENSES CARD */}
            <button
              type="button"
              onClick={() => {
                audioAlertService.playSuccess();
                setFinancialModalType('expense');
              }}
              className="bg-slate-950/80 hover:bg-rose-950/40 p-2.5 rounded-2xl border border-slate-800 hover:border-rose-500/60 transition-all cursor-pointer group shadow-md hover:shadow-rose-500/20 active:scale-95 text-center relative overflow-hidden"
              title={isAr ? 'اضغط لعرض تفاصيل وبيانات المصروفات وأذون الصرف' : 'Click to inspect expenses breakdown'}
            >
              <div className="flex items-center justify-center gap-1 mb-0.5">
                <span className="text-[10px] text-slate-400 group-hover:text-rose-300 font-bold transition-colors">
                  {isAr ? 'المصروفات' : 'Expenses'}
                </span>
                <ArrowDownLeft className="w-3 h-3 text-rose-400 group-hover:scale-125 transition-transform" />
              </div>
              <strong className="text-xs font-black text-rose-400 font-mono block">
                {totalExpenses.toLocaleString()} ج
              </strong>
              <span className="text-[9px] text-rose-400/90 font-bold block mt-0.5 opacity-80 group-hover:opacity-100 transition-opacity">
                {isAr ? '🔍 عرض البيانات' : 'View Details'}
              </span>
            </button>

            {/* 3. NET PROFIT CARD */}
            <button
              type="button"
              onClick={() => {
                audioAlertService.playSuccess();
                setFinancialModalType('profit');
              }}
              className="bg-slate-950/80 hover:bg-amber-950/40 p-2.5 rounded-2xl border border-slate-800 hover:border-amber-500/60 transition-all cursor-pointer group shadow-md hover:shadow-amber-500/20 active:scale-95 text-center relative overflow-hidden"
              title={isAr ? 'اضغط لعرض كشف الميزانية وصافي الربح وهامش الربحية' : 'Click to inspect net profit statement'}
            >
              <div className="flex items-center justify-center gap-1 mb-0.5">
                <span className="text-[10px] text-slate-400 group-hover:text-amber-300 font-bold transition-colors">
                  {isAr ? 'صافي الربح' : 'Net Profit'}
                </span>
                <DollarSign className="w-3 h-3 text-[#f7cb55] group-hover:scale-125 transition-transform" />
              </div>
              <strong className="text-xs font-black text-[#f7cb55] font-mono block">
                {netProfit.toLocaleString()} ج
              </strong>
              <span className="text-[9px] text-amber-400/90 font-bold block mt-0.5 opacity-80 group-hover:opacity-100 transition-opacity">
                {isAr ? '🔍 عرض البيانات' : 'View Details'}
              </span>
            </button>

            {/* 4. ACTIVE MEMBERS CARD */}
            <button
              type="button"
              onClick={() => {
                audioAlertService.playSuccess();
                setIsActiveMembersModalOpen(true);
              }}
              className="bg-slate-950/80 hover:bg-sky-950/40 p-2.5 rounded-2xl border border-slate-800 hover:border-sky-500/60 transition-all cursor-pointer group shadow-md hover:shadow-sky-500/20 active:scale-95 text-center relative overflow-hidden"
              title={isAr ? 'اضغط لعرض تفاصيل وبيانات الأعضاء المشتركين النشطين' : 'Click to inspect active members'}
            >
              <div className="flex items-center justify-center gap-1 mb-0.5">
                <span className="text-[10px] text-slate-400 group-hover:text-sky-300 font-bold transition-colors">
                  {isAr ? 'الأعضاء النشطين' : 'Active Members'}
                </span>
                <Users className="w-3 h-3 text-sky-400 group-hover:scale-125 transition-transform" />
              </div>
              <strong className="text-xs font-black text-sky-400 font-mono block">
                {activeMembersCount}
              </strong>
              <span className="text-[9px] text-sky-400/90 font-bold block mt-0.5 opacity-80 group-hover:opacity-100 transition-opacity">
                {isAr ? '🔍 عرض البيانات' : 'View Details'}
              </span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar with Native Desktop Horizontal Scrollbar & Interactive Arrow Controls */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 space-y-3">
          {/* Header & Quick Navigation Bar for Computer */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black text-amber-400 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                <span>{isAr ? 'أقسام ولوحات الإدارة العامة للرقابة المركزية:' : 'Central Management Modules:'}</span>
              </span>
              <span className="text-[10px] text-slate-400 hidden lg:inline font-mono">
                {isAr ? '(تمرير سلس بالماوس أو الأسهم أو القفز المباشر)' : '(Smooth scroll with mouse wheel, arrows, or quick jump)'}
              </span>
            </div>

            {/* Quick Category Jump Shortcuts for Desktop */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  setMainView('accounts');
                  scrollTabs('backward');
                }}
                className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold border transition-all cursor-pointer ${
                  ['accounts', 'shifts', 'attendance', 'vouchers'].includes(mainView)
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-black'
                    : 'bg-slate-900/90 text-slate-400 hover:text-white border-slate-800'
                }`}
              >
                🏢 {isAr ? 'الحسابات والخزينة' : 'Accounts & Cash'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setMainView('members');
                }}
                className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold border transition-all cursor-pointer ${
                  ['members', 'plans', 'permissions'].includes(mainView)
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 font-black'
                    : 'bg-slate-900/90 text-slate-400 hover:text-white border-slate-800'
                }`}
              >
                👥 {isAr ? 'الأعضاء والاشتراكات' : 'Members'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setMainView('security_alerts');
                }}
                className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold border transition-all cursor-pointer ${
                  ['security_alerts', 'sync_report', 'activity_logs'].includes(mainView)
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-black'
                    : 'bg-slate-900/90 text-slate-400 hover:text-white border-slate-800'
                }`}
              >
                ⚡ {isAr ? 'التنبيهات والتزامن' : 'Live Alerts & Sync'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setMainView('sensitive_mods');
                  scrollTabs('forward');
                }}
                className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold border transition-all cursor-pointer ${
                  ['sensitive_mods', 'recycle_bin', 'general_ledger', 'database_backup', 'contracts', 'exercise_video_library', 'report_archive', 'account_mods'].includes(mainView)
                    ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 font-black'
                    : 'bg-slate-900/90 text-slate-400 hover:text-white border-slate-800'
                }`}
              >
                🛡️ {isAr ? 'الرقابة والأرشيف' : 'Audit & Archive'}
              </button>

              {/* Arrow navigation buttons */}
              <div className="flex items-center gap-1 rtl:mr-2 ltr:ml-2">
                <button
                  type="button"
                  onClick={() => scrollTabs('backward')}
                  className="p-1.5 px-2.5 rounded-lg bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-slate-300 border border-slate-700 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer shadow-md active:scale-95"
                  title={isAr ? 'تمرير للخلف' : 'Scroll Backward'}
                >
                  <ChevronRight className="w-3.5 h-3.5 ltr:rotate-180" />
                  <span className="text-[10px] font-black hidden sm:inline">{isAr ? 'السابق' : 'Prev'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => scrollTabs('forward')}
                  className="p-1.5 px-2.5 rounded-lg bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-slate-300 border border-slate-700 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer shadow-md active:scale-95"
                  title={isAr ? 'تمرير للأمام' : 'Scroll Forward'}
                >
                  <span className="text-[10px] font-black hidden sm:inline">{isAr ? 'التالي' : 'Next'}</span>
                  <ChevronLeft className="w-3.5 h-3.5 ltr:rotate-180" />
                </button>
              </div>
            </div>
          </div>

          <div 
            ref={tabsScrollRef} 
            onWheel={handleTabsWheel}
            onMouseDown={(e) => {
              if (tabsScrollRef.current) {
                setIsDraggingTabs(true);
                setTabsStartX(e.pageX - tabsScrollRef.current.offsetLeft);
                setTabsScrollStart(tabsScrollRef.current.scrollLeft);
              }
            }}
            onMouseLeave={() => setIsDraggingTabs(false)}
            onMouseUp={() => setIsDraggingTabs(false)}
            onMouseMove={(e) => {
              if (!isDraggingTabs || !tabsScrollRef.current) return;
              e.preventDefault();
              const x = e.pageX - tabsScrollRef.current.offsetLeft;
              const walk = (x - tabsStartX) * 1.5;
              tabsScrollRef.current.scrollLeft = tabsScrollStart - walk;
            }}
            className={`w-full flex items-center gap-2 overflow-x-auto pb-3 pt-1 scroll-smooth select-none border-b border-slate-800/60 touch-pan-x [scrollbar-width:auto] [scrollbar-color:#f59e0b_#0b0f19] [&::-webkit-scrollbar]:h-2.5 [&::-webkit-scrollbar-track]:bg-slate-950/90 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-amber-500/80 hover:[&::-webkit-scrollbar-thumb]:bg-amber-400 [&::-webkit-scrollbar-thumb]:rounded-full ${
              isDraggingTabs ? 'cursor-grabbing' : 'cursor-grab'
            }`}
          >
            <button
              onClick={() => setMainView('accounts')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                mainView === 'accounts'
                  ? 'bg-[#f7cb55] text-slate-950 shadow-lg shadow-[#e5a91b]/20 font-black'
                  : 'bg-slate-900/80 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>{isAr ? 'الحسابات وكلمات المرور' : 'Accounts & Passwords'}</span>
            </button>

            <button
              onClick={() => setMainView('vouchers')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                mainView === 'vouchers'
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20 font-black'
                  : 'bg-slate-900/80 text-emerald-300 hover:text-white border border-emerald-900/50'
              }`}
            >
              <Receipt className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isAr ? 'سجل السندات وأذون الصرف' : 'Vouchers & Expenses'}</span>
            </button>

            <button
              onClick={() => setMainView('members')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                mainView === 'members'
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-black'
                  : 'bg-slate-900/80 text-amber-300 hover:text-white border border-slate-800'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-amber-400" />
              <span>{isAr ? 'إدارة الأعضاء والاشتراكات' : 'Members Directory'}</span>
            </button>

            <button
              onClick={() => setMainView('permissions')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                mainView === 'permissions'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20 font-black'
                  : 'bg-slate-900/80 text-purple-300 hover:text-white border border-purple-900/50'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              <span>{isAr ? 'الأذونات والمهام' : 'Permissions & Tasks'}</span>
            </button>

            <button
              onClick={() => setMainView('security_alerts')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                mainView === 'security_alerts'
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20 font-black'
                  : 'bg-slate-900/80 text-rose-300 hover:text-white border border-rose-900/50'
              }`}
            >
              <BellRing className="w-3.5 h-3.5 text-rose-400" />
              <span>{isAr ? 'الإشعارات والتنبيهات المباشرة' : 'Notifications & Alerts'}</span>
              {securityAlertsCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[9px] font-black animate-pulse">
                  {securityAlertsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setMainView('sync_report')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                mainView === 'sync_report'
                  ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-slate-950 font-black shadow-lg shadow-sky-500/20'
                  : 'bg-slate-900/80 text-sky-300 hover:text-white border border-sky-900/50'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-sky-400" />
              <span>{isAr ? 'تقرير التزامن الديناميكي ⚡' : 'Dynamic Sync Report'}</span>
            </button>

            <button
              onClick={() => setMainView('shifts')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                mainView === 'shifts'
                  ? 'bg-[#f7cb55] text-slate-950 shadow-lg shadow-[#e5a91b]/20 font-black'
                  : 'bg-slate-900/80 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{isAr ? 'الورديات والخزينة' : 'Cash Shifts'}</span>
            </button>

            <button
              onClick={() => setMainView('attendance')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                mainView === 'attendance'
                  ? 'bg-[#f7cb55] text-slate-950 shadow-lg shadow-[#e5a91b]/20'
                  : 'bg-slate-900/80 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>{isAr ? 'حضور الموظفين' : 'Attendance'}</span>
            </button>

            <button
              onClick={() => setMainView('activity_logs')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                mainView === 'activity_logs'
                  ? 'bg-[#f7cb55] text-slate-950 shadow-lg shadow-[#e5a91b]/20'
                  : 'bg-slate-900/80 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              <History className="w-3.5 h-3.5 text-amber-400" />
              <span>{isAr ? 'سجل الرقابة وحركات النظام' : 'Audit Logs'}</span>
            </button>

            <button
              onClick={() => setMainView('sensitive_mods')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                mainView === 'sensitive_mods'
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                  : 'bg-slate-900/80 text-rose-300 hover:text-white border border-rose-800'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              <span>{isAr ? 'التعديلات الحساسة' : 'Sensitive Mods'}</span>
            </button>

            <button
              onClick={() => setMainView('recycle_bin')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                mainView === 'recycle_bin'
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                  : 'bg-slate-900/80 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>{isAr ? 'سلة المحذوفات' : 'Recycle Bin'}</span>
            </button>

            <button
              onClick={() => setMainView('report_archive')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                mainView === 'report_archive'
                  ? 'bg-[#f7cb55] text-slate-950 shadow-lg shadow-[#e5a91b]/20'
                  : 'bg-slate-900/80 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{isAr ? 'أرشيف التقارير' : 'Reports Archive'}</span>
            </button>

            <button
              onClick={() => setMainView('account_mods')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                mainView === 'account_mods'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                  : 'bg-slate-900/80 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              <span>{isAr ? 'تعديلات الحسابات' : 'Account Mods'}</span>
            </button>

            <button
              onClick={() => setMainView('general_ledger')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                mainView === 'general_ledger'
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                  : 'bg-slate-900/80 text-amber-300 hover:text-white border border-amber-500/40'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>{isAr ? 'دفتر الأستاذ العام' : 'General Ledger'}</span>
            </button>

            <button
              onClick={() => setMainView('database_backup')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                mainView === 'database_backup'
                  ? 'bg-[#f7cb55] text-slate-950 shadow-lg shadow-amber-500/20 font-black'
                  : 'bg-slate-900/80 text-amber-300 hover:text-white border border-amber-500/40'
              }`}
            >
              <Database className="w-3.5 h-3.5 text-[#f7cb55]" />
              <span>{isAr ? 'النسخ الاحتياطي والبيانات' : 'Database & Backup'}</span>
            </button>

            <button
              onClick={() => setMainView('contracts')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                mainView === 'contracts'
                  ? 'bg-[#f7cb55] text-slate-950 shadow-lg shadow-amber-500/20 font-black'
                  : 'bg-slate-900/80 text-amber-300 hover:text-white border border-amber-500/40'
              }`}
            >
              <Signature className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
              <span>{isAr ? 'عقود العمل الرسمية' : 'Employment Contracts'}</span>
            </button>

            <button
              onClick={() => setMainView('exercise_video_library')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                mainView === 'exercise_video_library'
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-black'
                  : 'bg-slate-900/80 text-amber-300 hover:text-white border border-amber-500/40'
              }`}
            >
              <Film className="w-3.5 h-3.5 text-amber-400" />
              <span>{isAr ? '📁 مجلدات وفيديوهات التمارين والأجهزة' : 'Exercise Video Folders'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 1. ACCOUNTS VIEW */}
      {mainView === 'accounts' && renderAccountsView()}

      {/* 2. SHIFTS VIEW */}
      {mainView === 'shifts' && renderShiftsView()}

      {/* 3. VOUCHERS VIEW */}
      {mainView === 'vouchers' && (
        <ManagerVouchersView
          currentUser={currentUser}
          lang={lang}
          onTransactionDeleted={refreshAllData}
        />
      )}
      {mainView === 'members' && (
        <ManagerMembersDirectory
          members={members}
          lang={lang}
          onSelectMember={(mem) => setSelectedMemberDetail(mem)}
          onEditMember={(mem) => handleOpenEditMember(mem)}
          currentUser={currentUser}
          onRefreshData={refreshAllData}
        />
      )}

      {/* VIEW: SECURITY ALERTS (محاولات الدخول الخاطئة) */}
      {mainView === 'security_alerts' && (
        <ManagerSecurityAlerts 
          lang={lang} 
          currentUser={currentUser}
          onOpenPasswordModal={!isViewer ? handleOpenPasswordModal : undefined} 
        />
      )}

      {/* VIEW: DYNAMIC SYNC REPORT (تقرير التزامن الديناميكي لحركات الموظفين والأعضاء) */}
      {mainView === 'sync_report' && (
        <ManagerDynamicSyncReport 
          currentUser={currentUser} 
          lang={lang} 
        />
      )}

      {/* VIEW: ATTENDANCE */}
      {mainView === 'attendance' && (
        <ManagerEmployeeAttendance lang={lang} />
      )}

      {/* VIEW: AUDIT LOGS */}
      {mainView === 'activity_logs' && (
        <ManagerAuditLogs lang={lang} currentManagerName={activeManager.nameAr} />
      )}

      {/* VIEW: RECYCLE BIN */}
      {mainView === 'recycle_bin' && (
        <ManagerRecycleBin 
          lang={lang} 
          currentManagerName={activeManager.nameAr} 
          onRecordRestored={refreshAllData}
        />
      )}

      {/* VIEW: REPORT ARCHIVE */}
      {mainView === 'report_archive' && (
        <ManagerReportsArchive lang={lang} currentManagerName={activeManager.nameAr} />
      )}

      {mainView === 'account_mods' && (
        <ManagerAccountMods lang={lang} />
      )}

      {/* VIEW: SENSITIVE MODS */}
      {mainView === 'sensitive_mods' && (
        <ManagerSensitiveMods lang={lang} />
      )}

      {/* VIEW: GENERAL LEDGER (دفتر الأستاذ العام) */}
      {mainView === 'general_ledger' && (
        <ManagerGeneralLedger lang={lang} currentManagerName={activeManager.nameAr} />
      )}

      {/* VIEW: DATABASE & BACKUP (تصدير واستيراد قاعدة البيانات) */}
      {mainView === 'database_backup' && (
        <ManagerDatabaseBackup 
          lang={lang} 
          currentUser={currentUser} 
          refreshAllData={refreshAllData} 
        />
      )}

      {/* VIEW: PERMISSIONS & TASKS (الأذونات والمهام التشغيلية للموظفين) */}
      {mainView === 'permissions' && (
        <ManagerPermissionsMatrix 
          currentUser={currentUser} 
          lang={lang} 
        />
      )}

      {/* VIEW: EMPLOYMENT CONTRACTS (عقود العمل الرسمية للمدير فقط) */}
      {mainView === 'contracts' && (
        <ManagerContracts 
          lang={lang} 
          currentUser={currentUser} 
          managers={managers} 
          accountants={accountants} 
          staff={staff} 
          coaches={coaches} 
        />
      )}

      {/* VIEW: EXERCISE VIDEO LIBRARY / FOLDERS (مكتبة ومجلد فيديوهات التمارين والأجهزة) */}
      {mainView === 'exercise_video_library' && (
        <ManagerExerciseVideoLibrary 
          currentUser={currentUser} 
          lang={lang} 
        />
      )}

      {/* VIEW: MEMBERSHIP PLANS & PRICING (باقات وأسعار ومزايا الاشتراكات والخصومات) */}
      {mainView === 'membership_plans' && (
        <ManagerMembershipPlans 
          currentUser={currentUser} 
          lang={lang} 
        />
      )}

      {/* VIEW: LIVE MEMBER CHECK-IN LOGS (سجل دخول وحضور الأعضاء لحظة بلحظة) */}
      {mainView === 'member_checkins' && (
        <MemberCheckInLogView 
          currentUser={currentUser} 
          lang={lang} 
        />
      )}

      {/* Direct Password Changer Modal for GM */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-[#0e1320] border-2 border-amber-500/50 p-6 text-slate-100 shadow-2xl relative text-right rtl:text-right ltr:text-left">
            <button
              onClick={() => setIsPasswordModalOpen(false)}
              className="absolute top-4 left-4 rtl:left-4 rtl:right-auto ltr:right-4 ltr:left-auto p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/60"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-[#f7cb55] border border-amber-500/40 flex items-center justify-center font-bold">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">
                  {isAr ? 'تعديل وتعيين كلمة المرور' : 'Override Password / PIN'}
                </h3>
                <p className="text-[11px] text-amber-400 font-semibold">
                  {pwdTargetName} ({pwdTargetPhone})
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveNewPassword} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">
                  {isAr ? 'كلمة المرور أو كود الدخول الجديد' : 'New Password / Access PIN'}
                </label>
                <input
                  type="text"
                  required
                  value={pwdNewValue}
                  onChange={(e) => setPwdNewValue(e.target.value)}
                  placeholder={isAr ? 'اكتب كلمة المرور الجديدة...' : 'Enter new password'}
                  className="w-full bg-[#080b12] border-2 border-slate-800 focus:border-amber-400 rounded-xl p-3 text-white font-mono text-center font-black text-base text-amber-400 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs transition-colors shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  {isAr ? 'حفظ وتثبيت كلمة المرور' : 'Save & Update Password'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="px-4 py-3 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs cursor-pointer"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 1. CUSTOM PERMISSIONS & PRIVILEGES MODAL (تخصيص الإتاحات والصلاحيات للمستخدم) */}
      {isPermModalOpen && permTargetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl bg-[#0e1320] border-2 border-purple-500/50 p-4 sm:p-6 text-slate-100 shadow-2xl relative max-h-[calc(100dvh-2rem)] sm:max-h-[85vh] flex flex-col text-right rtl:text-right ltr:text-left overflow-hidden my-auto">
            <button
              onClick={() => setIsPermModalOpen(false)}
              className="absolute top-4 left-4 rtl:left-4 rtl:right-auto ltr:right-4 ltr:left-auto p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/60"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 mb-4 shrink-0">
              <div className="w-11 h-11 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/40 flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-white">
                    {isAr ? 'تخصيص الإتاحات والصلاحيات التشغيلية' : 'User Privileges & Permissions'}
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                    {permTargetRole.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-amber-400 font-semibold mt-0.5">
                  {permTargetUser.nameAr} ({permTargetUser.phone})
                </p>
              </div>
            </div>

            {/* Official Role Badge Selector */}
            {permTargetType === 'employee' && (
              <div className="bg-[#080b12] p-3 rounded-2xl border border-amber-500/40 mb-3 shrink-0">
                <span className="text-[11px] text-amber-400 font-bold block mb-2">
                  {isAr ? 'تغيير وتأكيد رتبة الحساب الرسمية (تظهر مباشرة جنب كلمة نشط):' : 'Official Role Title Badge:'}
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {[
                    { id: 'coach', label: 'كابتن ومدرب 🏋️‍♂️', activeStyle: 'bg-orange-500 text-slate-950 border-orange-400 font-black shadow-lg shadow-orange-500/20' },
                    { id: 'staff', label: 'موظف استقبال 👥', activeStyle: 'bg-sky-500 text-slate-950 border-sky-400 font-black shadow-lg shadow-sky-500/20' },
                    { id: 'accountant', label: 'مسؤول حسابات 💼', activeStyle: 'bg-emerald-500 text-slate-950 border-emerald-400 font-black shadow-lg shadow-emerald-500/20' },
                    { id: 'manager', label: 'مدير عام 👑', activeStyle: 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-lg shadow-amber-500/20' }
                  ].map(r => (
                    <button
                      type="button"
                      key={r.id}
                      onClick={() => handleSelectPermRole(r.id as any)}
                      className={`py-2 px-1.5 rounded-xl text-xs transition-all border cursor-pointer ${
                        permTargetRole === r.id
                          ? r.activeStyle
                          : 'bg-slate-900/90 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Presets Bar */}
            <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800/80 mb-4 shrink-0">
              <span className="text-[11px] text-slate-400 font-bold block mb-1.5">
                {isAr ? 'قوالب وإتاحات جاهزة سريعة:' : 'Quick Presets:'}
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => handleApplyPermissionPreset('full')}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500 hover:text-slate-950 text-amber-300 text-[10px] font-bold transition-all border border-amber-500/30 cursor-pointer"
                >
                  {isAr ? '🌟 إتاحة كاملة (مدير)' : 'Full Admin'}
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPermissionPreset('finance')}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 hover:text-slate-950 text-emerald-300 text-[10px] font-bold transition-all border border-emerald-500/30 cursor-pointer"
                >
                  {isAr ? '💼 صلاحيات مالية وسندات' : 'Finance Only'}
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPermissionPreset('reception')}
                  className="px-2.5 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500 hover:text-slate-950 text-sky-300 text-[10px] font-bold transition-all border border-sky-500/30 cursor-pointer"
                >
                  {isAr ? '🏢 صلاحيات استقبال وورديات' : 'Front Desk'}
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPermissionPreset('coach')}
                  className="px-2.5 py-1 rounded-lg bg-orange-500/20 hover:bg-orange-500 hover:text-slate-950 text-orange-300 text-[10px] font-bold transition-all border border-orange-500/30 cursor-pointer"
                >
                  {isAr ? '🏋️‍♂️ صلاحيات كابتن وتمارين' : 'Coach Only'}
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPermissionPreset('none')}
                  className="px-2.5 py-1 rounded-lg bg-rose-950/40 hover:bg-rose-900 text-rose-400 text-[10px] font-bold transition-all border border-rose-900/50 cursor-pointer"
                >
                  {isAr ? '🚫 إلغاء كافة الصلاحيات' : 'Revoke All'}
                </button>
              </div>
            </div>

            {/* Permissions Toggles List */}
            <div className="flex-1 min-h-0 overflow-y-auto space-y-2.5 pr-1 pl-1 scrollbar-thin overscroll-contain pb-2">
              {(
                [
                  { key: 'canManageMembers', labelAr: 'إدارة وتسجيل وتعديل بيانات المشتركين', descAr: 'إضافة أعضاء جدد وتعديل ملفاتهم وتجديد الاشتراكات' },
                  { key: 'canManageMemberPermissions', labelAr: 'إدارة وتخصيص صلاحيات وإتاحات الأعضاء المشتركين', descAr: 'التحكم في إتاحات خدمات بوابة العضو المشترك وتخصيص أذوناته' },
                  { key: 'canRecordTransactions', labelAr: 'تسجيل وإصدار السندات المالية (قبض / صرف)', descAr: 'إنشاء سندات القبض والصرف والفواتير الرسمية' },
                  { key: 'canManageAccounts', labelAr: 'إدارة حسابات المستخدمين وتعيين الصلاحيات', descAr: 'إضافة موظفين، حذف حسابات، وتعديل إتاحات النظام' },
                  { key: 'canAccessRecycleBin', labelAr: 'حذف واسترجاع السندات والمحذوفات من السلة والأرشيف', descAr: 'حذف السندات الخاطئة واسترجاع القيود المحذوفة' },
                  { key: 'canIssueDiscounts', labelAr: 'صلاحية تطبيق ومنح الخصومات السعرية', descAr: 'تطبيق تخفيض مالي على الاشتراكات والخدمات' },
                  { key: 'canFreezeMemberships', labelAr: 'تجميد وتمديد اشتراكات الأعضاء', descAr: 'إيقاف الاشتراك مؤقتاً لسفر أو ظروف خاصة' },
                  { key: 'canOpenCloseShifts', labelAr: 'فتح وإغلاق ورديات الخزينة ومطابقة الدرج', descAr: 'استلام وتسليم وردية الكاش اليومية' },
                  { key: 'canViewPayroll', labelAr: 'الاطلاع على كشوفات الرواتب والأجور ونسب الكباتن', descAr: 'عرض تفاصيل مرتبات الموظفين ونسب تدريب PT' },
                  { key: 'canManagePayroll', labelAr: 'صرف واعتماد مسيرات الرواتب الشهرية', descAr: 'إصدار أوامر الدفع ومسيرات المرتبات' },
                  { key: 'canManageServices', labelAr: 'نقاط بيع الخدمات والمكملات والبار (POS)', descAr: 'بيع المكملات الغذائية، باقات PT، وخدمات النادي' },
                  { key: 'canEditWorkouts', labelAr: 'تصميم وتعديل جداول وبرامج التمارين', descAr: 'بناء البرامج التدريبية وتعيين التمارين للاعبين' },
                  { key: 'canExportPDF', labelAr: 'تصدير وطباعة تقارير PDF الرسمية والسندات', descAr: 'توليد وطباعة الفواتير والسندات والتقارير' },
                  { key: 'canAccessAuditLogs', labelAr: 'الاطلاع على سجل الرقابة وحركات النظام', descAr: 'متابعة سجل التدقيق وتعديلات الحسابات' },
                  { key: 'canViewReports', labelAr: 'الاطلاع على التقارير المالية وأرباح الصالة', descAr: 'عرض تحليلات الإيرادات والمصروفات والأرباح' }
                ] as { key: keyof RolePermissions; labelAr: string; descAr: string }[]
              ).map(perm => {
                const isChecked = !!draftPermissions[perm.key];
                return (
                  <div
                    key={perm.key}
                    onClick={() => handleToggleDraftPermission(perm.key)}
                    className={`p-3 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                      isChecked
                        ? 'bg-purple-950/20 border-purple-500/50 hover:bg-purple-950/30'
                        : 'bg-[#080b12] border-slate-800/80 hover:border-slate-700 opacity-75'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                        isChecked ? 'bg-purple-600 text-white shadow-md' : 'bg-slate-800 text-slate-500'
                      }`}>
                        {isChecked ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                      </div>
                      <div>
                        <strong className={`text-xs block ${isChecked ? 'text-purple-200' : 'text-slate-300'}`}>
                          {perm.labelAr}
                        </strong>
                        <span className="text-[10px] text-slate-500 block mt-0.5">
                          {perm.descAr}
                        </span>
                      </div>
                    </div>

                    <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isChecked ? 'bg-purple-500/20 text-purple-300' : 'bg-slate-800 text-slate-500'
                    }`}>
                      {isChecked ? (isAr ? 'مفعلة' : 'Enabled') : (isAr ? 'معطلة' : 'Disabled')}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Actions */}
            <div className="pt-4 mt-2 border-t border-slate-800 flex gap-2 shrink-0">
              <button
                type="button"
                onClick={handleSavePermissions}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs transition-colors shadow-lg shadow-purple-600/20 cursor-pointer flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{isAr ? 'حفظ وتثبيت الصلاحيات والإتاحات' : 'Save User Permissions'}</span>
              </button>
              <button
                type="button"
                onClick={() => setIsPermModalOpen(false)}
                className="px-4 py-3 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs cursor-pointer"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. EMPLOYEE ADD / EDIT MODAL (إضافة وتعديل موظف/محاسب/استقبال/كابتن) */}
      {isEmployeeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
          <div className="w-full max-w-md max-h-[calc(100dvh-2rem)] sm:max-h-[85vh] flex flex-col rounded-3xl bg-[#0e1320] border-2 border-[#e5a91b]/50 text-slate-100 shadow-2xl relative text-right rtl:text-right ltr:text-left overflow-hidden my-auto">
            {/* Modal Header (Fixed at top) */}
            <div className="flex items-center justify-between p-5 pb-3 border-b border-slate-800/80 shrink-0 bg-[#0a0e18]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-[#f7cb55] flex items-center justify-center shrink-0">
                  {employeeRole === 'manager' ? <Crown className="w-5 h-5" /> : (employeeRole === 'accountant' ? <Wallet className="w-5 h-5" /> : <Edit className="w-5 h-5" />)}
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    {editingEmployee 
                      ? (employeeRole === 'manager' ? (isAr ? 'تعديل بيانات المدير العام' : 'Edit Manager Profile') : (isAr ? 'تعديل بيانات ورتبة الحساب' : 'Edit Account')) 
                      : (isAr ? `+ إضافة حساب ${employeeRole === 'accountant' ? 'مسؤول حسابات' : (employeeRole === 'coach' ? 'كابتن ومدرب' : (employeeRole === 'manager' ? 'مدير جديد' : 'موظف استقبال'))}` : 'Add New Account')}
                  </h3>
                  <span className="text-xs text-amber-400 font-semibold block">
                    {employeeRole === 'manager' ? (isAr ? 'صلاحية المدير العام' : 'General Manager') : (employeeRole === 'accountant' ? (isAr ? 'إدارة الحسابات والمالية' : 'Accountant') : (employeeRole === 'coach' ? (isAr ? 'كابتن ومدرب' : 'Coach') : (isAr ? 'استقبال وخدمة عملاء' : 'Staff')))}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsEmployeeModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/60 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSaveEmployee} className="flex-1 min-h-0 flex flex-col overflow-hidden">
              <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs overscroll-contain pb-6">
                {/* Role Selector always visible */}
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">{isAr ? 'نوع الحساب والرتبة الرسمية' : 'Account Role'}</label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                    {(
                      [
                        { id: 'accountant', label: 'محاسب', color: 'text-emerald-400' },
                        { id: 'staff', label: 'استقبال', color: 'text-sky-400' },
                        { id: 'coach', label: 'كابتن', color: 'text-orange-400' },
                        { id: 'viewer', label: 'عرض فقط 👁️', color: 'text-purple-400' },
                        { id: 'manager', label: 'مدير', color: 'text-amber-400' }
                      ] as const
                    ).map(r => (
                      <button
                        type="button"
                        key={r.id}
                        onClick={() => {
                          setEmployeeRole(r.id);
                          if (!attendanceCode) {
                            setAttendanceCode(StorageService.generateSuggestedAttendanceCode(r.id));
                          }
                          if (r.id === 'accountant') {
                            setSpecialty('إدارة الحسابات العامة والقيود');
                            if (!baseSalary) setBaseSalary(8000);
                          } else if (r.id === 'staff') {
                            setSpecialty('استقبال وخدمة عملاء ومناوبات');
                            if (!baseSalary) setBaseSalary(5500);
                          } else if (r.id === 'coach') {
                            setSpecialty('لياقة بدنية وتدريب خاص PT');
                            if (!baseSalary) setBaseSalary(7000);
                          } else if (r.id === 'viewer') {
                            setSpecialty('حساب للعرض والمطالعة فقط بدون صلاحية تعديل');
                            setBaseSalary('');
                          } else {
                            setSpecialty('إدارة العمليات والرقابة العامة');
                            if (!baseSalary) setBaseSalary(12000);
                          }
                        }}
                        className={`py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                          employeeRole === r.id
                            ? 'bg-amber-500 text-slate-950 font-black border-amber-400 shadow-md scale-105'
                            : 'bg-[#080b12] text-slate-400 border-slate-800 hover:text-white'
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">{isAr ? 'الاسم بالكامل' : 'Full Name'}</label>
                  <input
                    type="text"
                    required
                    value={nameAr}
                    onChange={(e) => setNameAr(e.target.value)}
                    placeholder={isAr ? 'مثال: أستاذ حازم المنشاوي' : 'Full Name'}
                    className="w-full bg-[#080b12] border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500 font-bold"
                  />
                </div>

                {/* Profile Image Real Uploader */}
                <div className="p-3 bg-[#080b12] border border-slate-800/80 rounded-2xl flex items-center gap-4">
                  <img
                    src={avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                    alt="Avatar Preview"
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-500/40 shadow shrink-0"
                  />
                  <div className="flex-1 space-y-1.5">
                    <label className="block text-slate-300 font-bold text-[11px]">{isAr ? 'الصورة الشخصية للموظف' : 'Profile Picture'}</label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          if (file.size > 2 * 1024 * 1024) {
                            alert(isAr ? 'عذرًا، الحد الأقصى لحجم الصورة هو 2 ميجابايت' : 'Max picture size is 2MB.');
                            return;
                          }
                          const reader = new FileReader();
                          reader.onload = (evt) => {
                            const base64 = evt.target?.result as string;
                            if (base64) {
                              setAvatarUrl(base64);
                              audioAlertService.playSuccess();
                            }
                          };
                          reader.readAsDataURL(file);
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 text-center text-[10px] font-bold text-amber-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer">
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>{isAr ? 'رفع صورة من الجهاز / الموبايل' : 'Upload from phone/PC'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">{isAr ? 'رقم الهاتف' : 'Phone'}</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="01011223344"
                      className="w-full bg-[#080b12] border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">{isAr ? 'كود الدخول السري (PIN)' : 'PIN Code'}</label>
                    <input
                      type={isViewer ? 'password' : 'text'}
                      required
                      maxLength={6}
                      disabled={isViewer}
                      value={isViewer ? '••••' : accessCode}
                      onChange={(e) => setAccessCode(e.target.value)}
                      placeholder="4 أرقام"
                      className="w-full bg-[#080b12] border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500 font-mono text-center font-black tracking-widest text-amber-400 disabled:opacity-60"
                    />
                  </div>
                </div>

                {/* Attendance Code (Suggested Automatically) */}
                <div className="p-3 bg-[#060810] border border-amber-500/30 rounded-2xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-[#f7cb55] font-bold text-[11px]">
                      {isAr ? 'كود الحضور والانصراف السريع (مقترح تلقائياً)' : 'Suggested Attendance Code'}
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const newSuggested = StorageService.generateSuggestedAttendanceCode(employeeRole);
                        setAttendanceCode(newSuggested);
                        audioAlertService.playBeep(659.25, 0.05);
                      }}
                      className="text-[10px] text-amber-300 hover:text-amber-200 font-bold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 cursor-pointer"
                    >
                      🎲 {isAr ? 'توليد كود تلقائي' : 'Regenerate'}
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={attendanceCode}
                    onChange={(e) => setAttendanceCode(e.target.value)}
                    placeholder={isAr ? 'كود تسجيل الحضور السريع' : 'Attendance code'}
                    className="w-full bg-[#080b12] border border-slate-800 focus:border-amber-400 rounded-xl p-2 text-white font-mono text-center font-black text-sm tracking-widest text-[#f7cb55] focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500 block">
                    {isAr ? 'يستخدمه الموظف لتسجيل الحضور والانصراف السريع في بداية ونهاية يوم العمل.' : 'Used for quick check-in and checkout.'}
                  </span>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">{isAr ? 'المسمى الوظيفي والتخصص' : 'Specialty / Role Title'}</label>
                  <input
                    type="text"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    placeholder={isAr ? 'إدارة وتطوير الأندية الرياضية...' : 'Specialty'}
                    className="w-full bg-[#080b12] border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">{isAr ? 'الراتب الأساسي الشهري (ج.م)' : 'Base Salary (EGP)'}</label>
                  <input
                    type="number"
                    value={baseSalary}
                    onChange={(e) => setBaseSalary(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder={isAr ? 'أدخل الراتب بالجنيه...' : 'Enter salary in EGP...'}
                    className="w-full bg-[#080b12] border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500 font-mono font-bold text-amber-400"
                  />
                </div>
              </div>

              {/* Sticky Fixed Bottom Actions Footer (ALWAYS 100% VISIBLE) */}
              <div className="p-3.5 sm:p-4 px-4 sm:px-6 bg-[#0a0e18] border-t-2 border-slate-800 shrink-0 flex items-center gap-3 z-30 shadow-[0_-12px_24px_rgba(0,0,0,0.85)]">
                <button
                  type="submit"
                  className="flex-1 py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-[#f7cb55] to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm transition-all shadow-xl shadow-amber-500/25 cursor-pointer flex items-center justify-center gap-2 active:scale-95 shrink-0"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span className="whitespace-nowrap font-black">{isAr ? 'حفظ وتأكيد الإعدادات والبيانات' : 'Save & Confirm Settings'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsEmployeeModalOpen(false)}
                  className="px-5 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs sm:text-sm cursor-pointer transition-colors shrink-0"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. MEMBER ADD / EDIT MODAL (إضافة وتعديل حساب مشترك) */}
      {isMemberModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
          <div className="w-full max-w-md max-h-[calc(100dvh-2rem)] sm:max-h-[85vh] flex flex-col rounded-3xl bg-[#0e1320] border-2 border-purple-500/50 text-slate-100 shadow-2xl relative text-right rtl:text-right ltr:text-left overflow-hidden my-auto">
            {/* Header (Fixed at top) */}
            <div className="flex items-center justify-between p-5 pb-3 border-b border-slate-800/80 shrink-0 bg-[#0a0e18]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    {editingMember ? (isAr ? 'تعديل بيانات حساب المشترك' : 'Edit Member Account') : (isAr ? '+ إضافة حساب مشترك جديد' : 'Add New Member')}
                  </h3>
                  <span className="text-xs text-purple-400 font-semibold block">
                    {isAr ? 'عضوية واشتراك النادي الرياضي' : 'Gym Membership Account'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsMemberModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/60 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSaveMember} className="flex-1 min-h-0 flex flex-col overflow-hidden">
              <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs overscroll-contain pb-6">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">{isAr ? 'اسم المشترك بالكامل' : 'Member Full Name'}</label>
                  <input
                    type="text"
                    required
                    value={memberFullName}
                    onChange={(e) => setMemberFullName(e.target.value)}
                    placeholder={isAr ? 'مثال: أحمد عبد الله الرويني' : 'Full Name'}
                    className="w-full bg-[#080b12] border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-purple-500 font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">{isAr ? 'رقم الهاتف' : 'Phone'}</label>
                    <input
                      type="tel"
                      required
                      value={memberPhone}
                      onChange={(e) => setMemberPhone(e.target.value)}
                      placeholder="01012345678"
                      className="w-full bg-[#080b12] border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-purple-500 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">{isAr ? 'الرقم السري للدخول (PIN)' : 'PIN Code'}</label>
                    <input
                      type={isViewer ? 'password' : 'text'}
                      required
                      maxLength={6}
                      disabled={isViewer}
                      value={isViewer ? '••••' : memberPin}
                      onChange={(e) => setMemberPin(e.target.value)}
                      placeholder="4 أرقام"
                      className="w-full bg-[#080b12] border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-purple-500 font-mono text-center font-black tracking-widest text-purple-400 disabled:opacity-60"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">{isAr ? 'تاريخ الميلاد (مجهول افتراضياً)' : 'Birth Date (Optional)'}</label>
                    <input
                      type="text"
                      name="gm_no_suggest_mem_birth"
                      value={memberBirthDate}
                      onChange={(e) => setMemberBirthDate(e.target.value)}
                      autoComplete="off"
                      placeholder={isAr ? 'مجهول / غير محدد (أدخل يدوياً إن وُجد)' : 'Unknown / Not specified (optional)'}
                      className="w-full bg-[#080b12] border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-purple-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">{isAr ? 'العنوان' : 'Address'}</label>
                    <input
                      type="text"
                      value={memberAddress}
                      onChange={(e) => setMemberAddress(e.target.value)}
                      placeholder={isAr ? 'العنوان والتفاصيل السكنية' : 'Address'}
                      className="w-full bg-[#080b12] border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-purple-500 font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">{isAr ? 'صورة العضو' : 'Member Avatar'}</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setMemberAvatarUrl(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full bg-[#080b12] border border-slate-800 rounded-xl p-2 text-slate-300 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-purple-500/20 file:text-purple-300 hover:file:bg-purple-500/30"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">{isAr ? 'تاريخ بداية الاشتراك' : 'Start Date'}</label>
                    <input
                      type="date"
                      value={memberStartDate}
                      onChange={(e) => setMemberStartDate(e.target.value)}
                      className="w-full bg-[#080b12] border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-purple-500 font-mono text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">{isAr ? 'تاريخ نهاية الاشتراك' : 'End Date'}</label>
                    <input
                      type="date"
                      value={memberEndDate}
                      onChange={(e) => setMemberEndDate(e.target.value)}
                      className="w-full bg-[#080b12] border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-purple-500 font-mono text-xs font-bold text-amber-400"
                    />
                  </div>
                </div>
              </div>

              {/* Sticky Fixed Bottom Actions Footer (ALWAYS 100% VISIBLE) */}
              <div className="p-3.5 sm:p-4 px-4 sm:px-6 bg-[#0a0e18] border-t-2 border-slate-800 shrink-0 flex items-center gap-3 z-30 shadow-[0_-12px_24px_rgba(0,0,0,0.85)]">
                <button
                  type="submit"
                  className="flex-1 py-3.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs sm:text-sm transition-all shadow-xl shadow-purple-600/25 cursor-pointer flex items-center justify-center gap-2 active:scale-95 shrink-0"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span className="whitespace-nowrap font-black">{isAr ? 'حفظ وتأكيد بيانات العضوية' : 'Save Member'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsMemberModalOpen(false)}
                  className="px-5 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs sm:text-sm cursor-pointer transition-colors shrink-0"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. FINANCIAL METRIC DETAIL INSPECTION MODAL (الإيرادات / المصروفات / صافي الربح) */}
      {financialModalType && (
        <ManagerFinancialDetailModal
          isOpen={Boolean(financialModalType)}
          onClose={() => setFinancialModalType(null)}
          initialType={financialModalType}
          transactions={transactions}
          managerName={activeManager.nameAr}
          lang={lang}
        />
      )}

      {/* 5. ACTIVE MEMBERS DETAIL INSPECTION MODAL (الأعضاء النشطين) */}
      {isActiveMembersModalOpen && (
        <ManagerActiveMembersModal
          isOpen={isActiveMembersModalOpen}
          onClose={() => setIsActiveMembersModalOpen(false)}
          members={members}
          onOpenEditMember={(mem) => handleOpenEditMember(mem)}
          onDeleteMember={(mem) => handleInitiateDeleteAccount(mem)}
          lang={lang}
          managerName={activeManager.nameAr}
          currentUser={currentUser}
          onRefreshData={refreshAllData}
        />
      )}

      {/* 6. IN-APP ACCOUNT DELETION CONFIRMATION MODAL (حذف الحساب بقرار المدير العام) */}
      {accountToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-[#0e1320] border-2 border-rose-500/50 p-6 text-slate-100 shadow-2xl relative text-right rtl:text-right ltr:text-left">
            <button
              onClick={() => setAccountToDelete(null)}
              className="absolute top-4 left-4 rtl:left-4 rtl:right-auto ltr:right-4 ltr:left-auto p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/60"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center font-bold shadow-lg shadow-rose-500/10 shrink-0">
                <Trash2 className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                  {isAr ? 'صلاحية المدير العام الحصرية' : 'Exclusive GM Privilege'}
                </span>
                <h3 className="text-base sm:text-lg font-black text-white mt-1">
                  {isAr ? 'تأكيد حذف الحساب والنقل للأرشيف' : 'Confirm Account Deletion'}
                </h3>
              </div>
            </div>

            {/* Account Spotlight Box */}
            <div className="p-4 rounded-2xl bg-[#080b12] border border-rose-950/80 mb-4 flex items-center gap-3.5">
              <img
                src={accountToDelete.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                alt={accountToDelete.name}
                className="w-12 h-12 rounded-xl object-cover border border-slate-700 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <strong className="text-sm font-bold text-white truncate block">
                    {accountToDelete.name}
                  </strong>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/20 text-[#f7cb55] font-bold border border-amber-500/30">
                    {accountToDelete.roleTitle}
                  </span>
                </div>
                <span className="text-xs text-slate-400 font-mono block mt-0.5">
                  {accountToDelete.identifier}
                </span>
              </div>
            </div>

            {/* Reason Input */}
            <div className="space-y-1.5 mb-4 text-xs">
              <label className="block text-slate-300 font-bold">
                {isAr ? 'سبب الحذف والإلغاء (يُوثّق في سجل الرقابة المعتمد):' : 'Deletion Reason (Logged in audit trail):'}
              </label>
              <input
                type="text"
                value={deleteReasonText}
                onChange={(e) => setDeleteReasonText(e.target.value)}
                placeholder={isAr ? 'اكتب سبب حذف الحساب...' : 'Enter reason...'}
                className="w-full bg-[#05070d] border border-slate-800 focus:border-rose-500 rounded-xl p-3 text-xs text-white font-bold"
              />
            </div>

            {/* Safe Notice */}
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs mb-5 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                {isAr
                  ? 'سيتم نقل هذا الحساب فوراً إلى سلة وأرشيف المحذوفات الإدارية، ويمكنك استرجاعه بكامل بياناته وسجلاته في أي وقت بضغطة زر.'
                  : 'This account will be safely archived to the recycle bin and can be restored at any time.'}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={handleConfirmAccountDeletion}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 transition-all cursor-pointer active:scale-95"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isAr ? 'تأكيد حذف الحساب ونقله للأرشيف' : 'Confirm & Move to Trash'}</span>
              </button>

              <button
                type="button"
                onClick={() => setAccountToDelete(null)}
                className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs transition-colors cursor-pointer"
              >
                {isAr ? 'إلغاء والتراجع' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. IN-APP SHIFT DELETION CONFIRMATION MODAL (حذف المناوبة بقرار المدير العام) */}
      {shiftToDelete && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-[#0e1320] border-2 border-rose-500/50 p-6 text-slate-100 shadow-2xl relative text-right rtl:text-right ltr:text-left">
            <button
              onClick={() => setShiftToDelete(null)}
              className="absolute top-4 left-4 rtl:left-4 rtl:right-auto ltr:right-4 ltr:left-auto p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center font-bold shadow-lg shadow-rose-500/10 shrink-0">
                <Trash2 className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                  {isAr ? 'صلاحية المدير العام الحصرية' : 'Exclusive GM Authority'}
                </span>
                <h3 className="text-base sm:text-lg font-black text-white mt-1">
                  {isAr ? 'تأكيد حذف سجل المناوبة والخزينة' : 'Confirm Shift Deletion'}
                </h3>
              </div>
            </div>

            {/* Shift Details Box */}
            <div className="p-4 rounded-2xl bg-[#080b12] border border-rose-950/80 mb-4 space-y-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">{isAr ? 'الموظف المسؤول:' : 'Staff:'}</span>
                  <strong className="text-sm font-bold text-white">{shiftToDelete.staffName}</strong>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                  shiftToDelete.status === 'open'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 animate-pulse'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                  {shiftToDelete.status === 'open' ? (isAr ? '🟢 مناوبة نشطة مفتوحة' : 'OPEN') : (isAr ? '🔒 مناوبة مغلقة' : 'CLOSED')}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                <div>
                  <span className="text-slate-500 block text-[10px]">{isAr ? 'وقت الافتتاح' : 'Opened At'}</span>
                  <span className="font-mono text-slate-300">{shiftToDelete.openedAt}</span>
                </div>
                {shiftToDelete.closedAt && (
                  <div>
                    <span className="text-slate-500 block text-[10px]">{isAr ? 'وقت الإغلاق' : 'Closed At'}</span>
                    <span className="font-mono text-slate-300">{shiftToDelete.closedAt}</span>
                  </div>
                )}
                <div>
                  <span className="text-slate-500 block text-[10px]">{isAr ? 'رصيد البداية (العهدة)' : 'Starting Float'}</span>
                  <span className="font-mono font-bold text-amber-400">{(shiftToDelete.startingCash || 0).toLocaleString()} ج.م</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">{isAr ? 'الدرج الفعلي المسجل' : 'Actual Cash'}</span>
                  <span className="font-mono font-bold text-emerald-400">{(shiftToDelete.actualCash || 0).toLocaleString()} ج.م</span>
                </div>
              </div>
            </div>

            {/* Reason Input */}
            <div className="space-y-1.5 mb-4 text-xs">
              <label className="block text-slate-300 font-bold">
                {isAr ? 'سبب حذف المناوبة (يُوثّق رسمياً في سجل الرقابة والتدقيق):' : 'Reason for deletion (Logged to audit logs):'}
              </label>
              <input
                type="text"
                value={shiftDeleteReason}
                onChange={(e) => setShiftDeleteReason(e.target.value)}
                placeholder={isAr ? 'اكتب سبب حذف المناوبة...' : 'Enter reason...'}
                className="w-full bg-[#05070d] border border-slate-800 focus:border-rose-500 rounded-xl p-3 text-xs text-white font-bold"
              />
            </div>

            {/* Warning Notice */}
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs mb-5 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>
                {isAr
                  ? 'سيتم حذف سجل هذه المناوبة بشكل نهائي من قاعدة البيانات، وسيتيح ذلك فتح وردية جديدة في حال كانت المناوبة مفتوحة. يُسجّل هذا الإجراء فوراً في السجل الرقابي للمدير العام.'
                  : 'This shift record will be permanently deleted from the database and audit trail will record this action.'}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={handleConfirmShiftDeletion}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 transition-all cursor-pointer active:scale-95"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isAr ? 'تأكيد الحذف النهائي للمناوبة' : 'Confirm Shift Deletion'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShiftToDelete(null)}
                className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs transition-colors cursor-pointer"
              >
                {isAr ? 'إلغاء والتراجع' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {deleteToastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-slate-900 border-2 border-emerald-500/60 text-emerald-300 font-bold text-xs shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{deleteToastMessage}</span>
        </div>
      )}

      {/* General Operational Charter & Bylaws Modal (بدون أسماء) */}
      {isCharterModalOpen && (
        <ManagerOperationalCharterModal
          lang={lang}
          onClose={() => setIsCharterModalOpen(false)}
        />
      )}

      {/* 14. COMPREHENSIVE MEMBER PROFILE & HISTORY MODAL (GM EXCLUSIVE) */}
      {isMemberDetailModalOpen && selectedMemberDetail && (
        <MemberProfileModal
          member={selectedMemberDetail}
          isOpen={isMemberDetailModalOpen}
          onClose={() => setIsMemberDetailModalOpen(false)}
          currentUser={currentUser}
          lang={lang}
          onMemberUpdated={refreshAllData}
          activeShift={shifts.find(s => s.status === 'open')}
        />
      )}

      {/* SHIFT TRANSACTIONS & AUDIT INSPECTOR MODAL (معاينة عمليات الوردية وحذف السندات للمدير العام) */}
      {selectedShiftForInspect && (() => {
        const shiftTxs = transactions.filter(t => t.shiftId === selectedShiftForInspect.id);
        const shiftIncome = shiftTxs.filter(t => (t.voucherKind || (t.type === 'expense' ? 'payment' : 'receipt')) === 'receipt').reduce((acc, t) => acc + t.amount, 0);
        const shiftExpense = shiftTxs.filter(t => (t.voucherKind || (t.type === 'expense' ? 'payment' : 'receipt')) === 'payment').reduce((acc, t) => acc + t.amount, 0);
        const isOpen = selectedShiftForInspect.status === 'open';

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in">
            <div className="w-full max-w-4xl max-h-[calc(100dvh-2rem)] sm:max-h-[88vh] flex flex-col rounded-3xl bg-[#0c101a] border-2 border-amber-500/50 text-slate-100 shadow-2xl relative text-right rtl:text-right ltr:text-left overflow-hidden my-auto">
              {/* Header */}
              <div className="p-5 pb-3.5 border-b border-slate-800 shrink-0 bg-[#070a12] flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-[#f7cb55] flex items-center justify-center font-black border border-amber-500/40 shadow-lg shadow-amber-500/20 shrink-0">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 font-bold uppercase">
                        {isAr ? 'رقابة وحسابات المناوبة' : 'Shift Audit'}
                      </span>
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-black border ${
                        isOpen ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        {isOpen ? (isAr ? '🟢 مناوبة نشطة مفتوحة' : 'ACTIVE OPEN') : (isAr ? '🔒 مناوبة مغلقة ومرحلة' : 'CLOSED')}
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-white mt-0.5">
                      {isAr ? `معاينة وردية الموظف: ${selectedShiftForInspect.staffName}` : `Shift Details: ${selectedShiftForInspect.staffName}`}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                      {isAr ? 'تاريخ الفتح:' : 'Opened:'} {selectedShiftForInspect.openedAt}
                      {selectedShiftForInspect.closedAt && ` • ${isAr ? 'تاريخ الإغلاق:' : 'Closed:'} ${selectedShiftForInspect.closedAt}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      audioAlertService.playSuccess();
                      pdfPrintService.printShiftReportPDF(selectedShiftForInspect, transactions);
                    }}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
                    title={isAr ? 'طباعة تقرير الوردية PDF' : 'Print Shift PDF'}
                  >
                    <Printer className="w-4 h-4" />
                    <span className="hidden sm:inline">{isAr ? 'طباعة التقرير' : 'Print PDF'}</span>
                  </button>

                  {!isViewer && (
                    <button
                      onClick={() => handleInitiateDeleteShift(selectedShiftForInspect)}
                      className="p-2 rounded-xl bg-rose-500/20 hover:bg-rose-600 hover:text-white text-rose-300 border border-rose-500/40 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-black shadow-sm"
                      title={isAr ? 'حذف سجل المناوبة بالكامل' : 'Delete Shift'}
                    >
                      <Trash2 className="w-4 h-4 text-rose-400 group-hover:text-white" />
                      <span className="hidden sm:inline">{isAr ? 'حذف الوردية' : 'Delete Shift'}</span>
                    </button>
                  )}

                  <button
                    onClick={() => setSelectedShiftForInspect(null)}
                    className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Stats Bar - Grouped Summary */}
              {(() => {
                const isExp = (t: FinancialTransaction) => t.voucherKind === 'payment' || ['expense', 'refund'].includes(t.type);
                const isSub = (t: FinancialTransaction) => {
                  if (isExp(t)) return false;
                  if (['subscription', 'renewal', 'pt_package', 'locker'].includes(t.type)) return true;
                  const n = ((t.notes || '') + ' ' + (t.memberName || '')).toLowerCase();
                  return n.includes('vip') || n.includes('اشتراك') || n.includes('باقة') || n.includes('ذهبي') || n.includes('عضوية') || n.includes('سنوي') || n.includes('شهري') || n.includes('تجديد') || n.includes('تدريب') || n.includes('pt') || n.includes('خزائن') || n.includes('locker');
                };

                const subsTxs = shiftTxs.filter(t => !isExp(t) && isSub(t));
                const salesTxs = shiftTxs.filter(t => !isExp(t) && !isSub(t));
                const expsTxs = shiftTxs.filter(t => isExp(t));

                const subTotal = subsTxs.reduce((acc, t) => acc + t.amount, 0);
                const barTotal = salesTxs.reduce((acc, t) => acc + t.amount, 0);
                const expTotal = expsTxs.reduce((acc, t) => acc + t.amount, 0);
                const startCash = selectedShiftForInspect.startingCash || 0;
                const netExpectedCash = startCash + subTotal + barTotal - expTotal;

                return (
                  <div className="p-4 bg-[#080b14] border-b border-slate-800/80 grid grid-cols-2 sm:grid-cols-6 gap-2.5 text-center text-xs shrink-0">
                    <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">{isAr ? 'رصيد الفكة' : 'Float'}</span>
                      <strong className="text-white font-mono font-black text-xs">{startCash.toLocaleString()} ج</strong>
                    </div>
                    <div className="bg-slate-950/80 p-2.5 rounded-xl border border-sky-500/20">
                      <span className="text-[10px] text-sky-400 block">{isAr ? 'قسم الاشتراكات' : 'Subscriptions'}</span>
                      <strong className="text-sky-400 font-mono font-black text-xs">{subTotal.toLocaleString()} ج</strong>
                    </div>
                    <div className="bg-slate-950/80 p-2.5 rounded-xl border border-amber-500/20">
                      <span className="text-[10px] text-amber-400 block">{isAr ? 'قسم مبيعات البار' : 'Bar Sales'}</span>
                      <strong className="text-amber-400 font-mono font-black text-xs">{barTotal.toLocaleString()} ج</strong>
                    </div>
                    <div className="bg-slate-950/80 p-2.5 rounded-xl border border-rose-500/20">
                      <span className="text-[10px] text-rose-400 block">{isAr ? 'المصروفات' : 'Expenses'}</span>
                      <strong className="text-rose-400 font-mono font-black text-xs">{expTotal.toLocaleString()} ج</strong>
                    </div>
                    <div className="bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/30">
                      <span className="text-[10px] text-emerald-400 block">{isAr ? 'الصافي المفروض بالخزنة' : 'Expected in Treasury'}</span>
                      <strong className="text-emerald-400 font-mono font-black text-xs">{netExpectedCash.toLocaleString()} ج</strong>
                    </div>
                    <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-700">
                      <span className="text-[10px] text-slate-300 block">{isAr ? 'الدرج الفعلي' : 'Actual'}</span>
                      <strong className="text-slate-100 font-mono font-black text-xs">{(selectedShiftForInspect.actualCash || 0).toLocaleString()} ج</strong>
                    </div>
                  </div>
                );
              })()}

              {/* Transactions in Shift - Grouped */}
              <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 space-y-6">
                {(() => {
                  if (shiftTxs.length === 0) {
                    return (
                      <div className="p-12 text-center bg-slate-950/60 rounded-2xl border border-dashed border-slate-800 text-slate-400 text-xs">
                        {isAr ? 'لا توجد أي سندات مالية أو عمليات مسجلة في هذه الوردية' : 'No transactions recorded in this shift'}
                      </div>
                    );
                  }

                  const isExp = (t: FinancialTransaction) => t.voucherKind === 'payment' || ['expense', 'refund'].includes(t.type);
                  const isSub = (t: FinancialTransaction) => {
                    if (isExp(t)) return false;
                    if (['subscription', 'renewal', 'pt_package', 'locker'].includes(t.type)) return true;
                    const n = ((t.notes || '') + ' ' + (t.memberName || '')).toLowerCase();
                    return n.includes('vip') || n.includes('اشتراك') || n.includes('باقة') || n.includes('ذهبي') || n.includes('عضوية') || n.includes('سنوي') || n.includes('شهري') || n.includes('تجديد') || n.includes('تدريب') || n.includes('pt') || n.includes('خزائن') || n.includes('locker');
                  };

                  const subs = shiftTxs.filter(t => !isExp(t) && isSub(t));
                  const sales = shiftTxs.filter(t => !isExp(t) && !isSub(t));
                  const exps = shiftTxs.filter(t => isExp(t));

                  const renderShiftTable = (title: string, txs: typeof shiftTxs, colorClass: string, headerBg: string) => {
                    if (txs.length === 0) return null;
                    let rowCounter = 0;

                    return (
                      <div className="space-y-3 bg-[#0d1322] rounded-3xl border border-slate-800/80 overflow-hidden shadow-xl">
                        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800" style={{ background: `${headerBg}15` }}>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl flex items-center justify-center font-black" style={{ background: headerBg, color: '#000' }}>
                              <Receipt className="w-4 h-4" />
                            </div>
                            <h4 className={`text-sm font-black ${colorClass}`}>{title}</h4>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] px-2.5 py-1 rounded-xl bg-slate-800 text-slate-400 font-bold border border-slate-700">
                              {txs.length} {isAr ? 'حركة' : 'txs'}
                            </span>
                            <span className={`text-xs font-black font-mono ${colorClass}`}>
                              {isAr ? 'إجمالي القسم:' : 'Total:'} {txs.reduce((s, t) => s + t.amount, 0).toLocaleString()} ج.م
                            </span>
                          </div>
                        </div>
                        <div className="p-2 sm:p-3 overflow-x-auto">
                          <table className="w-full text-right rtl:text-right ltr:text-left text-xs min-w-[800px]">
                            <thead className="bg-[#070a12] text-slate-400 font-bold border-b border-slate-800">
                              <tr>
                                <th className="p-3 w-10">#</th>
                                <th className="p-3 w-32">{isAr ? 'رقم السند' : 'Voucher #'}</th>
                                <th className="p-3">{isAr ? 'الطرف / العضو' : 'Party / Member'}</th>
                                <th className="p-3">{isAr ? 'البيان والتفاصيل' : 'Details'}</th>
                                <th className="p-3 text-center w-24">{isAr ? 'الوسيلة' : 'Method'}</th>
                                <th className="p-3 w-28">{isAr ? 'المبلغ' : 'Amount'}</th>
                                <th className="p-3 w-40">{isAr ? 'التاريخ والمسؤول' : 'Date / Cashier'}</th>
                                <th className="p-3 text-center w-24">{isAr ? 'إجراءات' : 'Actions'}</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60 bg-[#0a0e1a]">
                              {txs.map((tx) => {
                                rowCounter++;
                                const isE = (tx.voucherKind || (tx.type === 'expense' ? 'payment' : 'receipt')) === 'payment';
                                const seq = tx.voucherSequenceNumber || '-';
                                
                                const itemName = (() => {
                                  if (tx.notes && tx.notes.trim()) {
                                    let n = tx.notes.trim();
                                    if (n.startsWith('فاتورة خدمات ومنتجات: ')) {
                                      return <span>🛒 {n.replace('فاتورة خدمات ومنتجات: ', '')}</span>;
                                    }
                                    return <span>{n}</span>;
                                  }
                                  const labels: any = {
                                    subscription: isAr ? 'اشتراك جديد' : 'New Sub',
                                    renewal: isAr ? 'تجديد اشتراك' : 'Renewal',
                                    pt_package: isAr ? 'تدريب خاص PT' : 'PT',
                                    product_sale: isAr ? 'مبيعات بار' : 'Bar Sale',
                                    expense: isAr ? 'مصروفات' : 'Expense',
                                    locker: isAr ? 'خزائن' : 'Locker'
                                  };
                                  return <span>{labels[tx.type] || tx.type}</span>;
                                })();

                                return (
                                  <tr key={tx.id} className="hover:bg-slate-900/40 transition-colors">
                                    <td className="p-3 font-bold text-slate-600">{rowCounter}</td>
                                    <td className="p-3">
                                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-black border ${
                                        isE ? 'bg-rose-950/80 text-rose-300 border-rose-500/40' : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                                      }`}>
                                        {isE ? `صرف #${seq}` : `قبض #${seq}`}
                                      </span>
                                    </td>
                                    <td className="p-3 font-bold text-white">
                                      <div>{tx.memberName || tx.beneficiaryName || '---'}</div>
                                      {tx.membershipNumber && <div className="text-[9px] text-slate-500 font-mono">#{tx.membershipNumber}</div>}
                                    </td>
                                    <td className="p-3 text-slate-300">{itemName}</td>
                                    <td className="p-3 text-center text-slate-400 font-bold uppercase">{tx.paymentMethod}</td>
                                    <td className={`p-3 font-black font-mono ${isE ? 'text-rose-400' : 'text-emerald-400'}`}>
                                      {tx.amount.toLocaleString()} ج.م
                                    </td>
                                    <td className="p-3 text-slate-500 text-[10px]">
                                      <div>{tx.date.split(' ')[1]}</div>
                                      <div className="truncate max-w-[100px]">{tx.recordedBy}</div>
                                    </td>
                                    <td className="p-3 text-center">
                                      <div className="flex items-center justify-center gap-1">
                                        <button onClick={() => pdfPrintService.printSingleVoucherPDF(tx)} className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 hover:bg-amber-500/20"><Printer className="w-3.5 h-3.5" /></button>
                                        {!isViewer && <button onClick={() => handleDeleteTransactionInShift(tx)} className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"><Trash2 className="w-3.5 h-3.5" /></button>}
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  };

                  return (
                    <>
                      {renderShiftTable(isAr ? 'قسم الاشتراكات' : 'Subscriptions Department', subs, 'text-sky-400', '#0ea5e9')}
                      {renderShiftTable(isAr ? 'قسم مبيعات البار' : 'Bar Sales Department', sales, 'text-amber-400', '#f59e0b')}
                      {renderShiftTable(isAr ? 'قسم المصروفات' : 'Expenses Department', exps, 'text-rose-400', '#e11d48')}
                    </>
                  );
                })()}
              </div>

              {/* Sticky Footer */}
              <div className="p-4 px-6 bg-[#070a12] border-t-2 border-slate-800 shrink-0 flex items-center justify-between gap-3 z-30">
                <div className="flex items-center gap-2">
                  {isOpen && !isViewer && (
                    <button
                      onClick={() => handleCloseShiftByManager(selectedShiftForInspect)}
                      className="px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-lg transition-all"
                    >
                      <Power className="w-4 h-4" />
                      <span>{isAr ? '🔴 إغلاق الوردية نيابة عن الموظف' : 'Close Shift'}</span>
                    </button>
                  )}

                  {!isViewer && (
                    <button
                      onClick={() => handleInitiateDeleteShift(selectedShiftForInspect)}
                      className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs flex items-center gap-2 cursor-pointer transition-all shadow-lg shadow-rose-600/30 active:scale-95"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>{isAr ? '🗑️ حذف سجل الوردية نهائياً' : 'Delete Shift'}</span>
                    </button>
                  )}
                </div>

                <button
                  onClick={() => setSelectedShiftForInspect(null)}
                  className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  {isAr ? 'إغلاق' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        );
      })()}
      {/* EXTEND SUBSCRIPTION END DATE MODAL */}
      <ExtendSubscriptionModal
        member={selectedExtendMemberModal}
        isOpen={!!selectedExtendMemberModal}
        onClose={() => setSelectedExtendMemberModal(null)}
        currentUser={currentUser}
        lang={lang}
        onSuccess={() => {
          refreshAllData();
          if (selectedMemberDetail && selectedExtendMemberModal && selectedMemberDetail.id === selectedExtendMemberModal.id) {
            const updated = StorageService.getMembers().find(m => m.id === selectedMemberDetail.id);
            if (updated) setSelectedMemberDetail(updated);
          }
        }}
      />

      {/* DELETE SHIFT VOUCHER IN-APP MODAL */}
      <DeleteVoucherModal
        isOpen={!!shiftVoucherToDelete}
        transaction={shiftVoucherToDelete}
        onClose={() => setShiftVoucherToDelete(null)}
        onConfirmDelete={handleConfirmDeleteShiftVoucher}
        lang={lang}
        managerName={currentUser.nameAr || 'المدير العام'}
      />
      {/* CLOSE SHIFT BY MANAGER MODAL */}
      {shiftToCloseByManager && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#0c101a] border-2 border-rose-500/50 rounded-3xl p-6 shadow-2xl relative text-slate-100 text-right rtl:text-right ltr:text-left">
            <button
              onClick={() => setShiftVoucherToCloseByManager(null)}
              className="absolute top-4 left-4 rtl:left-4 rtl:right-auto ltr:right-4 ltr:left-auto p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/60 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold border border-rose-500/30">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">
                  {isAr ? 'إغلاق الوردية (صلاحية المدير)' : 'Force Close Shift (Manager)'}
                </h3>
                <span className="text-xs text-slate-400">
                  {isAr ? `إغلاق وردية الموظف: ${shiftToCloseByManager.staffName}` : `Closing shift for: ${shiftToCloseByManager.staffName}`}
                </span>
              </div>
            </div>

            <form onSubmit={confirmCloseShiftByManager} className="space-y-5">
              <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">{isAr ? 'الرصيد المتوقع:' : 'Expected Cash:'}</span>
                  <strong className="text-emerald-400 font-mono text-sm">{shiftToCloseByManager.expectedCash?.toLocaleString()} ج.م</strong>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  {isAr ? 'أدخل إجمالي النقدية الفعلية (للمطابقة):' : 'Enter Actual Cash:'}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    min="0"
                    value={closeShiftAmountByManager}
                    onChange={(e) => setCloseShiftAmountByManager(e.target.value)}
                    className="w-full bg-[#050810] border-2 border-rose-500/40 rounded-xl p-4 pr-12 text-xl font-mono font-black text-white focus:border-rose-500 focus:outline-none"
                    placeholder="0"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">ج.م</span>
                </div>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[10px] text-amber-200/80 leading-relaxed font-bold">
                  {isAr 
                    ? 'بصفتك مديراً، يمكنك إغلاق الوردية نيابة عن الموظف. سيتم تسجيل هذا الإجراء في سجل الرقابة.' 
                    : 'As Manager, you are closing this shift on behalf of the employee. This action is logged.'}
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-xl bg-gradient-to-r from-rose-500 to-rose-700 hover:from-rose-400 hover:to-rose-600 text-white font-black text-sm transition-all shadow-xl shadow-rose-500/20 active:scale-95 cursor-pointer"
              >
                {isAr ? '🔴 إغلاق الوردية فورياً' : 'Close Shift Now'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

function DumbbellIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 5v14M18 5v14M4 8h4M4 16h4M16 8h4M16 16h4M8 12h8" />
    </svg>
  );
}
