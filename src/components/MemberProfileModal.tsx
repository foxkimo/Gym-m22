import React, { useState } from 'react';
import { GymMember, CurrentUser, CashShift, FinancialTransaction, MemberCheckInRecord } from '../types/gym';
import { StorageService } from '../services/storageService';
import { audioAlertService } from '../services/audioService';
import { pdfPrintService } from '../services/pdfPrintService';
import { RenewSubscriptionModal } from './RenewSubscriptionModal';
import { DigitalCardModal } from './DigitalCardModal';
import { SettleDebtModal } from './SettleDebtModal';
import { 
  User, 
  Phone, 
  Calendar, 
  CreditCard, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  QrCode, 
  Printer, 
  RefreshCw, 
  FileText, 
  Dumbbell, 
  ShieldCheck, 
  Sparkles, 
  X, 
  DollarSign, 
  UserCheck, 
  Tag, 
  Activity, 
  Lock, 
  AlertTriangle, 
  Eye,
  Receipt,
  History,
  Info,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  ShieldAlert,
  Layers,
  Coins,
  Trash2
} from 'lucide-react';

interface MemberProfileModalProps {
  member: GymMember | null;
  isOpen: boolean;
  onClose: () => void;
  currentUser: CurrentUser;
  lang: 'ar' | 'en';
  onMemberUpdated?: () => void;
  activeShift?: CashShift;
}

