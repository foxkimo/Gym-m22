import React, { useState, useEffect } from 'react';
import { SecurityAlert, ManagerNotification } from '../types/gym';
import { StorageService } from '../services/storageService';
import { audioAlertService } from '../services/audioService';
import { pdfPrintService } from '../services/pdfPrintService';
import { 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  User, 
  Phone, 
  KeyRound, 
  Trash2, 
  RefreshCw,
  BellRing,
  Lock,
  UserCheck,
  LogOut,
  Printer,
  Download,
  Filter,
  CheckCheck,
  Timer,
  FileText,
  Briefcase,
  Sparkles,
  Eye,
  X
} from 'lucide-react';

interface ManagerSecurityAlertsProps {
  lang: 'ar' | 'en';
  currentUser: any;
  onOpenPasswordModal?: (targetType: 'employee' | 'member', id: string, name: string, phone: string) => void;
}

export const ManagerSecurityAlerts: React.FC<ManagerSecurityAlertsProps> = ({
  lang,
  currentUser,
  onOpenPasswordModal
}) => {
  const isAr = lang === 'ar';
  const [activeTab, setActiveTab] = useState<'all' | 'attendance' | 'reports' | 'security'>('all');
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([]);
  const [managerNotifications, setManagerNotifications] = useState<ManagerNotification[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInspectingNotification, setSelectedInspectingNotification] = useState<ManagerNotification | null>(null);

  const handlePrintNotification = (notif: ManagerNotification) => {
    audioAlertService.playSuccess();
    
    if (notif.type === 'shift_open' || notif.type === 'shift_close') {
      const shifts = StorageService.getShifts();
      const allTransactions = StorageService.getTransactions();
      
      // Try finding by shiftId first, then fallback to date/staff matching
      let match = shifts.find(s => s.id === notif.shiftId);
      if (!match) {
        match = shifts.find(s => s.staffId === notif.employeeId && s.openedAt.startsWith(notif.date));
      }

      if (match) {
        const txs = allTransactions.filter(t => t.shiftId === match!.id);
        pdfPrintService.printShiftReportPDF(match, txs, currentUser.nameAr);
      } else {
        alert(isAr ? 'عذراً، لم يتم العثور على سجل المناوبة التفصيلي.' : 'Shift record not found.');
      }
      return;
    }
    
    pdfPrintService.printManagerNotificationReportPDF(notif);
  };

  const refreshAll = () => {
    setSecurityAlerts(StorageService.getSecurityAlerts());
    setManagerNotifications(StorageService.getManagerNotifications());
  };

  useEffect(() => {
    refreshAll();

    const handleUpdate = () => refreshAll();
    window.addEventListener('gym_manager_notification', handleUpdate);
    window.addEventListener('gym_storage_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('gym_manager_notification', handleUpdate);
      window.removeEventListener('gym_storage_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const handleResolveSecurityAlert = (alertId: string) => {
    StorageService.markAlertResolved(alertId);
    audioAlertService.playSuccess();
    refreshAll();
  };

  const handleMarkNotificationRead = (notifId: string) => {
    StorageService.markManagerNotificationRead(notifId);
    refreshAll();
  };

  const handleMarkAllRead = () => {
    StorageService.markAllManagerNotificationsRead();
    audioAlertService.playSuccess();
    refreshAll();
  };

  const handleClearAll = () => {
    if (confirm(isAr ? 'هل أنت متأكد من مسح جميع سجلات الإشعارات والتنبيهات؟' : 'Clear all notifications & alerts?')) {
      StorageService.clearManagerNotifications();
      StorageService.clearSecurityAlerts();
      audioAlertService.playDelete();
      refreshAll();
    }
  };

  // Unread counts
  const unreadNotifs = managerNotifications.filter(n => n.status === 'unread').length;
  const unreadSecurity = securityAlerts.filter(a => a.status === 'unread').length;
  const totalUnread = unreadNotifs + unreadSecurity;

  const attendanceNotifs = managerNotifications.filter(n => n.type === 'employee_checkin' || n.type === 'employee_checkout' || n.type === 'shift_open' || n.type === 'shift_close');
  const reportNotifs = managerNotifications.filter(n => n.type === 'report_printed' || n.type === 'report_downloaded');

  // Filter items
  const filteredNotifications = managerNotifications.filter(n => {
    if (activeTab === 'attendance' && !(n.type === 'employee_checkin' || n.type === 'employee_checkout' || n.type === 'shift_open' || n.type === 'shift_close')) return false;
    if (activeTab === 'reports' && !(n.type === 'report_printed' || n.type === 'report_downloaded')) return false;
    if (activeTab === 'security') return false; // Handled separately

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const match = n.employeeName.toLowerCase().includes(q) ||
                    (n.titleAr && n.titleAr.toLowerCase().includes(q)) ||
                    (n.reportTitle && n.reportTitle.toLowerCase().includes(q)) ||
                    (n.detailsAr && n.detailsAr.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const filteredSecurity = securityAlerts.filter(a => {
    if (activeTab === 'attendance' || activeTab === 'reports') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const match = a.usernameOrPhone.toLowerCase().includes(q) ||
                    (a.accountName && a.accountName.toLowerCase().includes(q)) ||
                    (a.reasonAr && a.reasonAr.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const renderShiftAuditDetails = (shiftId: string, isArabic: boolean) => {
    const shift = StorageService.getShifts().find(s => s.id === shiftId);
    if (!shift) return <div className="text-rose-400 text-[10px] italic">{isArabic ? 'تعذر العثور على بيانات الوردية' : 'Shift data not found'}</div>;
    const txs = StorageService.getTransactions().filter(t => t.shiftId === shift.id);
    
    const subs = txs.filter(t => ['subscription', 'renewal', 'pt_package', 'locker'].includes(t.type));
    const sales = txs.filter(t => ['product_sale', 'supplement'].includes(t.type));
    const expenses = txs.filter(t => ['expense', 'refund'].includes(t.type));
    
    const sumSubs = subs.reduce((s, t) => s + t.amount, 0);
    const sumSales = sales.reduce((s, t) => s + t.amount, 0);
    const sumExp = expenses.reduce((s, t) => s + t.amount, 0);

    const cashIn = txs.filter(t => (t.voucherKind || (t.type === 'expense' ? 'payment' : 'receipt')) !== 'payment' && t.paymentMethod === 'cash').reduce((s,t) => s + t.amount, 0);
    const cashOut = txs.filter(t => (t.voucherKind || (t.type === 'expense' ? 'payment' : 'receipt')) === 'payment' && t.paymentMethod === 'cash').reduce((s,t) => s + t.amount, 0);
    const expectedDrawer = shift.startingCash + cashIn - cashOut;
    const diff = shift.actualCash !== undefined ? (shift.actualCash - expectedDrawer) : 0;

    return (
      <div className="space-y-2.5">
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-[#0a0f1a] p-2 rounded-xl border border-slate-800/50">
            <span className="text-[9px] text-slate-500 block mb-0.5">{isArabic ? 'رصيد الفتح:' : 'Opening:'}</span>
            <span className="text-xs font-bold text-white">{shift.startingCash.toLocaleString()} ج.م</span>
          </div>
          <div className="bg-[#0a0f1a] p-2 rounded-xl border border-slate-800/50">
            <span className="text-[9px] text-slate-500 block mb-0.5">{isArabic ? 'الرصيد الفعلي:' : 'Actual:'}</span>
            <span className="text-xs font-bold text-amber-400">{shift.actualCash?.toLocaleString() || 0} ج.م</span>
          </div>
        </div>
        
        <div className="space-y-2 bg-slate-950/40 p-4 rounded-2xl border border-slate-800/60">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 border-b border-slate-800 pb-3 mb-2">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 font-bold block">{isArabic ? 'مبيعات الجيم والاشتراكات:' : 'Gym Sales:'}</span>
              <span className="text-sky-400 font-black text-sm">+{sumSubs.toLocaleString()} ج.م</span>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 font-bold block">{isArabic ? 'مبيعات البار والمكملات:' : 'Bar Sales:'}</span>
              <span className="text-amber-500 font-black text-sm">+{sumSales.toLocaleString()} ج.م</span>
            </div>
          </div>

          <div className="flex justify-between items-center py-1">
            <span className="text-rose-400 font-bold text-xs">{isArabic ? 'إجمالي المصروفات والمدفوعات:' : 'Total Expenses:'}</span>
            <span className="text-rose-400 font-black text-sm">-{sumExp.toLocaleString()} ج.م</span>
          </div>

          <div className="pt-3 border-t-2 border-emerald-500/30 flex justify-between items-center bg-emerald-500/5 p-3 rounded-xl">
            <div className="space-y-0.5">
              <span className="text-emerald-400 font-black text-xs block">{isArabic ? '📊 صافي إيراد الوردية النهائي:' : '📊 Net Shift Revenue:'}</span>
            </div>
            <span className="text-emerald-400 font-black text-xl">{(sumSubs + sumSales - sumExp).toLocaleString()} ج.م</span>
          </div>
          
          <div className="flex justify-between items-center py-0.5">
            <span className="text-slate-300 font-bold text-[10px]">{isArabic ? '💼 المتوقع تسليمه (كاش):' : '💼 Expected Cash:'}</span>
            <span className="text-white font-black text-[10px]">{expectedDrawer.toLocaleString()} ج.م</span>
          </div>
          {shift.status === 'closed' && shift.actualCash !== undefined ? (
            <div className={`flex justify-between items-center mt-1 p-1.5 rounded-lg ${diff < 0 ? 'bg-rose-500/10 text-rose-400' : diff > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800/40 text-slate-300'}`}>
              <span className="font-bold text-[10px]">{isArabic ? '🔍 مطابقة الخزينة:' : '🔍 Treasury Match:'}</span>
              <span className="font-black text-[10px]">{diff.toLocaleString()} ج.م ({diff < 0 ? (isArabic ? 'عجز' : 'Deficit') : diff > 0 ? (isArabic ? 'زيادة' : 'Surplus') : (isArabic ? 'مطابق' : 'Balanced')})</span>
            </div>
          ) : (
            <div className="text-[9px] text-slate-500 italic text-center mt-1">
              {isArabic ? '(الوردية لا تزال مفتوحة، جاري تجميع الحسابات)' : '(Shift active, totals accumulating)'}
            </div>
          )}
        </div>
        <div className="text-[9px] text-center text-slate-500 italic">
          {isArabic ? 'بإمكانك طباعة التقرير الكامل للحصول على بيان حركة بحركة' : 'Print full report for itemized transaction list'}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Hero Banner */}
      <div className="bg-gradient-to-r from-rose-950/40 via-[#10131d] to-[#0a0d16] p-6 rounded-3xl border border-rose-500/40 shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center font-bold shadow-lg shrink-0">
            <BellRing className="w-6 h-6 animate-bounce" style={{ animationDuration: '3s' }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-white">
                {isAr ? 'مركز الإشعارات والتنبيهات المباشرة للمدير العام' : 'General Manager Live Notifications & Alerts Center'}
              </h3>
              {totalUnread > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black animate-pulse">
                  {totalUnread} {isAr ? 'إشعار جديد' : 'New'}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {isAr ? 'متابعة حية فورية لتسجيل حضور وانصراف الموظفين، ساعات العمل اليومية، المطبوعات والتنزيلات، ومحاولات الدخول' : 'Live real-time monitoring of employee attendance, hours worked, report prints/downloads, and security.'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {totalUnread > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="px-3.5 py-2 rounded-xl bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <CheckCheck className="w-4 h-4" />
              <span>{isAr ? 'تحديد الكل كمقروء' : 'Mark All Read'}</span>
            </button>
          )}

          <button
            onClick={refreshAll}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title={isAr ? 'تحديث فوري' : 'Refresh'}
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {(managerNotifications.length > 0 || securityAlerts.length > 0) && (
            <button
              onClick={handleClearAll}
              className="px-3 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isAr ? 'مسح السجل' : 'Clear'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none bg-[#090d16] p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'all'
                ? 'bg-rose-500 text-white font-black shadow-lg shadow-rose-500/20'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <span>{isAr ? 'جميع الإشعارات' : 'All'}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] font-mono">
              {managerNotifications.length + securityAlerts.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('attendance')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'attendance'
                ? 'bg-emerald-600 text-white font-black shadow-lg shadow-emerald-600/20'
                : 'text-emerald-300 hover:text-white'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>{isAr ? 'حضور وانصراف الموظفين' : 'Staff Attendance & Hours'}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] font-mono">
              {attendanceNotifs.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'reports'
                ? 'bg-sky-600 text-white font-black shadow-lg shadow-sky-600/20'
                : 'text-sky-300 hover:text-white'
            }`}
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{isAr ? 'المطبوعات وتنزيل التقارير' : 'Prints & Downloads'}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] font-mono">
              {reportNotifs.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'security'
                ? 'bg-amber-600 text-white font-black shadow-lg shadow-amber-600/20'
                : 'text-amber-300 hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{isAr ? 'التنبيهات الأمنية' : 'Security Alerts'}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] font-mono">
              {securityAlerts.length}
            </span>
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isAr ? 'بحث في الإشعارات أو اسم الموظف...' : 'Search notifications...'}
            className="w-full sm:w-64 bg-[#070a12] border border-slate-700/80 rounded-2xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
          />
        </div>
      </div>

      {/* Notifications Feed */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 && filteredSecurity.length === 0 ? (
          <div className="bg-[#0c101a] rounded-3xl p-12 text-center border border-slate-800 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto opacity-70" />
            <h4 className="text-sm font-bold text-slate-200">
              {isAr ? 'لا توجد أي إشعارات أو تنبيهات مطابقة لهذا التصنيف حالياً' : 'No notifications match this category'}
            </h4>
            <p className="text-xs text-slate-500">
              {isAr ? 'سيظهر هنا فورياً أي تسجيل حضور، انصراف موظف، طباعة أو تنزيل تقرير، أو تنبيه أمني.' : 'New notifications will appear here instantly.'}
            </p>
          </div>
        ) : (
          <>
            {/* 1. Operational & Attendance Notifications */}
            {filteredNotifications.map(notif => {
              const isUnread = notif.status === 'unread';
              const isCheckIn = notif.type === 'employee_checkin';
              const isCheckOut = notif.type === 'employee_checkout';
              const isShiftOpen = notif.type === 'shift_open';
              const isShiftClose = notif.type === 'shift_close';
              const isPrint = notif.type === 'report_printed';
              const isDownload = notif.type === 'report_downloaded';

              return (
                <div
                  key={notif.id}
                  onClick={() => isUnread && handleMarkNotificationRead(notif.id)}
                  className={`p-5 rounded-3xl border transition-all shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-pointer ${
                    isUnread
                      ? (isCheckIn || isShiftOpen)
                        ? 'bg-gradient-to-r from-emerald-950/40 via-[#0a1612] to-[#070e0b] border-emerald-500/50 shadow-emerald-500/10'
                        : (isCheckOut || isShiftClose)
                          ? 'bg-gradient-to-r from-amber-950/40 via-[#16120d] to-[#0e0c08] border-amber-500/50 shadow-amber-500/10'
                          : 'bg-gradient-to-r from-sky-950/40 via-[#0b1320] to-[#070d17] border-sky-500/50 shadow-sky-500/10'
                      : 'bg-[#0c101a] border-slate-800/80 opacity-85 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    {/* Icon */}
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold shrink-0 shadow-md border ${
                      (isCheckIn || isShiftOpen)
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                        : (isCheckOut || isShiftClose)
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                          : isDownload
                            ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
                            : 'bg-sky-500/20 text-sky-400 border-sky-500/40'
                    }`}>
                      {(isCheckIn || isShiftOpen) ? <UserCheck className="w-5 h-5" /> :
                       (isCheckOut || isShiftClose) ? <LogOut className="w-5 h-5" /> :
                       isDownload ? <Download className="w-5 h-5" /> :
                       <Printer className="w-5 h-5" />}
                    </div>

                    {/* Content Details */}
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <strong className="text-white text-sm font-bold">
                          {notif.titleAr}
                        </strong>

                        {/* Category Badge */}
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                          isCheckIn 
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                            : isCheckOut
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                        }`}>
                          {isCheckIn ? (isAr ? '🟢 تسجيل حضور' : 'Check-in') :
                           isCheckOut ? (isAr ? '🚪 تسجيل انصراف' : 'Check-out') :
                           isDownload ? (isAr ? '📥 تنزيل تقرير' : 'Download') :
                           (isAr ? '🖨️ طباعة تقرير' : 'Print')}
                        </span>

                        {isUnread && (
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-rose-500 text-white font-black animate-pulse">
                            {isAr ? 'جديد' : 'New'}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        {notif.detailsAr}
                      </p>

                      {/* Working hours extra badge on checkouts */}
                      {isCheckOut && notif.workedHours !== undefined && (
                        <div className="pt-1 flex items-center gap-2">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold">
                            <Timer className="w-3.5 h-3.5 text-amber-400" />
                            <span>
                              {isAr ? 'إجمالي ساعات العمل المنجزة اليوم:' : 'Total Worked Hours:'} <strong>{notif.workedHoursFormatted || `${notif.workedHours} ساعة`}</strong>
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Printed report extra title badge */}
                      {(isPrint || isDownload) && notif.reportTitle && (
                        <div className="pt-1 flex items-center gap-2">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-300 text-xs font-bold">
                            <FileText className="w-3.5 h-3.5 text-sky-400" />
                            <span>
                              {isAr ? 'عنوان التقرير:' : 'Report:'} <strong>{notif.reportTitle}</strong>
                            </span>
                          </div>
                        </div>
                      )}

                      {/* View & Print Action Buttons */}
                      <div className="flex items-center gap-1.5 pt-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedInspectingNotification(notif);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 border border-sky-500/30 text-[10px] font-black flex items-center gap-1 transition-all cursor-pointer shadow-lg"
                          title={isAr ? 'عرض تفاصيل الإشعار بالكامل' : 'Display notification details'}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{isAr ? 'عرض وتفاصيل' : 'Display'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePrintNotification(notif);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/30 text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow"
                          title={isAr ? 'طباعة الإشعار كمستند رسمي معتمد' : 'Print official report PDF'}
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>{isAr ? 'طباعة المستند' : 'Print'}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right Meta Column */}
                  <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-2 shrink-0 border-t md:border-t-0 pt-2 md:pt-0 border-slate-800/60">
                    <div className="text-left rtl:text-right md:rtl:text-left text-xs text-slate-400 font-mono">
                      <span className="block text-slate-300 font-bold">{notif.time}</span>
                      <span className="text-[10px] text-slate-500">{notif.date}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-medium">
                        {notif.employeeRole}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* 2. Security Alerts (Failed Logins) */}
            {filteredSecurity.map(alert => {
              const isUnread = alert.status === 'unread';

              return (
                <div
                  key={alert.id}
                  className={`p-5 rounded-3xl border transition-all shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                    isUnread
                      ? 'bg-gradient-to-r from-rose-950/40 via-[#101420] to-[#090d16] border-rose-500/50 shadow-rose-500/10'
                      : 'bg-[#0c101a] border-slate-800/80 opacity-80'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold shrink-0 shadow-md ${
                      isUnread ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' : 'bg-slate-800 text-slate-400'
                    }`}>
                      <AlertTriangle className="w-5 h-5" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <strong className="text-white text-sm font-bold">
                          {alert.reasonAr}
                        </strong>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 font-mono font-bold">
                          {alert.attemptsCount} {isAr ? 'محاولات خاطئة' : 'attempts'}
                        </span>
                        {isUnread && (
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-rose-500 text-white font-black animate-pulse">
                            {isAr ? 'تنبيه أمني جديد' : 'New Security Alert'}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-0.5">
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-slate-500" />
                          <span>{isAr ? 'المعرف/الهاتف المستخدم:' : 'Input:'} <strong className="text-white font-mono">{alert.usernameOrPhone}</strong></span>
                        </span>

                        {alert.accountName && (
                          <span className="flex items-center gap-1 text-amber-300">
                            <span>{isAr ? 'الاسم المطابق:' : 'Matched Account:'} <strong>{alert.accountName}</strong></span>
                          </span>
                        )}

                        <span className="flex items-center gap-1 font-mono text-[11px] text-slate-500">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{alert.date} {alert.time}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-auto justify-end pt-2 md:pt-0">
                    {onOpenPasswordModal && alert.accountFound && alert.usernameOrPhone && (
                      <button
                        onClick={() => onOpenPasswordModal('employee', alert.usernameOrPhone, alert.accountName || alert.usernameOrPhone, alert.accountPhone || alert.usernameOrPhone)}
                        className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500 text-[#f7cb55] hover:text-slate-950 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>{isAr ? 'تعديل كلمة المرور' : 'Change Password'}</span>
                      </button>
                    )}

                    {isUnread && (
                      <button
                        onClick={() => handleResolveSecurityAlert(alert.id)}
                        className="px-3.5 py-2 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{isAr ? 'تمت المراجعة' : 'Mark Reviewed'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* 5. VIEW NOTIFICATION MODAL */}
      {selectedInspectingNotification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[#0c101a] border-2 border-sky-500/50 rounded-3xl p-6 shadow-2xl relative text-slate-100 text-right rtl:text-right ltr:text-left">
            <button
              onClick={() => setSelectedInspectingNotification(null)}
              className="absolute top-4 left-4 rtl:left-4 rtl:right-auto ltr:right-4 ltr:left-auto p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/60 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center font-bold">
                <BellRing className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">
                  {isAr ? 'تفاصيل الإشعار الإداري' : 'Administrative Notification'}
                </h3>
                <span className="text-xs text-slate-400">
                  {selectedInspectingNotification.date} • {selectedInspectingNotification.time}
                </span>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-[#050810] p-4 rounded-2xl border border-slate-800/80 space-y-3">
                <div className="flex justify-between border-b border-slate-900 pb-2">
                  <span className="text-slate-400 font-bold">{isAr ? 'الإجراء:' : 'Action:'}</span>
                  <strong className="text-white font-black">{selectedInspectingNotification.titleAr}</strong>
                </div>
                <div className="flex justify-between border-b border-slate-900 pb-2">
                  <span className="text-slate-400 font-bold">{isAr ? 'المسؤول:' : 'Operator:'}</span>
                  <span className="text-slate-200 font-bold">{selectedInspectingNotification.employeeName} ({selectedInspectingNotification.employeeRole})</span>
                </div>
                {selectedInspectingNotification.reportTitle && (
                  <div className="flex justify-between border-b border-slate-900 pb-2">
                    <span className="text-slate-400 font-bold">{isAr ? 'المستند/التقرير:' : 'Document:'}</span>
                    <span className="text-sky-300 font-semibold">{selectedInspectingNotification.reportTitle}</span>
                  </div>
                )}
                {selectedInspectingNotification.workedHours !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold">{isAr ? 'ساعات العمل اليومية:' : 'Worked Hours:'}</span>
                    <strong className="text-emerald-400 font-mono">{selectedInspectingNotification.workedHoursFormatted || `${selectedInspectingNotification.workedHours} ساعة`}</strong>
                  </div>
                )}
                
                {selectedInspectingNotification.type === 'shift_close' && selectedInspectingNotification.shiftId && (
                  <div className="pt-3 border-t border-slate-900 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-amber-400 font-black text-[10px] uppercase tracking-wider">{isAr ? 'تفاصيل جرد الوردية:' : 'Shift Audit Details:'}</span>
                      <span className="text-[9px] text-slate-500 font-mono">ID: {selectedInspectingNotification.shiftId}</span>
                    </div>
                    {renderShiftAuditDetails(selectedInspectingNotification.shiftId, isAr)}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-slate-400 font-black mb-1.5">{isAr ? 'البيان والمذكرة التفصيلية:' : 'Statement details:'}</label>
                <div className="bg-[#050810] border border-slate-800 rounded-xl p-4 text-slate-300 leading-relaxed font-bold">
                  {selectedInspectingNotification.detailsAr}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    handlePrintNotification(selectedInspectingNotification);
                    setSelectedInspectingNotification(null);
                  }}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs shadow-lg hover:brightness-110 flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Printer className="w-4 h-4" />
                  <span>{isAr ? 'طباعة هذا الإشعار كتقرير رسمي' : 'Print Official PDF'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedInspectingNotification(null)}
                  className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 font-bold text-xs cursor-pointer transition-colors"
                >
                  {isAr ? 'إغلاق' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
