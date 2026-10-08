import React, { useState, useEffect } from 'react';
import { MemberCheckInRecord, GymMember, CurrentUser } from '../types/gym';
import { StorageService } from '../services/storageService';
import { audioAlertService } from '../services/audioService';
import { pdfPrintService } from '../services/pdfPrintService';
import { 
  UserCheck, 
  Search, 
  Calendar, 
  Clock, 
  QrCode, 
  ShieldCheck, 
  Printer, 
  Filter, 
  Plus, 
  Users, 
  AlertCircle, 
  Sparkles, 
  CheckCircle2, 
  ArrowUpRight, 
  RefreshCw,
  ShieldAlert,
  X
} from 'lucide-react';

interface MemberCheckInLogViewProps {
  currentUser?: CurrentUser;
  lang: 'ar' | 'en';
}

export const MemberCheckInLogView: React.FC<MemberCheckInLogViewProps> = ({ currentUser, lang }) => {
  const isAr = lang === 'ar';
  const [checkIns, setCheckIns] = useState<MemberCheckInRecord[]>([]);
  const [members, setMembers] = useState<GymMember[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<'today' | 'all'>('today');
  
  // Manual Check-in Modal State
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState('');

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const todayStr = StorageService.getLocalTodayString();

  const refreshData = () => {
    setCheckIns(StorageService.getMemberCheckIns());
    setMembers(StorageService.getMembers());
  };

  useEffect(() => {
    refreshData();
    // Auto refresh every 10 seconds for real-time live log experience
    const interval = setInterval(refreshData, 10000);
    return () => clearInterval(interval);
  }, []);

  const filteredCheckIns = checkIns.filter(record => {
    if (dateFilter === 'today' && record.checkInDate !== todayStr) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = (record.memberNameAr && record.memberNameAr.toLowerCase().includes(q)) ||
        (record.membershipNumber && record.membershipNumber.includes(q)) ||
        (record.phone && record.phone.includes(q));
      if (!matchSearch) return false;
    }

    return true;
  });

  const handleManualCheckIn = (e: React.FormEvent, force: boolean = false) => {
    e.preventDefault();
    const member = members.find(m => m.id === selectedMemberId);
    if (!member) {
      alert(isAr ? 'يرجى اختيار المشترك' : 'Please select a member');
      return;
    }

    const performerName = currentUser ? `${currentUser.nameAr} (${currentUser.role})` : 'موظف الاستقبال';
    const performerRole = currentUser?.role || 'staff';

    const result = StorageService.recordMemberCheckIn(
      member,
      'manual_staff',
      performerName,
      performerRole,
      force
    );

    if (!result.success) {
      audioAlertService.playDelete();
      setToastMessage(isAr ? `⛔ ${result.errorAr}` : `⛔ ${result.errorEn}`);
      setTimeout(() => setToastMessage(null), 5000);
      return;
    }

    audioAlertService.playSuccess();
    refreshData();
    setIsCheckInModalOpen(false);
    setSelectedMemberId('');
    setToastMessage(isAr ? `✓ تم تسجيل حضور العضو (${member.fullNameAr}) في ${result.record?.checkInTime} بنجاح` : 'Check-in recorded');
    setTimeout(() => setToastMessage(null), 3500);
  };

  const todayCount = checkIns.filter(c => c.checkInDate === todayStr).length;
  const todayActiveCount = checkIns.filter(c => c.checkInDate === todayStr && c.statusAtCheckIn === 'active').length;
  const todayWarningsCount = checkIns.filter(c => c.checkInDate === todayStr && c.statusAtCheckIn !== 'active').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* 1. EXECUTIVE HERO BANNER */}
      <div className="bg-gradient-to-br from-[#0e1626] via-[#09101c] to-[#04070e] rounded-3xl p-6 border-2 border-emerald-500/40 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500/40 flex items-center justify-center font-bold shadow-xl shadow-emerald-500/10 shrink-0">
              <UserCheck className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>{isAr ? 'سجل الحضور الحي المباشر' : 'Live Real-time Check-ins'}</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 text-emerald-400 font-mono font-bold border border-emerald-500/30 animate-pulse">
                  ● Live Sync
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                {isAr ? 'سجل دخول وحضور الأعضاء باليوم والتاريخ والساعة' : 'Member Attendance & Check-In Register'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {isAr ? 'متابعة وتوثيق دخول المشتركين لحظة بلحظة بالوقت والدقيقة والثانية ووسيلة الدخول' : 'Track and record member check-ins second-by-second with timestamps'}
              </p>
            </div>
          </div>

          {/* Metrics & Add Button */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-[#070b14] px-4 py-2.5 rounded-2xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block">{isAr ? 'حضور اليوم' : 'Today Check-ins'}</span>
              <strong className="text-lg font-black text-emerald-400 font-mono block mt-0.5">{todayCount}</strong>
            </div>

            <div className="bg-[#070b14] px-4 py-2.5 rounded-2xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block">{isAr ? 'اشتراكات سارية' : 'Active Members'}</span>
              <strong className="text-lg font-black text-sky-400 font-mono block mt-0.5">{todayActiveCount}</strong>
            </div>

            {todayWarningsCount > 0 && (
              <div className="bg-[#070b14] px-4 py-2.5 rounded-2xl border border-rose-500/40 text-center">
                <span className="text-[10px] text-rose-300 block">{isAr ? 'تنبيهات دخول' : 'Warnings'}</span>
                <strong className="text-lg font-black text-rose-400 font-mono block mt-0.5">{todayWarningsCount}</strong>
              </div>
            )}

            <button
              type="button"
              onClick={() => setIsCheckInModalOpen(true)}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs flex items-center gap-2 shadow-xl shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>{isAr ? '+ تسجيل حضور عضو الآن' : '+ Record Check-In'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. SEARCH & FILTER BAR */}
      <div className="bg-[#090d16] p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute right-3.5 rtl:right-3.5 ltr:left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoComplete="off"
            placeholder={isAr ? 'ابحث باسم المشترك، رقم العضوية، أو رقم الهاتف...' : 'Search member name, ID, phone...'}
            className="w-full bg-[#05070d] border border-slate-800 rounded-xl py-2 px-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setDateFilter('today')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              dateFilter === 'today'
                ? 'bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {isAr ? 'حضور اليوم فقط 📅' : 'Today Only'}
          </button>

          <button
            type="button"
            onClick={() => setDateFilter('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              dateFilter === 'all'
                ? 'bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {isAr ? 'جميع الأيام' : 'All Dates'}
          </button>

          <button
            type="button"
            onClick={refreshData}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white cursor-pointer"
            title={isAr ? 'تحديث السجل الحي' : 'Refresh'}
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3. CHECK-INS LIVE LOG TABLE */}
      <div className="bg-[#090d16] rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
        <div className="p-4 bg-[#060810] border-b border-slate-800 flex items-center justify-between text-xs font-bold text-slate-300">
          <span className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>{isAr ? 'حركات وسجل الدخول المسجلة' : 'Recorded Check-in Entries'}</span>
          </span>

          <span className="text-emerald-400 font-mono">
            {filteredCheckIns.length} {isAr ? 'تسجيل دخول' : 'records'}
          </span>
        </div>

        {filteredCheckIns.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs font-bold space-y-2">
            <UserCheck className="w-12 h-12 text-slate-700 mx-auto mb-2" />
            <p>{isAr ? 'لا توجد تسجيلات دخول مطابقة للبحث أو اليوم المحدد.' : 'No check-ins recorded for selected criteria.'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right rtl:text-right ltr:text-left text-xs">
              <thead className="bg-[#05070f] text-slate-400 font-bold border-b border-slate-800/80">
                <tr>
                  <th className="p-3.5">#</th>
                  <th className="p-3.5">{isAr ? 'المشترك' : 'Member'}</th>
                  <th className="p-3.5">{isAr ? 'وقت الدخول exact' : 'Time'}</th>
                  <th className="p-3.5">{isAr ? 'تاريخ اليوم' : 'Date'}</th>
                  <th className="p-3.5">{isAr ? 'حالة الاشتراك' : 'Status'}</th>
                  <th className="p-3.5">{isAr ? 'وسيلة وبوابة الدخول' : 'Gate / Method'}</th>
                  <th className="p-3.5">{isAr ? 'تم بواسطة' : 'Performed By'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredCheckIns.map((rec, idx) => (
                  <tr key={rec.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="p-3.5 font-mono text-slate-500 font-bold text-[11px]">
                      {idx + 1}
                    </td>

                    {/* Member Details */}
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={rec.avatarUrl || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'}
                          alt={rec.memberNameAr}
                          className="w-9 h-9 rounded-xl object-cover border border-slate-700 shrink-0"
                        />
                        <div>
                          <strong className="text-white text-xs block font-bold">{rec.memberNameAr}</strong>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] font-mono text-emerald-400 font-bold">
                              رقم {rec.membershipNumber}
                            </span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold">
                              {rec.tier === 'diamond' ? 'ماسي' : rec.tier === 'gold' ? 'ذهبي' : rec.tier === 'vip' ? 'VIP' : 'قياسي'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Time */}
                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <strong className="text-xs font-black text-emerald-300 font-mono">
                          {rec.checkInTime}
                        </strong>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="p-3.5 font-mono text-slate-300 font-bold text-xs">
                      {rec.checkInDate}
                    </td>

                    {/* Status At Check-in */}
                    <td className="p-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        rec.statusAtCheckIn === 'active'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                          : rec.statusAtCheckIn === 'frozen'
                            ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
                            : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                      }`}>
                        {rec.statusAtCheckIn === 'active' ? (isAr ? 'ساري ونشط ✓' : 'Active') : (isAr ? 'مجمّد' : rec.statusAtCheckIn)}
                        <span className="text-[9px] font-mono mr-1 rtl:mr-1 ltr:ml-1">({rec.remainingDaysAtCheckIn} يوم)</span>
                      </span>
                    </td>

                    {/* Gate / Method */}
                    <td className="p-3.5">
                      <span className="text-[11px] font-bold text-sky-300 bg-sky-950/60 px-2.5 py-1 rounded-xl border border-sky-500/30 flex items-center gap-1 w-fit">
                        <QrCode className="w-3 h-3 text-sky-400" />
                        <span>
                          {rec.gateOrMethod === 'reception_qr'
                            ? (isAr ? 'بوابة الباركود الذاتي' : 'Reception QR')
                            : rec.gateOrMethod === 'self_portal'
                              ? (isAr ? 'دخول ذاتي بالبوابة' : 'Self Portal')
                              : (isAr ? 'تسجيل يدوي بالاستقبال' : 'Manual Staff')}
                        </span>
                      </span>
                    </td>

                    {/* Performed By */}
                    <td className="p-3.5 text-slate-400 text-xs font-bold">
                      {rec.performedByName}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. MANUAL CHECK-IN MODAL */}
      {isCheckInModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#0c101a] border-2 border-emerald-500/50 rounded-3xl p-6 shadow-2xl relative text-slate-100 text-right rtl:text-right ltr:text-left">
            <button
              onClick={() => setIsCheckInModalOpen(false)}
              className="absolute top-4 left-4 rtl:left-4 rtl:right-auto ltr:right-4 ltr:left-auto p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/60"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">
                  {isAr ? 'تسجيل حضور عضو بالصالة الآن' : 'Record Member Attendance'}
                </h3>
                <span className="text-xs text-slate-400">
                  {isAr ? 'تأكيد ودخول العضو وتسجيل الوقت والحضور فوراً' : 'Select member to check in'}
                </span>
              </div>
            </div>

            <form onSubmit={handleManualCheckIn} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">{isAr ? 'اختر المشترك:' : 'Select Member:'}</label>
                <select
                  required
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  className="w-full bg-[#050810] border border-slate-700 rounded-xl p-3 text-xs text-white font-bold focus:border-emerald-500 focus:outline-none"
                >
                  <option value="">{isAr ? '-- اختر العضو المسجل --' : '-- Select Member --'}</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.fullNameAr} (#{m.membershipNumber}) - {m.status} ({m.remainingDays} يوم)
                    </option>
                  ))}
                </select>
              </div>

              {selectedMemberId && (() => {
                const eligibility = StorageService.checkMemberCheckInEligibility(selectedMemberId);
                if (!eligibility.allowed) {
                  return (
                    <div className="p-3 bg-rose-950/60 border border-rose-500/50 rounded-2xl text-rose-200 text-xs space-y-1.5 animate-in fade-in duration-200">
                      <div className="flex items-center gap-2 font-bold text-rose-300">
                        <Clock className="w-4 h-4 text-rose-400 shrink-0 animate-pulse" />
                        <span>{isAr ? '⛔ تنبيه: العضو مسجل حضور خلال آخر 12 ساعة' : 'Cooldown Active: Member checked in within 12h'}</span>
                      </div>
                      <p className="text-[11px] text-rose-300/90 leading-relaxed">
                        {isAr
                          ? `آخر تسجيل حضور: ${eligibility.lastCheckInDate} الساعة [${eligibility.lastCheckInTime}]. متبقي [${eligibility.remainingHours} ساعة و ${eligibility.remainingMinutes} دقيقة] للسماح بالدخول التالي.`
                          : `Last check-in at ${eligibility.lastCheckInTime}. ${eligibility.remainingHours}h ${eligibility.remainingMinutes}m remaining.`}
                      </p>
                      <div className="pt-1 flex items-center justify-between text-[10px] text-rose-400 font-mono">
                        <span>{isAr ? 'موعد الدخول المسموح القادم:' : 'Next allowed check-in:'}</span>
                        <strong className="text-white font-bold">{eligibility.nextAllowedTimeStr}</strong>
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <div className="p-2.5 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{isAr ? '✓ العضو مؤهل لتسجيل الحضور (مرت أكثر من 12 ساعة)' : 'Member is eligible to check in'}</span>
                    </div>
                  );
                }
              })()}

              <div className="p-3 bg-[#050810] rounded-2xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div className="flex justify-between">
                  <span>{isAr ? 'التاريخ الحالي:' : 'Date:'}</span>
                  <strong className="text-white font-mono">{todayStr}</strong>
                </div>
                <div className="flex justify-between">
                  <span>{isAr ? 'الوقت الحالي:' : 'Time:'}</span>
                  <strong className="text-emerald-400 font-mono">{new Date().toTimeString().split(' ')[0]}</strong>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs transition-colors shadow-lg shadow-emerald-500/20 cursor-pointer"
                >
                  {isAr ? '✓ تسجيل الدخول والحضور الآن' : 'Record Check-In Now'}
                </button>

                {selectedMemberId && !StorageService.checkMemberCheckInEligibility(selectedMemberId).allowed && (
                  <button
                    type="button"
                    onClick={(e) => handleManualCheckIn(e, true)}
                    className="w-full py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold text-[11px] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isAr ? '⚠️ تسجيل دخول استثنائي وتجاوز مهلة الـ 12 ساعة (بإذن الإدارة)' : 'Force Override 12h Cooldown (Admin)'}</span>
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-slate-900 border-2 border-emerald-500/60 text-emerald-300 font-bold text-xs shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
