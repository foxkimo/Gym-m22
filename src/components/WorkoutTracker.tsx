import React, { useState } from 'react';
import { GymMember, WorkoutDay, Exercise, CurrentUser, WorkoutProgram } from '../types/gym';
import { StorageService } from '../services/storageService';
import { audioAlertService } from '../services/audioService';
import { ExerciseVideoModal } from './ExerciseVideoModal';
import { ExerciseVideoUploaderModal } from './ExerciseVideoUploaderModal';
import confetti from 'canvas-confetti';
import { 
  Dumbbell, 
  CheckCircle2, 
  Clock, 
  Flame, 
  ChevronDown, 
  Sparkles, 
  Play, 
  RotateCcw, 
  Timer, 
  Lightbulb, 
  Plus, 
  Trophy,
  Activity,
  Film,
  Video,
  Users,
  Edit3,
  Check,
  UserCheck
} from 'lucide-react';

interface WorkoutTrackerProps {
  member?: GymMember | null;
  allMembers?: GymMember[];
  onSelectMember?: (m: GymMember) => void;
  currentUser?: CurrentUser;
  onOpenTimer: () => void;
  lang: 'ar' | 'en';
}

const DEFAULT_SAMPLE_PROGRAM: WorkoutProgram = {
  id: 'prog-default',
  titleAr: 'برنامج التنشيف وبناء الكتل العضلية',
  titleEn: 'Hypertrophy & Shred Routine',
  coachName: 'كابتن الصالة الرياضية',
  createdAt: '2026-10-01',
  days: [
    {
      id: 'day-1',
      dayNumber: 1,
      titleAr: 'اليوم 1: تمارين عضلات الصدر والترايسبس',
      titleEn: 'Day 1: Chest & Triceps Routine',
      focusMuscles: ['عضلات الصدر', 'عضلات الترايسبس', 'البطن'],
      exercises: [
        {
          id: 'ex-1',
          nameAr: 'تمرين ضغط الصدر المستوي بالبار (Barbell Bench Press)',
          nameEn: 'Flat Barbell Bench Press',
          targetMuscle: 'الصدر الأوسط',
          targetMuscleEn: 'Mid Chest',
          equipment: 'بار أولمبي ودكة مستوية',
          sets: 4,
          reps: '10-12',
          restSeconds: 60,
          targetWeightKg: 60,
          coachTipsAr: 'التحكم بالوزن أثناء النزول لملامسة أسفل الصدر ببطء ثم الدفع للأعلى بقوة والتنفس بانتظام.',
          videoUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500'
        },
        {
          id: 'ex-2',
          nameAr: 'تفتيح الصدر بالدمبلز على دكة مائلة (Incline Dumbbell Flyes)',
          nameEn: 'Incline Dumbbell Flyes',
          targetMuscle: 'الصدر العلوي',
          targetMuscleEn: 'Upper Chest',
          equipment: 'دمبلز ودكة مائلة 30°',
          sets: 4,
          reps: '12-15',
          restSeconds: 45,
          targetWeightKg: 16,
          coachTipsAr: 'ثني خفيف بالكوعين للحفاظ على أمان الكتف، والنزول ببطء لتحقيق أقصى إطالة لعضلات الصدر.',
          videoUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500'
        },
        {
          id: 'ex-3',
          nameAr: 'ضغط الترايسبس بالحبل على الكيبل (Cable Tricep Pushdown)',
          nameEn: 'Cable Tricep Pushdown',
          targetMuscle: 'الترايسبس',
          targetMuscleEn: 'Triceps',
          equipment: 'جهاز الكيبل والحبل',
          sets: 4,
          reps: '12-15',
          restSeconds: 45,
          targetWeightKg: 25,
          coachTipsAr: 'تثبيت الكوعين بجانب الجسم تماماً، وفتح الحبل عند أسفل الحركة لعصر رؤوس الترايسبس.',
          videoUrl: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=500'
        }
      ]
    },
    {
      id: 'day-2',
      dayNumber: 2,
      titleAr: 'اليوم 2: تمارين عضلات الظهر والبايسبس',
      titleEn: 'Day 2: Back & Biceps Routine',
      focusMuscles: ['عضلات الظهر', 'عضلات البايسبس', 'القطنية'],
      exercises: [
        {
          id: 'ex-4',
          nameAr: 'سحب عالي للظهر قبضة واسعة (Wide Lat Pulldown)',
          nameEn: 'Wide Lat Pulldown',
          targetMuscle: 'الظهر العلوي',
          targetMuscleEn: 'Upper Lat',
          equipment: 'جهاز السحب العالي',
          sets: 4,
          reps: '10-12',
          restSeconds: 60,
          targetWeightKg: 50,
          coachTipsAr: 'سحب البار لأعلى الصدر مع رجوع الكتفين لأسفل وللخلف وتجنب التأرجح بالجسم.',
          videoUrl: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=500'
        }
      ]
    }
  ]
};

