import React, { useState, useEffect } from 'react';
import { GymMember, CurrentUser, CashShift, EmployeeAccount } from '../types/gym';
import { StorageService } from '../services/storageService';
import { audioAlertService } from '../services/audioService';
import { pdfPrintService } from '../services/pdfPrintService';
import { RenewSubscriptionModal } from './RenewSubscriptionModal';
import { OpenShiftModal } from './OpenShiftModal';
import { MemberProfileModal } from './MemberProfileModal';
import { SettleDebtModal } from './SettleDebtModal';
import { 
  Search, 
  User, 
  CheckCircle2, 
  Calendar, 
  Dumbbell, 
  Phone, 
  QrCode, 
  ArrowRight, 
  ShieldAlert, 
  ShieldCheck,
  Sparkles, 
  FileText, 
  Printer, 
  RefreshCw, 
  Clock, 
  X,
  CreditCard,
  DollarSign,
  AlertTriangle,
  AlertCircle,
  Coins,
  Lock, 
  UserPlus, 
  UserCheck
} from 'lucide-react';

interface QuickMemberSelectorProps {
  onSelectMember: (member: GymMember) => void;
  activeMember: GymMember | null;
  onOpenCard: () => void;
  lang: 'ar' | 'en';
  currentUser?: CurrentUser;
}

