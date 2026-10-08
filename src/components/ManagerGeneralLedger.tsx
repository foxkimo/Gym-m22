import React, { useState } from 'react';
import { StorageService } from '../services/storageService';
import { pdfPrintService } from '../services/pdfPrintService';
import { audioAlertService } from '../services/audioService';
import { 
  BookOpen, 
  Printer, 
  Search, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  FileText, 
  ArrowUpRight, 
  Layers, 
  CheckCircle2, 
  Lock,
  Sparkles
} from 'lucide-react';

interface ManagerGeneralLedgerProps {
  lang: 'ar' | 'en';
  currentManagerName: string;
}

export const ManagerGeneralLedger: React.FC<ManagerGeneralLedgerProps> = ({ 
  lang,
  currentManagerName 
}) => {
  const isAr = lang === 'ar';
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Gather all financial transactions to build the General Ledger (دفتر الأستاذ العام)
  const transactions = StorageService.getTransactions();

  // Map transactions into ledger entries
  const ledgerEntries = transactions.map((tx, index) => {
    const isCredit = tx.type === 'expense' || tx.type === 'refund';
    const amount = tx.amount;
    const debit = isCredit ? 0 : amount;
    const credit = isCredit ? amount : 0;
    
    let categoryAr = 'إيرادات اشتراكات';
    if (tx.type === 'expense') categoryAr = 'مصروفات صالة';
    else if (tx.type === 'refund') categoryAr = 'استرداد مالي';
    else if (tx.type === 'renewal') categoryAr = 'تجديد اشتراك';
    else if (tx.type === 'product_sale' || tx.type === 'supplement') categoryAr = 'مبيعات المتجر/الكافيتريا';
    else if (tx.type === 'pt_package') categoryAr = 'تدريب شخصي PT';

    const description = tx.notes || tx.memberName || tx.beneficiaryName || (isAr ? `معاملة مالية #${tx.id}` : `Transaction #${tx.id}`);
    const servedBy = tx.recordedBy || 'الإدارة المركزية';
    const timeStr = tx.date.includes('T') ? tx.date.split('T')[1].substring(0, 8) : '12:00:00';
    const dateStr = tx.date.includes('T') ? tx.date.split('T')[0] : tx.date;

    return {
      id: tx.voucherCode || tx.id || `GL-${index + 1000}`,
      date: dateStr,
      time: timeStr,
      type: tx.type,
      categoryAr,
      description,
      servedBy,
      paymentMethod: tx.paymentMethod || 'cash',
      debit,
      credit
    };
  }).reverse();

  // Filter ledger entries
  const filteredEntries = ledgerEntries.filter(entry => {
    if (filterType !== 'all' && entry.type !== filterType) return false;
    if (startDate && entry.date < startDate) return false;
    if (endDate && entry.date > endDate) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      return (
        entry.description.toLowerCase().includes(q) ||
        entry.id.toLowerCase().includes(q) ||
        entry.servedBy.toLowerCase().includes(q) ||
        entry.categoryAr.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Calculate totals
  const totalDebit = filteredEntries.reduce((sum, e) => sum + e.debit, 0);
  const totalCredit = filteredEntries.reduce((sum, e) => sum + e.credit, 0);
  const netBalance = totalDebit - totalCredit;

  const handlePrintLedger = () => {
    audioAlertService.playSuccess();
    pdfPrintService.printGeneralLedgerPDF(filteredEntries, totalDebit, totalCredit, netBalance, currentManagerName);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-amber-950/60 via-[#101626] to-slate-950 rounded-3xl p-6 border-2 border-amber-500/50 shadow-2xl relative overflow-hidden">
        <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 text-slate-950 flex items-center justify-center font-black shadow-xl shadow-amber-500/20">
              <BookOpen className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  <span>{isAr ? 'مستند حصري للمدير العام' : 'GM Exclusive Ledger'}</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                  {isAr ? 'مطابق ومعتمد محاسبياً' : 'Audited & Certified'}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1 tracking-wide">
                {isAr ? 'دفتر الأستاذ العام المالي (General Ledger)' : 'General Ledger Accounting Book'}
              </h2>
              <p className="text-xs text-amber-300/80 mt-0.5">
                {isAr ? 'سجل القيود اليومية وحركات الحسابات المالية، المدين والدائن، والرصيد التراكمي المعتمد' : 'Chronological bookkeeping of debits, credits, and cumulative balances'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrintLedger}
              className="px-4 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-[#f7cb55] to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs flex items-center gap-2 shadow-xl shadow-amber-500/20 transition-all active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{isAr ? 'طباعة دفتر الأستاذ PDF' : 'Print General Ledger PDF'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0c101a] rounded-2xl p-4 border border-slate-800/80 shadow-lg flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block">{isAr ? 'إجمالي قيود الدفتر' : 'Total Entries'}</span>
            <strong className="text-white text-base font-black font-mono">{filteredEntries.length}</strong>
          </div>
        </div>

        <div className="bg-[#0c101a] rounded-2xl p-4 border border-emerald-500/30 shadow-lg flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block">{isAr ? 'إجمالي المدين (الإيرادات)' : 'Total Debit (Revenue)'}</span>
            <strong className="text-emerald-400 text-base font-black font-mono">{totalDebit.toLocaleString()} ج.م</strong>
          </div>
        </div>

        <div className="bg-[#0c101a] rounded-2xl p-4 border border-rose-500/30 shadow-lg flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center font-bold">
            <TrendingDown className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block">{isAr ? 'إجمالي الدائن (المصروفات)' : 'Total Credit (Expenses)'}</span>
            <strong className="text-rose-400 text-base font-black font-mono">{totalCredit.toLocaleString()} ج.م</strong>
          </div>
        </div>

        <div className="bg-[#0c101a] rounded-2xl p-4 border border-amber-500/30 shadow-lg flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block">{isAr ? 'صافي الرصيد الدفتري' : 'Net Book Balance'}</span>
            <strong className="text-amber-400 text-base font-black font-mono">{netBalance.toLocaleString()} ج.م</strong>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#0c101a] rounded-2xl p-4 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex-1 relative">
          <Search className="absolute right-3.5 top-3 w-4 h-4 text-slate-500 rtl:right-3.5 rtl:left-auto ltr:left-3.5 ltr:right-auto" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isAr ? 'بحث في قيود دفتر الأستاذ (رقم القيد، البيان، الموظف)...' : 'Search ledger entries...'}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 rtl:pr-10 ltr:pl-10"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="all">{isAr ? 'جميع أنواع القيود' : 'All Types'}</option>
            <option value="subscription">{isAr ? 'اشتراكات جديدة' : 'New Subscriptions'}</option>
            <option value="renewal">{isAr ? 'تجديدات' : 'Renewals'}</option>
            <option value="expense">{isAr ? 'مصروفات صالة' : 'Expenses'}</option>
            <option value="product_sale">{isAr ? 'مبيعات الكافيتريا/المتجر' : 'POS Sales'}</option>
          </select>

          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* General Ledger Table */}
      <div className="bg-[#0c101a] rounded-3xl border border-slate-800 shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#080b12]">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              {isAr ? 'سجل القيود المحاسبية الدفترية' : 'Accounting Ledger Entries'}
            </h3>
          </div>
          <button
            onClick={handlePrintLedger}
            className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500 hover:text-slate-950 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{isAr ? 'طباعة تقرير الأستاذ' : 'Print Ledger'}</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-right rtl:text-right ltr:text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/80 text-[11px] text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <th className="p-3.5 font-bold">{isAr ? 'رقم القيد' : 'Entry #'}</th>
                <th className="p-3.5 font-bold">{isAr ? 'التاريخ والوقت' : 'Date & Time'}</th>
                <th className="p-3.5 font-bold">{isAr ? 'الفئة' : 'Category'}</th>
                <th className="p-3.5 font-bold">{isAr ? 'بيان المعاملة' : 'Narration / Description'}</th>
                <th className="p-3.5 font-bold">{isAr ? 'الموظف المسؤول' : 'Served By'}</th>
                <th className="p-3.5 font-bold text-center">{isAr ? 'طريقة الدفع' : 'Payment'}</th>
                <th className="p-3.5 font-bold text-left rtl:text-left">{isAr ? 'مدين (+)' : 'Debit'}</th>
                <th className="p-3.5 font-bold text-left rtl:text-left">{isAr ? 'دائن (-)' : 'Credit'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    {isAr ? 'لا توجد قيود مطابقة لمعايير البحث في دفتر الأستاذ' : 'No ledger entries found.'}
                  </td>
                </tr>
              ) : (
                filteredEntries.map((entry, idx) => (
                  <tr key={entry.id + idx} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-3.5 font-mono text-amber-400 font-bold">{entry.id}</td>
                    <td className="p-3.5 font-mono text-slate-300 text-[11px]">
                      <div>{entry.date}</div>
                      <div className="text-[10px] text-slate-500">{entry.time}</div>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px] font-bold">
                        {entry.categoryAr}
                      </span>
                    </td>
                    <td className="p-3.5 text-white font-semibold max-w-xs truncate" title={entry.description}>
                      {entry.description}
                    </td>
                    <td className="p-3.5 text-slate-300">{entry.servedBy}</td>
                    <td className="p-3.5 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-300 uppercase">
                        {entry.paymentMethod}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono font-bold text-emerald-400 text-left rtl:text-left">
                      {entry.debit > 0 ? `${entry.debit.toLocaleString()} ج.م` : '-'}
                    </td>
                    <td className="p-3.5 font-mono font-bold text-rose-400 text-left rtl:text-left">
                      {entry.credit > 0 ? `${entry.credit.toLocaleString()} ج.م` : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
