import React, { useState, useMemo, useEffect } from 'react';
import { FinancialTransaction } from '../types/gym';
import { StorageService } from '../services/storageService';
import { pdfPrintService } from '../services/pdfPrintService';
import { audioAlertService } from '../services/audioService';
import { tafqeet } from '../utils/tafqeet';
import {
  X,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Receipt,
  Wallet,
  Printer,
  Search,
  Filter,
  Calendar,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownLeft,
  PieChart,
  CreditCard,
  Building,
  Sparkles,
  Layers,
  ChevronRight,
  Percent,
  Trash2
} from 'lucide-react';

import { DeleteVoucherModal } from './DeleteVoucherModal';

export type FinancialDetailType = 'revenue' | 'expense' | 'profit';

interface ManagerFinancialDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType: FinancialDetailType;
  transactions: FinancialTransaction[];
  managerName?: string;
  lang: 'ar' | 'en';
  onTransactionDeleted?: () => void;
}

export const ManagerFinancialDetailModal: React.FC<ManagerFinancialDetailModalProps> = ({
  isOpen,
  onClose,
  initialType,
  transactions,
  managerName = 'المدير العام',
  lang,
  onTransactionDeleted
}) => {
  const isAr = lang === 'ar';
  const [activeTab, setActiveTab] = useState<FinancialDetailType>(initialType);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [localTransactions, setLocalTransactions] = useState<FinancialTransaction[]>(transactions);
  const [voucherToDelete, setVoucherToDelete] = useState<FinancialTransaction | null>(null);

  // Synchronize initialType and transactions when opened
  useEffect(() => {
    setActiveTab(initialType);
    setSearchQuery('');
    setSelectedMethod('all');
    setSelectedPeriod('all');
    setSelectedCategory('all');
    setLocalTransactions(transactions);
  }, [initialType, isOpen, transactions]);

  // Handle Deleting Transaction for General Manager
  const handleDeleteTransaction = (tx: FinancialTransaction) => {
    setVoucherToDelete(tx);
  };

  const handleConfirmDelete = (tx: FinancialTransaction, reason: string) => {
    const success = StorageService.deleteTransaction(tx.id, managerName, 'manager', reason);
    if (success) {
      audioAlertService.playDelete();
      setLocalTransactions(prev => prev.filter(t => t.id !== tx.id));
      if (onTransactionDeleted) onTransactionDeleted();
    }
  };

  if (!isOpen) return null;

  // Base calculations
  const allRevenues = localTransactions.filter(t => t.type !== 'expense');
  const allExpenses = localTransactions.filter(t => t.type === 'expense');

  const totalRevenue = allRevenues.reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = allExpenses.reduce((sum, t) => sum + t.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0';

  // Revenue Categorization
  const subRevenue = allRevenues.filter(t => t.type === 'subscription').reduce((s, t) => s + t.amount, 0);
  const renewalRevenue = allRevenues.filter(t => t.type === 'renewal').reduce((s, t) => s + t.amount, 0);
  const ptRevenue = allRevenues.filter(t => t.type === 'pt_package').reduce((s, t) => s + t.amount, 0);
  const posRevenue = allRevenues.filter(t => t.type === 'product_sale' || t.type === 'supplement' || t.type === 'locker').reduce((s, t) => s + t.amount, 0);
  const otherRevenue = totalRevenue - (subRevenue + renewalRevenue + ptRevenue + posRevenue);

  // Expense Categorization
  const getExpenseCat = (t: FinancialTransaction): string => {
    const text = (t.notes || '').toLowerCase();
    if (text.includes('صيانة') || text.includes('تصليح') || text.includes('أجهزة') || text.includes('maintenance')) return 'maintenance';
    if (text.includes('نظافة') || text.includes('تعقيم') || text.includes('cleaning')) return 'cleaning';
    if (text.includes('أدوات') || text.includes('مهمات') || text.includes('supplies')) return 'supplies';
    if (text.includes('بوفيه') || text.includes('بار') || text.includes('قهوة') || text.includes('buffet')) return 'buffet';
    if (text.includes('كهرباء') || text.includes('مياه') || text.includes('فواتير') || text.includes('إنترنت') || text.includes('نت') || text.includes('utilities')) return 'utilities';
    return 'other';
  };

  const maintenanceExp = allExpenses.filter(t => getExpenseCat(t) === 'maintenance').reduce((s, t) => s + t.amount, 0);
  const cleaningExp = allExpenses.filter(t => getExpenseCat(t) === 'cleaning').reduce((s, t) => s + t.amount, 0);
  const suppliesExp = allExpenses.filter(t => getExpenseCat(t) === 'supplies').reduce((s, t) => s + t.amount, 0);
  const buffetExp = allExpenses.filter(t => getExpenseCat(t) === 'buffet').reduce((s, t) => s + t.amount, 0);
  const utilitiesExp = allExpenses.filter(t => getExpenseCat(t) === 'utilities').reduce((s, t) => s + t.amount, 0);
  const otherExp = totalExpenses - (maintenanceExp + cleaningExp + suppliesExp + buffetExp + utilitiesExp);

  // Filtering function
  const filterList = (list: FinancialTransaction[]) => {
    return list.filter(item => {
      // Search
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || 
        (item.memberName && item.memberName.toLowerCase().includes(q)) ||
        (item.beneficiaryName && item.beneficiaryName.toLowerCase().includes(q)) ||
        (item.notes && item.notes.toLowerCase().includes(q)) ||
        (item.membershipNumber && item.membershipNumber.includes(q)) ||
        (item.voucherSequenceNumber && String(item.voucherSequenceNumber).includes(q)) ||
        (item.voucherCode && item.voucherCode.includes(q));

      // Method
      const matchMethod = selectedMethod === 'all' || item.paymentMethod === selectedMethod;

      // Category / Type
      let matchCat = true;
      if (selectedCategory !== 'all') {
        if (activeTab === 'revenue') {
          matchCat = item.type === selectedCategory;
        } else if (activeTab === 'expense') {
          matchCat = getExpenseCat(item) === selectedCategory;
        }
      }

      // Period
      let matchPeriod = true;
      if (selectedPeriod !== 'all' && item.date) {
        const itemDate = new Date(item.date);
        const today = new Date();
        if (selectedPeriod === 'today') {
          matchPeriod = itemDate.toDateString() === today.toDateString();
        } else if (selectedPeriod === 'week') {
          const diffDays = (today.getTime() - itemDate.getTime()) / (1000 * 3600 * 24);
          matchPeriod = diffDays <= 7;
        } else if (selectedPeriod === 'month') {
          matchPeriod = itemDate.getMonth() === today.getMonth() && itemDate.getFullYear() === today.getFullYear();
        }
      }

      return matchSearch && matchMethod && matchCat && matchPeriod;
    }).sort((a, b) => {
      const timeA = a.date ? new Date(a.date.replace(' ', 'T')).getTime() : 0;
      const timeB = b.date ? new Date(b.date.replace(' ', 'T')).getTime() : 0;
      if (timeA !== timeB) return timeA - timeB;
      return (a.voucherSequenceNumber || 0) - (b.voucherSequenceNumber || 0);
    });
  };

  const filteredRevenues = filterList(allRevenues);
  const filteredExpenses = filterList(allExpenses);
  const filteredCombined = filterList(transactions);

  // Print handlers
  const handlePrintActiveReport = () => {
    audioAlertService.playSuccess();
    if (activeTab === 'revenue') {
      pdfPrintService.printRevenueReportPDF(transactions, managerName);
    } else if (activeTab === 'expense') {
      pdfPrintService.printExpenseReportPDF(transactions, managerName);
    } else {
      pdfPrintService.printNetProfitStatementPDF(totalRevenue, totalExpenses, netProfit, transactions, managerName);
    }
  };

  const getMethodBadge = (method: string) => {
    switch (method) {
      case 'cash':
        return <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-[10px]">{isAr ? 'كاش نقدي' : 'Cash'}</span>;
      case 'card':
        return <span className="px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-400 border border-sky-500/20 font-bold text-[10px]">{isAr ? 'فيزا / بطاقة' : 'Card'}</span>;
      case 'instapay':
        return <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20 font-bold text-[10px]">InstaPay</span>;
      case 'vodafone_cash':
        return <span className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold text-[10px]">Vodafone Cash</span>;
      default:
        return <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-bold text-[10px]">{method}</span>;
    }
  };
  const currentTransactionsList = activeTab === 'revenue' 
    ? filteredRevenues 
    : activeTab === 'expense' 
    ? filteredExpenses 
    : filteredCombined;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-5xl max-h-[92vh] flex flex-col rounded-3xl bg-[#0b0f19] border-2 border-amber-500/40 text-slate-100 shadow-2xl relative overflow-hidden text-right rtl:text-right ltr:text-left">
        
        {/* Top Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#121826] via-[#0e1422] to-[#080c14] border-b border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black shadow-lg ${
              activeTab === 'revenue' 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-emerald-500/10'
                : activeTab === 'expense'
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-rose-500/10'
                : 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-amber-500/10'
            }`}>
              {activeTab === 'revenue' && <TrendingUp className="w-6 h-6" />}
              {activeTab === 'expense' && <TrendingDown className="w-6 h-6" />}
              {activeTab === 'profit' && <DollarSign className="w-6 h-6" />}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold">
                  {isAr ? 'البيانات التفصيلية والرقابة المالية للمدير العام' : 'Executive Financial Inspection'}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white mt-1 flex items-center gap-2">
                {activeTab === 'revenue' && (isAr ? 'تفاصيل وبيانات الإيرادات العامة للصالة' : 'Total Revenue Detailed Breakdown')}
                {activeTab === 'expense' && (isAr ? 'تفاصيل وبيانات المصروفات وأذون الصرف' : 'Total Expenses & Vouchers Breakdown')}
                {activeTab === 'profit' && (isAr ? 'كشف الميزانية التحليلية وصافي الأرباح' : 'Net Profit & Balance Statement')}
              </h2>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handlePrintActiveReport}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
              title={isAr ? 'طباعة تقرير معتمد رسمي PDF' : 'Print PDF Report'}
            >
              <Printer className="w-4 h-4" />
              <span>{isAr ? 'طباعة تقرير رسمي PDF' : 'Print Official PDF'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 3 Executive Metric Tabs */}
        <div className="px-5 pt-3 border-b border-slate-800/70 bg-[#090d16] flex items-center gap-2 overflow-x-auto pb-3 scrollbar-none">
          <button
            onClick={() => setActiveTab('revenue')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'revenue'
                ? 'bg-emerald-600 text-white font-black shadow-lg shadow-emerald-600/30 ring-2 ring-emerald-500/50'
                : 'bg-slate-900/90 text-emerald-400 hover:text-white border border-slate-800 hover:border-emerald-500/40'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>{isAr ? 'الإيرادات العامة' : 'Total Revenue'}</span>
            <strong className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 font-mono text-[11px] font-black border border-emerald-500/40">
              {totalRevenue.toLocaleString()} ج
            </strong>
          </button>

          <button
            onClick={() => setActiveTab('expense')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'expense'
                ? 'bg-rose-600 text-white font-black shadow-lg shadow-rose-600/30 ring-2 ring-rose-500/50'
                : 'bg-slate-900/90 text-rose-400 hover:text-white border border-slate-800 hover:border-rose-500/40'
            }`}
          >
            <TrendingDown className="w-4 h-4" />
            <span>{isAr ? 'المصروفات وأذون الصرف' : 'Total Expenses'}</span>
            <strong className="px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 font-mono text-[11px] font-black border border-rose-500/40">
              {totalExpenses.toLocaleString()} ج
            </strong>
          </button>

          <button
            onClick={() => setActiveTab('profit')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'profit'
                ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/30 ring-2 ring-amber-400/50'
                : 'bg-slate-900/90 text-amber-400 hover:text-white border border-slate-800 hover:border-amber-500/40'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>{isAr ? 'صافي الربح والميزانية' : 'Net Profit & Balance'}</span>
            <strong className="px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 font-mono text-[11px] font-black border border-amber-500/40">
              {netProfit.toLocaleString()} ج
            </strong>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">

          {/* TAB 1: REVENUE BREAKDOWN */}
          {activeTab === 'revenue' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Main Banner Stat */}
              <div className="bg-gradient-to-br from-emerald-950/40 via-[#0a1210] to-[#040807] rounded-3xl p-5 border border-emerald-500/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-emerald-400/90 font-bold block">
                    {isAr ? 'إجمالي المقبوضات والإيرادات المحصلة بالخزينة' : 'Total Collected Inflows'}
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono tracking-tight">
                      {totalRevenue.toLocaleString()}
                    </span>
                    <span className="text-base font-bold text-slate-300">ج.م</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 font-semibold">
                    {isAr ? 'فقط وقدره:' : 'Amount in words:'} <span className="text-emerald-300 font-bold">{tafqeet(totalRevenue)} لا غير</span>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-slate-950/80 px-4 py-2.5 rounded-2xl border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 block">{isAr ? 'عدد السندات' : 'Vouchers'}</span>
                    <strong className="text-sm font-black text-white font-mono">{allRevenues.length}</strong>
                  </div>
                </div>
              </div>

              {/* Categorized Inflow Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-[#0e1422] p-4 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-[11px] text-slate-400 block">{isAr ? 'عضويات جديدة' : 'New Members'}</span>
                  <strong className="text-lg font-black text-emerald-400 font-mono block">{subRevenue.toLocaleString()} ج</strong>
                  <span className="text-[10px] text-slate-500">
                    {totalRevenue > 0 ? `${((subRevenue / totalRevenue) * 100).toFixed(0)}% من الإيراد` : ''}
                  </span>
                </div>

                <div className="bg-[#0e1422] p-4 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-[11px] text-slate-400 block">{isAr ? 'تجديد اشتراكات' : 'Renewals'}</span>
                  <strong className="text-lg font-black text-sky-400 font-mono block">{renewalRevenue.toLocaleString()} ج</strong>
                  <span className="text-[10px] text-slate-500">
                    {totalRevenue > 0 ? `${((renewalRevenue / totalRevenue) * 100).toFixed(0)}% من الإيراد` : ''}
                  </span>
                </div>

                <div className="bg-[#0e1422] p-4 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-[11px] text-slate-400 block">{isAr ? 'تدريب خاص (PT)' : 'Private Training'}</span>
                  <strong className="text-lg font-black text-amber-400 font-mono block">{ptRevenue.toLocaleString()} ج</strong>
                  <span className="text-[10px] text-slate-500">
                    {totalRevenue > 0 ? `${((ptRevenue / totalRevenue) * 100).toFixed(0)}% من الإيراد` : ''}
                  </span>
                </div>

                <div className="bg-[#0e1422] p-4 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-[11px] text-slate-400 block">{isAr ? 'البار والمبيعات' : 'POS & Bar'}</span>
                  <strong className="text-lg font-black text-purple-400 font-mono block">{posRevenue.toLocaleString()} ج</strong>
                  <span className="text-[10px] text-slate-500">
                    {totalRevenue > 0 ? `${((posRevenue / totalRevenue) * 100).toFixed(0)}% من الإيراد` : ''}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: EXPENSES BREAKDOWN */}
          {activeTab === 'expense' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Main Banner Stat */}
              <div className="bg-gradient-to-br from-rose-950/40 via-[#150a0d] to-[#0a0406] rounded-3xl p-5 border border-rose-500/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-rose-400/90 font-bold block">
                    {isAr ? 'إجمالي النفقات والمصروفات التشغيلية المنصرفة' : 'Total Outgoing Expenses'}
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl sm:text-4xl font-black text-rose-400 font-mono tracking-tight">
                      {totalExpenses.toLocaleString()}
                    </span>
                    <span className="text-base font-bold text-slate-300">ج.م</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 font-semibold">
                    {isAr ? 'فقط وقدره:' : 'Amount in words:'} <span className="text-rose-300 font-bold">{tafqeet(totalExpenses)} لا غير</span>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-slate-950/80 px-4 py-2.5 rounded-2xl border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 block">{isAr ? 'أذون الصرف' : 'Vouchers'}</span>
                    <strong className="text-sm font-black text-white font-mono">{allExpenses.length}</strong>
                  </div>
                </div>
              </div>

              {/* Categorized Spending Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-center">
                <div className="bg-[#0e1422] p-3 rounded-2xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">{isAr ? 'صيانة وأجهزة' : 'Maintenance'}</span>
                  <strong className="text-sm font-black text-rose-400 font-mono block mt-1">{maintenanceExp.toLocaleString()} ج</strong>
                </div>

                <div className="bg-[#0e1422] p-3 rounded-2xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">{isAr ? 'نظافة وتعقيم' : 'Cleaning'}</span>
                  <strong className="text-sm font-black text-rose-400 font-mono block mt-1">{cleaningExp.toLocaleString()} ج</strong>
                </div>

                <div className="bg-[#0e1422] p-3 rounded-2xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">{isAr ? 'مهمات الصالة' : 'Supplies'}</span>
                  <strong className="text-sm font-black text-rose-400 font-mono block mt-1">{suppliesExp.toLocaleString()} ج</strong>
                </div>

                <div className="bg-[#0e1422] p-3 rounded-2xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">{isAr ? 'بوفيه وبار' : 'Buffet'}</span>
                  <strong className="text-sm font-black text-rose-400 font-mono block mt-1">{buffetExp.toLocaleString()} ج</strong>
                </div>

                <div className="bg-[#0e1422] p-3 rounded-2xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">{isAr ? 'فواتير ومرافق' : 'Utilities'}</span>
                  <strong className="text-sm font-black text-rose-400 font-mono block mt-1">{utilitiesExp.toLocaleString()} ج</strong>
                </div>

                <div className="bg-[#0e1422] p-3 rounded-2xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">{isAr ? 'نثريات أخرى' : 'Other'}</span>
                  <strong className="text-sm font-black text-rose-400 font-mono block mt-1">{otherExp.toLocaleString()} ج</strong>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: NET PROFIT & BALANCE BREAKDOWN */}
          {activeTab === 'profit' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* 3 Executive Stat Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-[#07130e] border border-emerald-500/40 rounded-3xl p-5 text-center relative overflow-hidden">
                  <span className="text-xs font-bold text-emerald-400 block">{isAr ? '(+) إجمالي الإيرادات' : 'Total Revenue'}</span>
                  <strong className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono block mt-1">
                    {totalRevenue.toLocaleString()} ج.م
                  </strong>
                  <span className="text-[10px] text-slate-400 mt-1 block">{allRevenues.length} {isAr ? 'سند قبض' : 'Receipts'}</span>
                </div>

                <div className="bg-[#17080a] border border-rose-500/40 rounded-3xl p-5 text-center relative overflow-hidden">
                  <span className="text-xs font-bold text-rose-400 block">{isAr ? '(-) إجمالي المصروفات' : 'Total Expenses'}</span>
                  <strong className="text-2xl sm:text-3xl font-black text-rose-400 font-mono block mt-1">
                    {totalExpenses.toLocaleString()} ج.م
                  </strong>
                  <span className="text-[10px] text-slate-400 mt-1 block">{allExpenses.length} {isAr ? 'إذن صرف' : 'Vouchers'}</span>
                </div>

                <div className="bg-[#191408] border-2 border-amber-500/50 rounded-3xl p-5 text-center relative overflow-hidden shadow-xl">
                  <span className="text-xs font-black text-amber-400 block">{isAr ? '(=) صافي الربح الفعلي' : 'Net Operating Profit'}</span>
                  <strong className="text-2xl sm:text-3xl font-black text-[#f7cb55] font-mono block mt-1">
                    {netProfit.toLocaleString()} ج.م
                  </strong>
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold mt-1">
                    <Percent className="w-3 h-3" />
                    <span>{isAr ? 'هامش ربحية' : 'Margin'}: {profitMargin}%</span>
                  </div>
                </div>
              </div>

              {/* Visual Balance Bar */}
              <div className="bg-[#0e1422] p-4 rounded-3xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-emerald-400 flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <span>{isAr ? 'نسبة الإيرادات' : 'Inflow Share'} ({totalRevenue + totalExpenses > 0 ? ((totalRevenue / (totalRevenue + totalExpenses)) * 100).toFixed(0) : 0}%)</span>
                  </span>
                  <span className="text-rose-400 flex items-center gap-1">
                    <span>{isAr ? 'نسبة المصروفات' : 'Outflow Share'} ({totalRevenue + totalExpenses > 0 ? ((totalExpenses / (totalRevenue + totalExpenses)) * 100).toFixed(0) : 0}%)</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                  </span>
                </div>

                <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden flex">
                  <div
                    style={{ width: `${totalRevenue + totalExpenses > 0 ? (totalRevenue / (totalRevenue + totalExpenses)) * 100 : 50}%` }}
                    className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all"
                  />
                  <div
                    style={{ width: `${totalRevenue + totalExpenses > 0 ? (totalExpenses / (totalRevenue + totalExpenses)) * 100 : 50}%` }}
                    className="h-full bg-gradient-to-r from-rose-500 to-rose-700 transition-all"
                  />
                </div>

                <div className="pt-2 text-center text-xs text-slate-300 font-semibold">
                  {netProfit > 0 ? (
                    <span className="text-emerald-400 font-bold">
                      {isAr ? '✅ مؤشر مالي ممتاز: الصالة تحقق فائضاً تشغيلياً مستقراً ومربحاً' : 'Healthy operating surplus'}
                    </span>
                  ) : (
                    <span className="text-amber-400 font-bold">
                      {isAr ? '⚠️ توازن أو تقارب بين المصروفات والإيرادات' : 'Close balance between revenue and expense'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Interactive Search & Filters Bar */}
          <div className="bg-[#090d16] p-4 rounded-2xl border border-slate-800/80 space-y-3">
            <div className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-500 absolute right-3.5 rtl:right-3.5 ltr:left-3.5 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isAr ? 'بحث باسم العضو أو المستلم، رقم السند، أو الملاحظات...' : 'Search by name, voucher #, notes...'}
                  className="w-full bg-[#05070d] border border-slate-800 rounded-xl py-2 px-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Payment Method filter */}
              <select
                value={selectedMethod}
                onChange={(e) => setSelectedMethod(e.target.value)}
                className="bg-[#05070d] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500 font-bold"
              >
                <option value="all">{isAr ? 'كل طرق الدفع' : 'All Methods'}</option>
                <option value="cash">{isAr ? 'كاش نقدي' : 'Cash'}</option>
                <option value="card">{isAr ? 'بطاقة / فيزا' : 'Card'}</option>
                <option value="instapay">InstaPay</option>
                <option value="vodafone_cash">Vodafone Cash</option>
              </select>

              {/* Period filter */}
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as any)}
                className="bg-[#05070d] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500 font-bold"
              >
                <option value="all">{isAr ? 'جميع الفترات' : 'All Time'}</option>
                <option value="today">{isAr ? 'حركات اليوم' : 'Today'}</option>
                <option value="week">{isAr ? 'آخر 7 أيام' : 'Last 7 Days'}</option>
                <option value="month">{isAr ? 'هذا الشهر' : 'This Month'}</option>
              </select>

              {/* Category filter if revenue or expense */}
              {activeTab === 'revenue' && (
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-[#05070d] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500 font-bold"
                >
                  <option value="all">{isAr ? 'جميع بنود الإيرادات' : 'All Categories'}</option>
                  <option value="subscription">{isAr ? 'عضويات جديدة' : 'New Subs'}</option>
                  <option value="renewal">{isAr ? 'تجديد اشتراكات' : 'Renewals'}</option>
                  <option value="pt_package">{isAr ? 'تدريب خاص PT' : 'PT'}</option>
                  <option value="product_sale">{isAr ? 'مبيعات وخدمات' : 'POS Sales'}</option>
                </select>
              )}

              {activeTab === 'expense' && (
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-[#05070d] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500 font-bold"
                >
                  <option value="all">{isAr ? 'جميع بنود المصروفات' : 'All Categories'}</option>
                  <option value="maintenance">{isAr ? 'صيانة وأجهزة' : 'Maintenance'}</option>
                  <option value="cleaning">{isAr ? 'نظافة وتعقيم' : 'Cleaning'}</option>
                  <option value="supplies">{isAr ? 'مهمات الصالة' : 'Supplies'}</option>
                  <option value="buffet">{isAr ? 'بوفيه وبار' : 'Buffet'}</option>
                  <option value="utilities">{isAr ? 'فواتير ومرافق' : 'Utilities'}</option>
                  <option value="other">{isAr ? 'نثريات تشغيلية' : 'Other'}</option>
                </select>
              )}
            </div>
          </div>

          {/* Records Table */}
          <div className="bg-[#090d16] rounded-2xl border border-slate-800 overflow-hidden">
            <div className="p-3.5 border-b border-slate-800 flex items-center justify-between text-xs font-bold text-slate-300">
              <span className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                <span>
                  {activeTab === 'revenue' && (isAr ? `سجل سندات القبض (${filteredRevenues.length} سند)` : `Receipts (${filteredRevenues.length})`)}
                  {activeTab === 'expense' && (isAr ? `سجل أذون الصرف (${filteredExpenses.length} إذن)` : `Expense Vouchers (${filteredExpenses.length})`)}
                  {activeTab === 'profit' && (isAr ? `سجل التدفق المالي المجمع (${filteredCombined.length} حركة)` : `Combined Ledger (${filteredCombined.length})`)}
                </span>
              </span>

              <span className="text-[11px] text-slate-400">
                {isAr ? 'مرتبة تصاعدياً برقم السند المسلسل المعتمد' : 'Sorted by voucher sequence'}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right rtl:text-right ltr:text-left text-xs">
                <thead className="bg-[#06080f] text-slate-400 font-bold border-b border-slate-800">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">{isAr ? 'رقم السند' : 'Voucher #'}</th>
                    <th className="p-3">{isAr ? 'التاريخ والوقت' : 'Date & Time'}</th>
                    <th className="p-3">{isAr ? 'الطرف / المستفيد' : 'Party / Recipient'}</th>
                    <th className="p-3">{isAr ? 'البيان والتصنيف' : 'Details'}</th>
                    <th className="p-3">{isAr ? 'طريقة الدفع' : 'Method'}</th>
                    <th className="p-3">{isAr ? 'المسؤول' : 'Staff'}</th>
                    <th className="p-3 font-mono text-center">{isAr ? 'المبلغ' : 'Amount'}</th>
                    <th className="p-3 text-center">{isAr ? 'الإجراءات والتحكم' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {currentTransactionsList.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-500 font-bold">
                        {isAr ? 'لا توجد حركات مالية مطابقة لمعايير البحث الحالية' : 'No matching transactions found'}
                      </td>
                    </tr>
                  ) : (
                    currentTransactionsList.map((tx, idx) => {
                      const isExpense = tx.type === 'expense';
                      const seqNum = tx.voucherSequenceNumber || (idx + 1);

                      return (
                        <tr key={tx.id || idx} className="hover:bg-slate-900/60 transition-colors">
                          <td className="p-3 font-bold text-slate-500">{idx + 1}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-md font-mono font-black text-xs border ${
                              isExpense 
                                ? 'bg-rose-950/70 text-rose-300 border-rose-500/40' 
                                : 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40'
                            }`}>
                              #{seqNum}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-[11px] text-slate-400">
                            {tx.date}
                          </td>
                          <td className="p-3 font-bold text-white">
                            <div>
                              <span>{tx.beneficiaryName || tx.memberName || (isExpense ? 'مصروف عام' : 'إيراد نقدي')}</span>
                              {tx.membershipNumber && (
                                <span className="text-[10px] text-amber-400 block font-mono">
                                  #{tx.membershipNumber}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-3 text-slate-300">
                            <span className="text-[11px] block truncate max-w-[200px]">
                              {tx.notes || (isExpense ? 'مصروفات تشغيلية' : (tx.type === 'subscription' ? 'اشتراك عضوية' : 'إيراد'))}
                            </span>
                          </td>
                          <td className="p-3">
                            {getMethodBadge(tx.paymentMethod)}
                          </td>
                          <td className="p-3 text-[11px] text-slate-400 font-medium">
                            {tx.recordedBy}
                          </td>
                          <td className="p-3 font-mono font-black text-sm text-center">
                            <span className={isExpense ? 'text-rose-400' : 'text-emerald-400'}>
                              {isExpense ? '-' : '+'}{tx.amount.toLocaleString()} ج.م
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* Print Voucher PDF */}
                              <button
                                type="button"
                                onClick={() => {
                                  audioAlertService.playSuccess();
                                  pdfPrintService.printSingleVoucherPDF(tx);
                                }}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-400 transition-colors cursor-pointer"
                                title={isAr ? 'طباعة السند الفردي PDF' : 'Print Voucher PDF'}
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete Voucher -> Recycle Bin (General Manager privilege) */}
                              <button
                                type="button"
                                onClick={() => handleDeleteTransaction(tx)}
                                className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900 hover:text-white text-rose-400 border border-rose-900/50 transition-all cursor-pointer shadow-sm active:scale-95"
                                title={isAr ? 'حذف السند ونقله إلى سلة المحذوفات والأرشيف' : 'Delete voucher to Recycle Bin'}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
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
        </div>

        {/* Footer info & close */}
        <div className="p-4 bg-[#080c14] border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{isAr ? 'منظومة الرقابة المالية اللحظية • نادي GYM-M22 الرياضي' : 'Central Financial Audit • GYM-M22'}</span>
          </span>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors cursor-pointer"
          >
            {isAr ? 'إغلاق النافذة' : 'Close'}
          </button>
        </div>

      </div>

      {/* Delete Voucher Modal */}
      <DeleteVoucherModal
        isOpen={!!voucherToDelete}
        transaction={voucherToDelete}
        onClose={() => setVoucherToDelete(null)}
        onConfirmDelete={handleConfirmDelete}
        lang={lang}
        managerName={managerName}
      />
    </div>
  );
};
