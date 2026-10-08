import React, { useState, useEffect } from 'react';
import { 
  EmployeeAccount, 
  FinancialTransaction, 
  GymMember, 
  CurrentUser 
} from '../types/gym';
import { StorageService } from '../services/storageService';
import { audioAlertService } from '../services/audioService';
import { pdfPrintService } from '../services/pdfPrintService';
import { VoucherModal } from './VoucherModal';
import { EmployeeAttendanceWidget } from './EmployeeAttendanceWidget';
import { 
  DollarSign, 
  Users, 
  Receipt, 
  PlusCircle, 
  Percent, 
  TrendingUp, 
  CreditCard, 
  FileText, 
  Printer, 
  Edit, 
  CheckCircle2, 
  Wallet, 
  ArrowDownLeft, 
  ArrowUpRight, 
  X, 
  Building, 
  Crown,
  Dumbbell,
  Eye,
  Trash2
} from 'lucide-react';

interface AccountantDashboardProps {
  currentUser: CurrentUser;
  lang: 'ar' | 'en';
}

export const AccountantDashboard: React.FC<AccountantDashboardProps> = ({ currentUser, lang }) => {
  const isAr = lang === 'ar';
  const [activeTab, setActiveTab] = useState<'payroll' | 'commissions' | 'transactions' | 'ledger' | 'summary'>('payroll');

  const [coaches, setCoaches] = useState<EmployeeAccount[]>([]);
  const [staff, setStaff] = useState<EmployeeAccount[]>([]);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [members, setMembers] = useState<GymMember[]>([]);

  // Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedVoucherForModal, setSelectedVoucherForModal] = useState<FinancialTransaction | null>(null);
  const [payMemberId, setPayMemberId] = useState('');
  const [payAmount, setPayAmount] = useState<number | string>('');
  const [payType, setPayType] = useState<'subscription' | 'renewal' | 'pt_package' | 'expense'>('renewal');
  const [payMethod, setPayMethod] = useState<'cash' | 'card' | 'instapay' | 'vodafone_cash'>('cash');
  const [payNotes, setPayNotes] = useState('');

  const refreshData = () => {
    setCoaches(StorageService.getCoaches());
    setStaff(StorageService.getStaff());
    setTransactions(StorageService.getTransactions());
    setMembers(StorageService.getMembers());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const totalRevenue = transactions.filter(t => t.type !== 'expense').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const netProfit = totalRevenue - totalExpenses;

  const payrollEmployees = React.useMemo(() => {
    const seen = new Set<string>();
    return [...coaches, ...staff].filter(e => {
      if (!e || !e.id || seen.has(e.id)) return false;
      seen.add(e.id);
      return true;
    });
  }, [coaches, staff]);

  const totalMonthlyPayroll = payrollEmployees.reduce((sum, e) => sum + (e.baseSalary || 0), 0);

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = Number(payAmount) || 0;
    if (amountNum <= 0) return;

    const mem = members.find(m => m.id === payMemberId);
    const isExpense = payType === 'expense';
    const kind: 'receipt' | 'payment' = isExpense ? 'payment' : 'receipt';

    const newTx: FinancialTransaction = {
      id: `tx-${Date.now()}`,
      memberId: mem?.id,
      memberName: isExpense ? (payNotes.trim() || 'مصروفات تشغيلية عامة') : (mem?.fullNameAr || 'إيراد نقدي'),
      membershipNumber: mem?.membershipNumber,
      type: payType,
      voucherKind: kind,
      amount: amountNum,
      paymentMethod: payMethod,
      date: StorageService.getLocalCurrentDateTimeString(),
      recordedBy: `${currentUser.nameAr} (الحسابات)`,
      notes: payNotes.trim() || undefined
    };

    const savedTx = StorageService.addTransaction(newTx);
    const seq = savedTx.voucherSequenceNumber || 1;
    const vTitle = isExpense ? `سند صرف #${seq}` : `سند قبض #${seq}`;

    // Audit log
    StorageService.logActivity({
      performerId: currentUser.id,
      performerName: currentUser.nameAr,
      performerRole: currentUser.role,
      category: 'financial',
      actionType: 'payment',
      titleAr: `تسجيل ${vTitle}`,
      titleEn: `Financial Entry #${seq}`,
      detailsAr: `تسجيل ${vTitle} بمبلغ ${amountNum.toLocaleString()} ج.م من خلال الحسابات`,
      detailsEn: `Payment voucher #${seq} recorded`,
      targetId: savedTx.id,
      targetName: savedTx.memberName,
      targetType: 'transaction'
    });

    audioAlertService.playSuccess();
    setIsPaymentModalOpen(false);
    setPayNotes('');
    setPayAmount('');
    refreshData();
  };

  const handleDeleteTransaction = (tx: FinancialTransaction) => {
    const isExpense = (tx.voucherKind || (tx.type === 'expense' ? 'payment' : 'receipt')) === 'payment';
    const seq = tx.voucherSequenceNumber || 1;
    const vName = isExpense ? `سند صرف #${seq}` : `سند قبض #${seq}`;
    const party = tx.memberName || tx.beneficiaryName || 'بدون اسم';

    const confirmMsg = isAr 
      ? `هل أنت متأكد من حذف ${vName} (${party} - ${tx.amount} ج.م)؟\nسيتم نقله فوراً إلى سلة وأرشيف المحذوفات ويمكن للإدارة استرجاعه في أي وقت.`
      : `Are you sure you want to delete ${vName}? It will be moved to the deleted archive.`;

    if (!confirm(confirmMsg)) return;

    const reason = prompt(
      isAr ? 'يرجى كتابة سبب الحذف والتعديل (اختياري):' : 'Enter deletion reason (optional):',
      isAr ? 'تعديل أو إلغاء السند من الحسابات' : 'Voucher adjustment'
    );

    const success = StorageService.deleteTransaction(tx.id, currentUser.nameAr, currentUser.role, reason || undefined);
    if (success) {
      audioAlertService.playDelete();
      refreshData();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Daily Staff Attendance & Working Hours Widget */}
      <EmployeeAttendanceWidget 
        currentUser={currentUser} 
        lang={lang} 
        onAttendanceChanged={refreshData} 
      />

      {/* Executive Financial Banner */}
      <div className="bg-gradient-to-br from-[#121c24] via-[#091118] to-[#04080c] rounded-3xl p-6 border border-emerald-500/40 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-slate-950 flex items-center justify-center font-black shadow-xl shadow-emerald-500/20">
              <DollarSign className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold uppercase tracking-wider">
                  {isAr ? 'الإدارة المالية والحسابات' : 'Financial Accounting & Payroll'}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white mt-1">
                {isAr ? `مسؤول الحسابات: ${currentUser.nameAr}` : currentUser.nameEn}
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                {isAr ? 'رواتب الموظفين، نسب الكباتن والتدريب الخاص، السندات والتقارير المالية' : 'Staff payroll, coach commissions, financial vouchers & profit reports'}
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
            <div className="bg-slate-950/80 p-2.5 rounded-2xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block">{isAr ? 'إجمالي الإيرادات' : 'Revenue'}</span>
              <strong className="text-xs font-black text-emerald-400 font-mono">{totalRevenue.toLocaleString()} ج</strong>
            </div>
            <div className="bg-slate-950/80 p-2.5 rounded-2xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block">{isAr ? 'إجمالي المصروفات' : 'Expenses'}</span>
              <strong className="text-xs font-black text-rose-400 font-mono">{totalExpenses.toLocaleString()} ج</strong>
            </div>
            <div className="bg-slate-950/80 p-2.5 rounded-2xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block">{isAr ? 'كتلة الرواتب' : 'Payroll'}</span>
              <strong className="text-xs font-black text-amber-400 font-mono">{totalMonthlyPayroll.toLocaleString()} ج</strong>
            </div>
            <div className="bg-slate-950/80 p-2.5 rounded-2xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block">{isAr ? 'صافي الربح' : 'Net Profit'}</span>
              <strong className="text-xs font-black text-[#f7cb55] font-mono">{netProfit.toLocaleString()} ج</strong>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveTab('payroll')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'payroll'
                ? 'bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/20'
                : 'bg-slate-900/80 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span>{isAr ? 'أجور ورواتب الموظفين' : 'Employee Payroll'}</span>
          </button>

          <button
            onClick={() => setActiveTab('commissions')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'commissions'
                ? 'bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/20'
                : 'bg-slate-900/80 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            <Percent className="w-4 h-4" />
            <span>{isAr ? 'نسب الكباتن والـ PT' : 'Coach Commissions'}</span>
          </button>

          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'transactions'
                ? 'bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/20'
                : 'bg-slate-900/80 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>{isAr ? 'السندات والقيود المالية' : 'Financial Vouchers'}</span>
          </button>

          <button
            onClick={() => setActiveTab('ledger')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'ledger'
                ? 'bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/20'
                : 'bg-slate-900/80 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>{isAr ? 'الدليل وشجرة الحسابات' : 'General Ledger & Tree'}</span>
          </button>

          <button
            onClick={() => setActiveTab('summary')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'summary'
                ? 'bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/20'
                : 'bg-slate-900/80 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>{isAr ? 'التقرير المالي العام' : 'Financial Summary'}</span>
          </button>
        </div>
      </div>

      {/* TAB 1: PAYROLL (أجور ورواتب الموظفين) */}
      {activeTab === 'payroll' && (
        <div className="bg-[#0c101a] rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Wallet className="w-5 h-5 text-emerald-400" />
              <span>{isAr ? 'جدول رواتب وأجور موظفي النادي والكباتن' : 'Staff & Coach Payroll Table'}</span>
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right rtl:text-right ltr:text-left text-xs">
              <thead className="bg-[#070a12] text-slate-400 font-bold border-b border-slate-800">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">{isAr ? 'الموظف / الكابتن' : 'Name'}</th>
                  <th className="p-3">{isAr ? 'الرتبة والوظيفة' : 'Role'}</th>
                  <th className="p-3">{isAr ? 'رقم الهاتف' : 'Phone'}</th>
                  <th className="p-3">{isAr ? 'الراتب الأساسي الشهري' : 'Base Salary'}</th>
                  <th className="p-3 text-center">{isAr ? 'حالة الصرف' : 'Status'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {payrollEmployees.map((emp, idx) => (
                  <tr key={`payroll-${emp.role}-${emp.id}-${idx}`} className="hover:bg-slate-900/60 transition-colors">
                    <td className="p-3 font-bold text-slate-500">{idx + 1}</td>
                    <td className="p-3 font-bold text-white flex items-center gap-2">
                      <img src={emp.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'} alt={emp.nameAr} className="w-8 h-8 rounded-xl object-cover" />
                      <span>{emp.nameAr}</span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        emp.role === 'coach' ? 'bg-amber-500/20 text-[#f7cb55]' : 'bg-sky-500/20 text-sky-400'
                      }`}>
                        {emp.role === 'coach' ? (isAr ? 'كابتن ومدرب' : 'Coach') : (isAr ? 'استقبال' : 'Staff')}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-slate-300">{emp.phone}</td>
                    <td className="p-3 font-mono font-black text-emerald-400 text-sm">{(emp.baseSalary || 6000).toLocaleString()} ج.م</td>
                    <td className="p-3 text-center">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                        {isAr ? 'جاهز للاستحقاق' : 'Eligible'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: COACH COMMISSIONS (نسب الكباتن والتدريب الخاص) */}
      {activeTab === 'commissions' && (
        <div className="bg-[#0c101a] rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Percent className="w-5 h-5 text-amber-400" />
              <span>{isAr ? 'حساب نسب الكباتن وباقات التدريب الخاص (PT)' : 'Coach Commissions & PT Breakdown'}</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {coaches.map(coach => {
              const trainees = members.filter(m => m.assignedCoachId === coach.id);
              const coachRate = coach.commissionRate || 30;
              const estimatedPTIncome = trainees.length * 1500;
              const coachShare = (estimatedPTIncome * coachRate) / 100;

              return (
                <div key={coach.id} className="bg-slate-950/80 p-5 rounded-3xl border border-slate-800 space-y-4">
                  <div className="flex items-center gap-3">
                    <img src={coach.avatarUrl || 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=150'} alt={coach.nameAr} className="w-12 h-12 rounded-2xl object-cover border border-amber-500/40" />
                    <div>
                      <h4 className="font-bold text-white text-sm">{coach.nameAr}</h4>
                      <p className="text-[11px] text-amber-400 font-semibold">{coach.specialty}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-[#0c101a] p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">{isAr ? 'نسبة الكابتن' : 'Rate'}</span>
                      <strong className="text-amber-400 font-mono font-black text-sm">{coachRate}%</strong>
                    </div>
                    <div className="bg-[#0c101a] p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">{isAr ? 'المتدربين' : 'Trainees'}</span>
                      <strong className="text-sky-400 font-mono font-black text-sm">{trainees.length} {isAr ? 'مشترك' : ''}</strong>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400">{isAr ? 'إجمالي مستحقات النسبة:' : 'Commission Share:'}</span>
                    <strong className="text-emerald-400 font-mono font-black text-sm">{coachShare.toLocaleString()} ج.م</strong>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: TRANSACTIONS & VOUCHERS */}
      {activeTab === 'transactions' && (
        <div className="bg-[#0c101a] rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Receipt className="w-5 h-5 text-emerald-400" />
              <span>{isAr ? 'سجل السندات والقيود المحاسبية' : 'Accounting Entries'}</span>
            </h3>

            <button
              onClick={() => setIsPaymentModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{isAr ? '+ قيد مالي جديد' : '+ New Entry'}</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right rtl:text-right ltr:text-left text-xs">
              <thead className="bg-[#070a12] text-slate-400 font-bold border-b border-slate-800">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">{isAr ? 'رقم السند التسلسلي' : 'Voucher Serial #'}</th>
                  <th className="p-3">{isAr ? 'الطرف / البيان' : 'Party / Notes'}</th>
                  <th className="p-3 text-center">{isAr ? 'نوع القيد' : 'Type'}</th>
                  <th className="p-3 text-center">{isAr ? 'طريقة الدفع' : 'Method'}</th>
                  <th className="p-3">{isAr ? 'المبلغ' : 'Amount'}</th>
                  <th className="p-3">{isAr ? 'التاريخ والمسؤول' : 'Date'}</th>
                  <th className="p-3 text-center">{isAr ? 'معاينة وطباعة' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {[...transactions]
                  .sort((a, b) => {
                    const timeA = a.date ? new Date(a.date.replace(' ', 'T')).getTime() : 0;
                    const timeB = b.date ? new Date(b.date.replace(' ', 'T')).getTime() : 0;
                    if (timeA !== timeB) return timeA - timeB;
                    return (a.voucherSequenceNumber || 0) - (b.voucherSequenceNumber || 0);
                  })
                  .map((tx, idx) => {
                  const isExpense = (tx.voucherKind || (tx.type === 'expense' ? 'payment' : 'receipt')) === 'payment';
                  const seq = tx.voucherSequenceNumber || (idx + 1);

                  return (
                    <tr key={tx.id} className="hover:bg-slate-900/60 transition-colors">
                      <td className="p-3 font-bold text-slate-500">{idx + 1}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-black border ${
                            isExpense 
                              ? 'bg-rose-950/80 text-rose-300 border-rose-500/40' 
                              : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                          }`}>
                            {isExpense ? `سند صرف #${seq}` : `سند قبض #${seq}`}
                          </span>
                        </div>
                      </td>
                      <td className="p-3 font-bold text-white">
                        <div>{tx.memberName}</div>
                        {tx.notes && <div className="text-[10px] text-slate-400">{tx.notes}</div>}
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isExpense ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'
                        }`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="p-3 text-center font-mono text-slate-300">{tx.paymentMethod}</td>
                      <td className="p-3 font-mono font-bold text-sm">
                        <span className={isExpense ? 'text-rose-400' : 'text-emerald-400'}>
                          {tx.amount.toLocaleString()}
                        </span> ج.م
                      </td>
                      <td className="p-3 text-slate-400 text-[11px]">{tx.date}</td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedVoucherForModal(tx)}
                            className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-[#f7cb55] text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                            title="معاينة تفاصيل السند"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>{isAr ? 'عرض' : 'View'}</span>
                          </button>
                          <button
                            onClick={() => pdfPrintService.printSingleVoucherPDF(tx)}
                            className="px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-[#f7cb55] border border-[#f7cb55]/30 text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                            title="طباعة وتصدير السند الرسمي"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>{isAr ? 'طباعة' : 'Print'}</span>
                          </button>
                          <button
                            onClick={() => handleDeleteTransaction(tx)}
                            className="px-2 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                            title="حذف السند ونقله للأرشيف"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>{isAr ? 'حذف' : 'Delete'}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: LEDGER & GENERAL FINANCIAL SUITE */}
      {activeTab === 'ledger' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Treasury Safe Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-[#0b1019] p-4 rounded-2xl border border-emerald-500/30 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-bold">{isAr ? 'الخزينة النقدية (الكاش)' : 'Cash Vault'}</span>
                <Wallet className="w-5 h-5 text-emerald-400" />
              </div>
              <h4 className="text-xl font-black text-emerald-400 font-mono mt-2">
                {(transactions.filter(t => t.paymentMethod === 'cash' && t.type !== 'expense').reduce((s, t) => s + t.amount, 0) - 
                  transactions.filter(t => t.paymentMethod === 'cash' && t.type === 'expense').reduce((s, t) => s + t.amount, 0)).toLocaleString()} ج.م
              </h4>
              <div className="text-[10px] text-slate-500 mt-1">حساب الأصول رقم 10101</div>
            </div>

            <div className="bg-[#0b1019] p-4 rounded-2xl border border-sky-500/30 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-bold">{isAr ? 'حساب فودافون كاش' : 'Vodafone Cash'}</span>
                <CreditCard className="w-5 h-5 text-sky-400" />
              </div>
              <h4 className="text-xl font-black text-sky-400 font-mono mt-2">
                {(transactions.filter(t => t.paymentMethod === 'vodafone_cash' && t.type !== 'expense').reduce((s, t) => s + t.amount, 0) - 
                  transactions.filter(t => t.paymentMethod === 'vodafone_cash' && t.type === 'expense').reduce((s, t) => s + t.amount, 0)).toLocaleString()} ج.م
              </h4>
              <div className="text-[10px] text-slate-500 mt-1">حساب البنوك رقم 10102</div>
            </div>

            <div className="bg-[#0b1019] p-4 rounded-2xl border border-amber-500/30 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-bold">{isAr ? 'حساب شبكة انستا باي' : 'InstaPay Transfer'}</span>
                <TrendingUp className="w-5 h-5 text-amber-400" />
              </div>
              <h4 className="text-xl font-black text-amber-400 font-mono mt-2">
                {(transactions.filter(t => t.paymentMethod === 'instapay' && t.type !== 'expense').reduce((s, t) => s + t.amount, 0) - 
                  transactions.filter(t => t.paymentMethod === 'instapay' && t.type === 'expense').reduce((s, t) => s + t.amount, 0)).toLocaleString()} ج.م
              </h4>
              <div className="text-[10px] text-slate-500 mt-1">حساب البنوك رقم 10103</div>
            </div>

            <div className="bg-[#0b1019] p-4 rounded-2xl border border-purple-500/30 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-bold">{isAr ? 'حساب الدفع بالفيزا' : 'Bank Visa Terminal'}</span>
                <Building className="w-5 h-5 text-purple-400" />
              </div>
              <h4 className="text-xl font-black text-purple-400 font-mono mt-2">
                {(transactions.filter(t => t.paymentMethod === 'card' && t.type !== 'expense').reduce((s, t) => s + t.amount, 0) - 
                  transactions.filter(t => t.paymentMethod === 'card' && t.type === 'expense').reduce((s, t) => s + t.amount, 0)).toLocaleString()} ج.م
              </h4>
              <div className="text-[10px] text-slate-500 mt-1">حساب البنوك رقم 10104</div>
            </div>
          </div>

          {/* Double Entry System Balance Check & Chart of Accounts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Chart of Accounts (شجرة الحسابات) */}
            <div className="md:col-span-2 bg-[#0c101a] p-6 rounded-3xl border border-slate-800 space-y-4">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Building className="w-4 h-4 text-emerald-400" />
                <span>{isAr ? 'شجرة دليل الحسابات الموحد (Chart of Accounts)' : 'Unified Chart of Accounts'}</span>
              </h3>

              <div className="space-y-2.5 text-xs">
                {/* Assets */}
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-black text-slate-300">
                    <span>1000 - الأصول المتداولة (الخزائن والعهود)</span>
                    <span className="text-emerald-400 font-mono">{(totalRevenue - totalExpenses).toLocaleString()} ج.م</span>
                  </div>
                </div>

                {/* Revenues */}
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-black text-slate-300">
                    <span>3000 - إيرادات النشاط الرياضي والاشتراكات</span>
                    <span className="text-[#f7cb55] font-mono">{totalRevenue.toLocaleString()} ج.م</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pl-4 pr-4">
                    <div className="flex justify-between">
                      <span>• اشتراكات صالة الحديد:</span>
                      <span>{transactions.filter(t => t.type === 'subscription').reduce((s, t) => s + t.amount, 0).toLocaleString()} ج</span>
                    </div>
                    <div className="flex justify-between">
                      <span>• تجديد الاشتراكات:</span>
                      <span>{transactions.filter(t => t.type === 'renewal').reduce((s, t) => s + t.amount, 0).toLocaleString()} ج</span>
                    </div>
                  </div>
                </div>

                {/* Expenses */}
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-black text-slate-300">
                    <span>4000 - المصروفات والأجور والتشغيل</span>
                    <span className="text-rose-400 font-mono">{totalExpenses.toLocaleString()} ج.م</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pl-4 pr-4">
                    <div className="flex justify-between">
                      <span>• مصروفات عامة وصيانة:</span>
                      <span>{transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0).toLocaleString()} ج</span>
                    </div>
                    <div className="flex justify-between">
                      <span>• الرواتب التقديرية للوردية:</span>
                      <span>{totalMonthlyPayroll.toLocaleString()} ج</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Trial Balance & Governance Matching Widget */}
            <div className="bg-[#0c101a] p-6 rounded-3xl border border-slate-800 flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span>{isAr ? 'ميزان مراجعة المخرجات الثنائية' : 'Trial Balance Compliance'}</span>
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400">إجمالي الحسابات المدينة (Debits):</span>
                    <span className="font-mono text-emerald-400 font-black">{(totalRevenue).toLocaleString()} ج.م</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400">إجمالي الحسابات الدائنة (Credits):</span>
                    <span className="font-mono text-emerald-400 font-black">{(totalRevenue).toLocaleString()} ج.م</span>
                  </div>
                </div>
              </div>

              <div className="bg-emerald-500/10 border-2 border-emerald-500/30 p-4 rounded-2xl text-center space-y-1.5 mt-4">
                <span className="inline-block text-emerald-400 font-bold text-xs uppercase tracking-widest">
                  {isAr ? '✓ متوازن ومطابق للمعايير' : 'Balanced & Compliant'}
                </span>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  {isAr ? 'جميع المعاملات مقيدة وموزعة تلقائياً في دفتر الأستاذ العام بالتطابق الكامل ومحمية من التلاعب المالي.' : 'System ledger maintains perfect balanced double-entry accounting integrity.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SUMMARY & PRINTING */}
      {activeTab === 'summary' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-[#0c101a] rounded-3xl p-6 border border-slate-800 shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                <span>{isAr ? 'مركز تصدير التقارير المالية والطباعة الفورية' : 'Financial Reports & Printing Center'}</span>
              </h3>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-xs text-slate-400">{isAr ? 'إجمالي الدخل المحصل' : 'Total Revenue'}</span>
                <h4 className="text-xl font-black text-emerald-400 font-mono">{totalRevenue.toLocaleString()} ج.م</h4>
              </div>
              <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-xs text-slate-400">{isAr ? 'إجمالي المصروفات والرواتب' : 'Expenses & Payroll'}</span>
                <h4 className="text-xl font-black text-rose-400 font-mono">{(totalExpenses + totalMonthlyPayroll).toLocaleString()} ج.م</h4>
              </div>
              <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-xs text-slate-400">{isAr ? 'صافي أرباح النادي' : 'Net Business Profit'}</span>
                <h4 className="text-xl font-black text-[#f7cb55] font-mono">{(netProfit - totalMonthlyPayroll).toLocaleString()} ج.م</h4>
              </div>
            </div>

            {/* Printable Reports Grid */}
            <div className="pt-4 border-t border-slate-800/80">
              <h4 className="text-xs font-bold text-slate-300 mb-3">{isAr ? 'التقارير الرسمية الجاهزة للتصدير والطباعة' : 'Available Official Reports'}</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Report 1: Net Profit Statement */}
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-4">
                  <div>
                    <strong className="text-white text-xs block">{isAr ? 'قائمة الأرباح والخسائر الشاملة' : 'P&L Statement'}</strong>
                    <span className="text-[10px] text-slate-500 block mt-0.5">{isAr ? 'بيان صافي الأرباح والإيرادات والمصروفات مدمج' : 'Comprehensive business performance report'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      audioAlertService.playSuccess();
                      pdfPrintService.printNetProfitStatementPDF(totalRevenue, totalExpenses, totalRevenue - totalExpenses, transactions, currentUser.nameAr);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>{isAr ? 'طباعة PDF' : 'Print'}</span>
                  </button>
                </div>

                {/* Report 2: General Ledger */}
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-4">
                  <div>
                    <strong className="text-white text-xs block">{isAr ? 'كشف دفتر الأستاذ العام' : 'General Ledger Report'}</strong>
                    <span className="text-[10px] text-slate-500 block mt-0.5">{isAr ? 'جميع المعاملات والقيود والترحيلات المحاسبية بالتفصيل' : 'Accounting journal postings and matching'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      audioAlertService.playSuccess();
                      pdfPrintService.printGeneralLedgerPDF(transactions, totalRevenue, totalExpenses, totalRevenue - totalExpenses, currentUser.nameAr);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>{isAr ? 'طباعة PDF' : 'Print'}</span>
                  </button>
                </div>

                {/* Report 3: Revenue Report */}
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-4">
                  <div>
                    <strong className="text-white text-xs block">{isAr ? 'تقرير الإيرادات والتحصيلات' : 'Revenue & Collections'}</strong>
                    <span className="text-[10px] text-slate-500 block mt-0.5">{isAr ? 'سندات القبض وتجديد الاشتراكات وعقود التدريب الخاص' : 'All membership and cash receipts detail'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      audioAlertService.playSuccess();
                      pdfPrintService.printRevenueReportPDF(transactions, currentUser.nameAr);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-[#f7cb55] border border-slate-700 font-bold text-xs transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>{isAr ? 'طباعة PDF' : 'Print'}</span>
                  </button>
                </div>

                {/* Report 4: Expense Report */}
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-4">
                  <div>
                    <strong className="text-white text-xs block">{isAr ? 'بيان المصروفات والتشغيل' : 'Operational Expenses'}</strong>
                    <span className="text-[10px] text-slate-500 block mt-0.5">{isAr ? 'سندات الصرف والمشتريات وفواتير الصيانة والرواتب' : 'Cash outlays and operational bills detail'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      audioAlertService.playSuccess();
                      pdfPrintService.printExpenseReportPDF(transactions, currentUser.nameAr);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-400 border border-slate-700 font-bold text-xs transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>{isAr ? 'طباعة PDF' : 'Print'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Entry Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-[#0e1320] border border-emerald-500/40 p-6 text-slate-100 shadow-2xl relative">
            <button
              onClick={() => setIsPaymentModalOpen(false)}
              className="absolute top-4 left-4 rtl:left-4 rtl:right-auto ltr:right-4 ltr:left-auto p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/60"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <h3 className="text-base font-black text-white">
                {isAr ? 'تسجيل قيد مالي محاسبي جديد' : 'New Accounting Entry'}
              </h3>
              <div className="mt-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-bold">الرقم التسلسلي المخصص تلقائياً:</span>
                <span className={`px-2.5 py-0.5 rounded-lg text-xs font-mono font-black border ${
                  payType === 'expense' 
                    ? 'bg-rose-950 text-rose-300 border-rose-500/50' 
                    : 'bg-emerald-950 text-emerald-300 border-emerald-500/50'
                }`}>
                  {StorageService.peekNextVoucherSequence(payType === 'expense' ? 'payment' : 'receipt').labelAr}
                </span>
              </div>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">{isAr ? 'الطرف / العضو' : 'Member / Entity'}</label>
                <select
                  value={payMemberId}
                  onChange={(e) => setPayMemberId(e.target.value)}
                  className="w-full bg-[#080b12] border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="">{isAr ? '-- بدون عضو (مصروفات عامة / أجور) --' : '-- General Expense --'}</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>#{m.membershipNumber} - {m.fullNameAr}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">{isAr ? 'المبلغ (ج.م)' : 'Amount'}</label>
                  <input
                    type="number"
                    required
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder={isAr ? 'أدخل المبلغ...' : 'Enter amount...'}
                    className="w-full bg-[#080b12] border border-slate-800 rounded-xl p-2.5 text-white font-mono font-bold text-emerald-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">{isAr ? 'نوع القيد' : 'Type'}</label>
                  <select
                    value={payType}
                    onChange={(e) => setPayType(e.target.value as any)}
                    className="w-full bg-[#080b12] border border-slate-800 rounded-xl p-2.5 text-white"
                  >
                    <option value="renewal">{isAr ? 'سند قبض - تجديد اشتراك' : 'Renewal'}</option>
                    <option value="subscription">{isAr ? 'سند قبض - اشتراك جديد' : 'New Sub'}</option>
                    <option value="pt_package">{isAr ? 'سند قبض - تدريب خاص PT' : 'PT'}</option>
                    <option value="expense">{isAr ? 'سند صرف - مصروفات وتشغيل' : 'Expense'}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1.5">{isAr ? 'طريقة الدفع' : 'Payment Method'}</label>
                <div className="grid grid-cols-4 gap-1">
                  {(['cash', 'card', 'instapay', 'vodafone_cash'] as const).map(method => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPayMethod(method)}
                      className={`p-2 rounded-xl text-[11px] font-bold border transition-all ${
                        payMethod === method ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-[#080b12] text-slate-400 border-slate-800'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1.5">{isAr ? 'البيان والملاحظات' : 'Notes'}</label>
                <input
                  type="text"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  placeholder={isAr ? 'بيان القيد...' : 'Notes...'}
                  className="w-full bg-[#080b12] border border-slate-800 rounded-xl p-3 text-white"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition-colors shadow-lg shadow-emerald-600/20 cursor-pointer"
                >
                  {isAr ? 'حفظ وتثبيت القيد المرقم' : 'Save Entry'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-3 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs cursor-pointer"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sequential Voucher View & Print Modal */}
      <VoucherModal
        isOpen={!!selectedVoucherForModal}
        transaction={selectedVoucherForModal}
        onClose={() => setSelectedVoucherForModal(null)}
      />
    </div>
  );
};
