import React, { useState } from 'react';
import { FinancialTransaction } from '../types/gym';
import { 
  X, 
  Trash2, 
  AlertTriangle, 
  Receipt, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ShieldAlert, 
  Calendar, 
  User, 
  CreditCard,
  FileText
} from 'lucide-react';

interface DeleteVoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: FinancialTransaction | null;
  onConfirmDelete: (tx: FinancialTransaction, reason: string) => void;
  lang: 'ar' | 'en';
  managerName?: string;
}

export const DeleteVoucherModal: React.FC<DeleteVoucherModalProps> = ({
  isOpen,
  onClose,
  transaction,
  onConfirmDelete,
  lang,
  managerName = 'المدير العام'
}) => {
  const isAr = lang === 'ar';
  const [reason, setReason] = useState('تعديل وحذف سند مالي من قبل الإدارة المركزية');
  const [customReason, setCustomReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !transaction) return null;

  const isExpense = (transaction.voucherKind || (transaction.type === 'expense' ? 'payment' : 'receipt')) === 'payment';
  const seq = transaction.voucherSequenceNumber || 1;
  const voucherLabel = isExpense ? `إذن صرف #${seq}` : `سند قبض #${seq}`;
  const partyName = transaction.memberName || transaction.beneficiaryName || 'بدون اسم';

  const reasonPresets = [
    { id: '1', ar: 'تعديل وحذف سند مالي من قبل الإدارة المركزية', en: 'Administrative management adjustment' },
    { id: '2', ar: 'إدخال خاطئ بواسطة موظف الاستقبال', en: 'Erroneous entry by receptionist' },
    { id: '3', ar: 'إلغاء المعاملة واسترداد المبلغ للعميل', en: 'Transaction cancelled / refunded' },
    { id: '4', ar: 'تكرار في تسجيل السند المالي', en: 'Duplicate transaction record' },
    { id: '5', ar: 'تعديل الحسابات ومطابقة رصيد الخزينة والوردية', en: 'Shift / Cash balance reconciliation' }
  ];

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const finalReason = customReason.trim() ? customReason.trim() : reason;
    onConfirmDelete(transaction, finalReason);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="w-full max-w-lg rounded-3xl bg-[#0c101b] border-2 border-rose-500/50 text-slate-100 shadow-2xl overflow-hidden relative my-auto">
        
        {/* Top Warning Strip */}
        <div className="h-2 bg-gradient-to-r from-rose-600 via-red-500 to-amber-500" />

        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between bg-[#080c14]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">
                  {isAr ? 'تأكيد حذف السند المالي' : 'Confirm Voucher Deletion'}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-950 text-rose-300 border border-rose-500/40 font-mono">
                  {voucherLabel}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {isAr ? `بواسطة: ${managerName} • سيتم نقل السند إلى سجل وسلة المحذوفات` : `By: ${managerName} • Voucher will be moved to Recycle Bin`}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-900 border border-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleConfirm} className="p-5 space-y-4 text-xs">
          {/* Target Voucher Card Info */}
          <div className="p-4 rounded-2xl bg-[#070a12] border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isExpense ? (
                  <ArrowDownLeft className="w-4 h-4 text-rose-400" />
                ) : (
                  <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                )}
                <span className="font-bold text-white text-sm">{partyName}</span>
                {transaction.membershipNumber && (
                  <span className="text-[10px] text-amber-400 font-mono">#{transaction.membershipNumber}</span>
                )}
              </div>

              <div className="font-mono font-black text-sm text-right">
                <span className={isExpense ? 'text-rose-400' : 'text-emerald-400'}>
                  {transaction.amount.toLocaleString()} ج.م
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
              <div>
                <span className="text-slate-500 block">{isAr ? 'طريقة الدفع:' : 'Payment Method:'}</span>
                <span className="text-slate-300 font-mono font-bold">{transaction.paymentMethod}</span>
              </div>
              <div>
                <span className="text-slate-500 block">{isAr ? 'التاريخ والمسؤول:' : 'Date & Staff:'}</span>
                <span className="text-slate-300 truncate block">{transaction.date} ({transaction.recordedBy})</span>
              </div>
            </div>

            {transaction.notes && (
              <div className="text-[11px] text-slate-400 bg-slate-950/60 p-2 rounded-xl border border-slate-800/60">
                <span className="text-slate-500 block">{isAr ? 'البيان والملاحظات:' : 'Notes:'}</span>
                <span className="text-slate-300">{transaction.notes}</span>
              </div>
            )}
          </div>

          {/* Deletion Notice */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              <strong className="block text-amber-200 font-bold mb-0.5">
                {isAr ? 'حماية وأمان البيانات (Recycle Bin Safe Guard):' : 'Recycle Bin Protection:'}
              </strong>
              {isAr 
                ? 'عند حذف هذا السند، سيتم إزالته من الحسابات النشطة ونقله فوراً لسجل وسلة المحذوفات، ويمكن للمدير العام استرجاعه في أي وقت بنقرة واحدة.'
                : 'This transaction will be moved to the Recycle Bin and can be restored by the manager at any time.'}
            </div>
          </div>

          {/* Preset Reasons */}
          <div className="space-y-2">
            <label className="block text-slate-300 font-bold">
              {isAr ? 'سبب الحذف والتعديل (اختر أو اكتب سبباً مخصصاً):' : 'Reason for Deletion:'}
            </label>
            <div className="space-y-1.5">
              {reasonPresets.map(preset => (
                <label
                  key={preset.id}
                  className={`flex items-center gap-2.5 p-2 rounded-xl border cursor-pointer transition-all ${
                    reason === preset.ar && !customReason
                      ? 'bg-rose-950/40 border-rose-500/60 text-white font-bold'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="deleteReason"
                    checked={reason === preset.ar && !customReason}
                    onChange={() => {
                      setReason(preset.ar);
                      setCustomReason('');
                    }}
                    className="accent-rose-500"
                  />
                  <span>{isAr ? preset.ar : preset.en}</span>
                </label>
              ))}
            </div>

            <input
              type="text"
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder={isAr ? 'أو اكتب سبباً مخصصاً هنا...' : 'Or enter custom reason...'}
              className="w-full bg-[#05070d] border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-rose-500 mt-2"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold transition-colors cursor-pointer"
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-rose-900/30 transition-all cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              <span>{isAr ? 'تأكيد الحذف والنقل لسجل المحذوفات' : 'Confirm Delete & Move to Trash'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
