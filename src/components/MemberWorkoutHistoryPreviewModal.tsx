import React, { useState } from 'react';
import { GymMember, CurrentUser, WorkoutProgram } from '../types/gym';
import { audioAlertService } from '../services/audioService';
import { pdfPrintService } from '../services/pdfPrintService';
import { ExerciseVideoModal } from './ExerciseVideoModal';
import { 
  X, 
  Printer, 
  Download, 
  Dumbbell, 
  Calendar, 
  Phone, 
  User, 
  Trophy, 
  Clock, 
  CheckCircle2, 
  Activity, 
  Play, 
  Flame, 
  Sparkles, 
  Layers, 
  ShieldCheck, 
  FileText,
  Eye,
  Info
} from 'lucide-react';

interface MemberWorkoutHistoryPreviewModalProps {
  member: GymMember;
  currentUser: CurrentUser;
  lang: 'ar' | 'en';
  onClose: () => void;
  onEditProgram?: (member: GymMember) => void;
}

export const MemberWorkoutHistoryPreviewModal: React.FC<MemberWorkoutHistoryPreviewModalProps> = ({
  member,
  currentUser,
  lang,
  onClose,
  onEditProgram
}) => {
  const isAr = lang === 'ar';
  const [activeDayTab, setActiveDayTab] = useState<number>(0);
  const [previewVideoExercise, setPreviewVideoExercise] = useState<any | null>(null);

  const program: WorkoutProgram = member.currentProgram || {
    id: `prog-${member.id}`,
    titleAr: 'الجدول التدريبي المخصص',
    titleEn: 'Custom Routine',
    coachName: currentUser.nameAr,
    createdAt: new Date().toISOString().split('T')[0],
    days: []
  };

  const days = program.days || [];
  const currentDay = days[activeDayTab] || days[0];

  const totalExercises = days.reduce((sum, d) => sum + (d.exercises ? d.exercises.length : 0), 0);

  // Print PDF handler
  const handlePrint = () => {
    audioAlertService.playSuccess();
    pdfPrintService.printMemberActivityAndWorkoutReportPDF(member, currentUser.nameAr);
  };

  const tierLabelsAr: Record<string, string> = {
    standard: 'العضوية القياسية',
    vip: 'العضوية المميزة VIP',
    gold: 'العضوية الذهبية',
    diamond: 'العضوية الماسية'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-4xl max-h-[92vh] rounded-3xl bg-[#0a0e1a] border-2 border-sky-500/40 shadow-2xl flex flex-col text-right rtl:text-right ltr:text-left overflow-hidden">
        
        {/* TOP HEADER */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#0d1424] via-[#09101f] to-[#0d1424] border-b border-slate-800 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/40 flex items-center justify-center font-bold shadow-lg shrink-0">
              <Eye className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">
                  {isAr ? 'معاينة ومتابعة سجل تمارين المتدرب' : 'Trainee Workout & Exercise Log Preview'}
                </h3>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30">
                  {isAr ? 'عرض قبل الطباعة والتنزيل' : 'Preview Mode'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {isAr 
                  ? `متابعة الخطة التدريبية، الأيام، التمارين، والأوزان المستهدفة للمتدرب: ${member.fullNameAr}` 
                  : `Routine review for: ${member.fullNameEn || member.fullNameAr}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg shadow-sky-500/20 transition-all cursor-pointer"
              title={isAr ? 'طباعة أو تنزيل تقرير التمارين والحضور بصيغة PDF' : 'Print / Download PDF'}
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">{isAr ? 'طباعة / تنزيل PDF' : 'Print PDF'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/80 hover:bg-slate-700 transition-colors cursor-pointer"
              title={isAr ? 'إغلاق' : 'Close'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* MEMBER PROFILE BAR */}
        <div className="p-4 bg-[#070a14] border-b border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0 text-xs">
          <div className="bg-[#0e1424] p-3 rounded-2xl border border-slate-800 flex items-center gap-3">
            <img
              src={member.avatarUrl || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'}
              alt={member.fullNameAr}
              className="w-10 h-10 rounded-xl object-cover border border-sky-400/40 shrink-0"
            />
            <div className="overflow-hidden">
              <span className="text-[10px] text-slate-400 block">{isAr ? 'المتدرب' : 'Trainee'}</span>
              <strong className="text-white block font-bold truncate">{member.fullNameAr}</strong>
              <span className="text-[10px] text-sky-400 font-mono">#{member.membershipNumber}</span>
            </div>
          </div>

          <div className="bg-[#0e1424] p-3 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block">{isAr ? 'باقة الاشتراك' : 'Tier'}</span>
            <strong className="text-amber-400 block font-bold mt-0.5">
              {tierLabelsAr[member.tier] || member.tier}
            </strong>
            <span className="text-[10px] text-emerald-400 font-medium block mt-0.5">
              {isAr ? `متبقي ${member.remainingDays} يوم` : `${member.remainingDays} days left`}
            </span>
          </div>

          <div className="bg-[#0e1424] p-3 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block">{isAr ? 'حضور التمارين' : 'Attendance'}</span>
            <strong className="text-emerald-400 block font-mono font-bold text-sm mt-0.5">
              {member.attendanceCount} {isAr ? 'حصة تدريبية' : 'sessions'}
            </strong>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              {isAr ? `آخر حضور: ${member.lastAttendanceDate || 'اليوم'}` : 'Active'}
            </span>
          </div>

          <div className="bg-[#0e1424] p-3 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block">{isAr ? 'الخطة التدريبية' : 'Program'}</span>
            <strong className="text-sky-300 block font-bold truncate mt-0.5">
              {program.titleAr}
            </strong>
            <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
              {days.length} {isAr ? 'أيام تدريبية' : 'days'} • {totalExercises} {isAr ? 'تمرين' : 'ex'}
            </span>
          </div>
        </div>

        {/* DAYS TAB SELECTOR */}
        {days.length > 0 && (
          <div className="px-4 pt-3 pb-2 bg-[#0a0e1a] border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto scrollbar-thin shrink-0">
            <span className="text-xs text-slate-400 font-bold ml-1 rtl:ml-2 ltr:mr-2 shrink-0 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-sky-400" />
              <span>{isAr ? 'الأيام التدريبية:' : 'Workout Days:'}</span>
            </span>
            {days.map((day, idx) => (
              <button
                key={day.id || idx}
                onClick={() => {
                  audioAlertService.playBeep(700, 0.04);
                  setActiveDayTab(idx);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 cursor-pointer border ${
                  activeDayTab === idx
                    ? 'bg-sky-500 text-slate-950 font-black border-sky-400 shadow-md shadow-sky-500/20'
                    : 'bg-[#0e1424] text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                }`}
              >
                <span>{day.titleAr || (isAr ? `اليوم ${day.dayNumber || idx + 1}` : `Day ${day.dayNumber || idx + 1}`)}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-black ${
                  activeDayTab === idx ? 'bg-slate-950/40 text-slate-950' : 'bg-slate-800 text-slate-300'
                }`}>
                  {day.exercises ? day.exercises.length : 0}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* EXERCISES CONTENT AREA */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 scrollbar-thin">
          {!currentDay || !currentDay.exercises || currentDay.exercises.length === 0 ? (
            <div className="p-12 text-center bg-[#070a14] rounded-3xl border border-slate-800 space-y-3">
              <Dumbbell className="w-12 h-12 text-slate-600 mx-auto" />
              <h4 className="text-base font-bold text-white">
                {isAr ? 'لا توجد تمارين مضافة في هذا اليوم التدريبي بعد' : 'No exercises in this day yet'}
              </h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                {isAr 
                  ? 'يمكنك الضغط على زر تخصيص الجدول لإضافة التمارين وربط فيديوهات الأجهزة والشرح للكابتن.' 
                  : 'Customize this program to add exercises and videos.'}
              </p>
              {onEditProgram && (
                <button
                  onClick={() => {
                    onClose();
                    onEditProgram(member);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs transition-all shadow-lg cursor-pointer inline-flex items-center gap-2"
                >
                  <Dumbbell className="w-4 h-4" />
                  <span>{isAr ? 'تخصيص وتعديل جدول التمارين الآن' : 'Customize Routine Now'}</span>
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-black text-white flex items-center gap-2">
                    <Flame className="w-4 h-4 text-orange-400" />
                    <span>{currentDay.titleAr}</span>
                  </h4>
                  {currentDay.focusMuscles && currentDay.focusMuscles.length > 0 && (
                    <div className="flex items-center gap-1">
                      {currentDay.focusMuscles.map((m, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-300 font-bold border border-sky-500/20">
                          {m}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <span className="text-xs text-slate-400 font-bold">
                  {currentDay.exercises.length} {isAr ? 'تمارين معتمدة' : 'exercises'}
                </span>
              </div>

              {/* Exercises List Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {currentDay.exercises.map((ex, exIdx) => (
                  <div
                    key={ex.id || exIdx}
                    className="bg-[#0d1222] p-4 rounded-2xl border border-slate-800 hover:border-sky-500/40 transition-all space-y-3 relative group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5">
                        <div className="w-7 h-7 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/30 flex items-center justify-center font-mono font-black text-xs shrink-0 mt-0.5">
                          {exIdx + 1}
                        </div>
                        <div>
                          <strong className="text-sm font-black text-white block">
                            {ex.nameAr}
                          </strong>
                          {ex.nameEn && (
                            <span className="text-[10px] text-slate-400 font-medium block">
                              {ex.nameEn}
                            </span>
                          )}
                          <span className="text-[10px] px-2 py-0.5 rounded bg-orange-500/10 text-orange-300 font-bold border border-orange-500/20 inline-block mt-1">
                            {ex.targetMuscle || 'عضلات عامة'}
                          </span>
                        </div>
                      </div>

                      {ex.videoUrl && (
                        <button
                          type="button"
                          onClick={() => setPreviewVideoExercise(ex)}
                          className="px-2.5 py-1 rounded-xl bg-sky-500/20 hover:bg-sky-500 hover:text-slate-950 text-sky-300 font-bold text-[10px] border border-sky-500/30 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                          title={isAr ? 'مشاهدة فيديو التمرين التوضيحي' : 'Watch Video'}
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>{isAr ? 'فيديو' : 'Video'}</span>
                        </button>
                      )}
                    </div>

                    {/* Stats Specs Bar */}
                    <div className="grid grid-cols-3 gap-2 bg-[#070a14] p-2.5 rounded-xl border border-slate-800 text-center text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block">{isAr ? 'المجموعات' : 'Sets'}</span>
                        <strong className="text-white font-mono font-black">{ex.sets}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">{isAr ? 'التكرارات' : 'Reps'}</span>
                        <strong className="text-white font-mono font-black">{ex.reps}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">{isAr ? 'الراحة' : 'Rest'}</span>
                        <strong className="text-amber-400 font-mono font-black">{ex.restSeconds} ث</strong>
                      </div>
                    </div>

                    {ex.targetWeightKg && ex.targetWeightKg > 0 && (
                      <div className="flex items-center justify-between text-[11px] px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 font-bold">
                        <span>{isAr ? 'الوزن المستهدف:' : 'Target Weight:'}</span>
                        <span className="font-mono font-black">{ex.targetWeightKg} كجم</span>
                      </div>
                    )}

                    {ex.coachTipsAr && (
                      <div className="text-[11px] text-sky-200 bg-sky-950/40 p-2.5 rounded-xl border border-sky-500/20 flex items-start gap-1.5">
                        <Info className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                        <span>{ex.coachTipsAr}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM ACTION BAR */}
        <div className="p-4 bg-[#070a14] border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              {isAr 
                ? 'يمكنك متابعة التمارين بالكامل على الشاشة، أو تنزيل وطباعة التقرير الشامل PDF.' 
                : 'Review on screen or print official PDF report.'}
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onEditProgram && (
              <button
                onClick={() => {
                  onClose();
                  onEditProgram(member);
                }}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 border border-slate-700"
              >
                <Dumbbell className="w-4 h-4 text-orange-400" />
                <span>{isAr ? 'تعديل الجدول' : 'Edit Routine'}</span>
              </button>
            )}

            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-slate-950 font-black text-xs transition-all shadow-lg shadow-sky-500/20 cursor-pointer flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>{isAr ? 'طباعة / تنزيل تقرير PDF' : 'Print / Download PDF'}</span>
            </button>
          </div>
        </div>

      </div>

      {/* VIDEO PREVIEW MODAL */}
      {previewVideoExercise && (
        <ExerciseVideoModal
          isOpen={!!previewVideoExercise}
          exercise={previewVideoExercise}
          lang={lang}
          onClose={() => setPreviewVideoExercise(null)}
        />
      )}
    </div>
  );
};