export const QuickMemberSelector: React.FC<QuickMemberSelectorProps> = ({
  onSelectMember,
  activeMember,
  onOpenCard,
  lang,
  currentUser = { id: 'staff-1', nameAr: 'موظف الاستقبال', nameEn: 'Reception Staff', role: 'staff', phone: '' }
}) => {
  const isAr = lang === 'ar';
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expired' | 'vip' | 'debtors'>('all');
  const [members, setMembers] = useState<GymMember[]>([]);
  const [selectedRenewMember, setSelectedRenewMember] = useState<GymMember | null>(null);
  const [selectedSettleMember, setSelectedSettleMember] = useState<GymMember | null>(null);
  const [inspectingMember, setInspectingMember] = useState<GymMember | null>(null);
  const [isOpenShiftModalOpen, setIsOpenShiftModalOpen] = useState(false);
  const [activeShift, setActiveShift] = useState<CashShift | undefined>(undefined);
  const [isNewMemberModalOpen, setIsNewMemberModalOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberPhone, setNewMemberPhone] = useState('');
  const [newMemberBirthDate, setNewMemberBirthDate] = useState('');
  const [newMemberAddress, setNewMemberAddress] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberCoachId, setNewMemberCoachId] = useState('');
  const [newMemberCoachName, setNewMemberCoachName] = useState('كابتن الصالة العام');
  const [activeGymManager, setActiveGymManager] = useState<EmployeeAccount>(() => StorageService.getActiveGymManager());
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const coaches = StorageService.getCoaches();
  const allManagers = StorageService.getManagers();

  const refreshData = () => {
    setMembers(StorageService.getMembers());
    const shift = StorageService.getActiveShift();
    setActiveShift(shift);
    setActiveGymManager(StorageService.getActiveGymManager());
    return shift;
  };

  useEffect(() => {
    const shift = refreshData();
    // Auto-prompt shift opening for reception staff if no active shift
    if (currentUser.role === 'staff' && !shift) {
      setIsOpenShiftModalOpen(true);
    }

    const handleSync = () => refreshData();
    window.addEventListener('gym_storage_updated', handleSync);
    window.addEventListener('storage', handleSync);

    return () => {
      window.removeEventListener('gym_storage_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [currentUser.role]);

  const debtorMembers = members.filter(m => (m.balanceDue || 0) > 0);
  const totalDebtAmount = debtorMembers.reduce((sum, m) => sum + (m.balanceDue || 0), 0);

  const filteredMembers = members.filter(m => {
    const isActive = m.status === 'active' && m.remainingDays > 0;
    const isDebtor = (m.balanceDue || 0) > 0;
    if (statusFilter === 'active' && !isActive) return false;
    if (statusFilter === 'expired' && isActive) return false;
    if (statusFilter === 'vip' && m.tier !== 'vip' && m.tier !== 'gold' && m.tier !== 'diamond') return false;
    if (statusFilter === 'debtors' && !isDebtor) return false;

    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase().trim();
    return (
      m.membershipNumber.includes(q) ||
      m.fullNameAr.toLowerCase().includes(q) ||
      m.fullNameEn.toLowerCase().includes(q) ||
      m.phone.includes(q)
    );
  });

  const handleSelect = (m: GymMember) => {
    audioAlertService.playSuccess();
    onSelectMember(m);
    // If reception staff, show member profile dialog with renewal option
    if (currentUser.role === 'staff') {
      setInspectingMember(m);
    }
  };

  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser.role === 'staff' && !activeShift) {
      audioAlertService.playWarning();
      alert(isAr ? '⛔ عذراً: يجب فتح الوردية أولاً قبل تسجيل أي مشترك جديد في النادي' : 'Open shift first.');
      setIsOpenShiftModalOpen(true);
      return;
    }

    if (!newMemberName.trim() || !newMemberPhone.trim()) return;

    const newNum = String(Math.floor(1000 + Math.random() * 9000));
    const newMember: GymMember = {
      id: `mem-${Date.now()}`,
      membershipNumber: newNum,
      fullNameAr: newMemberName.trim(),
      fullNameEn: newMemberName.trim(),
      phone: newMemberPhone.trim(),
      gender: 'male',
      tier: 'standard',
      birthDate: newMemberBirthDate.trim(),
      address: newMemberAddress.trim(),
      email: newMemberEmail.trim(),
      startDate: StorageService.getLocalTodayString(),
      endDate: StorageService.getLocalTodayString(),
      remainingDays: 0,
      status: 'expired',
      assignedCoachId: newMemberCoachId || undefined,
      assignedCoachName: newMemberCoachName || 'كابتن الصالة العام',
      currentProgram: members[0]?.currentProgram || {
        id: 'prog-1',
        titleAr: 'البرنامج العام للمشترك',
        titleEn: 'General Fitness Program',
        coachName: newMemberCoachName || 'كابتن الصالة',
        createdAt: StorageService.getLocalTodayString(),
        days: []
      } as any,
      history: [],
      attendanceCount: 0,
      balanceDue: 0
    };

    StorageService.saveMember(newMember);

    StorageService.logActivity({
      performerId: currentUser.id,
      performerName: currentUser.nameAr,
      performerRole: currentUser.role,
      category: 'membership',
      actionType: 'create',
      titleAr: `تسجيل عضو جديد: ${newMember.fullNameAr} (#${newMember.membershipNumber}) وإسناد الكابتن (${newMember.assignedCoachName})`,
      titleEn: `Registered New Gym Member: ${newMember.fullNameEn} with coach ${newMember.assignedCoachName}`,
      detailsAr: `تم إنشاء حساب عضوية رقم (#${newMember.membershipNumber}) باسم (${newMember.fullNameAr}) وهاتف (${newMember.phone}) وإسناد الكابتن المشرف (${newMember.assignedCoachName})`,
      detailsEn: `New membership registered`,
      targetId: newMember.id,
      targetName: newMember.fullNameAr,
      targetType: 'member'
    });

    audioAlertService.playSuccess();
    setIsNewMemberModalOpen(false);
    setNewMemberName('');
    setNewMemberPhone('');
    setNewMemberBirthDate('');
    setNewMemberAddress('');
    setNewMemberEmail('');
    setNewMemberCoachId('');
    setNewMemberCoachName('كابتن الصالة العام');
    refreshData();
    // Open renew subscription immediately to supply their subscription!
    setSelectedRenewMember(newMember);
  };

  const formatShiftTime = (openedAtStr: string) => {
    try {
      const parts = openedAtStr.split(' ');
      const tPart = parts.length > 1 ? parts[1] : parts[0];
      const [h, m] = tPart.split(':');
      const date = new Date();
      date.setHours(parseInt(h, 10), parseInt(m, 10));
      return date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch {
      return '';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* SHIFT STATUS BANNER (For Reception Staff) */}
      {currentUser.role === 'staff' && (
        activeShift ? (
          <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-950 border border-emerald-500/40 rounded-2xl p-3.5 px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-lg">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <div>
                <span className="text-emerald-300 font-bold">
                  {isAr ? `الوردية الحالية مفتوحة: ${activeShift.staffName}` : `Active Shift: ${activeShift.staffName}`}
                </span>
                <span className="text-slate-400 font-mono block sm:inline sm:mr-2 rtl:sm:mr-2 ltr:sm:ml-2">
                  ({isAr ? 'الرصيد الافتتاحي:' : 'Starting:'} {activeShift.startingCash.toLocaleString()} ج.م • {isAr ? 'تاريخ البدء:' : 'Started:'} {activeShift.openedAt.split(' ')[0]} {formatShiftTime(activeShift.openedAt)})
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                {isAr ? 'الخزينة نشطة ومستعدة للاستقبال' : 'Cashier Ready'}
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-rose-950/80 via-slate-900 to-rose-950/60 border-2 border-rose-500/60 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold border border-rose-500/40 shrink-0">
                <Lock className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <strong className="text-white font-black block text-sm flex items-center gap-2">
                  <span>{isAr ? '🛑 فتح المناوبة إجباري لموظف الاستقبال' : 'Mandatory Shift Required'}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold">
                    {isAr ? 'إلزامي للتشغيل' : 'Mandatory'}
                  </span>
                </strong>
                <span className="text-rose-200/90 text-xs mt-0.5 block font-medium">
                  {isAr ? 'لا يمكنك تنفيذ أي معاملة مالية أو تجديد اشتراك أو تسجيل عضو إلا بعد فتح المناوبة وتحديد العهدة' : 'Financial transactions and renewals require an open shift.'}
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpenShiftModalOpen(true)}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 transition-all cursor-pointer whitespace-nowrap active:scale-95 flex items-center gap-2"
            >
              <Clock className="w-4 h-4" />
              <span>{isAr ? '🟢 فتح المناوبة الآن (إجباري)' : 'Open Shift Now'}</span>
            </button>
          </div>
        )
      )}

      {/* Active Hall Manager Bar for Prints & Reports */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-[#0c1220] via-[#090d16] to-[#060910] border border-amber-500/30 rounded-2xl px-4 py-2.5 text-xs shadow-lg">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-slate-400 font-bold">{isAr ? 'مدير الصالة المناوب في اعتمادات التقارير:' : 'Active Hall Manager for Prints:'}</span>
          <strong className="text-amber-400 font-black">{activeGymManager?.nameAr || (isAr ? 'كابتن كريم هنداوي (مدير الصالة)' : 'Capt. Karim Hendawy')}</strong>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-500 font-bold">{isAr ? 'تغيير المدير المناوب:' : 'Switch Manager:'}</span>
          <div className="inline-flex rounded-xl bg-slate-900 p-0.5 border border-slate-800">
            {allManagers.filter(m => !m.nameAr.includes('المدير العام') && m.id !== 'mgr-1').map(mgr => (
              <button
                key={mgr.id}
                type="button"
                onClick={() => {
                  StorageService.setActiveGymManagerId(mgr.id);
                  setActiveGymManager(mgr);
                  audioAlertService.playSuccess();
                  setToastMsg({
                    type: 'success',
                    text: isAr ? `✓ تم تعيين (${mgr.nameAr}) كمدير الصالة المناوب للتقارير والطباعة` : `Hall manager switched to ${mgr.nameAr}`
                  });
                  setTimeout(() => setToastMsg(null), 3000);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeGymManager?.id === mgr.id 
                    ? 'bg-amber-500 text-slate-950 font-black shadow' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {mgr.nameAr.includes('كريم') ? (isAr ? 'كابتن كريم هنداوي' : 'Capt. Karim') : (isAr ? 'كابتن أحمد جابر' : 'Capt. Ahmed Jaber')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* OUTSTANDING BALANCES / DEBTORS ALERT BANNER */}
      {debtorMembers.length > 0 && (
        <div className="bg-gradient-to-r from-amber-950/80 via-rose-950/70 to-slate-950 border-2 border-amber-500/60 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl animate-in slide-in-from-top-2">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/10">
              <AlertCircle className="w-6 h-6 animate-pulse text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-sm sm:text-base font-black text-white">
                  {isAr ? '⚠️ إنذار المشتركين المدينين وبواقي المبالغ' : 'Outstanding Balances & Debtors Alert'}
                </h4>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold border border-rose-500/40 font-mono">
                  {debtorMembers.length} {isAr ? 'مشترك مطلوب سداده' : 'debtors'}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-black border border-amber-500/40 font-mono">
                  {isAr ? 'المجموع:' : 'Total:'} {totalDebtAmount.toLocaleString()} ج.م
                </span>
              </div>
              <p className="text-xs text-amber-200/90 mt-1 font-medium">
                {isAr 
                  ? `يوجد ${debtorMembers.length} مشتركين عليهم متبقيات سداد واشتراكات غير مسددة بالكامل. يمكنك تحصيل أي مبلغ وإدراجه فوراً في تقرير الوردية والدرج.`
                  : `There are ${debtorMembers.length} members with pending balances totaling ${totalDebtAmount.toLocaleString()} EGP.`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setStatusFilter('debtors')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 shadow-lg ${
              statusFilter === 'debtors'
                ? 'bg-rose-600 text-white shadow-rose-600/40 ring-2 ring-rose-400'
                : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/20 hover:scale-105'
            }`}
          >
            <span>{isAr ? '📋 استعراض خانة الأعضاء المدينين' : 'View Debtors List'}</span>
            <span className="font-mono bg-black/25 px-2 py-0.5 rounded-md text-xs">
              {debtorMembers.length}
            </span>
          </button>
        </div>
      )}

      {/* Search and Lookup Box */}
      <div className="bg-gradient-to-br from-[#121826] via-[#0b101c] to-[#06080e] rounded-3xl p-6 border border-amber-500/30 shadow-2xl relative overflow-hidden">
        <div className="max-w-2xl mx-auto space-y-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-[#f7cb55] text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isAr ? 'البحث الذكي والاستعلام السريع للأعضاء' : 'Smart Member Lookup'}</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white">
            {isAr ? 'أدخل رقم العضوية أو رقم الهاتف أو اسم اللاعب' : 'Enter Membership #, Phone, or Name'}
          </h2>

          <div className="relative">
            <Search className="w-5 h-5 text-amber-400 absolute right-4 rtl:right-4 ltr:left-4 top-3.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoComplete="off"
              placeholder={isAr ? 'أدخل رقم العضوية أو رقم الهاتف أو اسم المشترك' : 'Search by ID, phone, or name...'}
              className="w-full bg-[#070a12] border-2 border-amber-500/40 rounded-2xl py-3.5 pr-12 pl-4 rtl:pr-12 rtl:pl-4 ltr:pl-12 ltr:pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-bold shadow-inner"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                if (currentUser.role === 'staff' && !activeShift) {
                  audioAlertService.playWarning();
                  alert(isAr 
                    ? '⛔ فتح المناوبة إجباري لموظف الاستقبال قبل تسجيل أي مشترك جديد أو توريد اشتراك' 
                    : 'Mandatory shift required before registering new member.');
                  setIsOpenShiftModalOpen(true);
                  return;
                }
                setIsNewMemberModalOpen(true);
              }}
              className={`w-full sm:w-auto px-6 py-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shadow-lg ${
                currentUser.role === 'staff' && !activeShift
                  ? 'bg-rose-950/80 border-2 border-rose-500/60 text-rose-300 hover:bg-rose-900 shadow-rose-950/40'
                  : 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-slate-950 shadow-sky-500/20'
              }`}
            >
              {currentUser.role === 'staff' && !activeShift ? <Lock className="w-4 h-4 text-rose-400" /> : <UserPlus className="w-4 h-4 text-slate-950" />}
              <span>{currentUser.role === 'staff' && !activeShift ? (isAr ? '🔒 فتح المناوبة إجباري لتسجيل مشترك وتوريد باقة' : 'Shift Required to Register Member') : (isAr ? '+ تسجيل مشترك جديد وتوريد باقة' : '+ Register New Member & Plan')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Active Member Spotlight Card (If selected) */}
      {activeMember && (
        <div className="bg-gradient-to-r from-amber-950/40 via-[#0e1320] to-slate-900 rounded-3xl p-5 border border-amber-500/40 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={activeMember.avatarUrl || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'}
              alt={activeMember.fullNameAr}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-500 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black">
                  #{activeMember.membershipNumber}
                </span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                  activeMember.status === 'active' && activeMember.remainingDays > 0
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                }`}>
                  {activeMember.status === 'active' && activeMember.remainingDays > 0 ? (isAr ? 'ساري' : 'Active') : (isAr ? 'منتهي' : 'Expired')}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-amber-300 font-bold">
                  {activeMember.tier}
                </span>
              </div>
              <h3 className="text-lg font-black text-white mt-1">{activeMember.fullNameAr}</h3>
              <p className="text-xs text-slate-400 font-medium">
                {isAr ? 'تاريخ الانتهاء:' : 'Expiry:'} <strong className="text-slate-200 font-mono">{activeMember.endDate || 'غير محدد'}</strong>
                {' • '}
                {isAr ? 'المتبقي:' : 'Left:'} <strong className="text-amber-400 font-mono font-bold">{activeMember.remainingDays} {isAr ? 'يوم' : 'd'}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
            <button
              onClick={() => {
                if (currentUser.role === 'staff' && !activeShift) {
                  audioAlertService.playWarning();
                  alert(isAr 
                    ? '⛔ عذراً: يجب فتح الوردية أولاً قبل تجديد اشتراك أي عضو أو تسجيل أي معاملات مالية' 
                    : 'Please open a shift first.');
                  setIsOpenShiftModalOpen(true);
                  return;
                }
                audioAlertService.playBeep(650, 0.05);
                setSelectedRenewMember(activeMember);
              }}
              className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shadow-lg ${
                currentUser.role === 'staff' && !activeShift
                  ? 'bg-rose-950/80 border-2 border-rose-500/60 text-rose-300 hover:bg-rose-900 shadow-rose-900/30'
                  : 'bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-slate-950 shadow-amber-500/20 hover:brightness-110'
              }`}
            >
              {currentUser.role === 'staff' && !activeShift ? <Lock className="w-4 h-4 text-rose-400" /> : <RefreshCw className="w-4 h-4" />}
              <span>{currentUser.role === 'staff' && !activeShift ? (isAr ? '🔒 فتح الوردية إجباري للتجديد' : 'Shift Required') : (isAr ? '🔄 تجديد اشتراك العضو' : 'Renew Subscription')}</span>
            </button>

            <button
              onClick={() => setInspectingMember(activeMember)}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <User className="w-4 h-4 text-amber-400" />
              <span>{isAr ? 'الملف الكامل' : 'Profile'}</span>
            </button>

            <button
              onClick={onOpenCard}
              className="px-3.5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
              <span>{isAr ? 'بطاقة QR' : 'Smart Pass'}</span>
            </button>
          </div>
        </div>
      )}

      {/* MEMBERS SECTION HEADER & FILTERS BAR */}
      <div className="bg-[#0b101d] p-4 sm:p-5 rounded-3xl border border-amber-500/30 space-y-3.5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center font-black">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>{isAr ? '📋 سجل وخانة الأعضاء والاشتراكات' : 'Members & Subscriptions Directory'}</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold font-mono">
                  {filteredMembers.length} {isAr ? 'عضو' : 'members'}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {isAr ? 'اضغط على "تجديد اشتراك" أو "اشتراك جديد" لاختيار الباقة من القائمة وتوريد الإيصال فوراً' : 'Select renewal or new plan to process receipts instantly'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (currentUser.role === 'staff' && !activeShift) {
                audioAlertService.playWarning();
                alert(isAr ? '⛔ فتح المناوبة إجباري لموظف الاستقبال قبل تسجيل أي مشترك جديد أو توريد اشتراك' : 'Mandatory shift required before registering new member.');
                setIsOpenShiftModalOpen(true);
                return;
              }
              setIsNewMemberModalOpen(true);
            }}
            className={`px-4 py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shadow-lg ${
              currentUser.role === 'staff' && !activeShift
                ? 'bg-rose-950/80 border border-rose-500/60 text-rose-300 hover:bg-rose-900'
                : 'bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-slate-950 shadow-amber-500/20 hover:brightness-110'
            }`}
          >
            {currentUser.role === 'staff' && !activeShift ? <Lock className="w-4 h-4 text-rose-400" /> : <UserPlus className="w-4 h-4 text-slate-950" />}
            <span>{isAr ? '+ تسجيل مشترك جديد' : '+ New Member'}</span>
          </button>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 pt-1 border-t border-slate-800/80 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === 'all'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            {isAr ? `جميع الأعضاء (${members.length})` : `All (${members.length})`}
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              statusFilter === 'active'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-slate-900 text-emerald-400 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>{isAr ? `اشتراكات سارية (${members.filter(m => m.status === 'active' && m.remainingDays > 0).length})` : `Active (${members.filter(m => m.status === 'active' && m.remainingDays > 0).length})`}</span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('expired')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              statusFilter === 'expired'
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                : 'bg-slate-900 text-rose-400 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-400"></span>
            <span>{isAr ? `بحاجة لتجديد / منتهية (${members.filter(m => m.status !== 'active' || m.remainingDays <= 0).length})` : `Expired (${members.filter(m => m.status !== 'active' || m.remainingDays <= 0).length})`}</span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('debtors')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              statusFilter === 'debtors'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 ring-2 ring-rose-400'
                : 'bg-rose-950/40 text-rose-300 hover:bg-rose-900/50 border border-rose-500/40'
            }`}
          >
            <span>⚠️</span>
            <span>{isAr ? `عليهم متبقيات وسداد (${debtorMembers.length})` : `Debtors (${debtorMembers.length})`}</span>
            {totalDebtAmount > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-rose-500/20 text-rose-200 font-mono font-bold">
                {totalDebtAmount.toLocaleString()} ج.م
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('vip')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              statusFilter === 'vip'
                ? 'bg-purple-500 text-white shadow-md shadow-purple-500/20'
                : 'bg-slate-900 text-purple-400 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <span>👑</span>
            <span>{isAr ? `باقات VIP (${members.filter(m => m.tier === 'vip' || m.tier === 'gold' || m.tier === 'diamond').length})` : `VIP (${members.filter(m => m.tier === 'vip' || m.tier === 'gold' || m.tier === 'diamond').length})`}</span>
          </button>
        </div>
      </div>

      {/* Members Grid / List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMembers.map(m => {
          const isSelected = activeMember?.id === m.id;
          const isActive = m.status === 'active' && m.remainingDays > 0;
          return (
            <div
              key={m.id}
              onClick={() => handleSelect(m)}
              className={`cursor-pointer rounded-3xl p-4 sm:p-5 border transition-all shadow-lg flex flex-col justify-between space-y-3.5 group ${
                isSelected 
                  ? 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/30' 
                  : 'bg-[#0c101a] border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
              }`}
            >
              {/* Top: Avatar & Info */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={m.avatarUrl || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'}
                    alt={m.fullNameAr}
                    className="w-12 h-12 rounded-2xl object-cover border border-slate-700 group-hover:border-amber-500/50 shadow shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="text-[10.5px] font-black font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                      #{m.membershipNumber}
                    </span>
                    <h4 className="text-sm font-bold text-white mt-1 group-hover:text-amber-300 transition-colors truncate">
                      {m.fullNameAr}
                    </h4>
                    <span className="text-[10.5px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-slate-500" />
                      <span className="font-mono">{m.phone}</span>
                    </span>
                  </div>
                </div>

                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase shrink-0 border ${
                  isActive ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                }`}>
                  {isActive ? (isAr ? 'ساري' : 'Active') : (isAr ? 'منتهي' : 'Expired')}
                </span>
              </div>

              {/* Program & Remaining Days */}
              <div className="bg-slate-950/80 p-2.5 px-3 rounded-2xl border border-slate-800/80 text-xs flex justify-between items-center">
                <div>
                  <span className="text-[9.5px] text-slate-500 block font-bold">{isAr ? 'نوع الباقة الحالية' : 'Current Plan'}</span>
                  <span className="font-black text-amber-300 text-xs uppercase truncate max-w-[130px] block">
                    {m.tier}
                  </span>
                </div>
                <div className="text-right rtl:text-right ltr:text-left">
                  <span className="text-[9.5px] text-slate-500 block font-bold">{isAr ? 'الأيام المتبقية' : 'Remaining'}</span>
                  <strong className={`font-black font-mono text-xs ${isActive ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {m.remainingDays} {isAr ? 'يوم' : 'd'}
                  </strong>
                </div>
              </div>

              {/* Outstanding Debt Notice on Member Card */}
              {(m.balanceDue || 0) > 0 && (
                <div className="bg-rose-950/70 border-2 border-rose-500/50 rounded-2xl p-2.5 px-3 flex items-center justify-between gap-2 text-xs shadow-inner">
                  <div className="flex items-center gap-1.5 text-rose-300 font-bold min-w-0">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 animate-pulse" />
                    <span className="truncate">{isAr ? '⚠️ متبقي عليه سداد:' : 'Balance Due:'}</span>
                  </div>
                  <strong className="text-rose-300 font-mono font-black text-xs shrink-0">
                    {m.balanceDue?.toLocaleString()} ج.م
                  </strong>
                </div>
              )}

              {/* Action Buttons Under Each Member */}
              <div className="pt-2 border-t border-slate-800/80 space-y-2">
                {/* One-Click Collect Debt Button If Member Has Debt */}
                {(m.balanceDue || 0) > 0 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (currentUser?.role === 'staff' && !activeShift) {
                        audioAlertService.playWarning();
                        setIsOpenShiftModalOpen(true);
                        return;
                      }
                      setSelectedSettleMember(m);
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:brightness-110 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950/40 border border-emerald-400/40 transition-all cursor-pointer active:scale-95"
                  >
                    <Coins className="w-3.5 h-3.5 text-emerald-200" />
                    <span>{isAr ? `💰 سداد دفعة / تحصيل (${m.balanceDue?.toLocaleString()} ج.م)` : `Collect Debt (${m.balanceDue} EGP)`}</span>
                  </button>
                )}

                {/* Primary Actions Row: Renew & New Plan */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (currentUser?.role === 'staff' && !activeShift) {
                        audioAlertService.playWarning();
                        setIsOpenShiftModalOpen(true);
                        return;
                      }
                      audioAlertService.playBeep(650, 0.05);
                      setSelectedRenewMember(m);
                    }}
                    className={`py-2 px-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow active:scale-95 ${
                      currentUser?.role === 'staff' && !activeShift
                        ? 'bg-rose-950/70 text-rose-300 border border-rose-600/50 hover:bg-rose-900'
                        : 'bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:brightness-110 text-slate-950 shadow-amber-500/20'
                    }`}
                    title={currentUser?.role === 'staff' && !activeShift ? (isAr ? '🔒 فتح المناوبة إجباري لتجديد الاشتراك' : 'Shift required') : (isAr ? 'تجديد اشتراك العضو واختيار الباقة' : 'Renew')}
                  >
                    {currentUser?.role === 'staff' && !activeShift ? <Lock className="w-3.5 h-3.5 text-rose-400" /> : <RefreshCw className="w-3.5 h-3.5" />}
                    <span>{isAr ? 'تجديد اشتراك' : 'Renew'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (currentUser?.role === 'staff' && !activeShift) {
                        audioAlertService.playWarning();
                        setIsOpenShiftModalOpen(true);
                        return;
                      }
                      audioAlertService.playBeep(650, 0.05);
                      setSelectedRenewMember(m);
                    }}
                    className="py-2 px-2.5 rounded-xl bg-sky-500/15 hover:bg-sky-500 text-sky-300 hover:text-slate-950 border border-sky-500/40 text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
                    title={isAr ? 'اشتراك جديد أو ترقية الباقة' : 'New Plan / Upgrade'}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                    <span>{isAr ? 'اشتراك جديد' : 'New Plan'}</span>
                  </button>
                </div>

                {/* Secondary Actions Row: Digital Card & Profile & PDF */}
                <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectMember(m);
                      onOpenCard();
                    }}
                    className="py-1.5 px-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 border border-amber-500/30 text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                    title={isAr ? 'عرض كارت العضوية QR' : 'Member Card'}
                  >
                    <QrCode className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isAr ? 'الكارت' : 'Card'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setInspectingMember(m);
                    }}
                    className="py-1.5 px-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                    title={isAr ? 'عرض الملف الكامل' : 'Profile'}
                  >
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>{isAr ? 'الملف' : 'Profile'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      audioAlertService.playSuccess();
                      pdfPrintService.printMemberActivityAndWorkoutReportPDF(m, currentUser.nameAr);
                    }}
                    className="py-1.5 px-2 rounded-xl bg-indigo-500/20 hover:bg-indigo-500 text-indigo-300 hover:text-white border border-indigo-500/30 text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                    title={isAr ? 'طباعة تقرير الحضور PDF' : 'PDF'}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>PDF</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* COMPREHENSIVE MEMBER PROFILE & HISTORY MODAL */}
      {inspectingMember && (
        <MemberProfileModal
          member={inspectingMember}
          isOpen={!!inspectingMember}
          onClose={() => setInspectingMember(null)}
          currentUser={currentUser}
          lang={lang}
          onMemberUpdated={refreshData}
          activeShift={activeShift}
        />
      )}

      {/* New Member Registration Modal */}
      {isNewMemberModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="w-full max-w-md max-h-[calc(100dvh-2rem)] sm:max-h-[85vh] flex flex-col rounded-3xl bg-[#0e1320] border border-sky-500/40 text-slate-100 shadow-2xl relative overflow-hidden my-auto">
            <div className="p-5 pb-3 border-b border-slate-800/80 shrink-0 flex items-center justify-between bg-[#0a0e18]">
              <h3 className="text-base font-black text-white">
                {isAr ? '+ تسجيل مشترك جديد وتوريد باقة' : 'Register New Member & Plan'}
              </h3>
              <button
                onClick={() => setIsNewMemberModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/60 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMember} className="flex-1 min-h-0 flex flex-col overflow-hidden">
              <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs overscroll-contain pb-6">
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">{isAr ? 'اسم المشترك بالكامل' : 'Full Name'}</label>
                  <input
                    type="text"
                    required
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    placeholder={isAr ? 'الاسم ثلاثي...' : 'Full Name'}
                    className="w-full bg-[#080b12] border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">{isAr ? 'رقم الهاتف' : 'Phone'}</label>
                  <input
                    type="tel"
                    required
                    value={newMemberPhone}
                    onChange={(e) => setNewMemberPhone(e.target.value)}
                    placeholder="01012345678"
                    className="w-full bg-[#080b12] border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1.5">{isAr ? 'تاريخ الميلاد (مجهول افتراضياً)' : 'Birth Date (Optional)'}</label>
                    <input
                      type="text"
                      name="no_suggest_mem_birth"
                      autoComplete="off"
                      value={newMemberBirthDate}
                      onChange={(e) => setNewMemberBirthDate(e.target.value)}
                      placeholder={isAr ? 'مجهول / غير محدد (أدخل يدوياً إن وُجد)' : 'Unknown / Not specified (optional)'}
                      className="w-full bg-[#080b12] border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-sky-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1.5">{isAr ? 'العنوان' : 'Address'}</label>
                    <input
                      type="text"
                      value={newMemberAddress}
                      onChange={(e) => setNewMemberAddress(e.target.value)}
                      placeholder={isAr ? 'المدينة / المنطقة' : 'Address'}
                      className="w-full bg-[#080b12] border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">{isAr ? 'البريد الإلكتروني' : 'Email'}</label>
                  <input
                    type="email"
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    placeholder="example@mail.com"
                    className="w-full bg-[#080b12] border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1.5 flex items-center gap-1.5">
                    <Dumbbell className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isAr ? 'الكابتن المشرف (إسناد كابتن للعضو)' : 'Assigned Coach / Trainer'}</span>
                  </label>
                  <select
                    value={newMemberCoachName}
                    onChange={(e) => {
                      const selectedName = e.target.value;
                      setNewMemberCoachName(selectedName);
                      const c = coaches.find(coach => coach.nameAr === selectedName);
                      setNewMemberCoachId(c ? c.id : '');
                    }}
                    className="w-full bg-[#080b12] border border-slate-800 focus:border-amber-400 rounded-xl p-3 text-white focus:outline-none font-bold"
                  >
                    <option value="كابتن الصالة العام">{isAr ? 'كابتن الصالة العام (بدون مدرب مخصص)' : 'General Gym Coach'}</option>
                    {coaches.map(c => (
                      <option key={c.id} value={c.nameAr}>
                        {c.nameAr} {c.specialty ? `• (${c.specialty})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-3.5 sm:p-4 px-4 sm:px-6 bg-[#0a0e18] border-t-2 border-slate-800 shrink-0 flex items-center gap-3 z-30 shadow-[0_-12px_24px_rgba(0,0,0,0.85)]">
                <button
                  type="submit"
                  className="flex-1 py-3.5 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-slate-950 font-black text-xs sm:text-sm transition-all shadow-xl shadow-sky-500/25 cursor-pointer flex items-center justify-center gap-2 active:scale-95 shrink-0"
                >
                  <CheckCircle2 className="w-4 h-4 text-slate-950" />
                  <span>{isAr ? 'تأكيد التسجيل والانتقال لتوريد الباقة' : 'Save & Select Plan'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsNewMemberModalOpen(false)}
                  className="px-5 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs sm:text-sm cursor-pointer transition-colors shrink-0"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OPEN SHIFT MODAL FOR RECEPTION STAFF */}
      <OpenShiftModal
        isOpen={isOpenShiftModalOpen || (currentUser?.role === 'staff' && !activeShift)}
        onClose={() => {
          if (!(currentUser?.role === 'staff' && !activeShift)) {
            setIsOpenShiftModalOpen(false);
          }
        }}
        currentUser={currentUser}
        lang={lang}
        isMandatory={currentUser?.role === 'staff' && !activeShift}
        onShiftOpened={(shift) => {
          setActiveShift(shift);
          setIsOpenShiftModalOpen(false);
          refreshData();
        }}
      />

      {/* RENEW SUBSCRIPTION MODAL */}
      <RenewSubscriptionModal
        member={selectedRenewMember}
        isOpen={!!selectedRenewMember}
        onClose={() => setSelectedRenewMember(null)}
        currentUser={currentUser}
        lang={lang}
        activeShift={activeShift}
        onSuccess={() => {
          refreshData();
        }}
      />

      {/* SETTLE DEBT MODAL (سداد مديونية وبواقي مبالغ) */}
      <SettleDebtModal
        member={selectedSettleMember}
        isOpen={!!selectedSettleMember}
        onClose={() => setSelectedSettleMember(null)}
        currentUser={currentUser}
        lang={lang}
        activeShift={activeShift}
        onSuccess={(updatedMem) => {
          refreshData();
          if (activeMember?.id === updatedMem.id) {
            onSelectMember(updatedMem);
          }
        }}
      />

      {/* Toast Notification */}
      {toastMsg && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl border-2 text-xs font-bold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-300 ${
          toastMsg.type === 'error'
            ? 'bg-rose-950 border-rose-500/80 text-rose-200'
            : 'bg-slate-900 border-emerald-500/80 text-emerald-300'
        }`}>
          {toastMsg.type === 'error' ? (
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <span>{toastMsg.text}</span>
        </div>
      )}
    </div>
  );
};
