import React, { useState, useEffect, useMemo } from 'react';
import { CurrentUser, SystemActivityLog, AppRole, ActivityCategory } from '../types/gym';
import { StorageService } from '../services/storageService';
import { audioAlertService } from '../services/audioService';
import { pdfPrintService } from '../services/pdfPrintService';
import { 
  Zap, 
  RefreshCw, 
  Printer, 
  Search, 
  Filter, 
  Users, 
  UserCheck, 
  ShieldCheck, 
  Clock, 
  DollarSign, 
  Dumbbell, 
  Calendar, 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  Eye, 
  Crown, 
  Wallet, 
  Radio, 
  SlidersHorizontal,
  ArrowUpDown,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Flame,
  Activity
} from 'lucide-react';

interface ManagerDynamicSyncReportProps {
  currentUser: CurrentUser;
  lang: 'ar' | 'en';
}

export const ManagerDynamicSyncReport: React.FC<ManagerDynamicSyncReportProps> = ({
  currentUser,
  lang
}) => {
  const isAr = lang === 'ar';
  const [logs, setLogs] = useState<SystemActivityLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedDateFilter, setSelectedDateFilter] = useState<'today' | 'week' | 'all'>('today');
  const [autoSyncInterval, setAutoSyncInterval] = useState<number>(5000); // 5 seconds
  const [isLiveActive, setIsLiveActive] = useState(true);
  const [lastSyncedTime, setLastSyncedTime] = useState<string>(new Date().toLocaleTimeString('ar-EG'));
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load logs
  const refreshLogs = () => {
    setIsRefreshing(true);
    const activityLogs = StorageService.getActivityLogs();
    setLogs(activityLogs);
    setLastSyncedTime(new Date().toLocaleTimeString('ar-EG'));
    setTimeout(() => setIsRefreshing(false), 400);
  };

  useEffect(() => {
    refreshLogs();

    const handleSync = () => refreshLogs();
    window.addEventListener('gym_storage_updated', handleSync);
    window.addEventListener('gym_permissions_updated', handleSync);
    window.addEventListener('gym_attendance_updated', handleSync);
    window.addEventListener('storage', handleSync);

    return () => {
      window.removeEventListener('gym_storage_updated', handleSync);
      window.removeEventListener('gym_permissions_updated', handleSync);
      window.removeEventListener('gym_attendance_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  // Periodic Auto-Sync Timer
  useEffect(() => {
    if (!isLiveActive || autoSyncInterval <= 0) return;

    const timer = setInterval(() => {
      const activityLogs = StorageService.getActivityLogs();
      setLogs(activityLogs);
      setLastSyncedTime(new Date().toLocaleTimeString('ar-EG'));
    }, autoSyncInterval);

    return () => clearInterval(timer);
  }, [isLiveActive, autoSyncInterval]);

  const todayStr = new Date().toISOString().split('T')[0];

  // Filter logs
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      // Date filter
      if (selectedDateFilter === 'today') {
        const logDate = log.date || log.timestamp?.split('T')[0];
        if (logDate !== todayStr) return false;
      }

      // Category filter
      if (selectedCategory === 'staff_only') {
        if (log.performerRole === 'member') return false;
      } else if (selectedCategory === 'members_only') {
        if (log.performerRole !== 'member' && log.category !== 'workout' && log.category !== 'attendance') return false;
      } else if (selectedCategory !== 'all') {
        if (log.category !== selectedCategory) return false;
      }

      // Role filter
      if (selectedRole !== 'all') {
        if (log.performerRole !== selectedRole) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const match = 
          (log.performerName || '').toLowerCase().includes(q) ||
          (log.titleAr || '').toLowerCase().includes(q) ||
          (log.detailsAr || '').toLowerCase().includes(q) ||
          (log.targetName || '').toLowerCase().includes(q) ||
          (log.performerRole || '').toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    });
  }, [logs, selectedDateFilter, selectedCategory, selectedRole, searchQuery, todayStr]);

  // Key KPI stats
  const totalAllLogs = logs.length;
  const todayLogsCount = logs.filter(l => (l.date || l.timestamp?.split('T')[0]) === todayStr).length;
  const staffActionsToday = logs.filter(l => (l.date || l.timestamp?.split('T')[0]) === todayStr && l.performerRole !== 'member').length;
  const memberActionsToday = logs.filter(l => (l.date || l.timestamp?.split('T')[0]) === todayStr && (l.performerRole === 'member' || l.category === 'workout' || l.category === 'attendance')).length;
  const financialActionsToday = logs.filter(l => (l.date || l.timestamp?.split('T')[0]) === todayStr && (l.category === 'financial' || l.category === 'shift')).length;

  // Print Dynamic Sync Report PDF
  const handlePrintReport = () => {
    audioAlertService.playSuccess();
    const filterSummary = `${selectedDateFilter === 'today' ? 'حركات اليوم' : 'كافة الفترات'} • ${selectedCategory === 'all' ? 'كافة التصنيفات' : selectedCategory} • ${selectedRole === 'all' ? 'كافة الرتب' : selectedRole}`;
    pdfPrintService.printDynamicSyncReportPDF(filteredLogs, filterSummary, currentUser.nameAr);
  };

  const roleMeta: Record<string, { labelAr: string; colorClass: string; icon: any }> = {
    manager: { labelAr: 'المدير العام', colorClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40', icon: Crown },
    accountant: { labelAr: 'مسؤول حسابات', colorClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', icon: Wallet },
    staff: { labelAr: 'موظف استقبال', colorClass: 'bg-sky-500/20 text-sky-300 border-sky-500/40', icon: UserCheck },
    coach: { labelAr: 'كابتن ومدرب', colorClass: 'bg-orange-500/20 text-orange-300 border-orange-500/40', icon: Dumbbell },
    member: { labelAr: 'عضو مشترك', colorClass: 'bg-purple-500/20 text-purple-300 border-purple-500/40', icon: Users },
    viewer: { labelAr: 'مراقب عرض فقط', colorClass: 'bg-slate-700/50 text-slate-300 border-slate-600', icon: Eye }
  };

  const categoryLabelsAr: Record<string, string> = {
    membership: 'إدارة المشتركين',
    financial: 'ماليات وسندات',
    workout: 'تمارين وتدريب',
    shift: 'ورديات الخزينة',
    account: 'حسابات وصلاحيات',
    attendance: 'حضور وانصراف',
    system: 'نظام ومزامنة',
    deletion: 'سلة المحذوفات'
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* 1. TOP HEADER & LIVE SYNC STATUS BAR */}
      <div className="bg-gradient-to-r from-[#0e1726] via-[#091120] to-[#0a1424] rounded-3xl p-6 border-2 border-sky-500/40 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 text-slate-950 flex items-center justify-center font-bold shadow-xl shadow-sky-500/20 border border-sky-300/40 shrink-0">
              <Zap className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  {isAr ? 'تقرير التزامن الديناميكي لحركات النظام' : 'Dynamic Real-time System Sync Report'}
                </h2>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/40 shadow-sm animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span>{isAr ? 'مزامنة حية نشطة' : 'Live Sync Active'}</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {isAr 
                  ? 'رصد ديناميكي لحظي لكافة حركات وإجراءات الموظفين، تمارين وحضور الأعضاء، السندات والورديات والتعديلات.' 
                  : 'Real-time telemetry and dynamic audit trail of staff actions and member activities.'}
              </p>
            </div>
          </div>

          {/* Live Action Controls */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            <div className="bg-[#060a14] px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              <span>{isAr ? 'آخر تحديث تزامني:' : 'Last Synced:'}</span>
              <strong className="text-white font-mono">{lastSyncedTime}</strong>
            </div>

            <button
              onClick={refreshLogs}
              disabled={isRefreshing}
              className={`p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer ${isRefreshing ? 'animate-spin text-sky-400' : ''}`}
              title={isAr ? 'تحديث فوري يدوي' : 'Refresh Now'}
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={handlePrintReport}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-slate-950 font-black text-xs transition-all shadow-lg shadow-sky-500/20 flex items-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{isAr ? 'تصدير وطباعة تقرير التزامن PDF' : 'Print Sync PDF'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. DYNAMIC LIVE KPI CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-[#0b101c] p-4 rounded-2xl border border-slate-800/90 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold">{isAr ? 'حركات اليوم المتزامنة' : "Today's Total Events"}</span>
            <Activity className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">{todayLogsCount}</div>
          <span className="text-[10px] text-slate-500 block mt-0.5 font-medium">
            {isAr ? `من إجمالي ${totalAllLogs} حركة بالنظام` : `out of ${totalAllLogs} total`}
          </span>
        </div>

        <div className="bg-[#0b101c] p-4 rounded-2xl border border-sky-500/30 shadow-lg">
          <div className="flex items-center justify-between text-sky-400 mb-1">
            <span className="text-xs font-bold">{isAr ? 'حركات الموظفين والإدارة' : 'Staff Activities'}</span>
            <ShieldCheck className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-black text-sky-400 font-mono">{staffActionsToday}</div>
          <span className="text-[10px] text-sky-300/70 block mt-0.5 font-medium">
            {isAr ? 'حضور، سندات، ورديات، وتعديلات' : 'Logins, checkouts & edits'}
          </span>
        </div>

        <div className="bg-[#0b101c] p-4 rounded-2xl border border-emerald-500/30 shadow-lg">
          <div className="flex items-center justify-between text-emerald-400 mb-1">
            <span className="text-xs font-bold">{isAr ? 'حركات وتمارين الأعضاء' : 'Member Check-ins'}</span>
            <Dumbbell className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">{memberActionsToday}</div>
          <span className="text-[10px] text-emerald-300/70 block mt-0.5 font-medium">
            {isAr ? 'دخول الصالة، تمارين، اشتراكات' : 'Gate checkins & workout logs'}
          </span>
        </div>

        <div className="bg-[#0b101c] p-4 rounded-2xl border border-amber-500/30 shadow-lg">
          <div className="flex items-center justify-between text-amber-400 mb-1">
            <span className="text-xs font-bold">{isAr ? 'العمليات المالية والسندات' : 'Financial Transactions'}</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono">{financialActionsToday}</div>
          <span className="text-[10px] text-amber-300/70 block mt-0.5 font-medium">
            {isAr ? 'سندات قبض وصرف وتجديدات' : 'Vouchers & payments'}
          </span>
        </div>
      </div>

      {/* 3. DYNAMIC FILTER & SEARCH BAR */}
      <div className="bg-[#090d18] rounded-2xl p-4 border border-slate-800 space-y-3.5">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-500 absolute right-3.5 rtl:right-3.5 ltr:left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? 'ابحث باسم الموظف أو العضو، نوع الحركة، أو البيان...' : 'Search logs by name, action, or target...'}
              className="w-full bg-[#05070e] border border-slate-800 rounded-xl py-2 px-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Date Filter Pills */}
          <div className="flex items-center gap-1.5 w-full md:w-auto shrink-0">
            <span className="text-xs text-slate-400 font-bold ml-1 rtl:ml-1 ltr:mr-1">{isAr ? 'الفترة:' : 'Period:'}</span>
            <button
              onClick={() => setSelectedDateFilter('today')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedDateFilter === 'today'
                  ? 'bg-sky-500 text-slate-950 font-black'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              {isAr ? 'حركات اليوم 📅' : "Today's Logs"}
            </button>
            <button
              onClick={() => setSelectedDateFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedDateFilter === 'all'
                  ? 'bg-sky-500 text-slate-950 font-black'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              {isAr ? 'كافة السجلات' : 'All History'}
            </button>
          </div>
        </div>

        {/* Dynamic Category Quick Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-thin pt-2 border-t border-slate-800/80">
          <span className="text-[11px] text-slate-400 font-bold ml-1 rtl:ml-1 ltr:mr-1 shrink-0 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-sky-400" />
            <span>{isAr ? 'التصنيف الحي:' : 'Filter:'}</span>
          </span>

          {[
            { id: 'all', labelAr: 'كافة الحركات 🌐' },
            { id: 'staff_only', labelAr: 'حركات الموظفين والإدارة 👥' },
            { id: 'members_only', labelAr: 'حركات وتمارين المشتركين 🏋️‍♂️' },
            { id: 'financial', labelAr: 'ماليات وسندات 💼' },
            { id: 'attendance', labelAr: 'حضور وانصراف ⏱️' },
            { id: 'account', labelAr: 'حسابات وصلاحيات 🛡️' },
            { id: 'membership', labelAr: 'اشتراكات وباقات 📋' }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all shrink-0 cursor-pointer border ${
                selectedCategory === cat.id
                  ? 'bg-sky-500 text-slate-950 font-black border-sky-400 shadow-md shadow-sky-500/10'
                  : 'bg-[#060810] text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
              }`}
            >
              {cat.labelAr}
            </button>
          ))}
        </div>

        {/* Performer Role Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-thin pt-2 border-t border-slate-800/60">
          <span className="text-[11px] text-slate-400 font-bold ml-1 rtl:ml-1 ltr:mr-1 shrink-0">
            {isAr ? 'الرتبة المنفذة:' : 'Role:'}
          </span>
          {[
            { id: 'all', label: 'الجميع' },
            { id: 'manager', label: '👑 المدير العام' },
            { id: 'accountant', label: '💼 المحاسب' },
            { id: 'staff', label: '👥 الاستقبال' },
            { id: 'coach', label: '🏋️‍♂️ الكابتن' },
            { id: 'member', label: '👤 المشتركين' },
            { id: 'viewer', label: '👁️ العرض فقط' }
          ].map(r => (
            <button
              key={r.id}
              onClick={() => setSelectedRole(r.id)}
              className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold transition-all shrink-0 cursor-pointer border ${
                selectedRole === r.id
                  ? 'bg-amber-500 text-slate-950 font-black border-amber-400'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. DYNAMIC TIMELINE STREAM VIEW */}
      <div className="bg-[#090d18] rounded-3xl p-5 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <h3 className="text-sm font-black text-white">
              {isAr ? 'البث التزامني المباشر للعمليات' : 'Live Realtime Activity Stream'}
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono font-bold">
            {isAr ? `تم العثور على ${filteredLogs.length} حركة مطابقة` : `${filteredLogs.length} matched`}
          </span>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center bg-[#060810] rounded-2xl border border-slate-800 space-y-2">
            <Activity className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm text-slate-400 font-bold">
              {isAr ? 'لا توجد حركات مسجلة مطابقة لخيارات التصفية المحددة' : 'No matching activity logs found'}
            </p>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1 scrollbar-thin">
            {filteredLogs.map((log, index) => {
              const meta = roleMeta[log.performerRole] || {
                labelAr: log.performerRole,
                colorClass: 'bg-slate-800 text-slate-300 border-slate-700',
                icon: Users
              };
              const RoleIcon = meta.icon;
              const isStaff = log.performerRole !== 'member';

              return (
                <div
                  key={log.id || index}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isStaff
                      ? 'bg-[#0c1220] border-slate-800/90 hover:border-sky-500/40'
                      : 'bg-[#080d17] border-slate-800/70 hover:border-emerald-500/30'
                  }`}
                >
                  {/* Left Side: Avatar / Badge & Content */}
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 border ${meta.colorClass}`}>
                      <RoleIcon className="w-5 h-5" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <strong className="text-xs font-black text-white">
                          {log.performerName}
                        </strong>
                        <span className={`text-[10px] px-2 py-0.2 rounded-full font-bold border ${meta.colorClass}`}>
                          {meta.labelAr}
                        </span>
                        <span className="text-[10px] px-2 py-0.2 rounded-full bg-slate-800 text-slate-400 border border-slate-700 font-medium">
                          {categoryLabelsAr[log.category] || log.category}
                        </span>
                      </div>

                      <p className="text-xs text-sky-200 font-bold">
                        {log.titleAr}
                      </p>

                      <p className="text-[11px] text-slate-400">
                        {log.detailsAr}
                      </p>

                      {log.targetName && (
                        <div className="text-[10px] text-amber-300 font-medium flex items-center gap-1">
                          <span>{isAr ? 'الطرف المستهدف:' : 'Target:'}</span>
                          <strong className="font-bold">{log.targetName}</strong>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Side: Timestamp & Channel */}
                  <div className="text-left rtl:text-left ltr:text-right shrink-0 flex sm:flex-col items-center sm:items-end justify-between gap-1 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
                    <div className="text-xs font-mono font-black text-slate-300">
                      {log.time || log.timestamp?.split('T')[1]?.substring(0, 8)}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {log.date || log.timestamp?.split('T')[0]}
                    </div>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-900 text-slate-400 border border-slate-800 font-mono">
                      SYNC ID: {log.id ? log.id.substring(0, 8) : 'ACT'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