export const MemberProfileModal: React.FC<MemberProfileModalProps> = ({
  member,
  isOpen,
  onClose,
  currentUser,
  lang,
  onMemberUpdated,
  activeShift
}) => {
  const isAr = lang === 'ar';
  const [activeTab, setActiveTab] = useState<'subscriptions' | 'personal' | 'attendance' | 'financial' | 'workout'>('subscriptions');
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [isSettleDebtModalOpen, setIsSettleDebtModalOpen] = useState(false);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [isPrintMenuOpen, setIsPrintMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Reactive member state for instant coach assignment updates
  const [currentMember, setCurrentMember] = useState<GymMember>(member || ({} as any));
  const [isAssignCoachModalOpen, setIsAssignCoachModalOpen] = useState(false);
  const [selectedCoachId, setSelectedCoachId] = useState<string>(member?.assignedCoachId || '');
  const [selectedCoachName, setSelectedCoachName] = useState<string>(member?.assignedCoachName || 'كابتن الصالة العام');

  // Manual InBody & Analysis state
  const [isAddingInBody, setIsAddingInBody] = useState(false);
  const [newInBodyDate, setNewInBodyDate] = useState(StorageService.getLocalTodayString());
  const [newInBodyWeight, setNewInBodyWeight] = useState('');
  const [newInBodyMuscle, setNewInBodyMuscle] = useState('');
  const [newInBodyFat, setNewInBodyFat] = useState('');
  const [newInBodyNotes, setNewInBodyNotes] = useState('');

  const handleAddInBodyMeasurement = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(String(newInBodyWeight));
    const m = parseFloat(String(newInBodyMuscle));
    const f = parseFloat(String(newInBodyFat));
    if (isNaN(w) || isNaN(m) || isNaN(f)) {
      setToastMessage({ type: 'error', text: isAr ? 'يرجى إدخال قيم صحيحة للوزن والكتلة العضلية ونسبة الدهون' : 'Please enter valid numbers' });
      return;
    }

    const newScore = {
      date: newInBodyDate || StorageService.getLocalTodayString(),
      weightKg: w,
      muscleMassKg: m,
      bodyFatPercent: f,
      notes: newInBodyNotes
    };

    const existingScores = currentMember.inbodyScores || [];
    const updatedScores = [...existingScores, newScore];
    const updatedMember: GymMember = {
      ...currentMember,
      inbodyScores: updatedScores
    };

    StorageService.saveMember(updatedMember);
    setCurrentMember(updatedMember);
    setIsAddingInBody(false);
    setNewInBodyWeight('');
    setNewInBodyMuscle('');
    setNewInBodyFat('');
    setNewInBodyNotes('');
    audioAlertService.playSuccess();
    setToastMessage({ type: 'success', text: isAr ? 'تم إضافة قياس InBody والتحليل بنجاح' : 'InBody measurement added successfully' });
    if (onMemberUpdated) onMemberUpdated();
  };

  const handleDeleteInBodyMeasurement = (index: number) => {
    const existingScores = currentMember.inbodyScores || [];
    const updatedScores = existingScores.filter((_, i) => i !== index);
    const updatedMember: GymMember = {
      ...currentMember,
      inbodyScores: updatedScores
    };
    StorageService.saveMember(updatedMember);
    setCurrentMember(updatedMember);
    audioAlertService.playSuccess();
    setToastMessage({ type: 'success', text: isAr ? 'تم حذف القياس بنجاح' : 'Measurement deleted' });
    if (onMemberUpdated) onMemberUpdated();
  };

  const generateInBodyAnalysis = (scores: { date: string; weightKg: number; muscleMassKg: number; bodyFatPercent: number; notes?: string }[], arabic: boolean) => {
    if (!scores || scores.length === 0) {
      return arabic 
        ? 'لم يتم تسجيل قياسات InBody يدوياً بعد. ابدأ بإضافة قياس جديد لتفعيل التحليل الذكي لتطور الجسم مع جدول التمارين.'
        : 'No InBody measurements recorded yet. Add measurements to activate intelligent body composition & workout analysis.';
    }

    const sorted = [...scores].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const latest = sorted[sorted.length - 1];
    const baseline = sorted[0];

    if (sorted.length === 1) {
      return arabic
        ? `تم تسجيل القياس الأول بتاريخ ${latest.date}: الوزن ${latest.weightKg} كجم، الكتلة العضلية ${latest.muscleMassKg} كجم، نسبة الدهون ${latest.bodyFatPercent}%. تم ربط القياس بالجدول التدريبي، وبانتظار قياس تالي لرصد معدل التطور.`
        : `First measurement recorded on ${latest.date}: Weight ${latest.weightKg}kg, Muscle ${latest.muscleMassKg}kg, Fat ${latest.bodyFatPercent}%. Ready for comparative analysis with next measurement.`;
    }

    const diffWeight = +(latest.weightKg - baseline.weightKg).toFixed(1);
    const diffMuscle = +(latest.muscleMassKg - baseline.muscleMassKg).toFixed(1);
    const diffFat = +(latest.bodyFatPercent - baseline.bodyFatPercent).toFixed(1);

    let parts: string[] = [];

    if (diffMuscle > 0) {
      parts.push(arabic ? `📈 نمو عضلي رائع: زادت الكتلة العضلية بمقدار +${diffMuscle} كجم.` : `Great muscle gain: +${diffMuscle}kg muscle mass increase.`);
    } else if (diffMuscle < 0) {
      parts.push(arabic ? `⚠️ ملاحظة على الكتلة العضلية: انخفضت بمقدار ${diffMuscle} كجم.` : `Muscle mass decreased by ${diffMuscle}kg.`);
    } else {
      parts.push(arabic ? `⚖️ الكتلة العضلية مستقرة تماماً.` : `Muscle mass stable.`);
    }

    if (diffFat < 0) {
      parts.push(arabic ? `🔥 نجاح في حرق الدهون: انخفضت نسبة الدهون بمقدار ${diffFat}%.` : `Fat loss success: ${diffFat}% reduction in body fat.`);
    } else if (diffFat > 0) {
      parts.push(arabic ? `⚠️ ارتفاع طفيف في الدهون بنسبة +${diffFat}%.` : `Slight fat increase of +${diffFat}%.`);
    } else {
      parts.push(arabic ? `🛡️ نسبة الدهون ثابتة ومنضبطة.` : `Body fat percentage stable.`);
    }

    if (diffWeight > 0 && diffMuscle > 0 && diffFat <= 0) {
      parts.push(arabic ? `🌟 النتيجة العامة: (Body Recomposition مثالي) زيادة عضلية صافية مع فقدان دهون ونمو رياضي ممتاز مع التمرين!` : `Ideal body recomposition achieved!`);
    } else if (diffWeight < 0 && diffFat < 0) {
      parts.push(arabic ? `💪 نجاح في التخسيس ونحت القوام مع الحفاظ على الأداء التدريبي.` : `Successful weight/fat loss while maintaining training performance.`);
    }

    return parts.join(' ');
  };

  React.useEffect(() => {
    if (member) {
      setCurrentMember(member);
      setSelectedCoachId(member.assignedCoachId || '');
      setSelectedCoachName(member.assignedCoachName || 'كابتن الصالة العام');
    }
  }, [member]);

  const availableCoaches = StorageService.getCoaches();

  const handleSaveCoachAssignment = (cId?: string, cName?: string) => {
    const coachNameToUse = cName || selectedCoachName;
    const coachIdToUse = cId !== undefined ? cId : selectedCoachId;
    const updated = StorageService.assignCoachToMember(
      currentMember.id,
      coachIdToUse,
      coachNameToUse,
      currentUser
    );
    if (updated) {
      setCurrentMember({ ...updated });
      audioAlertService.playSuccess();
      setToastMessage({
        type: 'success',
        text: isAr ? `✓ تم إسناد الكابتن (${coachNameToUse}) للعضو بنجاح` : `Coach ${coachNameToUse} assigned successfully`
      });
      setTimeout(() => setToastMessage(null), 4000);
      setIsAssignCoachModalOpen(false);
      if (onMemberUpdated) onMemberUpdated();
    }
  };

  if (!isOpen || !member) return null;

  // Fetch all related data for this member
  const allTransactions = StorageService.getTransactions();
  const memberTransactions = allTransactions.filter(
    tx => tx.memberId === currentMember.id || 
          tx.membershipNumber === currentMember.membershipNumber ||
          (tx.memberName && tx.memberName.trim().toLowerCase() === currentMember.fullNameAr.trim().toLowerCase())
  );

  const allCheckIns = StorageService.getMemberCheckIns();
  const memberCheckIns = allCheckIns.filter(
    ci => ci.memberId === currentMember.id || 
          ci.membershipNumber === currentMember.membershipNumber
  );

  // Eligibility for 12-hour check-in rule
  const eligibility = StorageService.checkMemberCheckInEligibility(currentMember);

  // Handle Quick Check-In from Profile
  const handleRecordCheckIn = (force: boolean = false) => {
    const result = StorageService.recordMemberCheckIn(
      currentMember,
      'manual_staff',
      currentUser.nameAr || 'موظف الاستقبال',
      currentUser.role || 'staff',
      force
    );

    if (!result.success) {
      audioAlertService.playDelete();
      setToastMessage({
        type: 'error',
        text: isAr ? (result.errorAr || 'غير مسموح بالدخول قبل مرور 12 ساعة') : (result.errorEn || '12-hour cooldown active')
      });
      setTimeout(() => setToastMessage(null), 5000);
      return;
    }

    audioAlertService.playSuccess();
    setToastMessage({
      type: 'success',
      text: isAr ? `✓ تم تسجيل حضور ودخول (${currentMember.fullNameAr}) بنجاح الساعة ${result.record?.checkInTime}` : 'Check-in recorded'
    });
    if (onMemberUpdated) onMemberUpdated();
    setTimeout(() => setToastMessage(null), 4000);
  };

  const isExpired = currentMember.status === 'expired' || currentMember.remainingDays <= 0;
  const isFrozen = currentMember.status === 'frozen';
  const isActive = currentMember.status === 'active' && currentMember.remainingDays > 0;

  // Subscription transactions (renewals & initial memberships)
  const subscriptionTxs = memberTransactions.filter(
    tx => tx.type === 'renewal' || tx.type === 'subscription' || tx.voucherKind === 'receipt'
  );

  // Dedicated Print Handlers
  const handlePrintSpecificSection = (section: 'subscriptions' | 'personal' | 'financial' | 'attendance' | 'workout' | 'all') => {
    audioAlertService.playSuccess();
    setIsPrintMenuOpen(false);

    switch (section) {
      case 'subscriptions':
        pdfPrintService.printMemberSubscriptionsHistoryPDF(currentMember, currentUser.nameAr);
        break;
      case 'personal':
        pdfPrintService.printMemberPersonalDataPDF(currentMember, currentUser.nameAr);
        break;
      case 'financial':
        pdfPrintService.printMemberFinancialLedgerPDF(currentMember, currentUser.nameAr);
        break;
      case 'attendance':
        pdfPrintService.printMemberAttendanceHistoryPDF(currentMember, currentUser.nameAr, memberCheckIns);
        break;
      case 'workout':
        pdfPrintService.printMemberActivityAndWorkoutReportPDF(currentMember, currentUser.nameAr);
        break;
      case 'all':
      default:
        pdfPrintService.printMemberFullHistoryPDF(currentMember, currentUser.nameAr);
        break;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div 
        className="w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-[#0a0f1d] border-2 border-amber-500/40 text-slate-100 shadow-2xl relative overflow-hidden my-auto"
        dir={isAr ? 'rtl' : 'ltr'}
      >
        {/* TOP HEADER: Identity, Status & Quick Action Buttons */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-600/20 via-[#10172a] to-[#080d1a] border-b border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="relative shrink-0">
              <img
                src={member.avatarUrl || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'}
                alt={member.fullNameAr}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-amber-500 shadow-lg"
              />
              <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#0a0f1d] ${
                isActive ? 'bg-emerald-500' : isFrozen ? 'bg-sky-500' : 'bg-rose-500'
              }`} />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs px-2.5 py-0.5 rounded-lg bg-amber-500 text-slate-950 font-black font-mono shadow-sm">
                  #{member.membershipNumber}
                </span>
                <span className={`text-[11px] px-2.5 py-0.5 rounded-lg font-bold border ${
                  isActive 
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    : isFrozen 
                    ? 'bg-sky-500/20 text-sky-400 border-sky-500/40'
                    : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                }`}>
                  {isActive ? (isAr ? 'ساري وصالح للدخول' : 'Active') : isFrozen ? (isAr ? 'مجمد مؤقتاً' : 'Frozen') : (isAr ? 'منتهي الصلاحية' : 'Expired')}
                </span>
                <span className="text-[11px] px-2.5 py-0.5 rounded-lg bg-amber-500/15 text-amber-300 font-bold border border-amber-500/30 uppercase">
                  {member.tier} VIP
                </span>
              </div>

              <h2 className="text-lg sm:text-xl font-black text-white mt-1 truncate">
                {member.fullNameAr}
              </h2>
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5 flex-wrap">
                <span className="flex items-center gap-1 font-mono text-slate-300">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  {member.phone}
                </span>
                <span>•</span>
                <span className="text-amber-400 font-bold">
                  {isAr ? 'المتبقي:' : 'Remaining:'} <strong className="font-mono">{member.remainingDays}</strong> {isAr ? 'يوم' : 'Days'}
                </span>
                <span>•</span>
                <span>
                  {isAr ? 'مرات الحضور:' : 'Check-ins:'} <strong className="text-emerald-400 font-mono">{member.attendanceCount || memberCheckIns.length || 0}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions in Header */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
            {/* RENEW SUBSCRIPTION */}
            <button
              onClick={() => setIsRenewModalOpen(true)}
              className="py-2 px-3 sm:px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:brightness-110 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer transition-all active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{isAr ? '🔄 تجديد الاشتراك' : 'Renew Plan'}</span>
            </button>

            {/* CHECK-IN NOW (with 12h policy) */}
            {eligibility.allowed ? (
              <button
                onClick={() => handleRecordCheckIn(false)}
                className="py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer transition-all active:scale-95"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>{isAr ? '⏱️ تسجيل حضور' : 'Check In'}</span>
              </button>
            ) : (
              <button
                onClick={() => handleRecordCheckIn(false)}
                className="py-2 px-3 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                title={eligibility.reasonAr}
              >
                <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>{isAr ? `⏱️ متبقي [${eligibility.remainingHours}س ${eligibility.remainingMinutes}د]` : '12h cooldown'}</span>
              </button>
            )}

            {/* QR SMART PASS */}
            <button
              onClick={() => setIsCardModalOpen(true)}
              className="py-2 px-2.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
              title={isAr ? 'كارت الدخول الذكي QR' : 'Smart Pass'}
            >
              <QrCode className="w-3.5 h-3.5" />
            </button>

            {/* SELECTIVE PRINT BUTTON */}
            <button
              onClick={() => setIsPrintMenuOpen(true)}
              className="py-2 px-3 sm:px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 hover:brightness-110 text-white border border-indigo-400/50 text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-indigo-600/20 active:scale-95"
              title={isAr ? 'خيارات طباعة ملف العضو' : 'Print Options'}
            >
              <Printer className="w-4 h-4 text-indigo-200" />
              <span>{isAr ? '🖨️ خيارات الطباعة...' : 'Print Options...'}</span>
            </button>

            {/* CLOSE MODAL */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 12-HOUR POLICY ALERT BANNER (If in cooldown) */}
        {!eligibility.allowed && (
          <div className="bg-amber-950/60 border-b border-amber-500/30 px-4 py-2 flex items-center justify-between text-xs text-amber-200">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
              <span>
                {isAr 
                  ? `⛔ تنبيه مهلة الـ 12 ساعة: آخر تسجيل حضور كان الساعة [${eligibility.lastCheckInTime}] (${eligibility.lastCheckInDate}) • متبقي [${eligibility.remainingHours} ساعة و ${eligibility.remainingMinutes} دقيقة] للسماح بالدخول القادم.`
                  : `12h Cooldown active: Next allowed check-in in ${eligibility.remainingHours}h ${eligibility.remainingMinutes}m.`}
              </span>
            </div>
            <button
              onClick={() => handleRecordCheckIn(true)}
              className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold shrink-0 cursor-pointer"
            >
              {isAr ? 'تجاوز استثنائي بالإدارة ⚠️' : 'Force Check-In'}
            </button>
          </div>
        )}

        {/* NAVIGATION TABS */}
        <div className="flex items-center border-b border-slate-800/80 bg-[#080c16] px-3 sm:px-5 gap-2 overflow-x-auto shrink-0 scrollbar-none">
          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`py-3 px-3.5 text-xs font-black flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'subscriptions'
                ? 'border-amber-500 text-amber-400 bg-amber-500/10 rounded-t-xl'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <History className="w-4 h-4" />
            <span>{isAr ? '🔄 سجل الاشتراكات والتجديدات' : 'Subscriptions & Renewals'}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-400 font-mono">
              {subscriptionTxs.length || 1}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('personal')}
            className={`py-3 px-3.5 text-xs font-black flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'personal'
                ? 'border-amber-500 text-amber-400 bg-amber-500/10 rounded-t-xl'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Info className="w-4 h-4" />
            <span>{isAr ? '📋 البيانات الشخصية والاتصال' : 'Personal Data'}</span>
          </button>

          <button
            onClick={() => setActiveTab('attendance')}
            className={`py-3 px-3.5 text-xs font-black flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'attendance'
                ? 'border-amber-500 text-amber-400 bg-amber-500/10 rounded-t-xl'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{isAr ? '⏱️ سجل الحضور والدخول' : 'Attendance Logs'}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 font-mono">
              {memberCheckIns.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('financial')}
            className={`py-3 px-3.5 text-xs font-black flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'financial'
                ? 'border-amber-500 text-amber-400 bg-amber-500/10 rounded-t-xl'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>{isAr ? '💳 المعاملات المالية والفواتير' : 'Financial Ledger'}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-sky-500/20 text-sky-400 font-mono">
              {memberTransactions.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('workout')}
            className={`py-3 px-3.5 text-xs font-black flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'workout'
                ? 'border-amber-500 text-amber-400 bg-amber-500/10 rounded-t-xl'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Dumbbell className="w-4 h-4" />
            <span>{isAr ? '🏋️‍♂️ التمارين وقياسات InBody' : 'Workout & InBody'}</span>
          </button>
        </div>

        {/* TAB CONTENTS - SCROLLABLE BODY */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-xs min-h-[350px]">
          
          {/* ============================================================ */}
          {/* TAB 1: SUBSCRIPTION HISTORY & PLANS                          */}
          {/* ============================================================ */}
          {activeTab === 'subscriptions' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* OUTSTANDING DEBT WARNING BANNER */}
              {(currentMember.balanceDue || 0) > 0 && (
                <div className="bg-gradient-to-r from-rose-950/80 via-slate-900 to-rose-950/70 border-2 border-rose-500/60 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl animate-in slide-in-from-top-2">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center shrink-0">
                      <AlertCircle className="w-6 h-6 animate-pulse text-rose-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-white font-black block text-sm sm:text-base">
                          {isAr ? '⚠️ توجد مستحقات وبواقي مبالغ على العضو' : 'Outstanding Debt on Member'}
                        </strong>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold border border-rose-500/40 font-mono">
                          {isAr ? 'مستحق السداد' : 'Due'}
                        </span>
                      </div>
                      <p className="text-rose-200/90 text-xs mt-0.5 font-medium">
                        {isAr 
                          ? `إجمالي المبلغ المتبقي المطلوب سداده: ${(currentMember.balanceDue || 0).toLocaleString()} ج.م. يمكنك تحصيل أي دفعة نقدية الآن وتوريدها للوردية.`
                          : `Total remaining balance: ${(currentMember.balanceDue || 0).toLocaleString()} EGP.`}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsSettleDebtModalOpen(true)}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs transition-all shadow-lg shadow-emerald-500/20 cursor-pointer whitespace-nowrap active:scale-95 flex items-center gap-2"
                  >
                    <Coins className="w-4 h-4" />
                    <span>{isAr ? `💰 سداد دفعة / تحصيل (${(currentMember.balanceDue || 0).toLocaleString()} ج.م)` : 'Collect Payment'}</span>
                  </button>
                </div>
              )}

              {/* CURRENT ACTIVE SUBSCRIPTION CARD */}
              <div className="bg-gradient-to-br from-[#121a2d] via-[#0d1322] to-[#070a14] rounded-2xl p-4 sm:p-5 border-2 border-amber-500/40 shadow-xl relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                  <div>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black uppercase">
                      {isAr ? 'الاشتراك الحالي المفعل' : 'Current Active Plan'}
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-white mt-1">
                      {member.tier.toUpperCase()} VIP PASS
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {isAr ? 'باقة تدريبية كاملة تشمل دخول الصالة واستخدام الأجهزة ومتابعة المدرب' : 'Full access to gym facilities and coaching'}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-[#070b14] px-4 py-2.5 rounded-xl border border-slate-800 text-center">
                      <span className="text-[10px] text-slate-400 block">{isAr ? 'الأيام المتبقية' : 'Days Left'}</span>
                      <strong className={`text-xl font-black font-mono block ${isActive ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {member.remainingDays}
                      </strong>
                    </div>

                    <button
                      onClick={() => setIsRenewModalOpen(true)}
                      className="py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 cursor-pointer"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>{isAr ? 'تجديد الاشتراك الآن' : 'Renew Subscription'}</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-800/80">
                  <div className="bg-[#070b14]/70 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-bold mb-0.5">{isAr ? 'تاريخ بداية الاشتراك' : 'Start Date'}</span>
                    <strong className="text-slate-200 font-mono font-bold">{member.startDate || 'غير مسجل'}</strong>
                  </div>

                  <div className="bg-[#070b14]/70 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-bold mb-0.5">{isAr ? 'تاريخ نهاية الاشتراك' : 'End Date'}</span>
                    <strong className="text-amber-400 font-mono font-bold">{member.endDate || 'غير محدد'}</strong>
                  </div>

                  <div className="bg-[#070b14]/70 p-2.5 rounded-xl border border-slate-800 flex flex-col justify-between">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="text-[10px] text-slate-400 font-bold">{isAr ? 'الكابتن المشرف' : 'Assigned Coach'}</span>
                      <button
                        type="button"
                        onClick={() => setIsAssignCoachModalOpen(true)}
                        className="text-[9.5px] px-1.5 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold flex items-center gap-1 transition-all cursor-pointer border border-amber-500/30 shrink-0"
                        title={isAr ? 'إسناد أو تغيير الكابتن' : 'Assign / Change Coach'}
                      >
                        <UserCheck className="w-3 h-3 text-amber-400" />
                        <span>{isAr ? 'إسناد' : 'Assign'}</span>
                      </button>
                    </div>
                    <strong className="text-amber-400 font-bold truncate block">{currentMember.assignedCoachName || (isAr ? 'كابتن الصالة العام' : 'General Coach')}</strong>
                  </div>

                  <div className="bg-[#070b14]/70 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-bold mb-0.5">{isAr ? 'كود الدخول السري (PIN)' : 'PIN Code'}</span>
                    <strong className="text-emerald-400 font-mono font-black">{member.passwordPin || member.membershipNumber}</strong>
                  </div>
                </div>
              </div>

              {/* SUBSCRIPTIONS & RENEWALS TIMELINE HISTORY */}
              <div className="space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h4 className="text-sm font-black text-white flex items-center gap-2">
                    <History className="w-4 h-4 text-amber-400" />
                    <span>{isAr ? 'سجل الاشتراكات والتجديدات السابقة (السجل التاريخي)' : 'Previous Subscriptions & Renewal History'}</span>
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400 font-bold">
                      {isAr ? `إجمالي حركات التجديد: ${subscriptionTxs.length}` : `Total Renewals: ${subscriptionTxs.length}`}
                    </span>
                    <button
                      onClick={() => handlePrintSpecificSection('subscriptions')}
                      className="py-1 px-3 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>{isAr ? 'طباعة سجل الاشتراكات' : 'Print Subscriptions'}</span>
                    </button>
                  </div>
                </div>

                {subscriptionTxs.length === 0 ? (
                  <div className="p-8 text-center bg-[#070a14] rounded-2xl border border-slate-800/80">
                    <History className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                    <p className="text-sm font-bold text-slate-400">
                      {isAr ? 'لا توجد حركات تجديد سابقة مسجلة للعضو بعد' : 'No previous subscription renewal records yet'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {isAr ? 'الاشتراك الأولي الحالي ساري من تاريخ التسجيل' : 'Initial subscription active from registration'}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-[#060912]">
                    <table className="w-full text-right rtl:text-right ltr:text-left text-xs">
                      <thead className="bg-[#0a0f1e] text-slate-400 font-bold border-b border-slate-800">
                        <tr>
                          <th className="p-3"># الإيصال</th>
                          <th className="p-3">{isAr ? 'تاريخ التجديد' : 'Date'}</th>
                          <th className="p-3">{isAr ? 'نوع الباقة / العملية' : 'Plan / Type'}</th>
                          <th className="p-3">{isAr ? 'المبلغ المسدد' : 'Amount'}</th>
                          <th className="p-3">{isAr ? 'طريقة الدفع' : 'Payment'}</th>
                          <th className="p-3">{isAr ? 'المسؤول' : 'Staff'}</th>
                          <th className="p-3 text-center">{isAr ? 'الإيصال PDF' : 'Receipt'}</th>
                          {currentUser.role === 'manager' && (
                            <th className="p-3 text-center text-rose-400">{isAr ? 'حذف للأرشيف' : 'Delete'}</th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-medium">
                        {subscriptionTxs.map((tx, idx) => (
                          <tr key={tx.id || idx} className="hover:bg-slate-800/30 transition-colors">
                            <td className="p-3 font-mono font-bold text-amber-400">
                              {tx.id.replace('tx-renew-', 'REC-').slice(0, 12)}
                            </td>
                            <td className="p-3 font-mono text-slate-300">
                              {tx.date}
                            </td>
                            <td className="p-3">
                              <span className="font-bold text-white block">{tx.notes || (isAr ? 'تجديد اشتراك جيم' : 'Gym Renewal')}</span>
                              <span className="text-[10px] text-slate-500 font-mono">Shift #{tx.shiftId || '1'}</span>
                            </td>
                            <td className="p-3 font-mono font-black text-emerald-400">
                              {tx.amount.toLocaleString()} ج.م
                            </td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-bold text-[10px]">
                                {tx.paymentMethod === 'cash' ? (isAr ? '💵 نقدي (كاش)' : 'Cash') :
                                 tx.paymentMethod === 'card' ? (isAr ? '💳 بطاقة (فيزا)' : 'Card') :
                                 tx.paymentMethod === 'instapay' ? 'InstaPay' : 'Vodafone Cash'}
                              </span>
                            </td>
                            <td className="p-3 text-slate-300">
                              {tx.recordedBy || 'موظف الاستقبال'}
                            </td>
                            <td className="p-3 text-center">
                              <button
                                onClick={() => pdfPrintService.printSingleVoucherPDF(tx)}
                                className="p-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500 text-indigo-300 hover:text-white transition-all cursor-pointer inline-flex items-center gap-1 font-bold text-[11px]"
                                title={isAr ? 'طباعة سند القبض والتجديد' : 'Print Voucher'}
                              >
                                <Receipt className="w-3.5 h-3.5" />
                                <span>PDF</span>
                              </button>
                            </td>
                            {currentUser.role === 'manager' && (
                              <td className="p-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const reason = prompt(
                                      isAr 
                                        ? `⚠️ تحذير المدير العام:\nهل أنت متأكد من حذف سجل اشتراك وتجديد بقيمة (${tx.amount} ج.م) للعضو (${member?.fullNameAr}) ونقله لسجل المحذوفات والأرشيف؟\n\nأدخل سبب الحذف (اختياري):` 
                                        : 'Confirm deleting subscription and moving to recycle bin?'
                                    );
                                    if (reason === null) return; // cancelled

                                    const success = StorageService.deleteMemberSubscription(
                                      tx.id,
                                      currentUser.nameAr || 'المدير العام',
                                      'manager',
                                      reason || 'حذف اشتراك من ملف العضو بواسطة المدير العام'
                                    );

                                    if (success) {
                                      audioAlertService.playSuccess();
                                      setToastMessage({
                                        type: 'success',
                                        text: isAr ? '✓ تم حذف اشتراك وتجديد العضو ونقله بنجاح لسجل المحذوفات والأرشيف' : 'Subscription deleted and moved to archive.'
                                      });
                                      setTimeout(() => setToastMessage(null), 4000);
                                      if (onMemberUpdated) onMemberUpdated();
                                    } else {
                                      audioAlertService.playWarning();
                                      alert(isAr ? 'فشل في حذف الاشتراك' : 'Failed to delete subscription');
                                    }
                                  }}
                                  className="p-1.5 rounded-lg bg-rose-500/25 hover:bg-rose-500 text-rose-300 hover:text-white transition-all cursor-pointer inline-flex items-center gap-1 font-bold text-[11px]"
                                  title={isAr ? 'حذف الاشتراك وإرساله لسجل المحذوفات' : 'Delete and move to recycle bin'}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>{isAr ? 'حذف للأرشيف' : 'Archive'}</span>
                                </button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 2: PERSONAL & CONTACT DATA                               */}
          {/* ============================================================ */}
          {activeTab === 'personal' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-black text-white flex items-center gap-2">
                  <User className="w-4 h-4 text-amber-400" />
                  <span>{isAr ? 'الملف الشخصي وهوية العضو المشترك' : 'Member Personal Profile'}</span>
                </h4>
                <button
                  onClick={() => handlePrintSpecificSection('personal')}
                  className="py-1 px-3 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{isAr ? 'طباعة البيانات الشخصية' : 'Print Profile'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* IDENTITY BOX */}
                <div className="bg-[#070b14] p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-3.5">
                  <h4 className="text-sm font-black text-amber-400 flex items-center gap-2 border-b border-slate-800 pb-2.5">
                    <User className="w-4 h-4" />
                    <span>{isAr ? 'بيانات الهوية والاشتراك' : 'Identity & Subscription'}</span>
                  </h4>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">{isAr ? 'الاسم بالكامل (عربي):' : 'Full Name (Ar):'}</span>
                      <strong className="text-white font-bold">{member.fullNameAr}</strong>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">{isAr ? 'الاسم بالكامل (إنجليزي):' : 'Full Name (En):'}</span>
                      <strong className="text-slate-200">{member.fullNameEn || member.fullNameAr}</strong>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">{isAr ? 'رقم العضوية التعريفي:' : 'Membership No:'}</span>
                      <strong className="text-amber-400 font-mono font-black">#{member.membershipNumber}</strong>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">{isAr ? 'الرقم القومي / الهوية:' : 'National ID:'}</span>
                      <strong className="text-slate-200 font-mono">{member.nationalId || (isAr ? 'غير مسجل' : 'N/A')}</strong>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">{isAr ? 'النوع / الجنس:' : 'Gender:'}</span>
                      <strong className="text-slate-200">{member.gender === 'female' ? (isAr ? 'أنثى' : 'Female') : (isAr ? 'ذكر' : 'Male')}</strong>
                    </div>

                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">{isAr ? 'تاريخ الميلاد:' : 'Birth Date:'}</span>
                      <strong className="text-slate-200 font-mono">{member.birthDate || (isAr ? 'مجهول / غير مسجل' : 'Unknown / Not specified')}</strong>
                    </div>
                  </div>
                </div>

                {/* CONTACT & SECURITY BOX */}
                <div className="bg-[#070b14] p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-3.5">
                  <h4 className="text-sm font-black text-amber-400 flex items-center gap-2 border-b border-slate-800 pb-2.5">
                    <Phone className="w-4 h-4" />
                    <span>{isAr ? 'معلومات الاتصال والأمان' : 'Contact & Security'}</span>
                  </h4>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">{isAr ? 'رقم الهاتف الأساسي:' : 'Primary Phone:'}</span>
                      <strong className="text-white font-mono font-bold flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-emerald-400" />
                        {member.phone}
                      </strong>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">{isAr ? 'هاتف الطوارئ / ولي الأمر:' : 'Emergency Phone:'}</span>
                      <strong className="text-slate-200 font-mono">{member.emergencyPhone || (isAr ? 'غير مسجل' : 'N/A')}</strong>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">{isAr ? 'البريد الإلكتروني:' : 'Email:'}</span>
                      <strong className="text-slate-200">{member.email || (isAr ? 'غير مسجل' : 'N/A')}</strong>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">{isAr ? 'العنوان والمنطقة:' : 'Address:'}</span>
                      <strong className="text-slate-200">{member.address || (isAr ? 'غير مسجل' : 'N/A')}</strong>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">{isAr ? 'كود الدخول السري والشاشة (PIN):' : 'PIN / Password:'}</span>
                      <strong className="text-emerald-400 font-mono font-black">{member.passwordPin || member.membershipNumber}</strong>
                    </div>

                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">{isAr ? 'تاريخ التسجيل بالنظام:' : 'Joined Date:'}</span>
                      <strong className="text-slate-200 font-mono">{member.startDate || '2026-10-01'}</strong>
                    </div>
                  </div>
                </div>

                {/* COACH ASSIGNMENT BOX (إسناد كابتن للعضو) */}
                <div className="md:col-span-2 bg-gradient-to-r from-[#0d1627] to-[#070b14] p-4 sm:p-5 rounded-2xl border border-amber-500/30 space-y-3.5 shadow-lg">
                  <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-800/80 pb-2.5">
                    <h4 className="text-sm font-black text-amber-400 flex items-center gap-2">
                      <Dumbbell className="w-4 h-4 text-amber-400" />
                      <span>{isAr ? 'إسناد وتعيين الكابتن المشرف والمدرب الشخصي للعضو' : 'Assigned Coach / Personal Trainer'}</span>
                    </h4>
                    <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isAr ? 'متاح لموظف الاستقبال والمدير' : 'Available for Reception & Management'}</span>
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="flex-1">
                      <label className="block text-[11px] text-slate-400 font-bold mb-1.5">
                        {isAr ? 'اختر الكابتن أو المدرب المشرف على تدريب هذا المشترك:' : 'Select Assigned Coach / Trainer:'}
                      </label>
                      <select
                        value={selectedCoachName}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSelectedCoachName(val);
                          const found = availableCoaches.find(c => c.nameAr === val);
                          setSelectedCoachId(found ? found.id : '');
                        }}
                        className="w-full bg-[#070a12] border-2 border-amber-500/40 rounded-xl p-2.5 text-white font-bold text-xs sm:text-sm focus:outline-none focus:border-amber-400"
                      >
                        <option value="كابتن الصالة العام">{isAr ? 'كابتن الصالة العام (بدون مدرب مخصص)' : 'General Gym Coach'}</option>
                        {availableCoaches.map(c => (
                          <option key={c.id} value={c.nameAr}>
                            {c.nameAr} {c.specialty ? `• ${c.specialty}` : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSaveCoachAssignment()}
                      className="mt-auto py-2.5 px-5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer shrink-0"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>{isAr ? 'حفظ وتثبيت إسناد الكابتن' : 'Confirm & Save Coach'}</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 3: ATTENDANCE & CHECK-IN LOGS (12H COOLDOWN AUDIT)       */}
          {/* ============================================================ */}
          {activeTab === 'attendance' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h4 className="text-sm font-black text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-400" />
                    <span>{isAr ? 'سجل حضور ودخول العضو بالصالة باليوم والساعة والدقيقة' : 'Member Check-In & Gate Register'}</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {isAr ? 'توثيق الدخول الفعلي مع تطبيق شرط الدخول مرة كل 12 ساعة' : 'Chronological entry records with 12-hour limit enforcement'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                    {isAr ? `إجمالي مرات الحضور: ${memberCheckIns.length || member.attendanceCount || 0} مرة` : `Total: ${memberCheckIns.length} check-ins`}
                  </span>
                  <button
                    onClick={() => handlePrintSpecificSection('attendance')}
                    className="py-1 px-3 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>{isAr ? 'طباعة سجل الحضور' : 'Print Attendance'}</span>
                  </button>
                </div>
              </div>

              {memberCheckIns.length === 0 ? (
                <div className="p-8 text-center bg-[#070a14] rounded-2xl border border-slate-800/80">
                  <UserCheck className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-400">
                    {isAr ? 'لم يتم تسجيل حركات دخول أو حضور سابقة لهذا العضو' : 'No check-in logs recorded yet for this member'}
                  </p>
                  <button
                    onClick={() => handleRecordCheckIn(false)}
                    className="mt-3 py-2 px-4 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs inline-flex items-center gap-1.5 shadow cursor-pointer"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>{isAr ? 'تسجيل حضور أول دخول الآن' : 'Record First Check-in'}</span>
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-[#060912]">
                  <table className="w-full text-right rtl:text-right ltr:text-left text-xs">
                    <thead className="bg-[#0a0f1e] text-slate-400 font-bold border-b border-slate-800">
                      <tr>
                        <th className="p-3">{isAr ? 'تاريخ الحضور' : 'Date'}</th>
                        <th className="p-3">{isAr ? 'وقت الدخول' : 'Time'}</th>
                        <th className="p-3">{isAr ? 'بوابة / طريقة الدخول' : 'Gate / Method'}</th>
                        <th className="p-3">{isAr ? 'حالة الاشتراك عند الدخول' : 'Status at Entry'}</th>
                        <th className="p-3">{isAr ? 'الأيام المتبقية' : 'Days Left'}</th>
                        <th className="p-3">{isAr ? 'المسجل' : 'Staff / Performer'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-medium">
                      {memberCheckIns.map((ci, idx) => (
                        <tr key={ci.id || idx} className="hover:bg-slate-800/30 transition-colors">
                          <td className="p-3 font-mono font-bold text-slate-200">
                            {ci.checkInDate}
                          </td>
                          <td className="p-3 font-mono font-black text-emerald-400">
                            {ci.checkInTime}
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 font-bold text-[10px]">
                              {ci.gateOrMethod === 'reception_qr' ? (isAr ? '📱 كارت QR الذكي' : 'QR Card') :
                               ci.gateOrMethod === 'self_portal' ? (isAr ? '⚡ بوابة الدخول الذاتي' : 'Self Portal') :
                               ci.gateOrMethod === 'face_scan' ? (isAr ? '👁️ بصمة الوجه' : 'Face Scan') :
                               (isAr ? '👤 موظف الاستقبال' : 'Manual Staff')}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                              ci.statusAtCheckIn === 'active' 
                                ? 'bg-emerald-500/20 text-emerald-400' 
                                : 'bg-rose-500/20 text-rose-400'
                            }`}>
                              {ci.statusAtCheckIn === 'active' ? (isAr ? 'ساري' : 'Active') : (isAr ? 'منتهي' : 'Expired')}
                            </span>
                          </td>
                          <td className="p-3 font-mono font-bold text-amber-400">
                            {ci.remainingDaysAtCheckIn} {isAr ? 'يوم' : 'd'}
                          </td>
                          <td className="p-3 text-slate-400 text-[11px]">
                            {ci.performedByName || 'موظف الاستقبال'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 4: FINANCIAL TRANSACTIONS & INVOICES                      */}
          {/* ============================================================ */}
          {activeTab === 'financial' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h4 className="text-sm font-black text-emerald-400 flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    <span>{isAr ? `كشف حساب ومدفوعات المشترك: (${member.fullNameAr})` : `Financial Statement for ${member.fullNameAr}`}</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {isAr ? `رقم العضوية: #${member.membershipNumber} • الهاتف: ${member.phone}` : `Member #${member.membershipNumber}`}
                  </p>
                </div>

                <button
                  onClick={() => handlePrintSpecificSection('financial')}
                  className="py-1 px-3 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{isAr ? 'طباعة كشف المدفوعات باسم العضو' : 'Print Statement'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-[#070b14] p-3.5 rounded-2xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-bold mb-0.5">{isAr ? 'إجمالي المدفوعات المسددة' : 'Total Paid'}</span>
                  <strong className="text-lg font-black font-mono text-emerald-400">
                    {memberTransactions.reduce((sum, tx) => sum + (tx.amount || 0), 0).toLocaleString()} ج.م
                  </strong>
                </div>

                <div className="bg-[#070b14] p-3.5 rounded-2xl border border-slate-800 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold mb-0.5">{isAr ? 'المديونية / الرصيد المستحق' : 'Balance Due'}</span>
                    <strong className={`text-lg font-black font-mono ${(currentMember.balanceDue || 0) > 0 ? 'text-rose-400' : 'text-slate-300'}`}>
                      {(currentMember.balanceDue || 0).toLocaleString()} ج.م
                    </strong>
                  </div>
                  {(currentMember.balanceDue || 0) > 0 && (
                    <button
                      type="button"
                      onClick={() => setIsSettleDebtModalOpen(true)}
                      className="mt-2 py-1.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs transition-all shadow flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <Coins className="w-3.5 h-3.5" />
                      <span>{isAr ? 'سداد دفعة' : 'Settle'}</span>
                    </button>
                  )}
                </div>

                <div className="bg-[#070b14] p-3.5 rounded-2xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-bold mb-0.5">{isAr ? 'عدد الحركات المالية' : 'Total Invoices'}</span>
                  <strong className="text-lg font-black font-mono text-amber-400">
                    {memberTransactions.length}
                  </strong>
                </div>
              </div>

              {memberTransactions.length === 0 ? (
                <div className="p-8 text-center bg-[#070a14] rounded-2xl border border-slate-800/80">
                  <CreditCard className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-400">
                    {isAr ? `لا توجد فواتير أو حركات مالية مسجلة بعد باسم (${member.fullNameAr})` : 'No financial transactions recorded yet'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-[#060912]">
                  <table className="w-full text-right rtl:text-right ltr:text-left text-xs">
                    <thead className="bg-[#0a0f1e] text-slate-400 font-bold border-b border-slate-800">
                      <tr>
                        <th className="p-3"># السند</th>
                        <th className="p-3">{isAr ? 'التاريخ' : 'Date'}</th>
                        <th className="p-3">{isAr ? 'اسم المشترك' : 'Member Name'}</th>
                        <th className="p-3">{isAr ? 'نوع الحركة' : 'Type'}</th>
                        <th className="p-3">{isAr ? 'المبلغ' : 'Amount'}</th>
                        <th className="p-3">{isAr ? 'طريقة السداد' : 'Method'}</th>
                        <th className="p-3">{isAr ? 'البيان / الملاحظات' : 'Notes'}</th>
                        <th className="p-3 text-center">{isAr ? 'طباعة' : 'Print'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-medium">
                      {memberTransactions.map((tx, idx) => (
                        <tr key={tx.id || idx} className="hover:bg-slate-800/30 transition-colors">
                          <td className="p-3 font-mono font-bold text-amber-400">
                            {tx.id.replace('tx-', '').slice(0, 10)}
                          </td>
                          <td className="p-3 font-mono text-slate-300">
                            {tx.date}
                          </td>
                          <td className="p-3 font-bold text-white">
                            {member.fullNameAr}
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-bold text-[10px]">
                              {tx.type === 'renewal' ? (isAr ? 'تجديد اشتراك' : 'Renewal') :
                               tx.type === 'subscription' ? (isAr ? 'اشتراك جديد' : 'New Sub') :
                               (isAr ? 'خدمات ومشتريات' : 'POS / Item')}
                            </span>
                          </td>
                          <td className="p-3 font-mono font-black text-emerald-400">
                            {tx.amount.toLocaleString()} ج.م
                          </td>
                          <td className="p-3 text-slate-300">
                            {tx.paymentMethod === 'cash' ? (isAr ? '💵 نقدي' : 'Cash') :
                             tx.paymentMethod === 'card' ? (isAr ? '💳 بطاقة' : 'Card') :
                             tx.paymentMethod === 'instapay' ? 'InstaPay' : 'Vodafone'}
                          </td>
                          <td className="p-3 text-slate-400 text-[11px] max-w-xs truncate">
                            {tx.notes || '—'}
                          </td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() => pdfPrintService.printSingleVoucherPDF(tx)}
                              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                              title={isAr ? 'طباعة السند' : 'Print Voucher'}
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 5: WORKOUT PROGRAM & INBODY METRICS                      */}
          {/* ============================================================ */}
          {activeTab === 'workout' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-black text-white flex items-center gap-2">
                  <Dumbbell className="w-4 h-4 text-indigo-400" />
                  <span>{isAr ? 'البرنامج التدريبي وقياسات اللياقة و InBody' : 'Workout Program & Body Composition'}</span>
                </h4>
                <button
                  onClick={() => handlePrintSpecificSection('workout')}
                  className="py-1 px-3 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{isAr ? 'طباعة تقرير التمارين' : 'Print Workout'}</span>
                </button>
              </div>

              {/* CURRENT PROGRAM */}
              <div className="bg-[#070b14] p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-amber-400 flex items-center gap-2">
                    <Dumbbell className="w-4 h-4" />
                    <span>{member.currentProgram?.titleAr || (isAr ? 'البرنامج التدريبي المخصص للمشترك' : 'Workout Program')}</span>
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">
                      {isAr ? 'الكابتن المشرف:' : 'Coach:'} <strong className="text-amber-400 font-bold">{currentMember.assignedCoachName || currentMember.currentProgram?.coachName || 'كابتن الصالة'}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsAssignCoachModalOpen(true)}
                      className="text-[10px] px-2 py-0.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold transition-all cursor-pointer border border-amber-500/30"
                    >
                      {isAr ? 'تغيير الكابتن' : 'Change'}
                    </button>
                  </div>
                </div>

                {member.currentProgram?.days && member.currentProgram.days.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {member.currentProgram.days.map((d, i) => (
                      <div key={d.id || i} className="bg-[#0c1220] p-3.5 rounded-xl border border-slate-800/80 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-black text-amber-400 text-xs">{d.titleAr}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">{d.focusMuscles?.join(', ') || (isAr ? 'عضلات مستهدفة' : 'Target Muscles')}</span>
                        </div>
                        <ul className="space-y-1 text-[11px] text-slate-300">
                          {d.exercises?.slice(0, 4).map((ex, eIdx) => (
                            <li key={ex.id || eIdx} className="flex justify-between text-slate-400">
                              <span>• {ex.nameAr}</span>
                              <span className="font-mono text-amber-300/90">{ex.sets} × {ex.reps}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">
                    {isAr ? 'برنامج اللياقة البدنية العام مفعل للعضو' : 'General fitness workout assigned'}
                  </p>
                )}
              </div>

              {/* INBODY BODY COMPOSITION HISTORY & MANUAL COACH INPUT & SMART ANALYSIS */}
              <div className="bg-[#070b14] p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <h4 className="text-sm font-black text-emerald-400 flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    <span>{isAr ? 'سجل قياسات InBody (إضافة يدوية وتحليل تطور التمرين)' : 'InBody Body Composition & Workout Analysis'}</span>
                  </h4>
                  <button
                    onClick={() => setIsAddingInBody(!isAddingInBody)}
                    className="py-1.5 px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isAddingInBody ? (isAr ? 'إلغاء الإضافة' : 'Cancel') : (isAr ? '➕ إضافة قياس InBody يدوي' : 'Add InBody Measurement')}</span>
                  </button>
                </div>

                {/* MANUAL ADDITION FORM */}
                {isAddingInBody && (
                  <form onSubmit={handleAddInBodyMeasurement} className="bg-[#0c1220] p-4 rounded-xl border border-emerald-500/40 space-y-3 animate-in fade-in">
                    <h5 className="text-xs font-black text-emerald-300">
                      {isAr ? 'تسجيل قياس جديد بواسطة الكابتن' : 'New Measurement Entry'}
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">{isAr ? 'تاريخ القياس' : 'Date'}</label>
                        <input
                          type="date"
                          value={newInBodyDate}
                          onChange={(e) => setNewInBodyDate(e.target.value)}
                          className="w-full bg-[#070a14] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">{isAr ? 'الوزن (كجم)' : 'Weight (kg)'}</label>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="78.5"
                          value={newInBodyWeight}
                          onChange={(e) => setNewInBodyWeight(e.target.value)}
                          className="w-full bg-[#070a14] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">{isAr ? 'الكتلة العضلية (كجم)' : 'Muscle (kg)'}</label>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="38.2"
                          value={newInBodyMuscle}
                          onChange={(e) => setNewInBodyMuscle(e.target.value)}
                          className="w-full bg-[#070a14] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">{isAr ? 'نسبة الدهون (%)' : 'Body Fat (%)'}</label>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="14.8"
                          value={newInBodyFat}
                          onChange={(e) => setNewInBodyFat(e.target.value)}
                          className="w-full bg-[#070a14] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">{isAr ? 'ملاحظات الكابتن التوجيهية' : 'Coach Notes'}</label>
                      <input
                        type="text"
                        placeholder={isAr ? 'مثال: استجابة ممتازة لتمرين الأثقال وزيادة الأوزان...' : 'Coach training notes...'}
                        value={newInBodyNotes}
                        onChange={(e) => setNewInBodyNotes(e.target.value)}
                        className="w-full bg-[#070a14] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="submit"
                        className="py-1.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black cursor-pointer transition-all shadow-md"
                      >
                        {isAr ? 'حفظ القياس وإجراء التحليل الذكي' : 'Save & Analyze'}
                      </button>
                    </div>
                  </form>
                )}

                {/* SCORES LIST */}
                {currentMember.inbodyScores && currentMember.inbodyScores.length > 0 ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {currentMember.inbodyScores.map((score, idx) => (
                        <div key={idx} className="bg-[#0c1220] p-3 rounded-xl border border-slate-800 space-y-1.5 relative group">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] text-slate-400 font-mono font-bold">{score.date}</span>
                            <button
                              onClick={() => handleDeleteInBodyMeasurement(idx)}
                              className="text-red-400 hover:text-red-300 opacity-70 group-hover:opacity-100 transition-opacity p-1 cursor-pointer"
                              title={isAr ? 'حذف القياس' : 'Delete'}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="grid grid-cols-3 gap-1 text-center pt-1">
                            <div className="bg-[#070a14] p-2 rounded-lg border border-slate-800">
                              <span className="text-[9px] text-slate-400 block">{isAr ? 'الوزن' : 'Weight'}</span>
                              <span className="text-xs font-black text-white font-mono">{score.weightKg} كجم</span>
                            </div>
                            <div className="bg-[#070a14] p-2 rounded-lg border border-slate-800">
                              <span className="text-[9px] text-emerald-400 block">{isAr ? 'عضل' : 'Muscle'}</span>
                              <span className="text-xs font-black text-emerald-400 font-mono">{score.muscleMassKg} كجم</span>
                            </div>
                            <div className="bg-[#070a14] p-2 rounded-lg border border-slate-800">
                              <span className="text-[9px] text-amber-400 block">{isAr ? 'دهون' : 'Fat'}</span>
                              <span className="text-xs font-black text-amber-400 font-mono">{score.bodyFatPercent}%</span>
                            </div>
                          </div>
                          {score.notes && (
                            <p className="text-[10px] text-slate-300 italic pt-1 border-t border-slate-800">
                              "{score.notes}"
                            </p>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* SMART DYNAMIC ANALYSIS ENGINE BOX */}
                    <div className="bg-gradient-to-r from-emerald-950/40 via-[#0d121f] to-indigo-950/40 p-4 rounded-xl border border-emerald-500/30 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-black text-emerald-400">
                        <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                        <span>{isAr ? '🤖 تحليل الأداء والتطور التلقائي (بناءً على قياسات الكابتن اليدوية والتمارين):' : 'Intelligent Body Composition & Workout Progress Analysis:'}</span>
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed font-medium">
                        {generateInBodyAnalysis(currentMember.inbodyScores, isAr)}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 text-center bg-[#0c1220] rounded-xl border border-slate-800 space-y-3">
                    <Activity className="w-8 h-8 text-slate-600 mx-auto" />
                    <p className="text-xs text-slate-400">
                      {isAr ? 'لم يتم تسجيل قياسات InBody يدوياً بعد. انقر على زر "إضافة قياس InBody يدوي" لتسجيل الوزن والكتلة العضلية ونسبة الدهون وبدء التحليل التلقائي.' : 'No measurements added yet. Click "Add InBody Measurement" above.'}
                    </p>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>

        {/* BOTTOM FOOTER BAR */}
        <div className="p-3.5 sm:p-4 bg-[#070a14] border-t border-slate-800/80 flex items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-slate-400 flex items-center gap-2 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{isAr ? 'ملف العضو موثق ومحمي بنظام إدارة نادي GYM-M22' : 'Member profile certified by GYM-M22 Management'}</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Open Full Print Options Modal */}
            <button
              onClick={() => setIsPrintMenuOpen(true)}
              className="py-2 px-3 sm:px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 hover:brightness-110 text-white border border-indigo-400/50 text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all shadow-md shadow-indigo-600/20 active:scale-95"
            >
              <Printer className="w-3.5 h-3.5 text-indigo-200" />
              <span>{isAr ? '🖨️ قائمة خيارات الطباعة...' : 'Print Menu...'}</span>
            </button>

            {/* Direct button to print current tab */}
            <button
              onClick={() => handlePrintSpecificSection(activeTab)}
              className="py-2 px-3 sm:px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
              title={isAr ? 'طباعة التبويب المفتوح حالياً فوراً' : 'Print active tab now'}
            >
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {activeTab === 'subscriptions' ? (isAr ? 'طباعة الاشتراكات' : 'Print Subs') :
                 activeTab === 'personal' ? (isAr ? 'طباعة البيانات' : 'Print Profile') :
                 activeTab === 'financial' ? (isAr ? 'طباعة المدفوعات' : 'Print Ledger') :
                 activeTab === 'attendance' ? (isAr ? 'طباعة الحضور' : 'Print Attendance') :
                 (isAr ? 'طباعة التمارين' : 'Print Workout')}
              </span>
            </button>

            <button
              onClick={onClose}
              className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs cursor-pointer transition-colors"
            >
              {isAr ? 'إغلاق الملف' : 'Close'}
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 🖨️ DEDICATED HIGH-CONTRAST PRINT CENTER OVERLAY MODAL */}
        {/* ========================================================================= */}
        {isPrintMenuOpen && (
          <div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
            onClick={() => setIsPrintMenuOpen(false)}
          >
            <div 
              className="w-full max-w-3xl max-h-[92vh] flex flex-col rounded-3xl bg-[#0c1322] border-2 border-indigo-500/50 text-slate-100 shadow-2xl relative overflow-hidden my-auto"
              dir={isAr ? 'rtl' : 'ltr'}
              onClick={(e) => e.stopPropagation()}
            >
              {/* PRINT DIALOG HEADER */}
              <div className="p-4 sm:p-5 bg-gradient-to-r from-indigo-950 via-[#10172a] to-[#0a0f1d] border-b border-indigo-500/30 flex items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-2xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-400 shadow-inner shrink-0">
                    <Printer className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base sm:text-lg font-black text-white">
                        {isAr ? '🖨️ مركز طباعة وتصدير ملف العضو' : 'Print Member Dossier Center'}
                      </h3>
                      <span className="text-[11px] px-2.5 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
                        #{member.membershipNumber}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5 truncate">
                      {isAr ? `المشترك: ${member.fullNameAr} • الهاتف: ${member.phone}` : `Member: ${member.fullNameAr} • ${member.phone}`}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsPrintMenuOpen(false)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* PRINT DIALOG BODY - GRID OF OPTIONS */}
              <div className="p-4 sm:p-6 overflow-y-auto space-y-3.5 custom-scrollbar">
                <div className="text-xs text-indigo-300 font-bold flex items-center gap-1.5 px-1">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>{isAr ? 'اختر الجزء أو التقرير المطلوب طباعته فورياً بتنسيق رسمي معتمد:' : 'Select section to print:'}</span>
                </div>

                {/* 1. Print Currently Active Tab (Highlighted) */}
                <button
                  onClick={() => handlePrintSpecificSection(activeTab)}
                  className="w-full text-right rtl:text-right ltr:text-left p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-amber-600/10 to-transparent hover:from-amber-500/30 border-2 border-amber-500/60 shadow-lg shadow-amber-500/10 transition-all cursor-pointer group flex items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shrink-0 shadow-md">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-amber-300">
                          {isAr ? '🎯 طباعة القسم الحالي المعروض أمامك' : 'Print Currently Open Tab'}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black">
                          {isAr ? 'التبويب النشط' : 'Active Tab'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1 font-medium">
                        {activeTab === 'subscriptions' ? (isAr ? 'طباعة تقرير سجل الاشتراكات والتجديدات الكامل' : 'Print Subscriptions History') :
                         activeTab === 'personal' ? (isAr ? 'طباعة استمارة البيانات الشخصية وهوية العضو' : 'Print Personal Profile') :
                         activeTab === 'financial' ? (isAr ? `طباعة كشف حساب المدفوعات باسم (${member.fullNameAr})` : 'Print Financial Ledger') :
                         activeTab === 'attendance' ? (isAr ? 'طباعة سجل الحضور وتاريخ تسجيلات الدخول' : 'Print Attendance Logs') :
                         (isAr ? 'طباعة تقرير التمارين الرياضية وقياسات InBody' : 'Print Workout & InBody')}
                      </p>
                    </div>
                  </div>
                  <div className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shrink-0 shadow">
                    {isAr ? 'طباعة الآن 🖨️' : 'Print'}
                  </div>
                </button>

                {/* 2 COLUMNS GRID FOR THE SPECIFIC SECTIONS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  
                  {/* Option A: Subscriptions */}
                  <button
                    onClick={() => handlePrintSpecificSection('subscriptions')}
                    className="text-right rtl:text-right ltr:text-left p-3.5 rounded-2xl bg-[#11192e] hover:bg-[#16213c] border border-slate-700/80 hover:border-amber-500/50 transition-all cursor-pointer group flex flex-col justify-between gap-2.5"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
                        <History className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-black text-white group-hover:text-amber-300 transition-colors">
                          {isAr ? '🔄 سجل الاشتراكات والتجديدات' : 'Subscriptions & Renewals'}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">
                          {isAr ? 'تفاصيل الباقة، التواريخ، الرصيد المتبقي، والتجديدات السابقة والتجميد.' : 'Current plan, expiry date, previous renewals.'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-amber-400/90 pt-2 border-t border-slate-800">
                      <span>{isAr ? `${subscriptionTxs.length} تجديدات واشتراكات مسجلة` : 'Renewals count'}</span>
                      <span className="font-bold underline">{isAr ? 'تصدير PDF ↵' : 'Export'}</span>
                    </div>
                  </button>

                  {/* Option B: Personal Profile */}
                  <button
                    onClick={() => handlePrintSpecificSection('personal')}
                    className="text-right rtl:text-right ltr:text-left p-3.5 rounded-2xl bg-[#11192e] hover:bg-[#16213c] border border-slate-700/80 hover:border-sky-500/50 transition-all cursor-pointer group flex flex-col justify-between gap-2.5"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center shrink-0">
                        <Info className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-black text-white group-hover:text-sky-300 transition-colors">
                          {isAr ? '👤 استمارة البيانات الشخصية والهوية' : 'Personal Profile & Identity'}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">
                          {isAr ? 'الرقم القومي، أرقام الهواتف، جهة الطوارئ، والحالة الصحية والطبية.' : 'National ID, phones, emergency contact, health info.'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-sky-400/90 pt-2 border-t border-slate-800">
                      <span>{isAr ? `الرقم القومي: ${member.nationalId || 'مسجل'}` : 'Identity info'}</span>
                      <span className="font-bold underline">{isAr ? 'تصدير PDF ↵' : 'Export'}</span>
                    </div>
                  </button>

                  {/* Option C: Financial Ledger */}
                  <button
                    onClick={() => handlePrintSpecificSection('financial')}
                    className="text-right rtl:text-right ltr:text-left p-3.5 rounded-2xl bg-[#11192e] hover:bg-[#16213c] border border-slate-700/80 hover:border-emerald-500/50 transition-all cursor-pointer group flex flex-col justify-between gap-2.5"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-black text-white group-hover:text-emerald-300 transition-colors">
                          {isAr ? '💳 كشف حساب المدفوعات والمعاملات' : 'Financial Ledger'}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">
                          {isAr ? `كشف حساب رسمي باسم (${member.fullNameAr}) بجميع الإيصالات والرسوم والمتبقي.` : `Financial statement with receipts for ${member.fullNameAr}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-emerald-400/90 pt-2 border-t border-slate-800">
                      <span>{isAr ? `${memberTransactions.length} إيصال ومعاملة مالية` : 'Transactions'}</span>
                      <span className="font-bold underline">{isAr ? 'تصدير PDF ↵' : 'Export'}</span>
                    </div>
                  </button>

                  {/* Option D: Attendance History */}
                  <button
                    onClick={() => handlePrintSpecificSection('attendance')}
                    className="text-right rtl:text-right ltr:text-left p-3.5 rounded-2xl bg-[#11192e] hover:bg-[#16213c] border border-slate-700/80 hover:border-teal-500/50 transition-all cursor-pointer group flex flex-col justify-between gap-2.5"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center shrink-0">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-black text-white group-hover:text-teal-300 transition-colors">
                          {isAr ? '⏱️ سجل الحضور والدخول للصالة' : 'Attendance & Visits History'}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">
                          {isAr ? 'التواريخ والأوقات الدقيقة ومرات الدخول ومراعاة مهلة الـ 12 ساعة.' : 'Dates, scan times, gates and 12h policy logs.'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-teal-400/90 pt-2 border-t border-slate-800">
                      <span>{isAr ? `${memberCheckIns.length} زيارة موثقة` : 'Visits'}</span>
                      <span className="font-bold underline">{isAr ? 'تصدير PDF ↵' : 'Export'}</span>
                    </div>
                  </button>

                  {/* Option E: Workout & InBody */}
                  <button
                    onClick={() => handlePrintSpecificSection('workout')}
                    className="text-right rtl:text-right ltr:text-left p-3.5 rounded-2xl bg-[#11192e] hover:bg-[#16213c] border border-slate-700/80 hover:border-indigo-500/50 transition-all cursor-pointer group flex flex-col justify-between gap-2.5 md:col-span-2"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0">
                        <Dumbbell className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-black text-white group-hover:text-indigo-300 transition-colors">
                          {isAr ? '🏋️‍♂️ البرنامج التدريبي وتقرير قياسات InBody' : 'Workout Program & InBody Measurements'}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {isAr ? 'جدول التمارين والمجموعات والتكرارات وسجل التطور البدني والوزن ونسبة الدهون.' : 'Workouts, reps, physical progress, and body composition logs.'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-indigo-400/90 pt-2 border-t border-slate-800">
                      <span>{isAr ? 'جاهز للطباعة والتسليم للعضو' : 'Ready to print'}</span>
                      <span className="font-bold underline">{isAr ? 'تصدير PDF ↵' : 'Export'}</span>
                    </div>
                  </button>
                </div>

                {/* Option F: All-in-One Dossier (Full Comprehensive) */}
                <div className="pt-2">
                  <button
                    onClick={() => handlePrintSpecificSection('all')}
                    className="w-full text-right rtl:text-right ltr:text-left p-4 rounded-2xl bg-gradient-to-r from-indigo-900/60 via-purple-900/40 to-slate-900 hover:from-indigo-900/80 border-2 border-indigo-500/70 hover:border-indigo-400 shadow-xl transition-all cursor-pointer group flex items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shrink-0 shadow-lg shadow-indigo-600/30">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-black text-indigo-200 group-hover:text-white transition-colors">
                          {isAr ? '📄 طباعة الملف الشامل الكامل للعضو (Comprehensive Report)' : 'Print Full Complete Dossier'}
                        </div>
                        <p className="text-xs text-slate-300 mt-1">
                          {isAr ? 'وثيقة مدمجة ورسمية تجمع البيانات الشخصية والاشتراكات والمعاملات المالية وسجل الحضور بالكامل.' : 'All sections merged into one comprehensive official document.'}
                        </p>
                      </div>
                    </div>
                    <div className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shrink-0 shadow-md">
                      {isAr ? 'طباعة الملف الكامل 📑' : 'Print All'}
                    </div>
                  </button>
                </div>
              </div>

              {/* DIALOG FOOTER */}
              <div className="p-3.5 sm:p-4 bg-[#070a14] border-t border-slate-800 flex items-center justify-between gap-2 shrink-0">
                <span className="text-[11px] text-slate-400">
                  {isAr ? '💡 تتم طباعة التقرير بصيغة PDF عالية الجودة مع توقيع وخاتم النادي' : 'Exported with club official seal & signature'}
                </span>
                <button
                  onClick={() => setIsPrintMenuOpen(false)}
                  className="py-1.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TOAST NOTIFICATION */}
        {toastMessage && (
          <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl border-2 text-xs font-bold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-300 ${
            toastMessage.type === 'error'
              ? 'bg-rose-950 border-rose-500/80 text-rose-200'
              : 'bg-slate-900 border-emerald-500/80 text-emerald-300'
          }`}>
            {toastMessage.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        )}

        {/* EMBEDDED RENEW SUBSCRIPTION MODAL */}
        {isRenewModalOpen && (
          <RenewSubscriptionModal
            member={member}
            isOpen={isRenewModalOpen}
            onClose={() => setIsRenewModalOpen(false)}
            currentUser={currentUser}
            lang={lang}
            activeShift={activeShift}
            onSuccess={() => {
              setIsRenewModalOpen(false);
              if (onMemberUpdated) onMemberUpdated();
            }}
          />
        )}

        {/* EMBEDDED SETTLE DEBT MODAL */}
        {isSettleDebtModalOpen && (
          <SettleDebtModal
            member={currentMember}
            isOpen={isSettleDebtModalOpen}
            onClose={() => setIsSettleDebtModalOpen(false)}
            currentUser={currentUser}
            lang={lang}
            activeShift={activeShift}
            onSuccess={(updatedMem) => {
              setCurrentMember(updatedMem);
              setIsSettleDebtModalOpen(false);
              if (onMemberUpdated) onMemberUpdated();
            }}
          />
        )}

        {/* EMBEDDED DIGITAL CARD MODAL */}
        {isCardModalOpen && (
          <DigitalCardModal
            member={member}
            isOpen={isCardModalOpen}
            onClose={() => setIsCardModalOpen(false)}
            lang={lang}
            onAttendanceLogged={() => {
              if (onMemberUpdated) onMemberUpdated();
            }}
          />
        )}

        {/* ASSIGN COACH QUICK MODAL */}
        {isAssignCoachModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-md rounded-3xl bg-[#0f1422] border-2 border-amber-500/50 p-6 text-slate-100 shadow-2xl relative">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Dumbbell className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-black text-white">
                    {isAr ? 'إسناد كابتن / مدرب للعضو' : 'Assign Coach to Member'}
                  </h3>
                </div>
                <button
                  onClick={() => setIsAssignCoachModalOpen(false)}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="py-4 space-y-4 text-xs">
                <div className="bg-[#070a12] p-3 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-slate-400 block">{isAr ? 'العضو المحدد:' : 'Member:'}</span>
                  <strong className="text-sm text-white font-black">{currentMember.fullNameAr} (#{currentMember.membershipNumber})</strong>
                  <span className="text-[11px] text-slate-400 block">{isAr ? 'الكابتن الحالي:' : 'Current Coach:'} {currentMember.assignedCoachName || (isAr ? 'كابتن الصالة العام' : 'General')}</span>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">
                    {isAr ? 'اختر الكابتن المشرف من قائمة الكباتن والمدربين:' : 'Select New Coach:'}
                  </label>
                  <select
                    value={selectedCoachName}
                    onChange={(e) => {
                      const name = e.target.value;
                      setSelectedCoachName(name);
                      const found = availableCoaches.find(c => c.nameAr === name);
                      setSelectedCoachId(found ? found.id : '');
                    }}
                    className="w-full bg-[#070a12] border-2 border-amber-500/50 rounded-2xl p-3 text-white font-bold text-sm focus:outline-none focus:border-amber-400"
                  >
                    <option value="كابتن الصالة العام">{isAr ? 'كابتن الصالة العام (بدون مدرب مخصص)' : 'General Gym Coach'}</option>
                    {availableCoaches.map(c => (
                      <option key={c.id} value={c.nameAr}>
                        {c.nameAr} {c.specialty ? `• (${c.specialty})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] leading-relaxed">
                  {isAr 
                    ? '💡 عند إسناد كابتن للعضو، سيتم توثيق اسمه في استمارة اللاعب وكافة التقارير المطبوعة وسجل التمارين.' 
                    : 'Assigned coach will be documented on member profile and printed reports.'}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleSaveCoachAssignment()}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/25 active:scale-95 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isAr ? 'تأكيد وحفظ إسناد الكابتن' : 'Confirm & Save'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsAssignCoachModalOpen(false)}
                  className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm cursor-pointer"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
