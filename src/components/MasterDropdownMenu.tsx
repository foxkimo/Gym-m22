import React, { useRef, useEffect } from 'react';
import { 
  X, 
  User, 
  Dumbbell, 
  History, 
  QrCode, 
  Timer, 
  ShieldCheck, 
  Users, 
  DollarSign, 
  BarChart3, 
  Download, 
  Globe, 
  RotateCcw, 
  Crown, 
  Briefcase, 
  ChevronRight,
  Sparkles,
  Search,
  CheckCircle2,
  Clock,
  Printer,
  Receipt,
  Lock,
  ArrowRight,
  TrendingUp,
  FileSpreadsheet,
  UserCheck,
  Smartphone,
  Apple,
  Trash2,
  FileText,
  CreditCard,
  Percent,
  Wallet,
  LogIn,
  LogOut,
  ShieldAlert,
  Sun,
  Moon,
  BookOpen,
  Film
} from 'lucide-react';
import { AppRole, CurrentUser, GymMember } from '../types/gym';
import { audioAlertService } from '../services/audioService';
import { GymLogo } from './GymLogo';

interface MasterDropdownMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: CurrentUser;
  onSwitchRole?: (role: AppRole) => void;
  onNavigate: (view: any) => void;
  onNavigateToGMSection: (section: 'accounts' | 'permissions' | 'security_alerts' | 'shifts' | 'attendance' | 'reports' | 'activity_logs' | 'report_archive' | 'recycle_bin' | 'account_mods' | 'general_ledger' | 'exercise_video_library' | 'membership_plans' | 'member_checkins') => void;
  onOpenCard: () => void;
  onOpenTimer: () => void;
  onOpenInstallModal: () => void;
  onResetData: () => void;
  onToggleLang: () => void;
  lang: 'ar' | 'en';
  activeMember?: GymMember | null;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
  onOpenContract?: () => void;
}