export const WorkoutTracker: React.FC<WorkoutTrackerProps> = ({ 
  member: initialMember, 
  allMembers,
  onSelectMember,
  currentUser,
  onOpenTimer, 
  lang 
}) => {
  const isAr = lang === 'ar';
  
  // Safe member fallback
  const membersList = allMembers || StorageService.getMembers();
  const currentMember = initialMember || membersList[0] || null;

  // Safe program fallback
  const program: WorkoutProgram = (currentMember?.currentProgram?.days && currentMember.currentProgram.days.length > 0)
    ? currentMember.currentProgram
    : DEFAULT_SAMPLE_PROGRAM;

  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const currentDay: WorkoutDay = program.days[selectedDayIndex] || program.days[0] || DEFAULT_SAMPLE_PROGRAM.days[0];

  // Selected exercise for video preview modal
  const [selectedExerciseForVideo, setSelectedExerciseForVideo] = useState<Exercise | null>(null);

  // Quick Video Uploader modal if coach is viewing
  const [videoUploadTarget, setVideoUploadTarget] = useState<Exercise | null>(null);

  // Completed sets tracker state: { [exerciseId]: { [setNumber]: boolean } }
  const [completedSets, setCompletedSets] = useState<Record<string, Record<number, boolean>>>({});
  // Weights tracker: { [exerciseId]: { [setNumber]: number } }
  const [weights, setWeights] = useState<Record<string, Record<number, number>>>({});

  const toggleSetComplete = (exerciseId: string, setIndex: number, defaultWeight = 50) => {
    setCompletedSets(prev => {
      const exSets = prev[exerciseId] || {};
      const nextState = !exSets[setIndex];
      if (nextState) {
        audioAlertService.playSetComplete();
      }
      return {
        ...prev,
        [exerciseId]: {
          ...exSets,
          [setIndex]: nextState
        }
      };
    });

    setWeights(prev => {
      const exW = prev[exerciseId] || {};
      if (!exW[setIndex]) {
        return {
          ...prev,
          [exerciseId]: {
            ...exW,
            [setIndex]: defaultWeight
          }
        };
      }
      return prev;
    });
  };

  const handleFinishWorkout = () => {
    audioAlertService.playSuccess();
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {}

    if (currentMember) {
      StorageService.logActivity({
        performerId: currentMember.id,
        performerName: currentMember.fullNameAr,
        performerRole: 'member',
        category: 'workout',
        actionType: 'checkout',
        titleAr: `إكمال حصة تدريبية: ${currentDay.titleAr}`,
        titleEn: `Completed Workout Session: ${currentDay.titleEn || currentDay.titleAr}`,
        detailsAr: `أتم العضو ${currentMember.fullNameAr} (#${currentMember.membershipNumber}) جدول تمرين اليوم بنجاح.`,
        detailsEn: `Member completed daily workout routine`,
        targetId: currentMember.id,
        targetName: currentMember.fullNameAr,
        targetType: 'member'
      });
    }

    alert(isAr ? 'عاش يا بطل: تم حفظ وإكمال تمرين اليوم بنجاح 🔥💪' : 'Workout completed: Great job champion');
  };

  const isCoachOrManager = currentUser?.role === 'coach' || currentUser?.role === 'manager';

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16">
      {/* 1. TRAINEE SELECTOR BAR (For Coaches, Managers, or Switch Member) */}
      {membersList.length > 0 && (
        <div className="bg-[#090d16] p-4 rounded-3xl border border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-[#f7cb55] border border-amber-500/40 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-bold">
                {isAr ? 'المتدرب / صاحب الجدول التدريبي:' : 'Current Athlete / Member:'}
              </span>
              <strong className="text-sm font-black text-white">
                {currentMember ? currentMember.fullNameAr : (isAr ? 'جميع المتدربين' : 'All Trainees')}
                {currentMember && <span className="text-xs font-mono text-amber-400 mr-2 rtl:mr-2 ltr:ml-2">#{currentMember.membershipNumber}</span>}
              </strong>
            </div>
          </div>

          {/* Quick Selector Dropdown */}
          {onSelectMember && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-bold shrink-0">{isAr ? 'اختر المتدرب:' : 'Select Trainee:'}</span>
              <select
                value={currentMember?.id || ''}
                onChange={(e) => {
                  const found = membersList.find(m => m.id === e.target.value);
                  if (found) {
                    onSelectMember(found);
                    audioAlertService.playSuccess();
                  }
                }}
                className="bg-[#050810] border border-slate-700 hover:border-amber-500/50 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-amber-500"
              >
                {membersList.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.fullNameAr} (#{m.membershipNumber})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* 2. DAY SELECTOR RIBBON */}
      <div className="bg-[#0c101a] rounded-3xl p-4 border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none">
          {program.days.map((day, idx) => (
            <button
              key={day.id || idx}
              onClick={() => setSelectedDayIndex(idx)}
              className={`px-4 py-3 rounded-2xl text-xs font-black transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                selectedDayIndex === idx
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/20 scale-105'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Dumbbell className="w-4 h-4" />
              <span>{day.titleAr ? day.titleAr.split(':')[0] : `اليوم ${idx + 1}`}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/30 font-mono">
                {day.exercises?.length || 0}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. DAY OVERVIEW HEADER & PROGRESS */}
      <div className="bg-gradient-to-br from-amber-950/40 via-[#0d121f] to-[#07090e] rounded-3xl p-6 border border-amber-500/40 shadow-2xl relative overflow-hidden space-y-4">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-[10px] px-3 py-1 rounded-full bg-amber-500/20 text-[#f7cb55] border border-amber-500/40 font-black uppercase tracking-wider">
                {isAr ? '🎯 برنامج التدريب المعتمد' : 'Verified Workout Program'}
              </span>
              <span className="text-xs text-slate-300 font-bold bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800">
                {isAr ? 'الكابتن المشرف:' : 'Coach:'} <strong className="text-amber-400">{program.coachName || 'كابتن الصالة'}</strong>
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">{currentDay.titleAr}</h2>
            {currentDay.titleEn && (
              <p className="text-xs text-slate-400 font-medium">{currentDay.titleEn}</p>
            )}

            <div className="flex flex-wrap items-center gap-1.5 mt-3">
              {currentDay.focusMuscles?.map(m => (
                <span key={m} className="text-[11px] px-3 py-1 rounded-xl bg-gradient-to-r from-amber-500/10 to-amber-600/5 border border-amber-500/30 text-amber-300 font-bold shadow-sm">
                  🔥 {m}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenTimer}
              className="px-4 py-3 rounded-2xl bg-slate-900 border border-amber-500/40 text-[#f7cb55] font-black text-xs flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg shadow-amber-500/10 cursor-pointer hover:scale-105"
            >
              <Timer className="w-4 h-4" />
              <span>{isAr ? '⏱️ مؤقت الراحة' : 'Rest Timer'}</span>
            </button>
          </div>
        </div>

        {/* Workout Progress Bar */}
        {(() => {
          const totalExercises = currentDay.exercises?.length || 0;
          let totalSets = 0;
          let completedSetsCount = 0;
          currentDay.exercises?.forEach(ex => {
            const setsCount = ex.sets || 4;
            totalSets += setsCount;
            const exSets = completedSets[ex.id] || {};
            for (let i = 1; i <= setsCount; i++) {
              if (exSets[i]) completedSetsCount++;
            }
          });
          const percent = totalSets > 0 ? Math.round((completedSetsCount / totalSets) * 100) : 0;

          return (
            <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 space-y-2 mt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-bold flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-amber-400" />
                  <span>{isAr ? 'نسبة إنجاز تمارين اليوم:' : 'Today\'s Progress:'}</span>
                </span>
                <span className="font-mono font-black text-amber-400 text-sm">
                  {completedSetsCount} / {totalSets} {isAr ? 'مجموعات مكتملة' : 'sets'} ({percent}%)
                </span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-800">
                <div 
                  className="bg-gradient-to-r from-amber-500 to-emerald-500 h-2.5 rounded-full transition-all duration-500 shadow-lg"
                  style={{ width: `${percent}%` }}
                ></div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* 4. EXERCISES LIST */}
      <div className="space-y-4">
        {(!currentDay.exercises || currentDay.exercises.length === 0) ? (
          <div className="p-12 text-center bg-[#0c101a] rounded-3xl border border-slate-800">
            <Dumbbell className="w-12 h-12 text-slate-600 mx-auto mb-2" />
            <p className="text-slate-400 font-bold text-sm">
              {isAr ? 'لا توجد تمارين مسجلة لهذا اليوم التدريبي بعد.' : 'No exercises added yet for this day.'}
            </p>
          </div>
        ) : (
          currentDay.exercises.map((ex, exIdx) => {
            const exSets = completedSets[ex.id] || {};
            const exWeights = weights[ex.id] || {};
            const totalSetsCompleted = Object.values(exSets).filter(Boolean).length;
            const isAllCompleted = totalSetsCompleted === ex.sets;

            return (
              <div
                key={ex.id || exIdx}
                className={`rounded-3xl p-5 border transition-all shadow-xl space-y-4 ${
                  isAllCompleted 
                    ? 'bg-emerald-950/20 border-emerald-500/40' 
                    : 'bg-[#0c101a] border-slate-800'
                }`}
              >
                {/* Exercise Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-black text-sm shrink-0">
                      {exIdx + 1}
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-white">{ex.nameAr}</h3>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                        <span className="text-amber-400 font-semibold">{ex.targetMuscle}</span>
                        <span>•</span>
                        <span>{ex.equipment}</span>
                        {ex.targetWeightKg && (
                          <span className="text-sky-300 font-mono font-bold">• وزن مستهدف: {ex.targetWeightKg}كجم</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Video Demonstration Button */}
                    <button
                      type="button"
                      onClick={() => {
                        audioAlertService.playBeep(700, 0.05);
                        setSelectedExerciseForVideo(ex);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm group active:scale-95 cursor-pointer ${
                        ex.videoUploadedBy || ex.videoUrl
                          ? 'bg-gradient-to-r from-sky-500/30 to-blue-600/20 border border-sky-400/50 text-sky-200 hover:from-sky-500/40 hover:to-blue-600/30 shadow-sky-500/10'
                          : 'bg-gradient-to-r from-amber-500/20 to-amber-600/10 hover:from-amber-500/30 hover:to-amber-600/20 border border-amber-500/40 text-amber-300 hover:text-amber-200'
                      }`}
                      title={isAr ? 'مشاهدة فيديو التمرين والشرح العملي والتكنيك' : 'Watch Exercise Video Demonstration'}
                    >
                      <Video className={`w-3.5 h-3.5 group-hover:scale-110 transition-transform ${ex.videoUploadedBy ? 'text-sky-400' : 'text-[#f7cb55]'}`} />
                      <span>{ex.videoUploadedBy ? (isAr ? '🎬 فيديو الكابتن' : 'Coach Video') : (isAr ? '🎥 فيديو التمرين' : 'Exercise Video')}</span>
                    </button>

                    {/* If coach is viewing, allow quick edit video button */}
                    {isCoachOrManager && (
                      <button
                        type="button"
                        onClick={() => setVideoUploadTarget(ex)}
                        className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 cursor-pointer text-xs flex items-center gap-1"
                        title={isAr ? 'تخصيص/رفع فيديو جديد لهذا التمرين' : 'Upload Video'}
                      >
                        <Film className="w-3.5 h-3.5 text-sky-400" />
                        <span>{isAr ? 'رفع فيديو' : 'Upload'}</span>
                      </button>
                    )}

                    <span className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-bold font-mono">
                      {ex.sets} {isAr ? 'مجموعات' : 'Sets'} × {ex.reps}
                    </span>
                  </div>
                </div>

                {/* Coach Tips */}
                {ex.coachTipsAr && (
                  <div className="bg-amber-500/10 p-3 rounded-2xl border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                    <p className="leading-relaxed">{ex.coachTipsAr}</p>
                  </div>
                )}

                {/* Sets Checkboxes Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                  {Array.from({ length: ex.sets || 4 }).map((_, setIdx) => {
                    const setNum = setIdx + 1;
                    const isDone = !!exSets[setNum];

                    return (
                      <button
                        key={setNum}
                        onClick={() => toggleSetComplete(ex.id, setNum, 0)}
                        className={`p-3 rounded-2xl border text-xs font-bold transition-all flex items-center justify-between group cursor-pointer ${
                          isDone
                            ? 'bg-emerald-600 text-white border-emerald-500 shadow-md scale-95'
                            : 'bg-slate-950/80 hover:bg-slate-900 text-slate-300 border-slate-800'
                        }`}
                      >
                        <div className="text-right rtl:text-right ltr:text-left">
                          <span className="block text-xs font-bold">
                            {isAr ? `المجموعة ${setNum}` : `Set ${setNum}`}
                          </span>
                        </div>

                        <div className={`w-6 h-6 rounded-xl flex items-center justify-center ${
                          isDone ? 'bg-white text-emerald-600' : 'bg-slate-800 text-slate-500 group-hover:text-white'
                        }`}>
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 5. FINISH WORKOUT BUTTON */}
      <div className="pt-4">
        <button
          type="button"
          onClick={handleFinishWorkout}
          className="w-full py-4 rounded-3xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
        >
          <Trophy className="w-5 h-5" />
          <span>{isAr ? '🔥 إتمام وحفظ حصة تدريب اليوم' : '🔥 Finish Today\'s Workout'}</span>
        </button>
      </div>

      {/* Exercise Video Modal */}
      {selectedExerciseForVideo && (
        <ExerciseVideoModal
          exercise={selectedExerciseForVideo}
          isOpen={!!selectedExerciseForVideo}
          onClose={() => setSelectedExerciseForVideo(null)}
          lang={lang}
        />
      )}

      {/* Quick Video Uploader Modal */}
      {videoUploadTarget && currentMember && (
        <ExerciseVideoUploaderModal
          exercise={videoUploadTarget}
          isOpen={!!videoUploadTarget}
          onClose={() => setVideoUploadTarget(null)}
          onSave={(updatedEx) => {
            const updatedProg = JSON.parse(JSON.stringify(program));
            const day = updatedProg.days[selectedDayIndex];
            if (day) {
              const exIdx = day.exercises.findIndex((e: any) => e.id === updatedEx.id);
              if (exIdx >= 0) {
                day.exercises[exIdx] = updatedEx;
                StorageService.updateMemberProgram(currentMember.id, updatedProg, currentUser?.nameAr || 'الكابتن');
                audioAlertService.playSuccess();
                alert(isAr ? `✓ تم حفظ وإرفاق الفيديو للتمرين (${updatedEx.nameAr}) بنجاح` : 'Video attached successfully');
              }
            }
            setVideoUploadTarget(null);
          }}
          coachName={currentUser?.nameAr || 'الكابتن'}
          lang={lang}
        />
      )}
    </div>
  );
};
