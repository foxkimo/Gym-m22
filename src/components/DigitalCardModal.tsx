import React, { useState } from 'react';
import { GymMember } from '../types/gym';
import { StorageService } from '../services/storageService';
import { audioAlertService } from '../services/audioService';
import { 
  X, 
  QrCode, 
  CheckCircle2, 
  Calendar, 
  Phone, 
  Sparkles, 
  CreditCard,
  User,
  Crown
} from 'lucide-react';

interface DigitalCardModalProps {
  member: GymMember;
  isOpen: boolean;
  onClose: () => void;
  lang: 'ar' | 'en';
  onAttendanceLogged?: () => void;
}

export const DigitalCardModal: React.FC<DigitalCardModalProps> = ({
  member,
  isOpen,
  onClose,
  lang,
  onAttendanceLogged
}) => {
  const isAr = lang === 'ar';
  const [justCheckedIn, setJustCheckedIn] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen || !member) return null;

  const eligibility = StorageService.checkMemberCheckInEligibility(member);

  const handleSimulateQRScan = () => {
    const result = StorageService.recordMemberCheckIn(
      member,
      'reception_qr',
      'بوابة الدخول الذاتي - قارئ الباركود QR',
      'member'
    );

    if (!result.success) {
      audioAlertService.playDelete();
      setStatusMessage({
        type: 'error',
        text: isAr ? (result.errorAr || 'غير مسموح بالدخول أكثر من مرة كل 12 ساعة') : (result.errorEn || '12-hour cooldown active')
      });
      setTimeout(() => setStatusMessage(null), 4500);
      return;
    }

    audioAlertService.playSuccess();
    setJustCheckedIn(true);
    setStatusMessage({
      type: 'success',
      text: isAr ? `✓ ${result.messageAr}` : `✓ ${result.messageEn}`
    });
    setTimeout(() => {
      setJustCheckedIn(false);
      setStatusMessage(null);
      if (onAttendanceLogged) onAttendanceLogged();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-[320px] rounded-3xl bg-gradient-to-b from-[#131926] via-[#0b101c] to-[#06080e] border-2 border-[#f7cb55]/60 p-4 sm:p-5 text-slate-100 shadow-2xl relative overflow-hidden"
        dir={isAr ? 'rtl' : 'ltr'}
      >
        <button
          onClick={onClose}
          className="absolute top-3 left-3 rtl:left-3 rtl:right-auto ltr:right-3 ltr:left-auto p-1.5 text-slate-400 hover:text-white rounded-xl bg-slate-800/60 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Card Header */}
        <div className="flex items-center justify-between mb-2.5 pr-2 rtl:pr-0 rtl:pl-8 ltr:pr-8">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#f7cb55] text-slate-950 font-black flex items-center justify-center text-[11px] shadow">
              M22
            </div>
            <span className="font-black text-xs text-white tracking-wider">GYM-M22 CLUB</span>
          </div>
          <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/20 text-[#f7cb55] border border-amber-500/40 font-bold uppercase">
            {member.tier}
          </span>
        </div>

        {/* Member Profile */}
        <div className="flex items-center gap-2.5 my-2.5 p-2.5 bg-slate-950/70 rounded-xl border border-slate-800">
          <img
            src={member.avatarUrl || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'}
            alt={member.fullNameAr}
            className="w-11 h-11 rounded-xl object-cover border border-amber-500/60 shadow"
          />
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-black text-white truncate">{member.fullNameAr}</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[11px] text-amber-400 font-mono font-bold">
                #{member.membershipNumber}
              </span>
              <span className="text-[10px] text-slate-400">
                • {member.endDate}
              </span>
            </div>
          </div>
        </div>

        {/* Simulated High-Res QR Code Box */}
        <div 
          onClick={handleSimulateQRScan}
          className="cursor-pointer my-2.5 p-3 bg-white rounded-2xl text-slate-950 flex flex-col items-center justify-center shadow-lg hover:scale-102 active:scale-98 transition-all group"
        >
          {/* Custom Stylized QR Matrix */}
          <div className="w-28 h-28 sm:w-32 sm:h-32 bg-white flex flex-col justify-between p-1.5 relative">
            <div className="flex justify-between">
              <div className="w-7 h-7 border-[3px] border-slate-950 rounded-md p-0.5">
                <div className="w-full h-full bg-slate-950 rounded-xs"></div>
              </div>
              <div className="w-7 h-7 border-[3px] border-slate-950 rounded-md p-0.5">
                <div className="w-full h-full bg-slate-950 rounded-xs"></div>
              </div>
            </div>

            {/* Center Gym Logo In QR */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-7 h-7 rounded-lg bg-slate-950 text-[#f7cb55] font-black text-[10px] flex items-center justify-center border border-white shadow-md">
                M22
              </div>
            </div>

            <div className="flex justify-between items-end">
              <div className="w-7 h-7 border-[3px] border-slate-950 rounded-md p-0.5">
                <div className="w-full h-full bg-slate-950 rounded-xs"></div>
              </div>
              <div className="w-4 h-4 bg-slate-950 rounded-xs"></div>
            </div>
          </div>

          <span className="text-[10px] font-bold text-slate-700 mt-1.5 flex items-center gap-1 group-hover:text-amber-600 transition-colors">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>{isAr ? 'اضغط لتسجيل الحضور الفوري' : 'Tap to scan pass'}</span>
          </span>
        </div>

        {!eligibility.allowed && (
          <div className="my-2 p-2 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-[10px] text-center font-bold">
            <span>⏱️ {isAr ? `آخر حضور: ${eligibility.lastCheckInTime} • متبقي [${eligibility.remainingHours}س ${eligibility.remainingMinutes}د]` : `Cooldown active • ${eligibility.remainingHours}h ${eligibility.remainingMinutes}m remaining`}</span>
          </div>
        )}

        {statusMessage && (
          <div className={`p-2.5 rounded-xl border text-[11px] font-bold text-center animate-in fade-in my-1.5 leading-tight ${
            statusMessage.type === 'error'
              ? 'bg-rose-950/80 border-rose-500/60 text-rose-200'
              : 'bg-emerald-950/80 border-emerald-500/60 text-emerald-200'
          }`}>
            {statusMessage.text}
          </div>
        )}

        <div className="mt-2.5 pt-2 border-t border-slate-800 text-center">
          <button
            onClick={onClose}
            className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer transition-colors"
          >
            {isAr ? 'إغلاق البطاقة' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
