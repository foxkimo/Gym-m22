import React, { useState, useEffect } from 'react';
import { CurrentUser, EmployeeAttendanceRecord } from '../types/gym';
import { StorageService } from '../services/storageService';
import { audioAlertService } from '../services/audioService';
import { 
  UserCheck, 
  LogOut, 
  CheckCircle2, 
  AlertCircle, 
  Timer, 
  KeyRound,
  Send,
  Briefcase,
  History,
  AlertTriangle,
  X,
  FileText
} from 'lucide-react';

interface EmployeeAttendanceWidgetProps {
  currentUser: CurrentUser;
  lang: 'ar' | 'en';
  onAttendanceChanged?: () => void;
  compact?: boolean;
}

export const EmployeeAttendanceWidget: React.FC<EmployeeAttendanceWidgetProps> = ({
  currentUser,
  lang,
  onAttendanceChanged,
  compact = false
}) => {
  const isAr = lang === 'ar';
  const todayStr = StorageService.getLocalTodayString();

  const [enteredCode, setEnteredCode] = useState('');
  const [notes, setNotes] = useState('');
  const [todayRecord, setTodayRecord] = useState<EmployeeAttendanceRecord | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Early Departure Modal State
  const [isEarlyDepartureModalOpen, setIsEarlyDepartureModalOpen] = useState(false);
  const [earlyDepartureReason, setEarlyDepartureReason] = useState('');
  const [earlyDepartureError, setEarlyDepartureError] = useState('');

  // Find employee profile to get their unique suggested attendance code
  const employeeProfile = React.useMemo(() => {
    const allEmps = [
      ...StorageService.getManagers(),
      ...StorageService.getCoaches(),
      ...StorageService.getStaff(),
      ...StorageService.getAccountants(),
      ...StorageService.getViewers()
    ];
    return allEmps.find(e => e.id === currentUser.id || e.phone === currentUser.phone || e.nameAr === currentUser.nameAr);
  }, [currentUser]);

  const assignedAttendanceCode = employeeProfile?.attendanceCode || '1001';

  // Sync attendance record for today
  const refreshAttendance = () => {
    const attendances = StorageService.getEmployeeAttendances();
    const record = attendances.find(
      a => (a.employeeId === currentUser.id || a.employeeName === currentUser.nameAr) && a.date === todayStr
    );
    setTodayRecord(record || null);
  };

  useEffect(() => {
    refreshAttendance();

    const handleUpdate = () => refreshAttendance();
    window.addEventListener('gym_storage_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('gym_storage_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [currentUser.id, todayStr]);

  const formattedDate = new Date().toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Calculate live elapsed hours if checked in
  const calculateElapsedHours = () => {
    if (!todayRecord || !todayRecord.checkInTime) return { hours: 0, decimalHours: 0, formatted: '0 س' };
    if (todayRecord.checkOutTime) {
      return {
        hours: todayRecord.totalHoursWorked || 8,
        decimalHours: todayRecord.totalHoursWorked || 8,
        formatted: `${todayRecord.totalHoursWorked || 8} ${isAr ? 'ساعات' : 'hours'}`
      };
    }

    try {
      const [inH, inM, inS] = todayRecord.checkInTime.split(':').map(n => parseInt(n || '0', 10));
      const inDate = new Date(`${todayRecord.date}T${inH.toString().padStart(2, '0')}:${inM.toString().padStart(2, '0')}:${(inS || 0).toString().padStart(2, '0')}`);
      const now = new Date();

      const diffMs = Math.max(0, now.getTime() - inDate.getTime());
      const totalMinutes = Math.floor(diffMs / (1000 * 60));
      const h = Math.floor(totalMinutes / 60);
      const m = totalMinutes % 60;
      const decimalHours = Number((totalMinutes / 60).toFixed(2));

      return {
        hours: h,
        decimalHours,
        formatted: `${h} ${isAr ? 'ساعة' : 'hrs'}${m > 0 ? ` و ${m} ${isAr ? 'دقيقة' : 'mins'}` : ''}`
      };
    } catch {
      return { hours: 8, decimalHours: 8, formatted: '8 ساعات' };
    }
  };

  const elapsed = calculateElapsedHours();

  // Handle Employee Check-in
  const handleCheckIn = () => {
    // If code was entered, verify it
    if (enteredCode.trim() && enteredCode.trim() !== assignedAttendanceCode && enteredCode.trim() !== employeeProfile?.accessCode) {
      alert(isAr ? `كود الحضور غير صحيح، كودك المعتمد هو: ${assignedAttendanceCode}` : 'Invalid attendance code');
      return;
    }

    setIsProcessing(true);
    audioAlertService.playSuccess();

    const empInfo = {
      id: currentUser.id,
      nameAr: currentUser.nameAr,
      role: currentUser.role,
      attendanceCode: assignedAttendanceCode
    };

    const newRecord = StorageService.recordEmployeeCheckIn(empInfo, notes, enteredCode || assignedAttendanceCode);
    setTodayRecord(newRecord);
    setNotes('');
    setEnteredCode('');
    setIsProcessing(false);

    setToastMessage(
      isAr 
        ? `✓ تم تسجيل حضورك بنجاح في تمام الساعة [${newRecord.checkInTime}]. تم إرسال إشعار فوري لمدير الصالة!`
        : `Check-in recorded at ${newRecord.checkInTime}. Manager notified!`
    );
    setTimeout(() => setToastMessage(null), 5000);

    if (onAttendanceChanged) onAttendanceChanged();
  };

  // Initiate Check-out process (checks if worked < 8 hours)
  const handleInitiateCheckOut = () => {
    if (!todayRecord) return;

    // Check if worked hours are less than 8 hours
    if (elapsed.decimalHours < 8) {
      setEarlyDepartureReason('');
      setEarlyDepartureError('');
      setIsEarlyDepartureModalOpen(true);
      return;
    }

    // If completed 8+ hours, proceed directly
    executeCheckOut();
  };

  // Execute Check-out
  const executeCheckOut = (reason?: string) => {
    if (!todayRecord) return;
    setIsProcessing(true);
    audioAlertService.playSuccess();

    const updated = StorageService.recordEmployeeCheckOut(
      todayRecord.id, 
      notes, 
      reason, 
      enteredCode || assignedAttendanceCode
    );

    if (updated) {
      setTodayRecord(updated);
      setIsEarlyDepartureModalOpen(false);
      setToastMessage(
        isAr 
          ? `✓ تم تسجيل انصرافك بنجاح! إجمالي ساعات العمل: [${updated.totalHoursWorked} ساعة]. تم إشعار المدير العام فورياً.${updated.isEarlyDeparture ? ' (تم إرفاق سبب الانصراف المبكر)' : ''}`
          : `Check-out recorded! Total hours: ${updated.totalHoursWorked} hrs. Manager notified.`
      );
      setTimeout(() => setToastMessage(null), 5000);
    }
    setNotes('');
    setEnteredCode('');
    setIsProcessing(false);

    if (onAttendanceChanged) onAttendanceChanged();
  };

  // Confirm early departure with mandatory reason
  const handleConfirmEarlyDeparture = (e: React.FormEvent) => {
    e.preventDefault();
    if (!earlyDepartureReason.trim()) {
      setEarlyDepartureError(isAr ? 'يرجى كتابة سبب الانصراف المبكر (إجباري لإتمام العملية)' : 'Please enter early departure reason');
      return;
    }
    executeCheckOut(earlyDepartureReason.trim());
  };

  const roleTitleAr = 
    currentUser.role === 'coach' ? 'كابتن ومدرب الصالة' :
    currentUser.role === 'accountant' ? 'مسؤول حسابات وماليات' :
    currentUser.role === 'staff' ? 'موظف استقبال واشتراكات' :
    currentUser.role === 'viewer' ? 'مراقب عرض فقط' :
    currentUser.role === 'manager' ? 'المدير العام' : 'موظف النادي';

  return (
    <div className={`relative rounded-3xl overflow-hidden border shadow-xl transition-all ${
      !todayRecord 
        ? 'bg-gradient-to-br from-[#121624] via-[#0b0e18] to-[#070910] border-amber-500/40 shadow-amber-500/5'
        : !todayRecord.checkOutTime
          ? 'bg-gradient-to-br from-[#0c1f17] via-[#08150f] to-[#050c09] border-emerald-500/40 shadow-emerald-500/10'
          : 'bg-gradient-to-br from-[#161226] via-[#0f0c1b] to-[#080611] border-purple-500/40 shadow-purple-500/5'
    } ${compact ? 'p-4' : 'p-5 sm:p-6'}`}>

      {/* Toast Alert */}
      {toastMessage && (
        <div className="mb-4 p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500 text-emerald-300 text-xs font-bold flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/30 text-white font-mono">
            {isAr ? 'إشعار فوري للمدير ✓' : 'Manager Alerted ✓'}
          </span>
        </div>
      )}

      {/* Main Header Row (Clean, without the ticking seconds clock) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4 mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shadow-lg border shrink-0 ${
            !todayRecord
              ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
              : !todayRecord.checkOutTime
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                : 'bg-purple-500/20 text-purple-400 border-purple-500/40'
          }`}>
            {!todayRecord ? <UserCheck className="w-6 h-6 text-amber-400" /> :
             !todayRecord.checkOutTime ? <Timer className="w-6 h-6 text-emerald-400" /> :
             <CheckCircle2 className="w-6 h-6 text-purple-400" />}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-white">
                {isAr ? 'تسجيل حضور وانصراف وساعات عمل الموظف' : 'Employee Daily Attendance & Shift Hours'}
              </h3>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                !todayRecord
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : !todayRecord.checkOutTime
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-purple-500/20 text-purple-300 border-purple-500/40'
              }`}>
                {!todayRecord ? (isAr ? 'لم تسجل حضور اليوم' : 'Not Checked In') :
                 !todayRecord.checkOutTime ? (isAr ? '🟢 حاضر وقيد العمل بالصالة' : 'Working Now') :
                 (isAr ? '✓ تم إنهاء يوم العمل' : 'Shift Completed')}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
              <span className="text-white font-bold">{currentUser.nameAr}</span>
              <span>•</span>
              <span className="text-amber-400 font-medium">{roleTitleAr}</span>
              <span>•</span>
              <span className="text-slate-300">{formattedDate}</span>
            </div>
          </div>
        </div>

        {/* Assigned Attendance Code Box */}
        <div className="bg-[#050811] px-3.5 py-2 rounded-2xl border border-slate-800 text-left rtl:text-right shrink-0 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-[#f7cb55]">
            <KeyRound className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-medium">
              {isAr ? 'كود الحضور المخصص لك:' : 'Attendance Code:'}
            </span>
            <span className="text-sm font-black text-[#f7cb55] font-mono tracking-widest">
              {assignedAttendanceCode}
            </span>
          </div>
        </div>
      </div>

      {/* BODY CONTENT: 3 Distinct Dynamic States */}

      {/* STATE 1: NOT CHECKED IN YET TODAY */}
      {!todayRecord && (
        <div className="space-y-4">
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <strong className="text-amber-300 block font-bold text-sm">
                  {isAr ? 'أهلاً بك - يرجى تسجيل حضورك لبدء احتساب ساعات العمل اليومية' : 'Welcome - Please check in to start tracking your working hours'}
                </strong>
                <p className="text-slate-400 text-xs mt-0.5">
                  {isAr ? `يمكنك إدخال كود الحضور الخاص بك (${assignedAttendanceCode}) ثم الضغط على تسجيل الحضور لإشعار المدير العام فورياً.` : 'Enter your attendance code and click check-in.'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative w-full sm:w-44">
              <input
                type="text"
                value={enteredCode}
                onChange={(e) => setEnteredCode(e.target.value)}
                placeholder={isAr ? `كود الحضور (${assignedAttendanceCode})` : 'Code'}
                className="w-full bg-[#05070f] border border-amber-500/40 rounded-2xl px-4 py-3 text-xs text-[#f7cb55] font-mono font-black placeholder-slate-500 focus:outline-none focus:border-amber-400 text-center tracking-widest"
              />
            </div>

            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={isAr ? 'ملاحظات اختيارية (مثلاً: الوردية الصباحية / تغطية زميل)...' : 'Optional notes...'}
              className="flex-1 bg-[#05070f] border border-slate-700/80 rounded-2xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors font-medium"
            />

            <button
              onClick={handleCheckIn}
              disabled={isProcessing}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50 shrink-0"
            >
              <UserCheck className="w-5 h-5" />
              <span>{isAr ? 'تسجيل حضور الآن (بدء يوم العمل)' : 'Check In Now'}</span>
            </button>
          </div>
        </div>
      )}

      {/* STATE 2: CHECKED IN, WORKING NOW (LIVE WORKED HOURS COUNTER + CHECKOUT BUTTON) */}
      {todayRecord && !todayRecord.checkOutTime && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Check-in Time Box */}
            <div className="bg-[#050811] p-3.5 rounded-2xl border border-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">
                  {isAr ? 'وقت تسجيل الحضور:' : 'Check-in Time:'}
                </span>
                <strong className="text-sm font-black text-emerald-400 font-mono">
                  {todayRecord.checkInTime}
                </strong>
              </div>
            </div>

            {/* Calculated Hours Worked Box */}
            <div className="bg-[#050811] p-3.5 rounded-2xl border border-emerald-500/40 sm:col-span-2 flex items-center justify-between gap-3 shadow-lg shadow-emerald-500/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0">
                  <Timer className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">
                    {isAr ? 'ساعات العمل المحتسبة حتى الآن:' : 'Hours Tracked Today:'}
                  </span>
                  <div className="flex items-baseline gap-2">
                    <strong className="text-base font-black text-white font-mono">
                      {elapsed.formatted}
                    </strong>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      ({elapsed.decimalHours} {isAr ? 'ساعة' : 'hrs'})
                    </span>
                    {elapsed.decimalHours < 8 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {isAr ? `متبقي ${(8 - elapsed.decimalHours).toFixed(1)} س لاكتمال 8 ساعات` : 'Incomplete'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                <span>{isAr ? 'الدوام الكامل: 8 ساعات' : 'Standard Shift: 8h'}</span>
              </div>
            </div>
          </div>

          {/* Checkout Action Bar */}
          <div className="bg-[#070b13] p-4 rounded-2xl border border-rose-500/30 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-xs text-slate-300">
              <Briefcase className="w-4 h-4 text-rose-400 shrink-0" />
              <span>
                {isAr ? 'عند انتهاء وردية عملك، اضغط على زر تسجيل الانصراف لإتمام الاحتساب وإشعار المدير:' : 'Click checkout when shift is finished:'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleInitiateCheckOut}
                disabled={isProcessing}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-600 hover:from-rose-400 hover:to-amber-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20 active:scale-95 transition-all cursor-pointer shrink-0 disabled:opacity-50 w-full sm:w-auto"
              >
                <LogOut className="w-4 h-4" />
                <span>{isAr ? 'تسجيل انصراف (إنهاء يوم العمل)' : 'Check Out Now'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STATE 3: SHIFT COMPLETED & CHECKED OUT */}
      {todayRecord && todayRecord.checkOutTime && (
        <div className="space-y-4">
          <div className="bg-purple-950/20 border border-purple-500/40 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold shrink-0">
                <CheckCircle2 className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <strong className="text-purple-300 font-black text-sm block">
                  {isAr ? '✓ تم إتمام وردية العمل وتسجيل الانصراف بنجاح اليوم' : 'Daily Shift Completed & Logged Successfully'}
                </strong>
                <span className="text-xs text-slate-400 mt-0.5 block">
                  {todayRecord.isEarlyDeparture 
                    ? (isAr ? `تم تسجيل انصراف مبكر (${todayRecord.totalHoursWorked} س) مع إرسال السبب المذكور للمدير العام: "${todayRecord.earlyDepartureReason}"` : 'Early departure noted.')
                    : (isAr ? 'تم إرسال إشعار فوري لمدير الصالة بساعات عملك اليومية وتأكيد اعتمادها.' : 'Manager alerted with full shift hours.')}
                </span>
              </div>
            </div>

            {/* Total Worked Hours Badge */}
            <div className="bg-[#060812] px-4 py-2.5 rounded-xl border border-purple-500/30 text-center shrink-0">
              <span className="text-[10px] text-slate-400 block font-medium">
                {isAr ? 'إجمالي ساعات العمل المحتسبة:' : 'Total Calculated Hours:'}
              </span>
              <strong className="text-base font-black text-[#f7cb55] font-mono">
                {todayRecord.totalHoursWorked || 8} {isAr ? 'ساعات عمل فعلية' : 'Worked Hours'}
              </strong>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="bg-[#050811] p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block">{isAr ? 'ساعة الحضور' : 'Check-in'}</span>
              <strong className="text-emerald-400 font-mono font-bold">{todayRecord.checkInTime}</strong>
            </div>
            <div className="bg-[#050811] p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block">{isAr ? 'ساعة الانصراف' : 'Check-out'}</span>
              <strong className="text-rose-400 font-mono font-bold">{todayRecord.checkOutTime}</strong>
            </div>
            <div className="bg-[#050811] p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block">{isAr ? 'حالة الاعتماد' : 'Status'}</span>
              <strong className="text-purple-300 font-bold">
                {todayRecord.isEarlyDeparture ? (isAr ? 'انصراف مبكر مُخطر' : 'Early Out') : (isAr ? 'معتمد ومُخطر للمدير' : 'Approved')}
              </strong>
            </div>
            <div className="bg-[#050811] p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block">{isAr ? 'وردية جديدة؟' : 'Extra Shift?'}</span>
                <span className="text-slate-300 font-medium">{isAr ? 'تسجيل إضافي' : 'New Entry'}</span>
              </div>
              <button
                onClick={() => {
                  if (confirm(isAr ? 'هل تريد تسجيل وردية حضور إضافية جديدة لهذا اليوم؟' : 'Register an additional shift for today?')) {
                    handleCheckIn();
                  }
                }}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title={isAr ? 'تسجيل وردية إضافية' : 'Add Shift'}
              >
                <History className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Info Note */}
      <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5">
          <Send className="w-3.5 h-3.5 text-sky-400" />
          <span>
            {isAr ? 'نظام الحضور الذكي: يتم إخطار المدير العام فورياً بمجرد تسجيل حضورك أو انصرافك مع احتساب الساعات بدقة.' : 'Manager is automatically alerted upon check-in and checkout.'}
          </span>
        </span>

        <span className="font-mono text-slate-500">
          كود: {assignedAttendanceCode}
        </span>
      </div>

      {/* MANDATORY EARLY DEPARTURE REASON MODAL (< 8 Hours) */}
      {isEarlyDepartureModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[#0c101a] border-2 border-amber-500/60 rounded-3xl p-6 shadow-2xl relative text-slate-100 text-right rtl:text-right ltr:text-left space-y-4">
            <button
              onClick={() => setIsEarlyDepartureModalOpen(false)}
              className="absolute top-4 left-4 rtl:left-4 rtl:right-auto ltr:right-4 ltr:left-auto p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/60"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">
                  {isAr ? '⚠️ تسجيل انصراف مبكر (أقل من ساعات العمل المقررة)' : 'Early Departure Alert (< 8h)'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isAr ? `لقد قمت بالعمل لمدة (${elapsed.formatted}) فقط حتى الآن من إجمالي 8 ساعات المقررة.` : 'You have not completed standard 8 working hours.'}
                </p>
              </div>
            </div>

            <div className="bg-amber-950/30 border border-amber-500/30 rounded-2xl p-3.5 text-xs text-amber-200">
              <strong>{isAr ? 'تنبيه إداري إلزامي:' : 'Notice:'}</strong>
              <p className="mt-1 text-slate-300">
                {isAr ? 'بناءً على تعليمات الإدارة العامة، يتطلب تسجيل الانصراف المبكر كتابة سبب الانصراف وسيتم إرسال إشعار فوري مباشر للمدير العام بالسبب وعدد الساعات الفعلية.' : 'Please write your reason for early departure to alert the General Manager.'}
              </p>
            </div>

            <form onSubmit={handleConfirmEarlyDeparture} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-200 font-bold mb-1.5">
                  {isAr ? 'سبب الانصراف المبكر (إجباري):' : 'Reason for early departure (Mandatory):'}
                </label>
                <textarea
                  required
                  rows={3}
                  value={earlyDepartureReason}
                  onChange={(e) => {
                    setEarlyDepartureReason(e.target.value);
                    if (earlyDepartureError) setEarlyDepartureError('');
                  }}
                  placeholder={isAr ? 'اكتب سبب الانصراف المبكر هنا (مثلاً: ظرف طارئ، إذن مسبق من الإدارة، استكمال المهام من المنزل)...' : 'State reason here...'}
                  className="w-full bg-[#050810] border border-slate-700 rounded-2xl p-3 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                />
                {earlyDepartureError && (
                  <span className="text-rose-400 text-xs font-bold mt-1 block">{earlyDepartureError}</span>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEarlyDepartureModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-colors cursor-pointer"
                >
                  {isAr ? 'إلغاء والعودة للعمل' : 'Cancel'}
                </button>

                <button
                  type="submit"
                  disabled={isProcessing || !earlyDepartureReason.trim()}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-slate-950 font-black shadow-lg shadow-amber-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isAr ? 'تأكيد الانصراف وإشعار المدير العام' : 'Confirm & Alert Manager'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
