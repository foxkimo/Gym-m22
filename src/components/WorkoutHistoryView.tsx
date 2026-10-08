import React from 'react';
import { GymMember } from '../types/gym';
import { History, Calendar, Trophy, Dumbbell, Flame, Sparkles } from 'lucide-react';

interface WorkoutHistoryViewProps {
  member: GymMember;
  lang: 'ar' | 'en';
}

export const WorkoutHistoryView: React.FC<WorkoutHistoryViewProps> = ({ member, lang }) => {
  const isAr = lang === 'ar';

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-gradient-to-br from-[#121624] via-[#0b101c] to-[#07090e] rounded-3xl p-6 border border-amber-500/30 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shadow-lg">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">
              {isAr ? 'سجل التمارين والإنجازات السابقة' : 'Workout History & Milestones'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isAr ? `تاريخ التدريبات والأيام المكتملة للعضو: ${member.fullNameAr}` : `Workout log for: ${member.fullNameEn}`}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-[#0c101a] rounded-3xl p-8 border border-slate-800 text-center text-slate-400 space-y-4">
        <Trophy className="w-12 h-12 text-amber-400/40 mx-auto" />
        <div>
          <h3 className="text-base font-bold text-white">{isAr ? 'إجمالي الحضور والتمرين المسجل' : 'Total Sessions Completed'}</h3>
          <div className="text-3xl font-black text-amber-400 font-mono mt-1">{member.attendanceCount} {isAr ? 'حصة تدريبية' : 'sessions'}</div>
        </div>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          {isAr ? 'استمر في التمارين اليومية لتسجيل تقدمك العضلي وأوزانك الجديدة باستمرار.' : 'Keep training consistently to level up.'}
        </p>
      </div>
    </div>
  );
};
