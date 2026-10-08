import React, { useState, useEffect } from 'react';
import { GymMember, CurrentUser } from '../types/gym';
import { StorageService } from '../services/storageService';
import { audioAlertService } from '../services/audioService';
import { 
  Calendar, 
  Clock, 
  X, 
  CheckCircle2, 
  Sparkles, 
  User, 
  CalendarCheck
} from 'lucide-react';

interface ExtendSubscriptionModalProps {
  member: GymMember | null;
  isOpen: boolean;
  onClose: () => void;
  currentUser: CurrentUser;
  lang: 'ar' | 'en';
  onSuccess?: () => void;
}

export const ExtendSubscriptionModal: React.FC<ExtendSubscriptionModalProps> = ({
  member,
  isOpen,
  onClose,
  currentUser,
  lang,
  onSuccess
}) => {
  const isAr = lang === 'ar';

  const [newStartDate, setNewStartDate] = useState<string>(() => {
    return member?.startDate || new Date().toISOString().split('T')[0];
  });
  const [newEndDate, setNewEndDate] = useState<string>(() => {
    return member?.endDate || new Date().toISOString().split('T')[0];
  });
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [reasonCategory, setReasonCategory] = useState<string>('travel');
  const [customReason, setCustomReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (member) {
      setNewStartDate(member.startDate || new Date().toISOString().split('T')[0]);
      setNewEndDate(member.endDate || new Date().toISOString().split('T')[0]);
      setSelectedPreset(null);
    }
  }, [member]);

  if (!isOpen || !member) return null;

  // Calculate new remaining days dynamically
  const calculateDaysRemaining = (endDateStr: string): number => {
    if (!endDateStr) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(endDateStr);
    end.setHours(0, 0, 0, 0);
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const newRemainingDays = calculateDaysRemaining(newEndDate);
  const oldRemainingDays = member.remainingDays || 0;
  const addedDaysDifference = newRemainingDays - oldRemainingDays;

  // Preset handlers
  const handleApplyPresetDays = (daysToAdd: number) => {
    setSelectedPreset(daysToAdd);
    const baseDate = new Date(newEndDate || member.endDate || new Date().toISOString().split('T')[0]);
    baseDate.setDate(baseDate.getDate() + daysToAdd);
    setNewEndDate(baseDate.toISOString().split('T')[0]);
  };

  const reasonLabels: Record<string, { ar: string; en: string }> = {
    travel: { ar: 'ظروف سفر / إجازة للمشترك', en: 'Travel / Vacation' },
    medical: { ar: 'إصابة أو عذر مرضي مؤقت', en: 'Medical / Injury' },
    reward: { ar: 'مكافأة / هدية تمديد من الإدارة', en: 'Management Reward / Gift' },
    compensation: { ar: 'تعويض عن أيام إغلاق أو صيانة', en: 'Maintenance Compensation' },
    courtesy: { ar: 'تعديل وتغيير تواريخ الاشتراك بموافقة المدير العام', en: 'GM Date Modification' },
    other: { ar: 'سبب آخر (مخصص)', en: 'Other' }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStartDate || !newEndDate) {
      alert(isAr ? 'يرجى اختيار تاريخ بداية ونهاية الاشتراك' : 'Please select start and end dates');
      return;
    }

    if (newEndDate <= newStartDate) {
      alert(isAr ? 'تاريخ نهاية الاشتراك يجب أن يكون بعد تاريخ البداية' : 'End date must be after start date');
      return;
    }

    setIsSubmitting(true);
    try {
      const finalReason = reasonCategory === 'other' && customReason.trim()
        ? customReason.trim()
        : reasonLabels[reasonCategory]?.[isAr ? 'ar' : 'en'] || 'تعديل تواريخ الاشتراك';

      StorageService.setMemberSubscriptionDates(
        member.id,
        newStartDate,
        newEndDate,
        finalReason,
        currentUser.nameAr || 'المدير العام'
      );

      audioAlertService.playSuccess();
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err) {
      console.error('Error updating subscription dates:', err);
      alert(isAr ? 'حدث خطأ أثناء حفظ تواريخ الاشتراك' : 'Failed to update subscription dates');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="w-full max-w-lg max-h-[calc(100dvh-2rem)] sm:max-h-[88vh] flex flex-col rounded-3xl bg-[#0c101b] border-2 border-amber-500/50 text-slate-100 shadow-2xl relative text-right rtl:text-right ltr:text-left overflow-hidden my-auto">
        {/* Header */}
        <div className="p-5 pb-3 border-b border-slate-800/80 shrink-0 bg-[#070a12] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-[#f7cb55] flex items-center justify-center font-black border border-amber-500/40 shadow-lg shadow-amber-500/20 shrink-0">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 font-bold uppercase">
                  {isAr ? 'صلاحية المدير العام' : 'General Manager Authority'}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white mt-0.5">
                {isAr ? 'تعديل تواريخ بداية ونهاية الاشتراك' : 'Modify Subscription Start & End Dates'}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/60 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Member Summary Card */}
        <div className="p-4 bg-[#090d16] border-b border-slate-800/70 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400 font-black shrink-0 overflow-hidden">
              {member.avatarUrl ? (
                <img src={member.avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <User className="w-6 h-6" />
              )}
            </div>
            <div className="min-w-0">
              <h4 className="font-black text-white text-sm truncate">{member.fullNameAr}</h4>
              <p className="text-[11px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                <span>#{member.membershipNumber}</span>
                <span>•</span>
                <span>{member.phone}</span>
              </p>
            </div>
          </div>

          <div className="text-left rtl:text-left ltr:text-right shrink-0 font-mono text-[11px]">
            <span className="text-[10px] text-slate-500 block font-bold">{isAr ? 'التواريخ الحالية:' : 'Current Dates:'}</span>
            <span className="text-slate-300 block">{member.startDate || '—'}</span>
            <span className="text-rose-300 font-black block">{member.endDate || '—'}</span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs overscroll-contain pb-6">
            
            {/* Quick Add Days Presets */}
            <div>
              <label className="block text-slate-300 font-bold mb-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>{isAr ? 'خيارات تمديد سريعة (تضاف على تاريخ النهاية الحالي):' : 'Quick Days Extension Presets:'}</span>
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {[
                  { days: 7, labelAr: '+7 أيام', labelEn: '+7 Days' },
                  { days: 14, labelAr: '+14 يوم', labelEn: '+14 Days' },
                  { days: 30, labelAr: '+30 يوم', labelEn: '+1 Month' },
                  { days: 60, labelAr: '+60 يوم', labelEn: '+2 Months' },
                  { days: 90, labelAr: '+90 يوم', labelEn: '+3 Months' }
                ].map(preset => (
                  <button
                    type="button"
                    key={preset.days}
                    onClick={() => handleApplyPresetDays(preset.days)}
                    className={`py-2 px-1 rounded-xl text-xs font-black transition-all border cursor-pointer text-center ${
                      selectedPreset === preset.days
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md scale-105'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-amber-500/50 hover:text-white'
                    }`}
                  >
                    {isAr ? preset.labelAr : preset.labelEn}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Pickers Grid (Start Date & End Date) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Start Date */}
              <div className="bg-[#070a12] p-3.5 rounded-2xl border border-slate-800 space-y-2">
                <label className="block text-slate-300 font-bold text-xs flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-purple-400" />
                  <span>{isAr ? 'تاريخ بداية الاشتراك:' : 'Start Date:'}</span>
                </label>
                <input
                  type="date"
                  required
                  value={newStartDate}
                  onChange={(e) => setNewStartDate(e.target.value)}
                  className="w-full bg-[#0d1322] border-2 border-purple-500/40 focus:border-purple-400 rounded-xl p-2.5 text-white font-mono font-black text-xs text-center focus:outline-none shadow-inner"
                />
              </div>

              {/* End Date */}
              <div className="bg-[#070a12] p-3.5 rounded-2xl border border-slate-800 space-y-2">
                <label className="block text-[#f7cb55] font-black text-xs flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <span>{isAr ? 'تاريخ نهاية الاشتراك:' : 'End Date:'}</span>
                </label>
                <input
                  type="date"
                  required
                  value={newEndDate}
                  onChange={(e) => {
                    setSelectedPreset(null);
                    setNewEndDate(e.target.value);
                  }}
                  className="w-full bg-[#0d1322] border-2 border-amber-500/40 focus:border-amber-400 rounded-xl p-2.5 text-white font-mono font-black text-xs text-center focus:outline-none shadow-inner"
                />
              </div>
            </div>

            {/* Dynamic Comparison Badge */}
            <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-amber-950/40 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between gap-2 text-xs">
              <div className="text-center flex-1">
                <span className="text-[9px] text-slate-500 block font-bold">{isAr ? 'التواريخ السابقة' : 'Old Dates'}</span>
                <span className="font-mono font-bold text-slate-300 text-[10px] block">{member.startDate} ➔ {member.endDate}</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">({oldRemainingDays} {isAr ? 'يوم' : 'd'})</span>
              </div>

              <div className="px-2 text-amber-400 font-black">
                ➔
              </div>

              <div className="text-center flex-1">
                <span className="text-[9px] text-amber-400 block font-bold">{isAr ? 'التواريخ الجديدة' : 'New Dates'}</span>
                <span className="font-mono font-black text-emerald-400 text-[10px] block">{newStartDate} ➔ {newEndDate}</span>
                <span className="text-[10px] text-emerald-400 font-bold block mt-0.5">
                  ({newRemainingDays} {isAr ? 'يوم' : 'd'}) {addedDaysDifference > 0 && <span className="text-amber-400 font-black">(+{addedDaysDifference})</span>}
                </span>
              </div>
            </div>

            {/* Reason Selector */}
            <div>
              <label className="block text-slate-300 font-bold mb-1.5">
                {isAr ? 'سبب التعديل المعتمد:' : 'Modification Reason:'}
              </label>
              <select
                value={reasonCategory}
                onChange={(e) => setReasonCategory(e.target.value)}
                className="w-full bg-[#080b12] border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-bold cursor-pointer"
              >
                {Object.entries(reasonLabels).map(([key, item]) => (
                  <option key={key} value={key}>
                    {isAr ? item.ar : item.en}
                  </option>
                ))}
              </select>
            </div>

            {reasonCategory === 'other' && (
              <div>
                <label className="block text-slate-400 font-bold mb-1 text-[11px]">
                  {isAr ? 'اكتب تفاصيل السبب المخصص:' : 'Custom reason details:'}
                </label>
                <input
                  type="text"
                  required
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder={isAr ? 'مثال: تعديل استثنائي لتصحيح خطأ إدخال...' : 'e.g. Correction of entry error...'}
                  className="w-full bg-[#080b12] border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            )}

            <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-2xl flex items-start gap-2 text-[11px] text-amber-300/90 leading-relaxed">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                {isAr
                  ? 'بمجرد التأكيد، سيتم تحديث تاريخ البداية والنهاية للاشتراك، وحساب الأيام المتبقية وحالة العضو بدقة، وتوثيق التعديل في سجل الرقابة والحسابات باسم المدير العام.'
                  : 'Start and end dates will be updated immediately, remaining days recalculated, and logged under GM audit.'}
              </span>
            </div>
          </div>

          {/* Sticky Fixed Bottom Actions Footer */}
          <div className="p-3.5 sm:p-4 px-4 sm:px-6 bg-[#070a12] border-t-2 border-slate-800 shrink-0 flex items-center gap-3 z-30 shadow-[0_-12px_24px_rgba(0,0,0,0.85)]">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-[#f7cb55] to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm transition-all shadow-xl shadow-amber-500/25 cursor-pointer flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 shrink-0"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span className="whitespace-nowrap font-black">{isAr ? 'حفظ وتأكيد تواريخ الاشتراك' : 'Confirm Subscription Dates'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs sm:text-sm cursor-pointer transition-colors shrink-0"
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
