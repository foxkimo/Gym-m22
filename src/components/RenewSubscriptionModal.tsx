import React, { useState, useEffect } from 'react';
import { GymMember, CurrentUser, CashShift, MembershipPlan, FinancialTransaction, MembershipTier } from '../types/gym';
import { StorageService } from '../services/storageService';
import { audioAlertService } from '../services/audioService';
import { pdfPrintService } from '../services/pdfPrintService';
import { 
  RefreshCw, 
  Calendar, 
  CreditCard, 
  DollarSign, 
  X, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  User, 
  Tag, 
  Clock, 
  Lock, 
  AlertCircle, 
  ChevronDown,
  Coins
} from 'lucide-react';

interface RenewSubscriptionModalProps {
  member: GymMember | null;
  isOpen: boolean;
  onClose: () => void;
  currentUser: CurrentUser;
  lang: 'ar' | 'en';
  onSuccess?: (updatedMember: GymMember) => void;
  activeShift?: CashShift;
}

export const RenewSubscriptionModal: React.FC<RenewSubscriptionModalProps> = ({
  member,
  isOpen,
  onClose,
  currentUser,
  lang,
  onSuccess,
  activeShift
}) => {
  const isAr = lang === 'ar';
  const openShift = activeShift || StorageService.getActiveShift();
  const plans: MembershipPlan[] = StorageService.getMembershipPlans();

  // Selected plan
  const [selectedPlanId, setSelectedPlanId] = useState<string>(plans[0]?.id || '');
  
  // Custom dates
  const todayStr = StorageService.getLocalTodayString();
  
  // Determine default start date: if member subscription is still active and has future endDate, default to endDate, otherwise today
  const isCurrentlyActive = member && member.status === 'active' && member.remainingDays > 0 && member.endDate;
  const initialStartDate = isCurrentlyActive ? (member?.endDate || todayStr) : todayStr;

  const [startDate, setStartDate] = useState<string>(initialStartDate);
  const [expiryDate, setExpiryDate] = useState<string>('');
  
  // Plan price vs Amount Paid Now (for granular shift revenue tracking)
  const currentPlan = plans.find(p => p.id === selectedPlanId) || plans[0];
  const [planPrice, setPlanPrice] = useState<number | string>(currentPlan?.finalPrice || '');
  const [paidAmount, setPaidAmount] = useState<number | string>('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'instapay' | 'vodafone_cash'>('cash');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (currentPlan) {
      setPlanPrice(currentPlan.finalPrice);
    }
  }, [selectedPlanId]);

  // Recalculate expiryDate whenever startDate or selectedPlan changes
  useEffect(() => {
    if (!startDate || !currentPlan) return;
    try {
      const start = new Date(startDate);
      if (isNaN(start.getTime())) return;

      const end = new Date(start);
      // Add duration in days or months
      if (currentPlan.durationMonths && currentPlan.durationMonths > 0) {
        end.setMonth(end.getMonth() + currentPlan.durationMonths);
      } else if (currentPlan.durationDays && currentPlan.durationDays > 0) {
        end.setDate(end.getDate() + currentPlan.durationDays);
      } else {
        end.setMonth(end.getMonth() + 1); // default 1 month
      }

      setExpiryDate(end.toISOString().split('T')[0]);
    } catch (e) {
      console.error('Error computing expiry date:', e);
    }
  }, [startDate, selectedPlanId]);

  if (!isOpen || !member) return null;

  const priceNum = Math.max(0, Number(planPrice) || 0);
  const paidNum = Math.max(0, Number(paidAmount) || 0);
  const remainingDebt = Math.max(0, priceNum - paidNum);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!member) return;

    if (priceNum < 0) {
      alert(isAr ? 'يرجى إدخال سعر اشتراك صحيح' : 'Please enter a valid plan price');
      return;
    }

    if (!startDate || !expiryDate) {
      alert(isAr ? 'يرجى تحديد تاريخ بداية ونهاية الاشتراك' : 'Please select start and expiry dates');
      return;
    }

    const currentShifts = StorageService.getShifts();
    const openShift = activeShift || currentShifts.find(s => s.status === 'open');
    
    // Only block if staff is actually collecting cash without an open shift
    if (currentUser.role === 'staff' && paidNum > 0 && !openShift) {
      audioAlertService.playWarning();
      alert(isAr 
        ? '⛔ عذراً: يجب فتح الوردية أولاً قبل تحصيل أي مبالغ نقدية للاشتراك أو تسجيل إيرادات' 
        : 'Please open a shift first to collect payments.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Calculate remaining days from today until calculated expiryDate
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const exp = new Date(expiryDate);
      exp.setHours(23, 59, 59, 999);
      const diffTime = exp.getTime() - now.getTime();
      const calculatedRemainingDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

      // 2. Map tier correctly
      const newTier: MembershipTier = (currentPlan?.tierKey === 'vip' || currentPlan?.tierKey === 'gold' || currentPlan?.tierKey === 'diamond') 
        ? currentPlan.tierKey 
        : 'standard';

      // 3. Update member object (add unpaid remainingDebt to existing balanceDue)
      const previousBalance = member.balanceDue || 0;
      const newTotalBalance = previousBalance + remainingDebt;

      const updatedMember: GymMember = {
        ...member,
        tier: newTier,
        startDate: startDate,
        endDate: expiryDate,
        remainingDays: calculatedRemainingDays,
        status: 'active',
        balanceDue: newTotalBalance,
        notes: remainingDebt > 0 
          ? `متبقي ${remainingDebt} ج.م من اشتراك [${currentPlan?.nameAr || 'باقة'}]`
          : member.notes
      };

      StorageService.saveMember(updatedMember);

      // 4. Record Financial Transaction ONLY IF PAID AMOUNT > 0
      // CRITICAL REQUIREMENT: If client did NOT pay (paidNum === 0), do NOT record an income transaction in the shift report!
      let savedTx: FinancialTransaction | undefined = undefined;

      if (paidNum > 0) {
        const newTx: FinancialTransaction = {
          id: `tx-renew-${Date.now()}`,
          memberId: member.id,
          memberName: member.fullNameAr,
          membershipNumber: member.membershipNumber,
          type: 'renewal',
          voucherKind: 'receipt',
          amount: paidNum, // ONLY the actual paid amount is recorded in the shift!
          paymentMethod: paymentMethod,
          date: StorageService.getLocalCurrentDateTimeString(),
          recordedBy: currentUser.nameAr,
          notes: `سداد اشتراك [${currentPlan?.nameAr || 'باقة تجديد'}] • القيمة الكلية: ${priceNum} ج.م • المسدد بالوردية: ${paidNum} ج.م${remainingDebt > 0 ? ` • المتبقي دين: ${remainingDebt} ج.م` : ' • مسدد بالكامل'}${notes.trim() ? ' • ' + notes.trim() : ''}`,
          shiftId: openShift?.id
        };

        savedTx = StorageService.addTransaction(newTx);
      }

      // 5. Log Audit Activity
      StorageService.logActivity({
        performerId: currentUser.id,
        performerName: currentUser.nameAr,
        performerRole: currentUser.role,
        category: 'membership',
        actionType: 'update',
        titleAr: `تجديد اشتراك: ${member.fullNameAr} (مسدد: ${paidNum} ج.م - متبقي: ${remainingDebt} ج.م)`,
        titleEn: `Renewed subscription for ${member.fullNameAr} (Paid: ${paidNum} EGP)`,
        detailsAr: `تجديد اشتراك [${currentPlan?.nameAr}] للعضو #${member.membershipNumber}. سعر الباقة: ${priceNum} ج.م، المسدد فعلياً: ${paidNum} ج.م، المتبقي دين: ${remainingDebt} ج.م. بداية: ${startDate}، نهاية: ${expiryDate}`,
        detailsEn: `Renewed subscription ${currentPlan?.nameAr} for member #${member.membershipNumber}. Paid: ${paidNum} EGP, Due: ${remainingDebt} EGP`,
        targetId: member.id,
        targetName: member.fullNameAr,
        targetType: 'member'
      });

      audioAlertService.playSuccess();

      // 6. Feedback & Offer PDF Voucher Print
      if (paidNum > 0 && savedTx) {
        if (confirm(isAr 
          ? `✓ تم تجديد اشتراك (${member.fullNameAr}) وتوريد مبلغ (${paidNum.toLocaleString()} ج.م) للوردية بنجاح.${remainingDebt > 0 ? `\n⚠️ تم تسجيل باقي المبلغ (${remainingDebt.toLocaleString()} ج.م) كدين على العضو.` : ''}\n\nهل تريد طباعة وتنزيل إيصال التجديد PDF الآن؟` 
          : 'Print Renewal Voucher PDF?')) {
          pdfPrintService.printSingleVoucherPDF(savedTx);
        }
      } else {
        alert(isAr 
          ? `✓ تم تجديد اشتراك (${member.fullNameAr}) كاشتراك آجل غير مسدد.\n⚠️ لن يُحتسب أي إيراد في تقرير الوردية لعدم السداد، وتم قيد مبلغ (${priceNum.toLocaleString()} ج.م) في قائمة المديونيات والمستحقات للمطالبة.`
          : `Subscription activated with 0 payment. 0 added to shift report. ${priceNum} EGP recorded as debt.`);
      }

      if (onSuccess) {
        onSuccess(updatedMember);
      }
      onClose();
    } catch (err) {
      console.error('Failed to renew subscription:', err);
      alert(isAr ? 'حدث خطأ أثناء حفظ التجديد' : 'Error saving renewal');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0b101d] border-2 border-amber-500/50 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-amber-600/20 via-[#101728] to-[#070a12] p-5 border-b border-amber-500/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/20">
              <RefreshCw className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 font-bold uppercase font-mono">
                  #{member.membershipNumber}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                  member.status === 'active' && member.remainingDays > 0
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                }`}>
                  {member.status === 'active' && member.remainingDays > 0 ? (isAr ? 'ساري' : 'Active') : (isAr ? 'منتهي' : 'Expired')}
                </span>
                {(member.balanceDue || 0) > 0 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold font-mono">
                    {isAr ? `مديونية سابقة: ${member.balanceDue} ج` : `Old Debt: ${member.balanceDue}`}
                  </span>
                )}
              </div>
              <h2 className="text-base sm:text-lg font-black text-white mt-0.5">
                {isAr ? `تجديد اشتراك العضو: ${member.fullNameAr}` : `Renew Subscription: ${member.fullNameAr}`}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Current Subscription Info Spotlight */}
          <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <span className="text-[10px] text-slate-400 block font-bold">{isAr ? 'الباقة الحالية' : 'Current Tier'}</span>
              <strong className="text-amber-400 font-mono font-black">{member.tier || 'عادية'}</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-bold">{isAr ? 'تاريخ الانتهاء الحالي' : 'Current Expiry'}</span>
              <strong className="text-slate-200 font-mono font-bold">{member.endDate || 'غير محدد'}</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-bold">{isAr ? 'الأيام المتبقية' : 'Remaining Days'}</span>
              <strong className={`font-mono font-black ${member.remainingDays > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {member.remainingDays || 0} {isAr ? 'يوم' : 'd'}
              </strong>
            </div>
          </div>

          {/* 1. Select Subscription Plan */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-amber-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-amber-400" />
                <span>{isAr ? '📋 اختر باقة الاشتراك للعضو:' : 'Select Plan:'}</span>
              </span>
              <span className="text-[10px] text-amber-400/80 font-mono">
                {plans.length} {isAr ? 'باقات متوفرة' : 'plans'}
              </span>
            </label>

            <div className="relative">
              <select
                value={selectedPlanId}
                onChange={(e) => setSelectedPlanId(e.target.value)}
                className="w-full bg-slate-950 border-2 border-amber-500/50 rounded-2xl p-3 text-xs text-white appearance-none cursor-pointer focus:outline-none focus:border-amber-400 font-bold"
              >
                {plans.map(p => (
                  <option key={p.id} value={p.id} className="bg-slate-900 text-white py-2">
                    {p.nameAr} - {p.finalPrice} ج.م ({p.durationMonths ? `${p.durationMonths} شهر` : `${p.durationDays} يوم`})
                  </option>
                ))}
              </select>
              <div className="absolute left-3 rtl:left-3 ltr:right-3 top-3.5 pointer-events-none text-amber-400">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* 2. Dates Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>{isAr ? 'تاريخ بداية الاشتراك:' : 'Start Date:'}</span>
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isAr ? 'تاريخ انتهاء الاشتراك الجديد:' : 'Expiry Date:'}</span>
              </label>
              <input
                type="date"
                readOnly
                value={expiryDate}
                className="w-full bg-slate-900 border border-emerald-500/40 text-emerald-400 font-mono font-black rounded-xl px-3 py-2 text-xs cursor-not-allowed"
              />
            </div>
          </div>

          {/* 3. CORE FINANCIAL REQUIREMENT: Plan Price vs Amount Paid Now */}
          <div className="bg-[#070b14] p-4 rounded-2xl border-2 border-slate-800 space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Plan Total Price */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isAr ? 'سعر الباقة الإجمالي (ج.م):' : 'Plan Total Price:'}</span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="any"
                  value={planPrice}
                  onChange={(e) => {
                    const val = e.target.value;
                    setPlanPrice(val);
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-amber-400 font-mono font-black focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Amount Paid Now (المبلغ المسدد الآن) */}
              <div>
                <label className="block text-xs font-bold text-emerald-300 mb-1 flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isAr ? 'المبلغ المسدد الآن (المحصل بالوردية):' : 'Amount Paid Now:'}</span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="any"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(e.target.value)}
                  className="w-full bg-slate-950 border-2 border-emerald-500/60 rounded-xl px-3 py-2 text-xs text-emerald-400 font-mono font-black focus:outline-none focus:border-emerald-400"
                />
              </div>
            </div>

            {/* Quick Preset Buttons for Payment */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] text-slate-500 font-bold ml-1">{isAr ? 'خيارات سريعة:' : 'Quick:'}</span>
              <button
                type="button"
                onClick={() => setPaidAmount(priceNum)}
                className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold hover:bg-emerald-500/30 cursor-pointer"
              >
                {isAr ? `✓ سداد كامل (${priceNum} ج.م)` : `Full (${priceNum})`}
              </button>
              {priceNum > 200 && (
                <button
                  type="button"
                  onClick={() => setPaidAmount(Math.round(priceNum / 2))}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 text-[11px] font-bold hover:bg-slate-700 cursor-pointer"
                >
                  {isAr ? `نصف المبلغ (${Math.round(priceNum / 2)} ج.م)` : 'Half'}
                </button>
              )}
              <button
                type="button"
                onClick={() => setPaidAmount(0)}
                className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[11px] font-bold hover:bg-rose-500/30 cursor-pointer"
              >
                {isAr ? '⛔ لم يسدد الآن (0 ج.م - آجل)' : 'Unpaid (0 EGP)'}
              </button>
            </div>

            {/* Live Calculation / Shift Impact Note */}
            <div className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
              paidNum === 0 
                ? 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                : remainingDebt > 0 
                  ? 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                  : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
            }`}>
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="space-y-1">
                {paidNum === 0 ? (
                  <>
                    <strong className="block font-black text-rose-400">
                      {isAr ? '⛔ تنبيه: اشتراك آجل بدون سداد نقدي' : 'Unpaid Subscription'}
                    </strong>
                    <span>
                      {isAr 
                        ? `لن يُضاف أي مبلغ لتقرير الوردية والدرج النقدي (0 ج.م). سيتم قيد كامل ثمن الباقة (${priceNum} ج.م) كدين على العضو ومطالبته بها.`
                        : `No cash added to shift report. Full ${priceNum} EGP recorded as member debt.`}
                    </span>
                  </>
                ) : remainingDebt > 0 ? (
                  <>
                    <strong className="block font-black text-amber-400">
                      {isAr ? `⚠️ سداد جزئي: سيُحسب (${paidNum} ج.م) فقط في إيراد الوردية` : 'Partial Payment'}
                    </strong>
                    <span>
                      {isAr 
                        ? `سيظهر في تقرير الوردية إيراد مسدد بقيمة (${paidNum} ج.م) فقط، والمبلغ المتبقي (${remainingDebt} ج.م) سيُضاف لمديونية العضو.`
                        : `Only ${paidNum} EGP will appear in shift report. Remaining ${remainingDebt} EGP becomes member debt.`}
                    </span>
                  </>
                ) : (
                  <>
                    <strong className="block font-black text-emerald-400">
                      {isAr ? `✓ سداد كامل: سيُورّد مبلغ (${paidNum} ج.م) للوردية بالكامل` : 'Paid in Full'}
                    </strong>
                    <span>
                      {isAr 
                        ? `المبلغ المسدد بالكامل (${paidNum} ج.م) سيسمع في تقرير الوردية وإيراد الخزينة، ولا توجد أي متبقيات على العضو.`
                        : `Full amount ${paidNum} EGP added to shift report. No outstanding debt.`}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* 4. Payment Method & Notes */}
          {paidNum > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isAr ? 'طريقة دفع المبلغ المسدد:' : 'Payment Method:'}</span>
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-bold"
                >
                  <option value="cash">{isAr ? 'نقداً (كاش الخزينة)' : 'Cash'}</option>
                  <option value="card">{isAr ? 'بطاقة إلكترونية (فيزا)' : 'Visa / Card'}</option>
                  <option value="instapay">{isAr ? 'إنستاباي (InstaPay)' : 'InstaPay'}</option>
                  <option value="vodafone_cash">{isAr ? 'فودافون كاش' : 'Vodafone Cash'}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">
                  {isAr ? 'ملاحظات إضافية (اختياري):' : 'Notes (Optional):'}
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={isAr ? 'أي ملاحظات على السند أو التجديد...' : 'Additional notes...'}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          )}

          {/* Shift Closed Warning for Staff */}
          {currentUser.role === 'staff' && paidNum > 0 && !openShift && (
            <div className="bg-rose-950/70 border-2 border-rose-500/60 p-3.5 rounded-2xl flex items-center gap-3 text-xs text-rose-300">
              <Lock className="w-5 h-5 text-rose-400 shrink-0 animate-pulse" />
              <div>
                <strong className="block text-white font-bold">{isAr ? '⛔ تم حظر التحصيل: الوردية مغلقة' : 'Shift Closed'}</strong>
                <span>{isAr ? 'يجب فتح وردية نقدية أولاً باسمك قبل تحصيل أي مبالغ نقدية للاشتراكات في النادي.' : 'You must open an active shift before collecting payments.'}</span>
              </div>
            </div>
          )}

          {/* Footer Submit Button */}
          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>

            <button
              type="submit"
              disabled={isSubmitting || (currentUser.role === 'staff' && paidNum > 0 && !openShift)}
              className={`px-6 py-2.5 rounded-xl font-black text-xs shadow-lg transition-all flex items-center gap-2 ${
                currentUser.role === 'staff' && paidNum > 0 && !openShift
                  ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-50'
                  : 'bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:brightness-110 text-slate-950 shadow-amber-500/20 cursor-pointer disabled:opacity-50'
              }`}
            >
              {currentUser.role === 'staff' && paidNum > 0 && !openShift ? <Lock className="w-4 h-4 text-rose-400" /> : <CheckCircle2 className="w-4 h-4" />}
              <span>
                {currentUser.role === 'staff' && paidNum > 0 && !openShift
                  ? (isAr ? '🔒 فتح المناوبة إجباري للتحصيل' : 'Shift Required') 
                  : (isAr ? `تأكيد وحفظ تجديد الاشتراك (${paidNum > 0 ? `مسدد: ${paidNum} ج` : 'آجل 0 ج'})` : 'Confirm Renewal')}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
