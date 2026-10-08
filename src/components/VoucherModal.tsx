import React from 'react';
import { FinancialTransaction } from '../types/gym';
import { pdfPrintService } from '../services/pdfPrintService';
import { tafqeet } from '../utils/tafqeet';
import { 
  X, 
  Printer, 
  Receipt, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Copy, 
  Check, 
  Calendar, 
  Clock, 
  User, 
  CreditCard,
  ShieldCheck,
  FileText,
  Trash2
} from 'lucide-react';

interface VoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: FinancialTransaction | null;
  onDeleteVoucher?: (tx: FinancialTransaction) => void;
  isManager?: boolean;
}

export const VoucherModal: React.FC<VoucherModalProps> = ({
  isOpen,
  onClose,
  transaction,
  onDeleteVoucher,
  isManager = false
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !transaction) return null;

  const isPayment = (transaction.voucherKind || (transaction.type === 'expense' ? 'payment' : 'receipt')) === 'payment';
  const seqNum = transaction.voucherSequenceNumber || 1;
  const voucherCode = `#${seqNum}`;
  const tafqeetText = tafqeet(transaction.amount);

  const typeLabels: Record<string, string> = {
    subscription: 'اشتراك عضوية جديد',
    renewal: 'تجديد اشتراك عضوية',
    pt_package: 'باقة تدريب خاص (PT)',
    locker: 'تأجير خزانة خاصة (Locker)',
    supplement: 'شراء مكملات غذائية',
    product_sale: 'مبيعات بوفيه وخدمات النادي',
    expense: 'مصروفات تشغيلية وصيانة',
    refund: 'استرداد مالي معتمد'
  };

  const paymentMethodLabels: Record<string, string> = {
    cash: 'نقداً (كاش)',
    card: 'بطاقة بنكية / فيزا',
    transfer: 'تحويل بنكي',
    instapay: 'إنستاباي (InstaPay)',
    vodafone_cash: 'محفظة إلكترونية (فودافون كاش)'
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(voucherCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    pdfPrintService.printSingleVoucherPDF(transaction);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#0b101b] border border-slate-700/80 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden relative text-white">
        
        {/* Top Gradient Ribbon */}
        <div className={`h-2.5 w-full ${isPayment ? 'bg-gradient-to-r from-red-500 via-rose-500 to-amber-500' : 'bg-gradient-to-r from-emerald-500 via-teal-400 to-[#f7cb55]'}`} />

        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black shadow-lg ${
              isPayment 
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' 
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            }`}>
              {isPayment ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownLeft className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-white">
                  {isPayment ? 'سند صرف نقدية ومصروفات' : 'سند قبض مالي وإيرادات'}
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-black border ${
                  isPayment 
                    ? 'bg-rose-950/80 text-rose-300 border-rose-500/50' 
                    : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
                }`}>
                  رقم #{seqNum}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                نظام الترقيم التسلسلي المالي المعتمد وغير القابل للتكرار
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Official Voucher Preview */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto custom-scrollbar">
          
          {/* Official Voucher Badge & Serial Strip */}
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/90 flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-bold text-slate-400 block mb-1">الرقم التسلسلي الفريد للسند:</span>
              <div className="flex items-center gap-2">
                <span className="text-lg font-mono font-black text-[#f7cb55] tracking-wider">
                  {voucherCode}
                </span>
                <button
                  onClick={handleCopyCode}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-[#f7cb55] transition-all cursor-pointer text-xs flex items-center gap-1"
                  title="نسخ كود السند"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'تم النسخ' : 'نسخ'}</span>
                </button>
              </div>
            </div>

            <div className="text-left">
              <span className="text-[11px] font-bold text-slate-400 block mb-1">حالة السند:</span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black">
                <ShieldCheck className="w-4 h-4" />
                معتمد ومسجل بالدفاتر
              </span>
            </div>
          </div>

          {/* Amount Card */}
          <div className={`p-5 rounded-2xl border ${
            isPayment 
              ? 'bg-rose-950/20 border-rose-500/30 text-rose-100' 
              : 'bg-emerald-950/20 border-emerald-500/30 text-emerald-100'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-slate-400 block mb-1">المبلغ المالي المسدد:</span>
                <div className="text-3xl font-black font-mono flex items-baseline gap-2">
                  <span className={isPayment ? 'text-rose-400' : 'text-emerald-400'}>
                    {transaction.amount.toLocaleString()}
                  </span>
                  <span className="text-sm font-bold text-slate-400">جنيه مصري</span>
                </div>
              </div>

              <div className="sm:text-left">
                <span className="text-xs font-bold text-slate-400 block mb-1">طريقة السداد:</span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-white">
                  <CreditCard className="w-3.5 h-3.5 text-[#f7cb55]" />
                  {paymentMethodLabels[transaction.paymentMethod] || transaction.paymentMethod}
                </span>
              </div>
            </div>

            {/* Tafqeet in Arabic Words */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs sm:text-sm font-bold text-slate-300">
              <span className="text-[#f7cb55] ml-1">المبلغ كتابة بالحروف:</span>
              <span className="text-white">{tafqeetText}</span>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 block mb-1">
                {isPayment ? 'المصروف إليه / المستفيد:' : 'المستلم منه / العضو:'}
              </span>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-[#f7cb55]" />
                <span className="font-bold text-white text-sm">
                  {transaction.beneficiaryName || transaction.memberName || (isPayment ? 'مصروف عام' : 'عضو النادي')}
                </span>
                {transaction.membershipNumber && (
                  <span className="text-xs font-mono text-slate-400">
                    (#{transaction.membershipNumber})
                  </span>
                )}
              </div>
            </div>

            <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 block mb-1">نوع المعاملة والبيان:</span>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-white text-sm">
                  {typeLabels[transaction.type] || transaction.type}
                </span>
              </div>
            </div>

            <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 block mb-1">تاريخ ووقت المعاملة:</span>
              <div className="flex items-center gap-3 text-xs text-slate-300 font-mono">
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-slate-400" />{transaction.date.substring(0, 10)}</span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-slate-400" />{transaction.date.substring(11, 19) || '12:00'}</span>
              </div>
            </div>

            <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 block mb-1">الموظف المسؤول والمحرر:</span>
              <span className="font-bold text-white text-xs block">
                {transaction.recordedBy}
              </span>
            </div>
          </div>

          {/* Notes if any */}
          {transaction.notes && (
            <div className="bg-slate-900/40 p-3.5 rounded-xl border border-slate-800 text-xs">
              <span className="font-bold text-slate-400 block mb-1">ملاحظات إضافية:</span>
              <p className="text-slate-200">{transaction.notes}</p>
            </div>
          )}

        </div>

        {/* Modal Footer / Actions */}
        <div className="p-5 sm:p-6 border-t border-slate-800/80 bg-slate-950/70 flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-all cursor-pointer"
            >
              إغلاق النافذة
            </button>

            {isManager && onDeleteVoucher && (
              <button
                onClick={() => onDeleteVoucher(transaction)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                title="حذف هذا السند ونقله إلى سلة المحذوفات"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>حذف السند ونقله للمحذوفات</span>
              </button>
            )}
          </div>

          <button
            onClick={handlePrint}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-[#f7cb55] to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة وتصدير السند PDF (رسمي)</span>
          </button>
        </div>

      </div>
    </div>
  );
};
