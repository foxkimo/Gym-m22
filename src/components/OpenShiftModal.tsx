import React, { useState, useMemo } from 'react';
import { CurrentUser, CashShift } from '../types/gym';
import { StorageService } from '../services/storageService';
import { audioAlertService } from '../services/audioService';
import { 
  Clock, 
  DollarSign, 
  X, 
  CheckCircle2, 
  ShieldCheck, 
  AlertCircle, 
  Sparkles, 
  UserCheck, 
  Crown, 
  Briefcase,
  Lock,
  Sun,
  Moon,
  Wallet
} from 'lucide-react';

interface OpenShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: CurrentUser;
  lang: 'ar' | 'en';
  onShiftOpened?: (shift: CashShift) => void;
  isMandatory?: boolean;
}

export const OpenShiftModal: React.FC<OpenShiftModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  lang,
  onShiftOpened,
  isMandatory = false
}) => {
  const isAr = lang === 'ar';

  // Get all available staff and manager accounts
  const availableEmployees = useMemo(() => {
    const staff = StorageService.getStaffAccounts();
    const managers = StorageService.getManagerAccounts();

    const list: Array<{
      id: string;
      nameAr: string;
      nameEn: string;
      role: 'staff' | 'manager';
      roleTitleAr: string;
      roleTitleEn: string;
      phone: string;
      avatarUrl?: string;
    }> = [
      ...staff.map(s => ({
        id: s.id,
        nameAr: s.nameAr,
        nameEn: s.nameEn || s.nameAr,
        role: 'staff' as const,
        roleTitleAr: 'موظف استقبال وتنفيذ',
        roleTitleEn: 'Receptionist',
        phone: s.phone,
        avatarUrl: s.avatarUrl
      })),
      ...managers.map(m => ({
        id: m.id,
        nameAr: m.nameAr,
        nameEn: m.nameEn || m.nameAr,
        role: 'manager' as const,
        roleTitleAr: 'المدير العام',
        roleTitleEn: 'General Manager',
        phone: m.phone,
        avatarUrl: m.avatarUrl
      }))
    ];

    if (!list.some(e => e.id === currentUser.id)) {
      list.unshift({
        id: currentUser.id,
        nameAr: currentUser.nameAr,
        nameEn: currentUser.nameEn || currentUser.nameAr,
        role: currentUser.role === 'manager' ? 'manager' : 'staff',
        roleTitleAr: currentUser.role === 'manager' ? 'المدير العام' : 'موظف استقبال وتنفيذ',
        roleTitleEn: currentUser.role === 'manager' ? 'General Manager' : 'Receptionist',
        phone: '',
        avatarUrl: currentUser.avatarUrl
      });
    }

    return list;
  }, [currentUser]);

  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(() => {
    const found = availableEmployees.find(e => e.id === currentUser.id);
    return found ? found.id : availableEmployees[0]?.id || currentUser.id;
  });

  const [startingCash, setStartingCash] = useState<number | string>('0');
  const [notes, setNotes] = useState('');
  const [shiftPeriod, setShiftPeriod] = useState<'morning' | 'evening'>(() => {
    const hour = new Date().getHours();
    return hour < 15 ? 'morning' : 'evening';
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedOpener = availableEmployees.find(e => e.id === selectedEmployeeId) || {
    id: currentUser.id,
    nameAr: currentUser.nameAr,
    nameEn: currentUser.nameEn || currentUser.nameAr,
    role: currentUser.role === 'manager' ? 'manager' : 'staff',
    roleTitleAr: currentUser.role === 'manager' ? 'المدير العام' : 'موظف استقبال وتنفيذ',
    roleTitleEn: currentUser.role === 'manager' ? 'General Manager' : 'Receptionist',
    phone: '',
    avatarUrl: currentUser.avatarUrl
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cashNum = Number(startingCash) || 0;
    if (cashNum < 0) {
      alert(isAr ? 'يرجى إدخال رصيد افتتاحي صحيح' : 'Please enter a valid starting cash amount');
      return;
    }

    setIsSubmitting(true);
    try {
      const activeShift = StorageService.getActiveShift();
      if (activeShift) {
        alert(isAr ? `توجد بالفعل وردية نشطة مفتوحة باسم: ${activeShift.staffName}. يرجى إغلاقها أولاً.` : 'A shift is already open. Close it first.');
        onClose();
        return;
      }

      const periodLabelAr = shiftPeriod === 'morning' ? 'صباحية' : 'مسائية';
      const openedShift = StorageService.openShift(
        selectedOpener.id,
        selectedOpener.nameAr,
        cashNum
      );

      const noteParts: string[] = [`وردية ${periodLabelAr}`];
      noteParts.push(`فتح بواسطة: ${selectedOpener.roleTitleAr} (${selectedOpener.nameAr})`);
      if (notes.trim()) {
        noteParts.push(notes.trim());
      }
      openedShift.notes = noteParts.join(' - ');
      StorageService.saveShift(openedShift);

      audioAlertService.playSuccess();
      if (onShiftOpened) {
        onShiftOpened(openedShift);
      }
      onClose();
    } catch (err) {
      console.error('Error opening shift:', err);
      alert(isAr ? 'حدث خطأ أثناء فتح الوردية' : 'Error opening shift');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStaffForced = isMandatory || (currentUser.role === 'staff' && !StorageService.getActiveShift());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-[#0b101d] border-2 border-amber-500/50 rounded-3xl w-full max-w-lg max-h-[calc(100dvh-2rem)] sm:max-h-[92vh] overflow-hidden shadow-2xl flex flex-col my-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600/30 via-[#121a2c] to-[#070a12] p-5 border-b border-amber-500/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/20 shrink-0">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 font-bold uppercase">
                  {isAr ? 'منظومة الورديات والخزينة المركزية' : 'Cash Shifts Center'}
                </span>
                {isStaffForced && (
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold">
                    {isAr ? 'إلزامي للتشغيل' : 'Mandatory'}
                  </span>
                )}
              </div>
              <h3 className="text-base sm:text-lg font-black text-white mt-0.5">
                {isAr ? 'فتح وردية ومناوبة جديدة' : 'Open Work Shift'}
              </h3>
            </div>
          </div>

          {!isStaffForced ? (
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('gym_navigate_to', { detail: 'login' }));
                }}
                className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-amber-400 text-[11px] font-bold border border-slate-800 transition-colors cursor-pointer flex items-center gap-1"
                title={isAr ? 'تبديل الحساب أو تسجيل الخروج' : 'Switch Account'}
              >
                <span>{isAr ? 'تبديل الحساب' : 'Switch'}</span>
              </button>
              <div className="px-3 py-1.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 font-black text-[11px] flex items-center gap-1.5 animate-pulse shadow-sm">
                <Lock className="w-3.5 h-3.5 text-rose-400" />
                <span>{isAr ? 'فتح المناوبة إجباري' : 'Mandatory Shift'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-4 text-xs overscroll-contain pb-6">
            
            {/* Mandatory Alert Notice */}
            {isStaffForced && (
              <div className="bg-gradient-to-r from-rose-950/80 via-slate-900 to-rose-950/60 border-2 border-rose-500/60 p-4 rounded-2xl flex items-start gap-3 shadow-lg">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <strong className="text-sm font-black text-white block">
                    {isAr ? '⚠️ تنبيه إداري إلزامي: فتح المناوبة إجباري لموظف الاستقبال' : 'Mandatory Staff Shift Opening'}
                  </strong>
                  <p className="text-[11px] text-rose-200/90 leading-relaxed font-bold">
                    {isAr 
                      ? 'بناءً على تعليمات الإدارة المالية الصارمة، لا يمكنك تسجيل أي مشترك جديد، أو تجديد اشتراك، أو بيع مكملات، أو تسجيل أي سند مالي إلا بعد فتح الوردية وتحديد العهدة النقدية في الدرج.' 
                      : 'You cannot perform any financial transactions, renewals, or member registrations without opening an active shift.'}
                  </p>
                </div>
              </div>
            )}
            
            {/* Operator Card */}
            <div className="bg-gradient-to-r from-[#0d1424] to-[#080d18] p-4 rounded-2xl border border-slate-800 flex items-center justify-between gap-3 shadow-inner">
              <div className="flex items-center gap-3">
                <img
                  src={selectedOpener.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt={selectedOpener.nameAr}
                  className="w-11 h-11 rounded-xl object-cover border-2 border-amber-500/50 shadow"
                />
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">{isAr ? 'مسؤول فتح المناوبة:' : 'Shift Operator:'}</span>
                  <strong className="text-sm font-black text-white block mt-0.5">{selectedOpener.nameAr}</strong>
                  <span className="text-[10px] text-amber-400/90 font-semibold">{selectedOpener.roleTitleAr}</span>
                </div>
              </div>

              <div className="text-left rtl:text-left">
                <span className="px-2.5 py-1 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold font-mono block">
                  {new Date().toLocaleTimeString(isAr ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                </span>
                <span className="text-[9px] text-slate-500 block mt-1 font-mono">
                  {new Date().toLocaleDateString(isAr ? 'ar-EG' : 'en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                </span>
              </div>
            </div>

            {/* Opener Employee Selector */}
            <div className="bg-[#070a12] p-3.5 rounded-2xl border border-slate-800 space-y-2">
              <label className="block text-xs font-black text-[#f7cb55] flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-amber-400" />
                  <span>{isAr ? 'تغيير الموظف المسؤول عن الوردية:' : 'Select Staff Member:'}</span>
                </span>
              </label>

              <select
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                className="w-full bg-[#0d1322] border-2 border-amber-500/40 focus:border-amber-400 rounded-xl p-2.5 text-xs text-white font-bold focus:outline-none cursor-pointer"
              >
                <optgroup label={isAr ? '🏢 موظفو الاستقبال والخزينة' : 'Reception Staff'}>
                  {availableEmployees
                    .filter(e => e.role === 'staff')
                    .map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.nameAr} ({emp.roleTitleAr}) {emp.phone ? `- ${emp.phone}` : ''}
                      </option>
                    ))}
                </optgroup>
                <optgroup label={isAr ? '👑 الإدارة والمدير العام' : 'Management'}>
                  {availableEmployees
                    .filter(e => e.role === 'manager')
                    .map(emp => (
                      <option key={emp.id} value={emp.id}>
                        👑 {emp.nameAr} ({emp.roleTitleAr})
                      </option>
                    ))}
                </optgroup>
              </select>
            </div>

            {/* Shift Period Choice */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                {isAr ? 'اختر فترة الوردية:' : 'Shift Period:'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setShiftPeriod('morning')}
                  className={`py-3 px-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    shiftPeriod === 'morning'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-lg shadow-amber-500/10'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span>{isAr ? 'وردية صباحية (صباحاً)' : 'Morning Shift'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShiftPeriod('evening')}
                  className={`py-3 px-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    shiftPeriod === 'evening'
                      ? 'bg-purple-500/20 border-purple-500 text-purple-300 shadow-lg shadow-purple-500/10'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Moon className="w-4 h-4 text-purple-400" />
                  <span>{isAr ? 'وردية مسائية (مساءً)' : 'Evening Shift'}</span>
                </button>
              </div>
            </div>

            {/* Starting Cash Float with Quick Presets */}
            <div className="bg-[#070a12] p-4 rounded-2xl border border-slate-800 space-y-2.5">
              <label className="block text-xs font-bold text-slate-200 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Wallet className="w-4 h-4 text-emerald-400" />
                  <span>{isAr ? 'الرصيد الافتتاحي بالدرج (العهدة كاش):' : 'Starting Drawer Float:'}</span>
                </span>
                <span className="text-[10px] text-emerald-400 font-mono font-bold">جنية مصري (EGP)</span>
              </label>

              <div className="relative">
                <input
                  type="number"
                  required
                  min="0"
                  value={startingCash}
                  onChange={(e) => setStartingCash(e.target.value)}
                  placeholder="0"
                  className="w-full bg-slate-950 border-2 border-emerald-500/40 rounded-xl px-4 py-3 text-lg font-mono font-black text-emerald-400 focus:outline-none focus:border-emerald-400 shadow-inner"
                />
                <span className="absolute left-3.5 top-3.5 text-xs font-bold text-slate-500">ج.م</span>
              </div>

              {/* Quick Float Presets */}
              <div className="flex items-center gap-1.5 pt-1">
                <span className="text-[10px] text-slate-500 font-bold">{isAr ? 'مبالغ سريعة:' : 'Presets:'}</span>
                {[0, 100, 200, 500].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setStartingCash(val)}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-emerald-500 hover:text-slate-950 text-slate-300 text-[10px] font-mono font-bold border border-slate-800 transition-all cursor-pointer"
                  >
                    {val} ج
                  </button>
                ))}
              </div>
            </div>

            {/* Security Guard Box */}
            <div className="bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-2xl text-xs text-amber-200/90 leading-relaxed flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-amber-300 font-bold mb-0.5">
                  {isAr ? '🔒 صلاحية تفعيل المبيعات والخدمات' : 'Security Clearance'}
                </strong>
                {isAr
                  ? 'بمجرد الضغط على فتح الوردية، سيتفعل النظام فوراً لتسجيل الاشتراكات، تجديد العضويات، بيع المكملات من البار، وإصدار الفواتير وسندات القبض والصرف باسمك.'
                  : 'Opening a shift immediately enables POS sales, renewals, and vouchers.'}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">
                {isAr ? 'ملاحظات تسليم الوردية (اختياري):' : 'Notes (Optional):'}
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={isAr ? 'مثال: استلام العهدة بحالة جيدة ورصيد مطابق...' : 'Shift opening notes...'}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Actions Footer */}
          <div className="p-4 bg-[#070a12] border-t-2 border-slate-800 shrink-0 flex items-center gap-2.5 z-30 shadow-2xl">
            {!isStaffForced ? (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white font-bold text-xs cursor-pointer transition-colors shrink-0"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('gym_navigate_to', { detail: 'login' }));
                }}
                className="px-4 py-3 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 hover:text-rose-100 font-bold text-xs cursor-pointer border border-rose-500/30 transition-colors shrink-0 flex items-center gap-1.5"
              >
                <span>{isAr ? '🚪 تسجيل خروج' : 'Logout'}</span>
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-600 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-emerald-500/25 hover:brightness-110 cursor-pointer transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 shrink-0"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 text-slate-950" />
              <span className="whitespace-nowrap font-black">
                {isAr ? '🟢 تأكيد وبدء الوردية رسمياً (إجباري للمتابعة)' : 'Confirm & Open Shift Now'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
