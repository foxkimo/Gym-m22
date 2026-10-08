import React, { useState, useEffect } from 'react';
import { 
  SystemActivityLog, 
  ActivityCategory, 
  ActivityActionType, 
  AppRole 
} from '../types/gym';
import { StorageService } from '../services/storageService';
import { pdfPrintService } from '../services/pdfPrintService';
import { audioAlertService } from '../services/audioService';
import { 
  History, 
  Search, 
  Filter, 
  Printer, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle, 
  DollarSign, 
  Dumbbell, 
  Clock, 
  Users, 
  Trash2, 
  Eye, 
  X, 
  Calendar,
  Sparkles,
  RefreshCw,
  Layers,
  FileText
} from 'lucide-react';

interface ManagerAuditLogsProps {
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

export const ManagerAuditLogs: React.FC<ManagerAuditLogsProps> = ({ 
  lang,
  currentManagerName = getDefaultManagerName()
}) => {
  const isAr = lang === 'ar';
  const [logs, setLogs] = useState<SystemActivityLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAction, setSelectedAction] = useState<string>('all');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedLogForDetails, setSelectedLogForDetails] = useState<SystemActivityLog | null>(null);
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [selectedSpecificDate, setSelectedSpecificDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const refreshLogs = () => {
    setLogs(StorageService.getActivityLogs());
  };

  const handleExportSpecificDatePDF = () => {
    audioAlertService.playSuccess();
    const dateLogs = logs.filter(l => l.date === selectedSpecificDate);
    if (dateLogs.length === 0) {
      alert(`لا توجد حركات مسجلة بالنظام بتاريخ: ${selectedSpecificDate}`);
      return;
    }
    pdfPrintService.printAuditLogsPDF(
      dateLogs,
      `تقرير النشاط اليومي التفصيلي بتاريخ: ${selectedSpecificDate}`,
      currentManagerName
    );
  };

  useEffect(() => {
    refreshLogs();
  }, []);

  // Filter logs
  const filteredLogs = logs.filter(log => {
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = log.performerName.toLowerCase().includes(q);
      const matchTitle = log.titleAr.toLowerCase().includes(q) || log.titleEn.toLowerCase().includes(q);
      const matchDetails = log.detailsAr.toLowerCase().includes(q) || log.detailsEn.toLowerCase().includes(q);
      const matchTarget = (log.targetName || '').toLowerCase().includes(q);
      if (!matchName && !matchTitle && !matchDetails && !matchTarget) return false;
    }

    // Category
    if (selectedCategory !== 'all' && log.category !== selectedCategory) return false;

    // Action
    if (selectedAction !== 'all' && log.actionType !== selectedAction) return false;

    // Role
    if (selectedRole !== 'all' && log.performerRole !== selectedRole) return false;

    // Date range
    if (dateFilter !== 'all') {
      const logDate = new Date(log.timestamp);
      const now = new Date();
      if (dateFilter === 'today') {
        const todayStr = now.toISOString().split('T')[0];
        if (log.date !== todayStr) return false;
      } else if (dateFilter === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        if (logDate < weekAgo) return false;
      } else if (dateFilter === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        if (logDate < monthAgo) return false;
      }
    }

    return true;
  });

  // Handle PDF Export
  const handleExportPDF = () => {
    audioAlertService.playSuccess();
    const filterDesc = selectedCategory !== 'all' ? `قسم: ${selectedCategory}` : 'كافة الأقسام';
    pdfPrintService.printAuditLogsPDF(filteredLogs, filterDesc, currentManagerName);
  };

  // Handle CSV/Excel Export
  const handleExportCSV = () => {
    audioAlertService.playSuccess();
    if (filteredLogs.length === 0) return;

    const headers = ['م', 'التاريخ', 'الوقت', 'القائم بالحركة', 'الصفة', 'القسم', 'نوع الإجراء', 'العنوان', 'التفاصيل', 'الهدف'];
    const rows = filteredLogs.map((l, i) => [
      i + 1,
      l.date,
      l.time,
      `"${l.performerName.replace(/"/g, '""')}"`,
      l.performerRole,
      l.category,
      l.actionType,
      `"${l.titleAr.replace(/"/g, '""')}"`,
      `"${l.detailsAr.replace(/"/g, '""')}"`,
      `"${(l.targetName || '-').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `GYM-M22-audit-logs-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getCategoryBadge = (category: ActivityCategory) => {
    switch (category) {
      case 'financial':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold"><DollarSign className="w-3 h-3" /> مالي</span>;
      case 'shift':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 text-[#f7cb55] border border-amber-500/30 text-xs font-bold"><Clock className="w-3 h-3" /> وردية</span>;
      case 'workout':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/30 text-xs font-bold"><Dumbbell className="w-3 h-3" /> تدريب</span>;
      case 'membership':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/30 text-xs font-bold"><Users className="w-3 h-3" /> اشتراكات</span>;
      case 'deletion':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/30 text-xs font-bold"><Trash2 className="w-3 h-3" /> حذف</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold"><Layers className="w-3 h-3" /> {category}</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header & Actions */}
      <div className="bg-gradient-to-br from-[#0e131f] via-[#090d16] to-[#06080e] rounded-3xl p-6 border border-amber-500/30 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-[#f7cb55] border border-amber-500/40 flex items-center justify-center shadow-lg">
              <History className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <span>{isAr ? 'سجل الرقابة وحركات النظام الشامل' : 'System Live Audit Trail'}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-[#f7cb55] border border-amber-500/40">
                  {filteredLogs.length} {isAr ? 'حركة مسجلة' : 'records'}
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {isAr ? 'توثيق دقيق لكل عملية مالية، إدارية، اشتراكات، وتعديلات بالوقت والموظف المسؤول' : 'Real-time audit log of financial, membership, workout, and administrative operations'}
              </p>
            </div>
          </div>

          {/* Export & PDF Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={refreshLogs}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title={isAr ? 'تحديث السجل' : 'Refresh'}
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 text-xs font-bold flex items-center gap-2 transition-all active:scale-95"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>{isAr ? 'تصدير إكسيل Excel' : 'Export Excel'}</span>
            </button>

            {/* Official PDF Export Button */}
            <button
              onClick={handleExportPDF}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-[#e5a91b] to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>{isAr ? 'تصدير وطباعة تقرير PDF رسمي' : 'Export & Print PDF'}</span>
            </button>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 rtl:right-3.5 ltr:left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? 'بحث بالاسم، الحركة، أو التفاصيل...' : 'Search logs...'}
              className="w-full bg-[#080b12] border border-slate-800 rounded-xl py-2.5 pr-10 pl-4 rtl:pr-10 rtl:pl-4 ltr:pl-10 ltr:pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#080b12] border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
          >
            <option value="all">{isAr ? 'جميع الأقسام' : 'All Categories'}</option>
            <option value="financial">{isAr ? 'المعاملات المالية والمدفوعات' : 'Financial'}</option>
            <option value="shift">{isAr ? 'الورديات ومطابقة الخزينة' : 'Shifts'}</option>
            <option value="membership">{isAr ? 'الاشتراكات والأعضاء' : 'Memberships'}</option>
            <option value="workout">{isAr ? 'التمارين والبرامج' : 'Workouts'}</option>
            <option value="deletion">{isAr ? 'حركات الحذف وسلة المهملات' : 'Deletions'}</option>
            <option value="account">{isAr ? 'تعديلات الحسابات والصلاحيات' : 'Accounts'}</option>
          </select>

          {/* Role Filter */}
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="bg-[#080b12] border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
          >
            <option value="all">{isAr ? 'جميع المسؤولين' : 'All Roles'}</option>
            <option value="manager">{isAr ? 'المدير العام' : 'General Manager'}</option>
            <option value="staff">{isAr ? 'طاقم الاستقبال' : 'Reception Staff'}</option>
            <option value="coach">{isAr ? 'الكباتن والمدربين' : 'Coaches'}</option>
          </select>

          {/* Date Filter */}
          <div className="flex rounded-xl bg-[#080b12] border border-slate-800 p-1">
            <button
              onClick={() => setDateFilter('all')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${dateFilter === 'all' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'}`}
            >
              {isAr ? 'الكل' : 'All'}
            </button>
            <button
              onClick={() => setDateFilter('today')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${dateFilter === 'today' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'}`}
            >
              {isAr ? 'اليوم' : 'Today'}
            </button>
            <button
              onClick={() => setDateFilter('week')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${dateFilter === 'week' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'}`}
            >
              {isAr ? 'أسبوع' : 'Week'}
            </button>
            <button
              onClick={() => setDateFilter('month')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${dateFilter === 'month' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'}`}
            >
              {isAr ? 'شهر' : 'Month'}
            </button>
          </div>
        </div>

        {/* Daily Date-Specific Audit Log PDF Print Bar */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-slate-900 p-4 rounded-2xl border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Calendar className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <h4 className="text-xs font-black text-white">{isAr ? 'طباعة تقرير نشاط يوم محدد بالتاريخ (PDF)' : 'Print Daily Audit Log by Date'}</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">{isAr ? 'حدد أي تاريخ من النتيجة لطباعة كشف حركات ونشاط هذا اليوم بالكامل' : 'Pick a date to print full activity log for that day'}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <input
              type="date"
              value={selectedSpecificDate}
              onChange={(e) => setSelectedSpecificDate(e.target.value)}
              className="bg-[#080b12] border border-amber-500/40 rounded-xl px-3 py-2 text-xs font-mono font-bold text-amber-300 focus:outline-none focus:border-amber-400"
            />
            <button
              onClick={handleExportSpecificDatePDF}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow transition-all cursor-pointer shrink-0"
            >
              <Printer className="w-4 h-4" />
              <span>{isAr ? '🖨️ طباعة تقرير اليوم المحدد (PDF)' : 'Print Daily PDF'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-[#0c101a] rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right rtl:text-right ltr:text-left text-xs">
            <thead className="bg-[#070a12] text-slate-400 uppercase tracking-wider border-b border-slate-800 font-bold">
              <tr>
                <th className="p-4 w-12 text-center">#</th>
                <th className="p-4">{isAr ? 'التاريخ والوقت' : 'Date / Time'}</th>
                <th className="p-4">{isAr ? 'القائم بالحركة' : 'Performer'}</th>
                <th className="p-4 text-center">{isAr ? 'القسم' : 'Category'}</th>
                <th className="p-4">{isAr ? 'نوع الإجراء والتفاصيل' : 'Action & Details'}</th>
                <th className="p-4">{isAr ? 'الهدف / العضو' : 'Target'}</th>
                <th className="p-4 text-center">{isAr ? 'معاينة' : 'Details'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-500">
                    <History className="w-10 h-10 mx-auto mb-3 opacity-30 text-amber-500" />
                    <p className="font-bold">{isAr ? 'لا توجد حركات مسجلة مطابقة لمعايير البحث' : 'No activity logs found'}</p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, index) => (
                  <tr key={log.id} className="hover:bg-slate-900/60 transition-colors group">
                    <td className="p-4 text-center text-slate-500 font-bold">{index + 1}</td>
                    <td className="p-4 whitespace-nowrap">
                      <div className="font-bold text-slate-200">{log.date}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-amber-500/70" />
                        <span>{log.time}</span>
                      </div>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <div className="font-bold text-white group-hover:text-amber-300 transition-colors">
                        {log.performerName}
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-medium">
                        {log.performerRole === 'manager' ? (isAr ? 'المدير العام' : 'Manager') : log.performerRole === 'coach' ? (isAr ? 'كابتن' : 'Coach') : (isAr ? 'استقبال' : 'Staff')}
                      </span>
                    </td>
                    <td className="p-4 text-center whitespace-nowrap">
                      {getCategoryBadge(log.category)}
                    </td>
                    <td className="p-4 max-w-xs">
                      <div className="font-bold text-slate-100">{log.titleAr}</div>
                      <div className="text-slate-400 text-[11px] truncate mt-0.5">{log.detailsAr}</div>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      {log.targetName ? (
                        <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700/60 text-slate-300 font-medium text-[11px]">
                          {log.targetName}
                        </span>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => {
                            audioAlertService.playSuccess();
                            pdfPrintService.printSingleAuditLogPDF(log);
                          }}
                          className="p-2 rounded-xl bg-amber-500/20 hover:bg-amber-500 hover:text-slate-950 text-amber-300 border border-amber-500/30 transition-colors cursor-pointer"
                          title={isAr ? 'طباعة وتصدير إيصال هذه الحركة PDF' : 'Print Action Receipt PDF'}
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setSelectedLogForDetails(log)}
                          className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                          title={isAr ? 'عرض التفاصيل الكاملة' : 'View Full Details'}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Details Modal */}
      {selectedLogForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-[#0e1320] border border-amber-500/40 p-6 text-slate-100 shadow-2xl relative">
            <button
              onClick={() => setSelectedLogForDetails(null)}
              className="absolute top-4 left-4 rtl:left-4 rtl:right-auto ltr:right-4 ltr:left-auto p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/60"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <History className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{selectedLogForDetails.titleAr}</h3>
                <span className="text-xs text-slate-400">{selectedLogForDetails.date} - {selectedLogForDetails.time}</span>
              </div>
            </div>

            <div className="space-y-3 bg-slate-950/70 p-4 rounded-2xl border border-slate-800 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">{isAr ? 'القائم بالإجراء:' : 'Performer:'}</span>
                <span className="font-bold text-white">{selectedLogForDetails.performerName} ({selectedLogForDetails.performerRole})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">{isAr ? 'القسم التصنيفي:' : 'Category:'}</span>
                <span>{getCategoryBadge(selectedLogForDetails.category)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">{isAr ? 'نوع الحركة:' : 'Action Type:'}</span>
                <span className="font-mono text-amber-300">{selectedLogForDetails.actionType}</span>
              </div>
              {selectedLogForDetails.targetName && (
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">{isAr ? 'الطرف المستهدف:' : 'Target:'}</span>
                  <span className="font-bold text-sky-400">{selectedLogForDetails.targetName}</span>
                </div>
              )}
              <div className="py-1">
                <span className="text-slate-400 block mb-1">{isAr ? 'التفاصيل الكاملة المسجلة:' : 'Full Details:'}</span>
                <p className="bg-[#080b12] p-3 rounded-xl border border-slate-800/80 text-slate-200 leading-relaxed">
                  {selectedLogForDetails.detailsAr}
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  audioAlertService.playSuccess();
                  pdfPrintService.printSingleAuditLogPDF(selectedLogForDetails);
                }}
                className="py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow"
              >
                <Printer className="w-4 h-4" />
                <span>{isAr ? '🖨️ طباعة إيصال الحركة PDF' : 'Print Action Receipt PDF'}</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedLogForDetails(null)}
                className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
              >
                {isAr ? 'إغلاق النافذة' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
