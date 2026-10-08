import React, { useState, useEffect } from 'react';
import { GymMember, CurrentUser, CashShift } from '../types/gym';
import { StorageService } from '../services/storageService';
import { audioAlertService } from '../services/audioService';
import { pdfPrintService } from '../services/pdfPrintService';
import { 
  DollarSign, 
  CreditCard, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Lock, 
  User, 
  Coins, 
  Receipt,
  ArrowRightLeft
} from 'lucide-react';

interface SettleDebtModalProps {
  member: GymMember | null;
  isOpen: boolean;
  onClose: () => void;
  currentUser: CurrentUser;
  lang: 'ar' | 'en';
  onSuccess?: (updatedMember: GymMember) => void;
  activeShift?: CashShift;
}

export const SettleDebtModal: React.FC<SettleDebtModalProps> = ({
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
  const currentDebt = member?.balanceDue || 0;

  const [payAmount, setPayAmount] = useState<number | string>(currentDebt);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'instapay' | 'vodafone_cash'>('cash');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (member) {
      setPayAmount(member.balanceDue || 0);
      setNotes('');
    }
  }, [member]);

  if (!isOpen || !member) return null;

  const payNum = Math.max(0, Number(payAmount) || 0);
  const remainingAfterPayment = Math.max(0, currentDebt - payNum);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!member) return;

    if (payNum <= 0) {
      alert(isAr ? 'يرجى إدخال مبلغ صحيح للسداد (أكبر من صفر)' : 'Please enter an amount greater than 0');
      return;
    }

    if (payNum > currentDebt) {
      if (!confirm(isAr 
        ? `المبلغ المدخل (${payNum} ج.م) أكبر من إجمالي المديونية الحالية (${currentDebt} ج.م).\nهل تريد المتابعة وتصفير المديونية بالكامل؟`
        : `Amount (${payNum}) exceeds debt (${currentDebt}). Continue?`)) {
        return;
      }
    }

    if (currentUser.role === 'staff' && !openShift) {
      audioAlertService.playWarning();
      alert(isAr 
        ? '⛔ عذراً: يجب فتح الوردية أولاً قبل تحصيل أي مبالغ أو سداد مستحقات' 
        : 'Please open a shift first.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = StorageService.settleMemberDebt({
        memberId: member.id,
        amount: payNum,
        paymentMethod,
        recordedBy: currentUser.nameAr,
        performerId: currentUser.id,
        performerRole: currentUser.role,
        shiftId: openShift?.id,
        notes: notes.trim() || undefined
      });

      if (!result) {
        throw new Error('Member not found');
      }

      audioAlertService.playSuccess();

      // Offer printing official receipt
      if (confirm(isAr 
        ? `✓ تم سداد مبلغ ${payNum.toLocaleString()} ج.م بنجاح لحساب العضو (${member.fullNameAr}).\nالمتبقي عليه الآن: ${remainingAfterPayment.toLocaleString()} ج.م.\n\nهل تريد طباعة وتنزيل إيصال سداد الدفعة (PDF) الآن؟`
        : `Successfully collected ${payNum} EGP. Remaining: ${remainingAfterPayment} EGP. Print receipt?`)) {
        pdfPrintService.printSingleVoucherPDF(result.transaction);
      }

      if (onSuccess) {
        onSuccess(result.updatedMember);
      }

      onClose();
    } catch (err) {
      console.error('Error settling debt:', err);
      alert(isAr ? 'حدث خطأ أثناء حفظ سداد المديونية' : 'Failed to settle balance');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0b101d] border-2 border-emerald-500/50 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900/40 via-[#101728] to-[#070a12] p-5 border-b border-emerald-500/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-emerald-500/20">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold uppercase font-mono">
                  #{member.membershipNumber}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold">
                  {isAr ? 'سداد مستحقات وبواقي' : 'Debt Settlement'}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white mt-0.5">
                {isAr ? `سداد مديونية العضو: ${member.fullNameAr}` : `Collect Debt: ${member.fullNameAr}`}
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

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Debt Summary Banner */}
          <div className="bg-gradient-to-br from-rose-950/60 via-slate-900 to-slate-950 p-4 rounded-2xl border border-rose-500/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <span className="text-xs text-rose-300/90 font-bold block">
                  {isAr ? 'إجمالي المتبقي على العضو حالياً:' : 'Current Remaining Debt:'}
                </span>
                <span className="text-xs text-slate-400">
                  {member.notes || (isAr ? 'مستحقات اشتراك معلقة' : 'Pending subscription dues')}
                </span>
              </div>
            </div>
            <div className="text-left rtl:text-left ltr:text-right">
              <span className="text-2xl font-black font-mono text-rose-400">
                {currentDebt.toLocaleString()}
              </span>
              <span className="text-xs text-rose-300 font-bold mr-1">ج.م</span>
            </div>
          </div>

          {/* Amount to pay input */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-200 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>{isAr ? 'المبلغ المراد سداده الآن (ج.م):' : 'Amount to Collect Now (EGP):'}</span>
              </span>
              <span className="text-[11px] text-emerald-400 font-mono font-bold">
                {isAr ? 'يُضاف لدرج وإيراد الوردية فوراً' : 'Added to active shift'}
              </span>
            </label>

            <div className="relative">
              <input
                type="number"
                required
                min="1"
                step="any"
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                placeholder="0"
                className="w-full bg-[#070a14] border-2 border-emerald-500/50 rounded-2xl py-3 px-4 text-xl font-black font-mono text-emerald-400 focus:outline-none focus:border-emerald-400"
              />
              <span className="absolute left-4 rtl:left-4 ltr:right-4 top-3.5 text-xs text-slate-400 font-bold">
                ج.م
              </span>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => setPayAmount(currentDebt)}
                className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-black transition-all cursor-pointer"
              >
                {isAr ? `✓ سداد كامل المتبقي (${currentDebt} ج.م)` : `Full (${currentDebt})`}
              </button>

              {currentDebt > 200 && (
                <button
                  type="button"
                  onClick={() => setPayAmount(Math.round(currentDebt / 2))}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-bold transition-all cursor-pointer"
                >
                  {isAr ? `نصف المبلغ (${Math.round(currentDebt / 2)} ج.م)` : 'Half'}
                </button>
              )}

              {[100, 200, 500].filter(v => v < currentDebt).map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setPayAmount(val)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-mono font-bold transition-all cursor-pointer"
                >
                  {val} ج.م
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Calculation Live Breakdown */}
          <div className="bg-[#070b14] p-3.5 rounded-2xl border border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between items-center text-slate-300">
              <span>{isAr ? 'المديونية السابقة:' : 'Previous Debt:'}</span>
              <strong className="font-mono text-rose-400">{currentDebt.toLocaleString()} ج.م</strong>
            </div>
            <div className="flex justify-between items-center text-emerald-400 font-bold border-y border-slate-800/80 py-1.5">
              <span>{isAr ? 'المسدد الآن (المحصل بالوردية):' : 'Collected Now:'}</span>
              <strong className="font-mono text-sm">+{payNum.toLocaleString()} ج.م</strong>
            </div>
            <div className="flex justify-between items-center text-slate-200">
              <span className="font-bold">{isAr ? 'المتبقي على العضو بعد هذا السداد:' : 'Remaining After:'}</span>
              <strong className={`font-mono font-black text-sm ${remainingAfterPayment === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {remainingAfterPayment === 0 ? (isAr ? '0 ج.م (خالص تماماً ✓)' : '0 EGP (Cleared)') : `${remainingAfterPayment.toLocaleString()} ج.م`}
              </strong>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-amber-400" />
              <span>{isAr ? 'طريقة التحصيل / الدفع:' : 'Payment Method:'}</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'cash', label: isAr ? 'نقداً (كاش)' : 'Cash' },
                { id: 'card', label: isAr ? 'فيزا / بطاقة' : 'Card' },
                { id: 'instapay', label: isAr ? 'إنستاباي' : 'InstaPay' },
                { id: 'vodafone_cash', label: isAr ? 'فودافون كاش' : 'Vodafone' }
              ].map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setPaymentMethod(item.id as any)}
                  className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    paymentMethod === item.id
                      ? 'bg-amber-500 text-slate-950 font-black border-amber-400 shadow'
                      : 'bg-[#070b14] text-slate-300 border-slate-800 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">
              {isAr ? 'ملاحظات وسند السداد (اختياري):' : 'Notes (Optional):'}
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={isAr ? 'مثال: سداد دفعة نقدية بالاستقبال...' : 'Notes...'}
              className="w-full bg-[#070b14] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Shift warning for staff */}
          {currentUser.role === 'staff' && !openShift && (
            <div className="bg-rose-950/70 border-2 border-rose-500/60 p-3 rounded-2xl flex items-center gap-3 text-xs text-rose-300">
              <Lock className="w-5 h-5 text-rose-400 shrink-0 animate-pulse" />
              <div>
                <strong className="block text-white font-bold">{isAr ? '⛔ الوردية مغلقة حالياً' : 'Shift Closed'}</strong>
                <span>{isAr ? 'يجب فتح الوردية وتحديد العهدة الافتتاحية قبل تسجيل أي توريد نقدي.' : 'Shift required to collect payments.'}</span>
              </div>
            </div>
          )}

          {/* Actions */}
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
              disabled={isSubmitting || payNum <= 0 || (currentUser.role === 'staff' && !openShift)}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-600 hover:brightness-110 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isAr ? `تأكيد توريد مبلغ (${payNum.toLocaleString()} ج.م)` : `Confirm Payment (${payNum} EGP)`}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
