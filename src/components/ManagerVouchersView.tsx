import React, { useState, useMemo } from 'react';
import { FinancialTransaction, CurrentUser } from '../types/gym';
import { StorageService } from '../services/storageService';
import { pdfPrintService } from '../services/pdfPrintService';
import { audioAlertService } from '../services/audioService';
import { DeleteVoucherModal } from './DeleteVoucherModal';
import { VoucherModal } from './VoucherModal';
import {
  Receipt,
  Search,
  Filter,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Printer,
  Trash2,
  Eye,
  ArrowUpRight,
  ArrowDownLeft,
  Sparkles,
  Layers,
  CreditCard,
  Plus,
  RefreshCw,
  Clock,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface ManagerVouchersViewProps {
  currentUser: CurrentUser;
  lang: 'ar' | 'en';
  onTransactionDeleted?: () => void;
}

export const ManagerVouchersView: React.FC<ManagerVouchersViewProps> = ({
  currentUser,
  lang,
  onTransactionDeleted
}) => {
  const isAr = lang === 'ar';
  const isViewer = currentUser.role === 'viewer';
  const isManager = currentUser.role === 'manager' || currentUser.id === 'manager-1';

  const [transactions, setTransactions] = useState<FinancialTransaction[]>(() => StorageService.getTransactions());
  const [searchQuery, setSearchQuery] = useState('');
  const [voucherFilter, setVoucherFilter] = useState<'all' | 'receipts' | 'expenses'>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'month' | 'custom'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Modals state
  const [selectedVoucherForModal, setSelectedVoucherForModal] = useState<FinancialTransaction | null>(null);
  const [voucherToDelete, setVoucherToDelete] = useState<FinancialTransaction | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const refreshData = () => {
    setTransactions(StorageService.getTransactions());
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Perform transaction deletion
  const handleConfirmDelete = (tx: FinancialTransaction, reason: string) => {
    const success = StorageService.deleteTransaction(
      tx.id, 
      currentUser.nameAr || currentUser.nameEn || 'المدير العام', 
      'manager', 
      reason
    );

    if (success) {
      audioAlertService.playDelete();
      const isExpense = (tx.voucherKind || (tx.type === 'expense' ? 'payment' : 'receipt')) === 'payment';
      const seq = tx.voucherSequenceNumber || 1;
      const vName = isExpense ? `إذن صرف #${seq}` : `سند قبض #${seq}`;
      
      showToast(isAr ? `تم حذف ${vName} بنجاح ونقله إلى سلة وسجل المحذوفات.` : `Deleted ${vName} and moved to Recycle Bin.`);
      refreshData();
      if (onTransactionDeleted) onTransactionDeleted();
    }
  };

  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const isExpense = (tx.voucherKind || (tx.type === 'expense' ? 'payment' : 'receipt')) === 'payment';

      // Voucher Type filter
      if (voucherFilter === 'receipts' && isExpense) return false;
      if (voucherFilter === 'expenses' && !isExpense) return false;

      // Payment method filter
      if (methodFilter !== 'all' && tx.paymentMethod !== methodFilter) return false;

      // Date filtering
      const txDateStr = tx.date ? (tx.date.includes('T') ? tx.date.split('T')[0] : tx.date.substring(0, 10)) : '';
      const todayStr = new Date().toISOString().substring(0, 10);
      const currentMonthStr = todayStr.substring(0, 7);

      if (dateFilter === 'today' && txDateStr !== todayStr) return false;
      if (dateFilter === 'month' && !txDateStr.startsWith(currentMonthStr)) return false;
      if (dateFilter === 'custom') {
        if (startDate && txDateStr < startDate) return false;
        if (endDate && txDateStr > endDate) return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const seqNum = String(tx.voucherSequenceNumber || '');
        const party = (tx.memberName || tx.beneficiaryName || '').toLowerCase();
        const staff = (tx.recordedBy || '').toLowerCase();
        const notes = (tx.notes || '').toLowerCase();
        const memNum = (tx.membershipNumber || '').toLowerCase();
        const amountStr = String(tx.amount);

        const match = 
          party.includes(q) ||
          seqNum.includes(q) ||
          staff.includes(q) ||
          notes.includes(q) ||
          memNum.includes(q) ||
          amountStr.includes(q);

        if (!match) return false;
      }

      return true;
    }).sort((a, b) => {
      const timeA = a.date ? new Date(a.date.replace(' ', 'T')).getTime() : 0;
      const timeB = b.date ? new Date(b.date.replace(' ', 'T')).getTime() : 0;
      if (timeA !== timeB) return timeB - timeA;
      return (b.voucherSequenceNumber || 0) - (a.voucherSequenceNumber || 0);
    });
  }, [transactions, voucherFilter, methodFilter, dateFilter, startDate, endDate, searchQuery]);

  // Totals calculations
  const totalReceipts = filteredTransactions
    .filter(t => (t.voucherKind || (t.type === 'expense' ? 'payment' : 'receipt')) !== 'payment')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = filteredTransactions
    .filter(t => (t.voucherKind || (t.type === 'expense' ? 'payment' : 'receipt')) === 'payment')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalReceipts - totalExpenses;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-950/95 border-2 border-emerald-500 text-emerald-200 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-br from-[#0e1628] via-[#090e1a] to-[#05070f] rounded-3xl p-6 border-2 border-emerald-500/40 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-slate-950 flex items-center justify-center font-black shadow-xl shadow-emerald-500/20">
              <Receipt className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white">
                  {isAr ? 'سجل السندات المالية وأذون الصرف' : 'Financial Vouchers & Expenses Ledger'}
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black">
                  {filteredTransactions.length} {isAr ? 'سند معتمد' : 'Vouchers'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {isAr 
                  ? 'التحكم الكامل في كافة سندات القبض وأذون الصرف: معاينة، طباعة PDF، وحذف السندات الخاطئة ونقلها لسجل المحذوفات' 
                  : 'Central management for all receipts and expenses: preview, print PDF, and delete records to Recycle Bin'}
              </p>
            </div>
          </div>

          {/* Top Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={refreshData}
              className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title={isAr ? 'تحديث البيانات' : 'Refresh'}
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                audioAlertService.playSuccess();
                window.print();
              }}
              className="px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-[#f7cb55] border border-[#f7cb55]/40 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{isAr ? 'طباعة الكشف الحالي' : 'Print Table'}</span>
            </button>
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
          <div className="bg-[#070b14]/80 p-3.5 rounded-2xl border border-slate-800/90 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 font-bold block">{isAr ? 'إجمالي سندات القبض (الإيرادات)' : 'Total Receipts'}</span>
              <strong className="text-base font-black text-emerald-400 font-mono block mt-0.5">
                {totalReceipts.toLocaleString()} ج.م
              </strong>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-[#070b14]/80 p-3.5 rounded-2xl border border-slate-800/90 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 font-bold block">{isAr ? 'إجمالي أذون الصرف (المصروفات)' : 'Total Expenses'}</span>
              <strong className="text-base font-black text-rose-400 font-mono block mt-0.5">
                {totalExpenses.toLocaleString()} ج.م
              </strong>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-[#070b14]/80 p-3.5 rounded-2xl border border-slate-800/90 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 font-bold block">{isAr ? 'صافي حركة النقدية' : 'Net Cashflow'}</span>
              <strong className={`text-base font-black font-mono block mt-0.5 ${netBalance >= 0 ? 'text-[#f7cb55]' : 'text-rose-400'}`}>
                {netBalance.toLocaleString()} ج.م
              </strong>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-[#f7cb55] flex items-center justify-center border border-amber-500/20">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Control & Search Bar */}
      <div className="bg-[#0c101a] rounded-3xl p-5 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute right-3.5 rtl:right-3.5 ltr:left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? 'بحث برقم السند، اسم العضو، المستفيد، الكاشير، أو الملاحظات...' : 'Search by voucher #, member, cashier, notes...'}
              className="w-full bg-[#070a12] border border-slate-800 rounded-2xl py-2.5 px-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Filter Type Tabs */}
          <div className="flex items-center gap-1 bg-slate-950/90 p-1 rounded-2xl border border-slate-800 shrink-0">
            <button
              onClick={() => setVoucherFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                voucherFilter === 'all'
                  ? 'bg-amber-500 text-slate-950 font-black shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {isAr ? 'الكل' : 'All'}
            </button>
            <button
              onClick={() => setVoucherFilter('receipts')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                voucherFilter === 'receipts'
                  ? 'bg-emerald-500 text-slate-950 font-black shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>{isAr ? 'سندات القبض' : 'Receipts'}</span>
            </button>
            <button
              onClick={() => setVoucherFilter('expenses')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                voucherFilter === 'expenses'
                  ? 'bg-rose-500 text-white font-black shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              <span>{isAr ? 'أذون الصرف' : 'Expenses'}</span>
            </button>
          </div>
        </div>

        {/* Second Row: Payment Method and Date range filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 text-xs">
          {/* Payment Method filter */}
          <div>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="w-full bg-[#070a12] border border-slate-800 rounded-xl p-2.5 text-slate-300 font-bold focus:outline-none focus:border-emerald-500"
            >
              <option value="all">{isAr ? '💳 جميع طرق الدفع' : 'All Payment Methods'}</option>
              <option value="cash">{isAr ? 'كاش نقدي' : 'Cash'}</option>
              <option value="card">{isAr ? 'بطاقة بنكية / فيزا' : 'Card'}</option>
              <option value="instapay">InstaPay</option>
              <option value="vodafone_cash">Vodafone Cash</option>
            </select>
          </div>

          {/* Date quick filter */}
          <div>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="w-full bg-[#070a12] border border-slate-800 rounded-xl p-2.5 text-slate-300 font-bold focus:outline-none focus:border-emerald-500"
            >
              <option value="all">{isAr ? '📅 جميع التواريخ' : 'All Dates'}</option>
              <option value="today">{isAr ? 'معاملات اليوم فقط' : 'Today Only'}</option>
              <option value="month">{isAr ? 'معاملات هذا الشهر' : 'This Month'}</option>
              <option value="custom">{isAr ? 'تحديد فترة مخصصة...' : 'Custom Range...'}</option>
            </select>
          </div>

          {/* Start Date if custom */}
          {dateFilter === 'custom' && (
            <div>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="من تاريخ"
                className="w-full bg-[#070a12] border border-slate-800 rounded-xl p-2 text-slate-300 font-mono text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          )}

          {/* End Date if custom */}
          {dateFilter === 'custom' && (
            <div>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="إلى تاريخ"
                className="w-full bg-[#070a12] border border-slate-800 rounded-xl p-2 text-slate-300 font-mono text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          )}
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-[#0c101a] rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#080c14]">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-white">
              {isAr ? 'جدول السندات والمعاملات المالية المسجلة' : 'Recorded Vouchers Table'}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            {filteredTransactions.length} {isAr ? 'سند' : 'records'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-right rtl:text-right ltr:text-left text-xs">
            <thead className="bg-[#070a12] text-slate-400 font-bold border-b border-slate-800">
              <tr>
                <th className="p-3">#</th>
                <th className="p-3">{isAr ? 'رقم السند / الإذن' : 'Voucher Serial'}</th>
                <th className="p-3">{isAr ? 'الطرف / المستفيد' : 'Party / Member'}</th>
                <th className="p-3 text-center">{isAr ? 'نوع المعاملة' : 'Type'}</th>
                <th className="p-3 text-center">{isAr ? 'طريقة الدفع' : 'Method'}</th>
                <th className="p-3 font-mono">{isAr ? 'المبلغ' : 'Amount'}</th>
                <th className="p-3">{isAr ? 'التاريخ والمسؤول' : 'Date & Staff'}</th>
                <th className="p-3 text-center">{isAr ? 'الإجراءات والتحكم' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-slate-500 font-bold">
                    <Receipt className="w-8 h-8 text-slate-700 mx-auto mb-2 opacity-50" />
                    <span>{isAr ? 'لا توجد سندات أو أذون صرف مطابقة لمعايير البحث الحالية' : 'No matching vouchers found'}</span>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx, idx) => {
                  const isExpense = (tx.voucherKind || (tx.type === 'expense' ? 'payment' : 'receipt')) === 'payment';
                  const seq = tx.voucherSequenceNumber || (idx + 1);

                  return (
                    <tr key={tx.id || idx} className="hover:bg-slate-900/60 transition-colors">
                      <td className="p-3 font-bold text-slate-500">{idx + 1}</td>
                      <td className="p-3">
                        <span className={`px-2.5 py-1 rounded-xl text-xs font-mono font-black border inline-block ${
                          isExpense 
                            ? 'bg-rose-950/80 text-rose-300 border-rose-500/40' 
                            : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                        }`}>
                          {isExpense ? `إذن صرف #${seq}` : `سند قبض #${seq}`}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-white">
                        <div>
                          <span>{tx.memberName || tx.beneficiaryName || (isExpense ? 'مصروف عام' : 'إيراد نقدي')}</span>
                          {tx.membershipNumber && (
                            <span className="text-[10px] text-amber-400 block font-mono">
                              عضوية #{tx.membershipNumber}
                            </span>
                          )}
                        </div>
                        {tx.notes && (
                          <div className="text-[10px] text-slate-400 font-normal truncate max-w-[180px] mt-0.5">
                            {tx.notes}
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isExpense ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'
                        }`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="p-3 text-center font-mono text-slate-300">{tx.paymentMethod}</td>
                      <td className="p-3 font-mono font-black text-sm">
                        <span className={isExpense ? 'text-rose-400' : 'text-emerald-400'}>
                          {isExpense ? '-' : '+'}{tx.amount.toLocaleString()}
                        </span> ج.م
                      </td>
                      <td className="p-3 text-slate-400 text-[11px]">
                        <div>{tx.date}</div>
                        <div className="text-slate-500">{tx.recordedBy}</div>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* View Modal */}
                          <button
                            onClick={() => setSelectedVoucherForModal(tx)}
                            className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-[#f7cb55] text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                            title={isAr ? 'معاينة تفاصيل السند' : 'View Voucher'}
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>{isAr ? 'عرض' : 'View'}</span>
                          </button>

                          {/* Print PDF */}
                          <button
                            onClick={() => {
                              audioAlertService.playSuccess();
                              pdfPrintService.printSingleVoucherPDF(tx);
                            }}
                            className="px-2.5 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-[#f7cb55] border border-[#f7cb55]/30 text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                            title={isAr ? 'طباعة السند الرسمي PDF' : 'Print PDF'}
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>{isAr ? 'طباعة' : 'Print'}</span>
                          </button>

                          {/* DELETE VOUCHER -> RECYCLE BIN */}
                          {!isViewer && (
                            <button
                              onClick={() => setVoucherToDelete(tx)}
                              className="px-2.5 py-1 rounded-xl bg-rose-500/15 hover:bg-rose-600 hover:text-white text-rose-400 border border-rose-500/30 text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer shadow-sm active:scale-95"
                              title={isAr ? 'حذف السند ونقله إلى سجل وسلة المحذوفات' : 'Delete Voucher to Trash'}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>{isAr ? 'حذف' : 'Delete'}</span>
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

      {/* Sequential Voucher View Modal */}
      <VoucherModal
        isOpen={!!selectedVoucherForModal}
        transaction={selectedVoucherForModal}
        onClose={() => setSelectedVoucherForModal(null)}
        onDeleteVoucher={(tx) => {
          setSelectedVoucherForModal(null);
          setVoucherToDelete(tx);
        }}
        isManager={isManager}
      />

      {/* Delete Voucher Confirmation In-App Modal */}
      <DeleteVoucherModal
        isOpen={!!voucherToDelete}
        transaction={voucherToDelete}
        onClose={() => setVoucherToDelete(null)}
        onConfirmDelete={handleConfirmDelete}
        lang={lang}
        managerName={currentUser.nameAr || 'المدير العام'}
      />
    </div>
  );
};