export const MasterDropdownMenu: React.FC<MasterDropdownMenuProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSwitchRole,
  onNavigate,
  onNavigateToGMSection,
  onOpenCard,
  onOpenTimer,
  onOpenInstallModal,
  onResetData,
  onToggleLang,
  lang,
  activeMember,
  theme = 'dark',
  onToggleTheme,
  onOpenContract
}) => {
  const isAr = lang === 'ar';
  const role = currentUser.role;
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleAction = (action: () => void) => {
    audioAlertService.playBeep(880, 0.05);
    action();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-start rtl:justify-start ltr:justify-end animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div 
        ref={drawerRef}
        className="relative w-full max-w-sm sm:max-w-md h-full bg-[#080b12] border-r rtl:border-r ltr:border-l border-slate-800/90 text-slate-100 shadow-2xl flex flex-col z-10 overflow-hidden"
        dir={isAr ? 'rtl' : 'ltr'}
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-800/80 bg-gradient-to-b from-[#0e1320] to-[#080b12] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GymLogo size="md" showText={false} />
            <div>
              <h2 className="font-black text-white text-base tracking-wide flex items-center gap-1.5">
                <span>GYM-M22</span>
                <Sparkles className="w-3.5 h-3.5 text-[#f7cb55]" />
              </h2>
              <p className="text-[11px] text-slate-400">
                {isAr ? 'القائمة الرئيسية ولوحة التحكم' : 'Master System Menu'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Active Logged-In Account Info */}
        <div className="p-4 bg-slate-950/80 border-b border-slate-800/80">
          <div className="flex items-center justify-between gap-3 p-3 bg-[#0a0e17] rounded-2xl border border-slate-800/90">
            <div className="flex items-center gap-2.5">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                role === 'manager' 
                  ? 'bg-amber-500/20 text-[#f7cb55] border border-amber-500/40' 
                  : role === 'accountant'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : role === 'staff'
                  ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
                  : role === 'coach'
                  ? 'bg-amber-600/20 text-amber-400 border border-amber-600/40'
                  : 'bg-purple-500/20 text-purple-400 border border-purple-500/40'
              }`}>
                {role === 'manager' && <Crown className="w-4 h-4" />}
                {role === 'accountant' && <Wallet className="w-4 h-4" />}
                {role === 'staff' && <Users className="w-4 h-4" />}
                {role === 'coach' && <Dumbbell className="w-4 h-4" />}
                {role === 'member' && <User className="w-4 h-4" />}
              </div>

              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">
                  {isAr ? 'المستخدم المسجل حالياً' : 'Active Account'}
                </span>
                <strong className="text-xs text-white font-bold block">
                  {currentUser.nameAr}
                </strong>
              </div>
            </div>

            <span className={`px-2.5 py-1 rounded-xl text-[10px] font-bold ${
              role === 'manager' 
                ? 'bg-amber-500/20 text-[#f7cb55] border border-amber-500/30' 
                : role === 'accountant'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : role === 'staff'
                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                : role === 'coach'
                ? 'bg-amber-600/20 text-amber-400 border border-amber-600/30'
                : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
            }`}>
              {role === 'manager' ? (isAr ? 'المدير العام' : 'Manager') :
               role === 'accountant' ? (isAr ? 'مسؤول حسابات' : 'Accountant') :
               role === 'staff' ? (isAr ? 'موظف استقبال' : 'Staff') :
               role === 'coach' ? (isAr ? 'كابتن ومدرب' : 'Coach') : (isAr ? 'مشترك بالنادي' : 'Member')}
            </span>
          </div>
        </div>

        {/* Employment Contract Quick Link for Staff / Coaches / Accountants */}
        {role && role !== 'member' && onOpenContract && (
          <div className="px-4 pb-2 pt-1 border-b border-slate-850">
            <button
              onClick={() => handleAction(onOpenContract)}
              className="w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/15 to-amber-600/10 hover:from-amber-500/20 hover:to-amber-600/20 text-amber-400 font-bold text-xs transition-all border border-amber-500/30 flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[#f7cb55]" />
                <span>{isAr ? '📄 عقد العمل والراتب المعتمد' : 'My Employment Contract'}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-amber-500/60 rtl:rotate-180 group-hover:text-amber-400" />
            </button>
          </div>
        )}

        {/* Scrollable Navigation Sections Strictly Based on Role */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* ================= 1. MEMBER ONLY SECTIONS ================= */}
          {role === 'member' && (
            <div className="space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-purple-400 px-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                <span>{isAr ? 'بوابة المشترك وعضويتي' : 'Member Portal'}</span>
              </div>

              <button
                onClick={() => handleAction(() => onNavigate('member'))}
                className="w-full p-3 rounded-2xl bg-[#0c101a] border border-slate-800/80 hover:border-slate-700 text-right flex items-center justify-between group transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-xs text-slate-200 group-hover:text-white block">
                      {isAr ? 'اشتراكي وتفاصيل باقتي' : 'My Subscription Details'}
                    </strong>
                    <span className="text-[10px] text-slate-500">{isAr ? 'الباقة، الصلاحية، وحالة العضوية' : 'Tier, validity & membership status'}</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600 rtl:rotate-180" />
              </button>

              <button
                onClick={() => handleAction(() => onNavigate('workout'))}
                className="w-full p-3 rounded-2xl bg-[#0c101a] border border-slate-800/80 hover:border-slate-700 text-right flex items-center justify-between group transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-[#f7cb55] flex items-center justify-center">
                    <Dumbbell className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-xs text-slate-200 group-hover:text-white block">
                      {isAr ? 'جدول تماريني وتوثيق الأوزان' : 'My Daily Workout Routine'}
                    </strong>
                    <span className="text-[10px] text-slate-500">{isAr ? 'تسجيل المجموعات والعدات والملاحظات' : 'Log sets and reps'}</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600 rtl:rotate-180" />
              </button>

              <button
                onClick={() => handleAction(() => onNavigate('history'))}
                className="w-full p-3 rounded-2xl bg-[#0c101a] border border-slate-800/80 hover:border-slate-700 text-right flex items-center justify-between group transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <History className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-xs text-slate-200 group-hover:text-white block">
                      {isAr ? 'سجل تماريني وتطوري البدني' : 'My Workout History & Log'}
                    </strong>
                    <span className="text-[10px] text-slate-500">{isAr ? 'استعراض التمارين السابقة' : 'Past sessions history'}</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600 rtl:rotate-180" />
              </button>

              <button
                onClick={() => handleAction(onOpenCard)}
                className="w-full p-3 rounded-2xl bg-[#0c101a] border border-slate-800/80 hover:border-slate-700 text-right flex items-center justify-between group transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-xs text-slate-200 group-hover:text-white block">
                      {isAr ? 'بطاقة الدخول الذكية QR Pass' : 'My Smart Pass QR'}
                    </strong>
                    <span className="text-[10px] text-slate-500">{isAr ? 'تسجيل الحضور الإلكتروني عند البوابة' : 'Gate check-in card'}</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600 rtl:rotate-180" />
              </button>

              <button
                onClick={() => handleAction(onOpenTimer)}
                className="w-full p-3 rounded-2xl bg-[#0c101a] border border-slate-800/80 hover:border-slate-700 text-right flex items-center justify-between group transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <Timer className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-xs text-slate-200 group-hover:text-white block">
                      {isAr ? 'مؤقت الراحة بين المجموعات' : 'Rest Timer'}
                    </strong>
                    <span className="text-[10px] text-slate-500">{isAr ? 'تنبيهات صوتية للراحة' : 'Rest interval alerts'}</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600 rtl:rotate-180" />
              </button>
            </div>
          )}

          {/* ================= 2. RECEPTION STAFF SECTIONS ================= */}
          {role === 'staff' && (
            <div className="space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-sky-400 px-1 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                <span>{isAr ? 'مهام الاستقبال والأعضاء' : 'Front Desk Tasks'}</span>
              </div>

              <button
                onClick={() => handleAction(() => onNavigate('lookup'))}
                className="w-full p-3 rounded-2xl bg-[#0c101a] border border-slate-800/80 hover:border-slate-700 text-right flex items-center justify-between group transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
                    <Search className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-xs text-slate-200 group-hover:text-white block">
                      {isAr ? 'استعلام وحسابات العملاء والمشتركين' : 'Customer Accounts & Lookup'}
                    </strong>
                    <span className="text-[10px] text-slate-500">{isAr ? 'البحث بالهاتف، الاشتراكات، والمدفوعات' : 'Search, subscriptions & dues'}</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600 rtl:rotate-180" />
              </button>

              <button
                onClick={() => handleAction(() => onNavigate('admin'))}
                className="w-full p-3 rounded-2xl bg-[#0c101a] border border-slate-800/80 hover:border-slate-700 text-right flex items-center justify-between group transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-xs text-slate-200 group-hover:text-white block">
                      {isAr ? 'المناوبات والورديات واستلام الخزينة' : 'Shifts & Cash Registers'}
                    </strong>
                    <span className="text-[10px] text-slate-500">{isAr ? 'فتح وإغلاق الشيفت واستلام الدرج' : 'Shift opening & cash handoff'}</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600 rtl:rotate-180" />
              </button>

              <button
                onClick={() => handleAction(onOpenCard)}
                className="w-full p-3 rounded-2xl bg-[#0c101a] border border-slate-800/80 hover:border-slate-700 text-right flex items-center justify-between group transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-xs text-slate-200 group-hover:text-white block">
                      {isAr ? 'إصدار وتمرير بطاقة الدخول QR' : 'Issue Member Pass QR'}
                    </strong>
                    <span className="text-[10px] text-slate-500">{isAr ? 'تمرير بطاقة الحضور بالبوابة' : 'Gate attendance scan'}</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600 rtl:rotate-180" />
              </button>
            </div>
          )}

          {/* ================= 3. ACCOUNTANT SECTIONS ================= */}
          {role === 'accountant' && (
            <div className="space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 px-1 flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5" />
                <span>{isAr ? 'الإدارة المالية والمحاسبة' : 'Finance & Accounting'}</span>
              </div>

              <button
                onClick={() => handleAction(() => onNavigate('accountant'))}
                className="w-full p-3 rounded-2xl bg-[#0c101a] border border-slate-800/80 hover:border-slate-700 text-right flex items-center justify-between group transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-xs text-slate-200 group-hover:text-white block">
                      {isAr ? 'أجور ورواتب الموظفين والكباتن' : 'Staff & Coach Payroll'}
                    </strong>
                    <span className="text-[10px] text-slate-500">{isAr ? 'مسيرات الرواتب الشهرية والبدلات' : 'Monthly payroll roster'}</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600 rtl:rotate-180" />
              </button>

              <button
                onClick={() => handleAction(() => onNavigate('accountant'))}
                className="w-full p-3 rounded-2xl bg-[#0c101a] border border-slate-800/80 hover:border-slate-700 text-right flex items-center justify-between group transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <Percent className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-xs text-slate-200 group-hover:text-white block">
                      {isAr ? 'نسب الكباتن والتدريب الخاص PT' : 'Coach Commissions & PT'}
                    </strong>
                    <span className="text-[10px] text-slate-500">{isAr ? 'احتساب نسب ومستحقات الكباتن' : 'Calculate coach commissions'}</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600 rtl:rotate-180" />
              </button>

              <button
                onClick={() => handleAction(() => onNavigate('accountant'))}
                className="w-full p-3 rounded-2xl bg-[#0c101a] border border-slate-800/80 hover:border-slate-700 text-right flex items-center justify-between group transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-xs text-slate-200 group-hover:text-white block">
                      {isAr ? 'السندات والقيود والتقارير المالية' : 'Vouchers & Financial Balance'}
                    </strong>
                    <span className="text-[10px] text-slate-500">{isAr ? 'سندات القبض والصرف والأرباح' : 'Income, expense, profit'}</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600 rtl:rotate-180" />
              </button>
            </div>
          )}

          {/* ================= 4. COACH SECTIONS ================= */}
          {role === 'coach' && (
            <div className="space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400 px-1 flex items-center gap-1.5">
                <Dumbbell className="w-3.5 h-3.5" />
                <span>{isAr ? 'بوابة الكباتن والتدريب' : 'Coach Portal'}</span>
              </div>

              <button
                onClick={() => handleAction(() => onNavigate('coach'))}
                className="w-full p-3 rounded-2xl bg-[#0c101a] border border-slate-800/80 hover:border-slate-700 text-right flex items-center justify-between group transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-[#f7cb55] flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-xs text-slate-200 group-hover:text-white block">
                      {isAr ? 'قائمة المتدربين والبرامج التدريبية' : 'My Trainees & Programs'}
                    </strong>
                    <span className="text-[10px] text-slate-500">{isAr ? 'متابعة أداء وحضور المتدربين' : 'Track athlete progress'}</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600 rtl:rotate-180" />
              </button>

              <button
                onClick={() => handleAction(() => onNavigate('workout'))}
                className="w-full p-3 rounded-2xl bg-[#0c101a] border border-slate-800/80 hover:border-slate-700 text-right flex items-center justify-between group transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
                    <Dumbbell className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-xs text-slate-200 group-hover:text-white block">
                      {isAr ? 'جدول التمارين وبناء الحصص' : 'Workout Day Builder'}
                    </strong>
                    <span className="text-[10px] text-slate-500">{isAr ? 'استعراض التمارين والتعليمات' : 'View exercises & sets'}</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600 rtl:rotate-180" />
              </button>
            </div>
          )}

          {/* ================= 5. GENERAL MANAGER FULL ACCESS ================= */}
          {role === 'manager' && (
            <>
              {/* Executive Central & Audit */}
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#f7cb55] mb-2 px-1 flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5 text-[#f7cb55]" />
                  <span>{isAr ? 'لوحة تحكم ورقابة المدير العام' : 'General Manager Executive'}</span>
                </div>

                <div className="space-y-1.5">
                  <button
                    onClick={() => handleAction(() => onNavigate('manager'))}
                    className="w-full p-3 rounded-2xl bg-amber-500/10 border border-[#e5a91b]/40 text-right flex items-center justify-between group transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-[#f7cb55]/20 text-[#f7cb55] flex items-center justify-center">
                        <Crown className="w-4 h-4" />
                      </div>
                      <div>
                        <strong className="text-xs text-white block">
                          {isAr ? 'لوحة الإدارة المركزية والرقابة العامة' : 'Central Executive Dashboard'}
                        </strong>
                        <span className="text-[10px] text-amber-300/80">{isAr ? 'إدارة الموظفين، الورديات، والتقارير' : 'Staff, shifts, attendance'}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-amber-400 rtl:rotate-180" />
                  </button>

                  <button
                    onClick={() => handleAction(() => onNavigateToGMSection('permissions'))}
                    className="w-full p-3 rounded-2xl bg-purple-950/20 border border-purple-500/40 text-right flex items-center justify-between group transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <strong className="text-xs text-white block">
                          {isAr ? '🛡️ مصفوفة الأذونات والمهام التشغيلية للموظفين' : 'Permissions Matrix & Operational Tasks'}
                        </strong>
                        <span className="text-[10px] text-purple-300/80">{isAr ? 'تخصيص أذونات الرتب وإسناد التكليفات والمهام' : 'Manage role permissions & daily tasks'}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-purple-400 rtl:rotate-180" />
                  </button>

                  <button
                    onClick={() => handleAction(() => onNavigateToGMSection('exercise_video_library'))}
                    className="w-full p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-right flex items-center justify-between group transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-[#f7cb55] flex items-center justify-center">
                        <Film className="w-4 h-4" />
                      </div>
                      <div>
                        <strong className="text-xs text-white block">
                          {isAr ? 'مكتبة ومجلدات فيديوهات التمارين والأجهزة' : 'Exercise Video Folders & Stations'}
                        </strong>
                        <span className="text-[10px] text-amber-300/80">{isAr ? 'إضافة وتصنيف فيديوهات التمارين والأجهزة' : 'Exercise videos & machine stations'}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-amber-400 rtl:rotate-180" />
                  </button>

                  <button
                    onClick={() => handleAction(() => onNavigateToGMSection('membership_plans'))}
                    className="w-full p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-right flex items-center justify-between group transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-[#f7cb55] flex items-center justify-center">
                        <Percent className="w-4 h-4" />
                      </div>
                      <div>
                        <strong className="text-xs text-white block">
                          {isAr ? '💳 باقات وأسعار الاشتراكات والخصومات والمزايا' : 'Membership Plans, Pricing & Perks'}
                        </strong>
                        <span className="text-[10px] text-amber-300/80">{isAr ? 'تعديل الأسعار، إضافة مزايا وعروض خصومات' : 'Edit pricing, perks & discounts'}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-amber-400 rtl:rotate-180" />
                  </button>

                  <button
                    onClick={() => handleAction(() => onNavigateToGMSection('member_checkins'))}
                    className="w-full p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-right flex items-center justify-between group transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <UserCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <strong className="text-xs text-white block">
                          {isAr ? '📊 سجل دخول وحضور الأعضاء لحظة بلحظة' : 'Live Member Check-In Log'}
                        </strong>
                        <span className="text-[10px] text-emerald-300/80">{isAr ? 'متابعة وتوثيق دخول الأعضاء باليوم والوقت' : 'Real-time attendance & timestamps'}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-emerald-400 rtl:rotate-180" />
                  </button>

                  <button
                    onClick={() => handleAction(() => onNavigate('accountant'))}
                    className="w-full p-3 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 text-right flex items-center justify-between group transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <Wallet className="w-4 h-4" />
                      </div>
                      <div>
                        <strong className="text-xs text-white block">
                          {isAr ? 'المالية، الأجور ونسب الكباتن' : 'Financial Accounting & Payroll'}
                        </strong>
                        <span className="text-[10px] text-emerald-300/80">{isAr ? 'مراقبة الرواتب والنسب والسندات' : 'Payroll and commissions'}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-emerald-400 rtl:rotate-180" />
                  </button>

                  <button
                    onClick={() => handleAction(() => onNavigateToGMSection('security_alerts'))}
                    className="w-full p-3 rounded-2xl bg-rose-950/20 border border-rose-500/40 text-right flex items-center justify-between group transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                        <ShieldAlert className="w-4 h-4" />
                      </div>
                      <div>
                        <strong className="text-xs text-white block">
                          {isAr ? 'مركز الإشعارات والتنبيهات الأمنية' : 'Security Alerts & Failed Logins'}
                        </strong>
                        <span className="text-[10px] text-rose-300/80">{isAr ? 'محاولات الدخول الخاطئة وطلبات المساعدة' : 'Failed logins & help alerts'}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-rose-400 rtl:rotate-180" />
                  </button>

                  <button
                    onClick={() => handleAction(() => onNavigateToGMSection('activity_logs'))}
                    className="w-full p-3 rounded-2xl bg-[#0c101a] border border-slate-800/80 text-right flex items-center justify-between group transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                        <History className="w-4 h-4" />
                      </div>
                      <div>
                        <strong className="text-xs text-slate-200 block">
                          {isAr ? 'سجل الرقابة وحركات النظام الشامل' : 'Live System Audit Trail'}
                        </strong>
                        <span className="text-[10px] text-slate-500">{isAr ? 'تتبع فوري لكافة التعديلات + PDF' : 'Live audit logs'}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600 rtl:rotate-180" />
                  </button>

                  <button
                    onClick={() => handleAction(() => onNavigateToGMSection('recycle_bin'))}
                    className="w-full p-3 rounded-2xl bg-rose-950/20 border border-rose-500/30 text-right flex items-center justify-between group transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                        <Trash2 className="w-4 h-4" />
                      </div>
                      <div>
                        <strong className="text-xs text-white block">
                          {isAr ? 'سجل وسلة المحذوفات القابلة للاسترجاع' : 'Recycle Bin & Restore'}
                        </strong>
                        <span className="text-[10px] text-rose-300/80">{isAr ? 'استرجاع المحذوفات بأمان' : 'Restore deleted records'}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-rose-400 rtl:rotate-180" />
                  </button>

                  <button
                    onClick={() => handleAction(() => onNavigateToGMSection('attendance'))}
                    className="w-full p-3 rounded-2xl bg-cyan-950/30 border border-cyan-500/40 text-right flex items-center justify-between group transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                        <UserCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <strong className="text-xs text-white block">
                          {isAr ? 'سجل حضور ومستحقات الموظفين والساعات' : 'Staff Attendance & Hourly Wages'}
                        </strong>
                        <span className="text-[10px] text-cyan-300/80">{isAr ? 'حضور الموظفين وحساب الرواتب بالساعة' : 'Attendance & calculated hourly payout'}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-cyan-400 rtl:rotate-180" />
                  </button>

                  <button
                    onClick={() => handleAction(() => onNavigateToGMSection('general_ledger'))}
                    className="w-full p-3 rounded-2xl bg-amber-950/30 border border-amber-500/40 text-right flex items-center justify-between group transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div>
                        <strong className="text-xs text-white block">
                          {isAr ? 'دفتر الأستاذ العام المالي (حصري للمدير)' : 'General Ledger (GM Exclusive)'}
                        </strong>
                        <span className="text-[10px] text-amber-300/80">{isAr ? 'قيود الأستاذ المدين والدائن' : 'Debit/Credit bookkeeping'}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-amber-400 rtl:rotate-180" />
                  </button>
                </div>
              </div>
            </>
          )}

          {/* SECTION: APP UTILITIES & INSTALLATION */}
          <div className="pt-2 border-t border-slate-800/80">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-1 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" />
              <span>{isAr ? 'تثبيت التطبيق والإعدادات' : 'App Setup'}</span>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => handleAction(onOpenInstallModal)}
                className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-[#0e171b] to-[#0c1219] hover:from-emerald-900/50 hover:to-[#121c25] border border-emerald-500/40 text-right flex items-center justify-between transition-all group shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors block">
                      {isAr ? 'تثبيت وتحميل التطبيق للهاتف' : 'Install Gym App on Phone'}
                    </strong>
                    <span className="text-[10px] text-emerald-400/80 block mt-0.5">
                      {isAr ? 'أندرويد، Google Play، وآيفون' : 'Android & iPhone direct install'}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-emerald-400 rtl:rotate-180 transition-transform" />
              </button>

              <div className="grid grid-cols-2 gap-2">
                {/* Theme Switcher */}
                {onToggleTheme && (
                  <button
                    onClick={() => handleAction(onToggleTheme)}
                    className="p-3 rounded-2xl bg-[#0c0f17] border border-slate-800 hover:border-slate-700 text-xs font-bold text-slate-200 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {theme === 'dark' ? (
                      <>
                        <Sun className="w-4 h-4 text-amber-400" />
                        <span>{isAr ? 'النمط الفاتح' : 'Light Mode'}</span>
                      </>
                    ) : (
                      <>
                        <Moon className="w-4 h-4 text-indigo-400" />
                        <span>{isAr ? 'النمط الداكن' : 'Dark Mode'}</span>
                      </>
                    )}
                  </button>
                )}

                {/* Language Switch */}
                <button
                  onClick={() => handleAction(onToggleLang)}
                  className="p-3 rounded-2xl bg-[#0c0f17] border border-slate-800 hover:border-slate-700 text-xs font-bold text-slate-200 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Globe className="w-4 h-4 text-[#f7cb55]" />
                  <span>{isAr ? 'English' : 'العربية'}</span>
                </button>
              </div>

              {role === 'manager' && (
                <button
                  onClick={() => handleAction(onResetData)}
                  className="w-full mt-2 p-2.5 rounded-2xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-rose-400 flex items-center justify-center gap-2 cursor-pointer"
                  title={isAr ? 'استعادة البيانات الافتراضية' : 'Reset'}
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>{isAr ? 'استعادة بيانات النظام الأولية' : 'Reset Data'}</span>
                </button>
              )}

              {/* Logout Button */}
              <button
                onClick={() => handleAction(() => onNavigate('login'))}
                className="w-full mt-2.5 p-3 rounded-2xl bg-rose-950/35 hover:bg-rose-900/40 border border-rose-500/50 text-xs font-bold text-rose-300 flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-lg shadow-rose-950/30"
              >
                <LogOut className="w-4 h-4 text-rose-400" />
                <span>{isAr ? 'تسجيل الخروج (العودة لشاشة الدخول)' : 'Log Out (Return to Login)'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
