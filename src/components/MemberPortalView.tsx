import React from 'react';
import { GymMember } from '../types/gym';
import { QrCode, User, Calendar, CreditCard, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react';
import { audioAlertService } from '../services/audioService';

interface MemberPortalViewProps {
  member: GymMember;
  lang: 'ar' | 'en';
  onOpenCardModal: () => void;
  onOpenTimer: () => void;
  defaultSubTab?: string;
}

export const MemberPortalView: React.FC<MemberPortalViewProps> = ({
  member,
  lang,
  onOpenCardModal
}) => {
  const isAr = lang === 'ar';
  const isExpired = member.status === 'expired' || member.remainingDays <= 0;

  return (
    <div className="flex flex-col items-center justify-center py-6 sm:py-12 px-4 animate-in fade-in duration-300">
      {/* Premium Centered Athletic Pass & Subscription Card */}
      <div className="w-full max-w-lg bg-gradient-to-br from-[#121826] via-[#090d16] to-[#04060a] rounded-[32px] p-6 sm:p-8 border border-amber-500/30 shadow-2xl relative overflow-hidden text-slate-100 space-y-6">
        
        {/* Abstract Gold Background Mesh */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-36 h-36 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>

        {/* Club Logo Lockup */}
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-[#07090e] rounded-full flex items-center justify-center border-2 border-amber-500/40 shadow-lg shadow-amber-500/5 mb-2">
            <span className="text-white font-black text-lg tracking-widest font-mono">M22</span>
          </div>
          <span className="text-[10px] font-black text-amber-500/80 tracking-widest uppercase">
            {isAr ? 'نادي جيم M22 الرياضي' : 'GYM-M22 SPORTS CLUB'}
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
            {member.fullNameAr}
          </h2>
          <p className="text-xs text-slate-400 font-semibold flex items-center gap-1.5 mt-0.5">
            <User className="w-3.5 h-3.5 text-slate-500" />
            <span>{isAr ? `رقم العضوية: #${member.membershipNumber}` : `Membership #${member.membershipNumber}`}</span>
          </p>
        </div>

        {/* ================= SUBSCRIPTION & DATES DETAILS CARD (اشتراكي وحسابي) ================= */}
        <div className="bg-[#070b14] border border-amber-500/30 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-black text-white uppercase tracking-wider">
                {isAr ? 'بيانات اشتراكي وحسابي بالنادي' : 'My Subscription & Account'}
              </span>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
              !isExpired 
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
            }`}>
              {isAr ? (!isExpired ? 'اشتراك ساري النشاط' : 'اشتراك منتهي') : (!isExpired ? 'ACTIVE' : 'EXPIRED')}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center text-xs">
            <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[9px] text-slate-400 block font-bold">{isAr ? 'فئة الباقة' : 'Plan Tier'}</span>
              <strong className="text-amber-400 font-mono font-black uppercase text-sm">{member.tier}</strong>
            </div>

            <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[9px] text-slate-400 block font-bold">{isAr ? 'الأيام المتبقية' : 'Days Left'}</span>
              <strong className={`font-mono font-black text-sm ${member.remainingDays > 5 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {member.remainingDays} {isAr ? 'يوم' : 'd'}
              </strong>
            </div>

            <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[9px] text-slate-400 block font-bold">{isAr ? 'تاريخ البدء' : 'Start Date'}</span>
              <strong className="text-slate-200 font-mono text-[11px] block mt-0.5">{member.startDate}</strong>
            </div>

            <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[9px] text-slate-400 block font-bold">{isAr ? 'تاريخ الانتهاء' : 'Expiry Date'}</span>
              <strong className="text-slate-200 font-mono text-[11px] block mt-0.5">{member.endDate}</strong>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 px-1">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isAr ? `إجمالي مرات الحضور: ${member.attendanceCount || 0} مرة` : `Total check-ins: ${member.attendanceCount || 0}`}</span>
            </span>
            <span className="text-amber-400 font-bold">
              {isAr ? 'مجدد وموثق الكترونياً' : 'Verified'}
            </span>
          </div>
        </div>

        {/* THE CODE SHEET - GIANT CHECK-IN ENTRY CODE */}
        <div className="bg-[#050810]/95 border-2 border-amber-500/40 rounded-[24px] p-6 shadow-xl relative text-center">
          <span className="text-[10px] font-black text-slate-400 tracking-wider uppercase block mb-1">
            {isAr ? 'كود الدخول والتحقق الذاتي بالبوابة' : 'CHECK-IN ENTRY CODE'}
          </span>
          
          {/* Giant glowing code */}
          <div className="text-4xl sm:text-5xl font-mono font-black text-amber-400 tracking-widest py-2 animate-pulse">
            {member.membershipNumber}
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed max-w-xs mx-auto mt-3">
            {isAr 
              ? 'أظهر هذا الكود عند بوابات الدخول لتسجيل حضورك الفوري بالنادي.' 
              : 'Present this code at the club gates for instant check-in.'}
          </p>
        </div>

        {/* Action button to open full QR pass */}
        <button
          type="button"
          onClick={() => {
            audioAlertService.playBeep(659.25, 0.08);
            onOpenCardModal();
          }}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-[#e5a91b] hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-amber-500/15 transition-all hover:scale-102 active:scale-98 cursor-pointer"
        >
          <QrCode className="w-4 h-4" />
          <span>{isAr ? 'عرض بطاقة العضوية الذكية QR' : 'View Smart QR Pass'}</span>
        </button>

      </div>
    </div>
  );
};
