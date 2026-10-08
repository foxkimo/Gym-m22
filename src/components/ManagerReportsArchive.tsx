import React, { useState, useEffect } from 'react';
import { ArchivedReport } from '../types/gym';
import { StorageService } from '../services/storageService';
import { pdfPrintService } from '../services/pdfPrintService';
import { audioAlertService } from '../services/audioService';
import { 
  FileText, 
  Printer, 
  Calendar, 
  TrendingUp, 
  DollarSign, 
  Users, 
  CheckCircle2, 
  X, 
  Eye, 
  PlusCircle, 
  Sparkles,
  Layers,
  ArrowUpRight
} from 'lucide-react';

interface ManagerReportsArchiveProps {
  lang: 'ar' | 'en';
  currentManagerName?: string;
}

const getDefaultManagerName = () => {
  try {
    const saved = typeof window !== 'undefined' ? sessionStorage.getItem('gym_m22_current_user') : null;
    if (saved) {
      const u = JSON.parse(saved);
      if (u && u.nameAr) return `${u.nameAr} (المدير العام)`;
    }
  } catch (e) {}
  return 'المدير العام';
};

export const ManagerReportsArchive: React.FC<ManagerReportsArchiveProps> = ({ 
  lang,
  currentManagerName = getDefaultManagerName()
}) => {
  const isAr = lang === 'ar';
  const [archivedReports, setArchivedReports] = useState<ArchivedReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<ArchivedReport | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New archive form state
  const [periodTitleAr, setPeriodTitleAr] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [notesAr, setNotesAr] = useState('');

  const refreshReports = () => {
    setArchivedReports(StorageService.getArchivedReports());
  };

  useEffect(() => {
    refreshReports();
  }, []);

  const handlePrintReport = (report: ArchivedReport) => {
    audioAlertService.playSuccess();
    pdfPrintService.printArchivedReportPDF(report);
  };

  const handleCreateArchive = (e: React.FormEvent) => {
    e.preventDefault();
    if (!periodTitleAr.trim()) return;

    // Calculate live metrics from storage
    const txs = StorageService.getTransactions();
    const members = StorageService.getMembers();
    const shifts = StorageService.getShifts();

    const revenue = txs.filter(t => t.type !== 'expense' && t.type !== 'refund').reduce((s, t) => s + t.amount, 0);
    const expenses = txs.filter(t => t.type === 'expense' || t.type === 'refund').reduce((s, t) => s + t.amount, 0);
    const cashAmount = txs.filter(t => t.paymentMethod === 'cash' && t.type !== 'expense').reduce((s, t) => s + t.amount, 0);
    const electronicAmount = revenue - cashAmount;

    const newReport: ArchivedReport = {
      id: `rpt-${Date.now()}`,
      reportNumber: `RPT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      periodTitleAr: periodTitleAr.trim(),
      periodTitleEn: 'Archived Financial & Operational Report',
      dateRange: {
        start: startDate,
        end: endDate
      },
      archivedAt: StorageService.getLocalCurrentDateTimeString(),
      archivedBy: currentManagerName,
      archivedByRole: 'المدير العام',
      metrics: {
        totalRevenue: revenue,
        totalExpenses: expenses,
        netProfit: revenue - expenses,
        cashAmount,
        electronicAmount,
        activeMembersCount: members.filter(m => m.status === 'active').length,
        renewalsCount: txs.filter(t => t.type === 'renewal').length,
        newMembersCount: txs.filter(t => t.type === 'subscription').length,
        totalAttendances: members.reduce((sum, m) => sum + m.attendanceCount, 0),
        completedShiftsCount: shifts.filter(s => s.status === 'closed').length
      },
      notesAr: notesAr.trim() || undefined
    };

    StorageService.archiveReport(newReport);
    audioAlertService.playSuccess();
    setIsCreateModalOpen(false);
    setPeriodTitleAr('');
    setNotesAr('');
    refreshReports();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="bg-gradient-to-br from-[#0c121e] via-[#090e17] to-[#060910] rounded-3xl p-6 border border-[#e5a91b]/30 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#f7cb55]/20 text-[#f7cb55] border border-[#e5a91b]/40 flex items-center justify-center shadow-lg">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <span>{isAr ? 'أرشيف التقارير والاعتمادات السابقة' : 'Historical Reports Archive'}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#f7cb55]/20 text-[#f7cb55] border border-[#e5a91b]/40">
                  {archivedReports.length} {isAr ? 'تقرير مؤرشف' : 'archived'}
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {isAr ? 'سجلات وتقارير الفترات الشهرية والأسبوعية المعتمدة القابلة للطباعة وإعادة التصدير PDF' : 'Certified periodic reports library with PDF re-print capability'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-[#e5a91b] to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-95 shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{isAr ? '+ أرشفة تقرير فترة جديد' : '+ Archive New Report'}</span>
          </button>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {archivedReports.map((report) => (
          <div 
            key={report.id}
            className="bg-[#0c101a] rounded-3xl p-5 border border-slate-800 hover:border-[#e5a91b]/40 transition-all shadow-xl space-y-4 group"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2.5 py-1 rounded-lg bg-[#f7cb55]/10 text-[#f7cb55] border border-[#e5a91b]/30 text-[11px] font-mono font-bold">
                  {report.reportNumber}
                </span>
                <h3 className="text-sm font-black text-white mt-2 group-hover:text-[#f7cb55] transition-colors">
                  {report.periodTitleAr}
                </h3>
                <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>من {report.dateRange.start} إلى {report.dateRange.end}</span>
                </span>
              </div>

              <button
                onClick={() => handlePrintReport(report)}
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-700/60 hover:bg-[#e5a91b] hover:text-slate-950 text-slate-300 transition-all shadow-md"
                title={isAr ? 'طباعة وتصدير PDF' : 'Print PDF'}
              >
                <Printer className="w-4 h-4" />
              </button>
            </div>

            {/* Metrics Snapshot */}
            <div className="grid grid-cols-3 gap-2 p-3 bg-slate-950/70 rounded-2xl border border-slate-800/80 text-center">
              <div>
                <span className="text-[10px] text-slate-400 block">{isAr ? 'الإيرادات' : 'Revenue'}</span>
                <strong className="text-xs font-black text-emerald-400">
                  {report.metrics.totalRevenue.toLocaleString()} ج
                </strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">{isAr ? 'المصروفات' : 'Expenses'}</span>
                <strong className="text-xs font-black text-rose-400">
                  {report.metrics.totalExpenses.toLocaleString()} ج
                </strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">{isAr ? 'صافي الربح' : 'Net Profit'}</span>
                <strong className="text-xs font-black text-[#f7cb55]">
                  {report.metrics.netProfit.toLocaleString()} ج
                </strong>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
              <span>{isAr ? 'المعتمد:' : 'Certified by:'} <strong className="text-slate-200">{report.archivedBy}</strong></span>
              <button
                onClick={() => setSelectedReport(report)}
                className="text-[#f7cb55] hover:underline font-bold flex items-center gap-1"
              >
                <span>{isAr ? 'عرض الملخص الكامل' : 'View Full Summary'}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* View Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-[#0e1320] border border-[#e5a91b]/40 p-6 text-slate-100 shadow-2xl relative">
            <button
              onClick={() => setSelectedReport(null)}
              className="absolute top-4 left-4 rtl:left-4 rtl:right-auto ltr:right-4 ltr:left-auto p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/60"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{selectedReport.periodTitleAr}</h3>
                <span className="text-xs text-amber-400 font-mono">{selectedReport.reportNumber}</span>
              </div>
            </div>

            <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">{isAr ? 'الفترة:' : 'Date Range:'}</span>
                <span className="font-bold text-white">{selectedReport.dateRange.start} ➔ {selectedReport.dateRange.end}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{isAr ? 'الأعضاء النشطين:' : 'Active Members:'}</span>
                <span className="font-bold text-sky-400">{selectedReport.metrics.activeMembersCount} عضو</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{isAr ? 'التجديدات خلال الفترة:' : 'Renewals:'}</span>
                <span className="font-bold text-emerald-400">{selectedReport.metrics.renewalsCount} تجديد</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{isAr ? 'الورديات المغلقة:' : 'Closed Shifts:'}</span>
                <span className="font-bold text-slate-300">{selectedReport.metrics.completedShiftsCount} وردية</span>
              </div>
              {selectedReport.notesAr && (
                <div className="pt-2 border-t border-slate-800">
                  <span className="text-slate-400 block mb-1">{isAr ? 'ملاحظات وتوصيات الإدارة:' : 'Manager Notes:'}</span>
                  <p className="bg-[#090d16] p-2.5 rounded-xl text-slate-300">{selectedReport.notesAr}</p>
                </div>
              )}
            </div>

            <div className="mt-5 flex gap-2">
              <button
                onClick={() => handlePrintReport(selectedReport)}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center justify-center gap-1.5 transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>{isAr ? 'طباعة تقرير PDF' : 'Print PDF'}</span>
              </button>
              <button
                onClick={() => setSelectedReport(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
              >
                {isAr ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Archive Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-[#0e1320] border border-[#e5a91b]/40 p-6 text-slate-100 shadow-2xl relative">
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute top-4 left-4 rtl:left-4 rtl:right-auto ltr:right-4 ltr:left-auto p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/60"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-black text-white mb-4">
              {isAr ? 'أرشفة واعتماد تقرير مالي وإداري جديد' : 'Archive Certified Period Report'}
            </h3>

            <form onSubmit={handleCreateArchive} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">{isAr ? 'عنوان التقرير والفترة' : 'Report Title'}</label>
                <input
                  type="text"
                  required
                  value={periodTitleAr}
                  onChange={(e) => setPeriodTitleAr(e.target.value)}
                  placeholder={isAr ? 'مثال: تقرير الأسبوع الأخير من سبتمبر 2026' : 'Title...'}
                  className="w-full bg-[#080b12] border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">{isAr ? 'من تاريخ' : 'Start Date'}</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-[#080b12] border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">{isAr ? 'إلى تاريخ' : 'End Date'}</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-[#080b12] border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1.5">{isAr ? 'ملاحظات واعتماد المدير العام' : 'Manager Notes'}</label>
                <textarea
                  rows={3}
                  value={notesAr}
                  onChange={(e) => setNotesAr(e.target.value)}
                  placeholder={isAr ? 'اكتب أي توصيات إدارية أو قرارات اعتماد...' : 'Notes...'}
                  className="w-full bg-[#080b12] border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-colors shadow-lg shadow-amber-500/20"
                >
                  {isAr ? 'حفظ وأرشفة التقرير الآن' : 'Save & Archive'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-3 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
