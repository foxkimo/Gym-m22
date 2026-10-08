import React, { useState, useEffect, useRef } from 'react';
import { GymMember, CurrentUser, WorkoutProgram, WorkoutDay, Exercise, ExerciseLibraryItem } from '../types/gym';
import { StorageService } from '../services/storageService';
import { audioAlertService } from '../services/audioService';
import { pdfPrintService } from '../services/pdfPrintService';
import { videoMediaService } from '../services/videoMediaService';
import { ExerciseVideoUploaderModal } from './ExerciseVideoUploaderModal';
import { ExerciseVideoModal } from './ExerciseVideoModal';
import { EmployeeAttendanceWidget } from './EmployeeAttendanceWidget';
import { MemberWorkoutHistoryPreviewModal } from './MemberWorkoutHistoryPreviewModal';
import { EmployeeContractModal } from './EmployeeContractModal';
import { 
  Users, 
  Dumbbell, 
  Search, 
  Edit3, 
  CheckCircle2, 
  Calendar, 
  Plus, 
  Trash2, 
  X, 
  Sparkles, 
  Phone, 
  Flame, 
  Printer, 
  ShieldCheck, 
  Snowflake, 
  Activity, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  Layers, 
  Save, 
  FileText,
  Video,
  Film,
  Play,
  Upload,
  BookOpen,
  Tag,
  Check,
  Eye,
  Signature,
  BadgeCheck,
  Link as LinkIcon
} from 'lucide-react';

interface CoachTraineesPortalProps {
  currentUser: CurrentUser;
  lang: 'ar' | 'en';
}

export const CoachTraineesPortal: React.FC<CoachTraineesPortalProps> = ({ currentUser, lang }) => {
  const isAr = lang === 'ar';
  const [members, setMembers] = useState<GymMember[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'expiring'>('all');
  
  // Routine Builder Modal State
  const [selectedMember, setSelectedMember] = useState<GymMember | null>(null);
  const [editingProgram, setEditingProgram] = useState<WorkoutProgram | null>(null);
  const [activeDayIndex, setActiveDayIndex] = useState(0);

  // Video Management Modals
  const [videoUploadTarget, setVideoUploadTarget] = useState<{ exercise: Exercise; dayIndex: number; exIndex: number } | null>(null);
  const [previewExerciseVideo, setPreviewExerciseVideo] = useState<Exercise | null>(null);

  // Quick Direct Video Attacher from Trainee Card
  const [quickVideoMember, setQuickVideoMember] = useState<GymMember | null>(null);

  // Exercise Library Import Modal State
  const [isLibraryPickerOpen, setIsLibraryPickerOpen] = useState(false);
  const [exerciseLibrary, setExerciseLibrary] = useState<ExerciseLibraryItem[]>([]);

  // New Exercise Form State
  const [newExName, setNewExName] = useState('');
  const [newExMuscle, setNewExMuscle] = useState('صدر');
  const [newExSets, setNewExSets] = useState(4);
  const [newExReps, setNewExReps] = useState('10-12');
  const [newExRest, setNewExRest] = useState(60);
  const [newExTargetWeight, setNewExTargetWeight] = useState<number | undefined>(undefined);
  const [newExVideoUrl, setNewExVideoUrl] = useState('');
  const [newExCoachTips, setNewExCoachTips] = useState('');
  const [newExFileName, setNewExFileName] = useState('');
  const newExFileInputRef = useRef<HTMLInputElement>(null);

  // Toast message state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Attendance viewer modal state
  const [selectedAttendanceMember, setSelectedAttendanceMember] = useState<GymMember | null>(null);
  
  // Trainee Workout History Preview Modal state
  const [previewHistoryMember, setPreviewHistoryMember] = useState<GymMember | null>(null);

  // Coach Employment & Operational Contract Modal state
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);

  const coachContract = React.useMemo(() => {
    return StorageService.getEmploymentContracts().find(c => c.employeeId === currentUser.id);
  }, [currentUser.id, isContractModalOpen]);

  const hasSignedContract = coachContract?.isEmployeeAgreed === true;

  const refreshData = () => {
    setMembers(StorageService.getMembers());
    setExerciseLibrary(StorageService.getExerciseLibrary());
  };

  const handleQuickCheckIn = (m: GymMember) => {
    const result = StorageService.recordMemberCheckIn(
      m,
      'manual_staff',
      `${currentUser.nameAr} (كابتن الصالة)`,
      'coach'
    );

    if (!result.success) {
      audioAlertService.playDelete();
      setToastMessage(isAr ? `⛔ ${result.errorAr}` : `⛔ ${result.errorEn}`);
      setTimeout(() => setToastMessage(null), 5000);
      return;
    }

    audioAlertService.playSuccess();
    refreshData();
    setToastMessage(isAr ? `✓ تم تسجيل حضور وتدريب اليوم للعضو (${m.fullNameAr}) بنجاح` : 'Attendance recorded');
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Filter trainees
  const filteredTrainees = members.filter(m => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = m.fullNameAr.toLowerCase().includes(q) ||
        m.fullNameEn.toLowerCase().includes(q) ||
        m.membershipNumber.includes(q) ||
        m.phone.includes(q);
      if (!matchSearch) return false;
    }

    if (filterStatus === 'active') return m.status === 'active';
    if (filterStatus === 'expiring') return m.remainingDays <= 7 && m.remainingDays > 0;

    return true;
  });

  // Open Routine Editor for a Member with guaranteed valid program object
  const handleOpenRoutineEditor = (member: GymMember) => {
    audioAlertService.playBeep(659.25, 0.08);
    setSelectedMember(member);
    
    // Ensure valid program
    let prog = member.currentProgram;
    if (!prog || !prog.days || prog.days.length === 0) {
      prog = {
        id: `prog-${member.id}`,
        titleAr: 'البرنامج التدريبي المخصص',
        titleEn: 'Custom Routine',
        coachName: currentUser.nameAr,
        coachId: currentUser.id,
        createdAt: new Date().toISOString(),
        days: [
          {
            id: `day-${Date.now()}-1`,
            dayNumber: 1,
            titleAr: 'اليوم 1: تمارين عضلات الصدر والترايسبس',
            titleEn: 'Day 1: Chest & Triceps',
            focusMuscles: ['صدر', 'ترايسبس'],
            exercises: []
          },
          {
            id: `day-${Date.now()}-2`,
            dayNumber: 2,
            titleAr: 'اليوم 2: تمارين عضلات الظهر والبايسبس',
            titleEn: 'Day 2: Back & Biceps',
            focusMuscles: ['ظهر', 'بايسبس'],
            exercises: []
          }
        ]
      };
    }

    const clone: WorkoutProgram = JSON.parse(JSON.stringify(prog));
    setEditingProgram(clone);
    setActiveDayIndex(0);
    resetNewExerciseForm();
  };

  const resetNewExerciseForm = () => {
    setNewExName('');
    setNewExMuscle('صدر');
    setNewExSets(4);
    setNewExReps('10-12');
    setNewExRest(60);
    setNewExTargetWeight(undefined);
    setNewExVideoUrl('');
    setNewExCoachTips('');
    setNewExFileName('');
  };

  // Direct video file selection inside new exercise form
  const handleNewExerciseVideoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      alert(isAr ? 'يرجى اختيار ملف فيديو صالح (MP4, WebM, MOV)' : 'Please select a valid video file');
      return;
    }

    const tempId = `temp-ex-${Date.now()}`;
    setNewExFileName(file.name);

    try {
      const savedUrl = await videoMediaService.saveLocalVideo(tempId, file);
      setNewExVideoUrl(savedUrl);
      audioAlertService.playSuccess();
    } catch {
      const url = URL.createObjectURL(file);
      setNewExVideoUrl(url);
    }
  };

  // Add Exercise to active day
  const handleAddExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProgram || !newExName.trim()) return;

    const newExercise: Exercise = {
      id: `ex-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      nameAr: newExName.trim(),
      nameEn: newExName.trim(),
      targetMuscle: newExMuscle,
      targetMuscleEn: newExMuscle,
      equipment: 'أجهزة وأوزان حرة',
      sets: Number(newExSets) || 3,
      reps: newExReps.trim() || '10-12',
      restSeconds: Number(newExRest) || 60,
      targetWeightKg: newExTargetWeight ? Number(newExTargetWeight) : undefined,
      videoUrl: newExVideoUrl.trim() || undefined,
      videoUploadedBy: newExVideoUrl ? currentUser.nameAr : undefined,
      coachTipsAr: newExCoachTips.trim() || 'التركيز على الحركة البطيئة والتنفس المنتظم وعصر العضلة المستهدفة.'
    };

    const updated = { ...editingProgram };
    if (!updated.days[activeDayIndex]) {
      // Create active day if missing
      updated.days[activeDayIndex] = {
        id: `day-${Date.now()}`,
        dayNumber: activeDayIndex + 1,
        titleAr: `اليوم ${activeDayIndex + 1}: تمارين مخصصة`,
        titleEn: `Day ${activeDayIndex + 1}: Custom Routine`,
        focusMuscles: [newExMuscle],
        exercises: []
      };
    }

    updated.days[activeDayIndex].exercises.push(newExercise);
    setEditingProgram(updated);

    // Auto-save to member profile immediately
    if (selectedMember) {
      StorageService.updateMemberProgram(selectedMember.id, updated, currentUser.nameAr);
      refreshData();
    }

    resetNewExerciseForm();
    audioAlertService.playSuccess();
    setToastMessage(isAr ? `✓ تم إضافة التمرين (${newExercise.nameAr}) وحفظه بنجاح` : 'Exercise added and saved');
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Import exercise from Library
  const handleImportFromLibrary = (libItem: ExerciseLibraryItem) => {
    if (!editingProgram) return;

    const importedEx: Exercise = {
      id: `ex-lib-${Date.now()}`,
      nameAr: libItem.titleAr,
      nameEn: libItem.titleEn || libItem.titleAr,
      targetMuscle: libItem.targetMuscle,
      targetMuscleEn: libItem.targetMuscle,
      equipment: libItem.machineName || libItem.equipment || (libItem.machineNumber ? `جهاز صالة ${libItem.machineNumber}` : 'أجهزة الصالة'),
      sets: libItem.targetSets || 4,
      reps: libItem.targetReps || '10-12',
      restSeconds: 60,
      videoUrl: libItem.videoUrl,
      videoType: libItem.videoType,
      videoUploadedBy: currentUser.nameAr,
      coachTipsAr: libItem.descriptionAr
    };

    const updated = { ...editingProgram };
    if (!updated.days[activeDayIndex]) {
      updated.days[activeDayIndex] = {
        id: `day-${Date.now()}`,
        dayNumber: activeDayIndex + 1,
        titleAr: `اليوم ${activeDayIndex + 1}: تمارين مخصصة`,
        titleEn: `Day ${activeDayIndex + 1}: Custom Routine`,
        focusMuscles: [libItem.targetMuscle],
        exercises: []
      };
    }

    updated.days[activeDayIndex].exercises.push(importedEx);
    setEditingProgram(updated);

    if (selectedMember) {
      StorageService.updateMemberProgram(selectedMember.id, updated, currentUser.nameAr);
      refreshData();
    }

    setIsLibraryPickerOpen(false);
    audioAlertService.playSuccess();
    setToastMessage(isAr ? `✓ تم استيراد تمرين (${importedEx.nameAr}) بالفيديو والجهاز بنجاح` : 'Exercise imported from library');
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Remove Exercise from active day
  const handleRemoveExercise = (exId: string) => {
    if (!editingProgram || !editingProgram.days[activeDayIndex]) return;
    const updated = { ...editingProgram };
    updated.days[activeDayIndex].exercises = updated.days[activeDayIndex].exercises.filter(e => e.id !== exId);
    setEditingProgram(updated);

    if (selectedMember) {
      StorageService.updateMemberProgram(selectedMember.id, updated, currentUser.nameAr);
      refreshData();
    }

    audioAlertService.playDelete();
  };

  // Add new day to program
  const handleAddDay = () => {
    if (!editingProgram) return;
    const dayNumber = editingProgram.days.length + 1;
    const newDay: WorkoutDay = {
      id: `day-${Date.now()}`,
      dayNumber,
      titleAr: `اليوم ${dayNumber}: تمارين وتكنيك إضافي`,
      titleEn: `Day ${dayNumber}: Additional Routine`,
      focusMuscles: ['لياقة عامة'],
      exercises: []
    };

    const updated = { ...editingProgram, days: [...editingProgram.days, newDay] };
    setEditingProgram(updated);
    setActiveDayIndex(updated.days.length - 1);
    audioAlertService.playSuccess();
  };

  // Save customized program
  const handleSaveProgram = () => {
    if (!selectedMember || !editingProgram) return;

    const success = StorageService.updateMemberProgram(
      selectedMember.id,
      editingProgram,
      currentUser.nameAr
    );

    if (success) {
      audioAlertService.playSuccess();
      setToastMessage(isAr ? `✓ تم اعتماد وحفظ جدول التمارين وفيديوهات الكابتن للمشترك: ${selectedMember.fullNameAr}` : 'Workout routine and videos saved successfully');
      setTimeout(() => setToastMessage(null), 3500);
      setSelectedMember(null);
      setEditingProgram(null);
      refreshData();
    }
  };

  // Save video from Video Uploader Modal
  const handleSaveExerciseVideo = (updatedExercise: Exercise) => {
    if (!videoUploadTarget || !editingProgram) return;
    const { dayIndex, exIndex } = videoUploadTarget;
    const updated = { ...editingProgram };
    if (updated.days[dayIndex] && updated.days[dayIndex].exercises[exIndex]) {
      updated.days[dayIndex].exercises[exIndex] = updatedExercise;
      setEditingProgram(updated);
      
      // Persist to member profile
      if (selectedMember) {
        StorageService.updateMemberProgram(selectedMember.id, updated, currentUser.nameAr);
        refreshData();
      }
      setToastMessage(isAr ? `✓ تم إرفاق وحفظ فيديو التمرين (${updatedExercise.nameAr}) للاعب بنجاح` : 'Video attached successfully');
      setTimeout(() => setToastMessage(null), 3000);
    }
    setVideoUploadTarget(null);
  };

  // Print Routine Directly
  const handlePrintRoutine = () => {
    if (!selectedMember || !editingProgram) return;
    audioAlertService.playSuccess();
    pdfPrintService.printMemberActivityAndWorkoutReportPDF(
      { ...selectedMember, currentProgram: editingProgram },
      currentUser.nameAr
    );
  };

  const activeTraineesCount = members.filter(m => m.status === 'active').length;
  const expiringCount = members.filter(m => m.remainingDays <= 7 && m.remainingDays > 0).length;

  const renderTraineeAttendanceModal = (member: GymMember) => {
    const traineeCheckIns = StorageService.getMemberCheckIns().filter(
      c => c.memberId === member.id || c.membershipNumber === member.membershipNumber
    );
    const totalVisits = Math.max(traineeCheckIns.length, member.attendanceCount || 0);

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
        <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-[#0c101a] border-2 border-emerald-500/40 text-slate-100 shadow-2xl relative overflow-hidden text-right rtl:text-right ltr:text-left">
          {/* Header */}
          <div className="p-5 bg-gradient-to-r from-[#0c1a2e] via-[#091424] to-[#060c16] border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={member.avatarUrl || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'}
                alt={member.fullNameAr}
                className="w-12 h-12 rounded-2xl object-cover border-2 border-emerald-500/40"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-white">{member.fullNameAr}</h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-500/30">
                    #{member.membershipNumber}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                  <span>{isAr ? 'سجل الحضور والزيارات الفعلي بالصالة' : 'Check-in History'}</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-bold font-mono">{totalVisits} {isAr ? 'زيارة مؤكدة' : 'visits'}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedAttendanceMember(null)}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Attendance Table */}
          <div className="p-5 overflow-y-auto space-y-4 flex-1">
            <div className="bg-[#070b13] p-3 rounded-2xl border border-slate-800/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-slate-300 font-bold">{isAr ? 'حركات الدخول الموثقة بالساعة والتاريخ:' : 'Verified Visits:'}</span>
              </div>
              <span className="text-emerald-400 font-mono font-bold">{traineeCheckIns.length} {isAr ? 'حركة مسجلة' : 'records'}</span>
            </div>

            {traineeCheckIns.length === 0 ? (
              <div className="p-10 text-center text-slate-500 text-xs font-bold space-y-2">
                <Clock className="w-10 h-10 text-slate-700 mx-auto" />
                <p>{isAr ? 'لا توجد حركات حضور مسجلة لهذا المشترك حتى الآن.' : 'No visits recorded yet.'}</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-800/80">
                <table className="w-full text-right rtl:text-right ltr:text-left text-xs">
                  <thead className="bg-[#050811] text-slate-400 font-bold border-b border-slate-800">
                    <tr>
                      <th className="p-3">#</th>
                      <th className="p-3">{isAr ? 'التاريخ' : 'Date'}</th>
                      <th className="p-3">{isAr ? 'وقت الدخول' : 'Time'}</th>
                      <th className="p-3">{isAr ? 'وسيلة وبوابة الدخول' : 'Gate / Method'}</th>
                      <th className="p-3">{isAr ? 'المسؤول' : 'Staff'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-[#090d18]">
                    {traineeCheckIns.map((ci, idx) => (
                      <tr key={ci.id} className="hover:bg-slate-900/50 transition-colors">
                        <td className="p-3 font-mono font-bold text-slate-500 text-[11px]">
                          {traineeCheckIns.length - idx}
                        </td>
                        <td className="p-3 font-mono text-white font-bold">
                          {ci.checkInDate}
                        </td>
                        <td className="p-3 font-mono text-emerald-400 font-black">
                          {ci.checkInTime}
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-lg bg-sky-950/70 text-sky-300 border border-sky-500/30 text-[10px] font-bold">
                            {ci.gateOrMethod === 'reception_qr' 
                              ? (isAr ? 'استقبال QR' : 'Reception QR') 
                              : ci.gateOrMethod === 'self_portal' 
                                ? (isAr ? 'دخول ذاتي' : 'Self Portal') 
                                : (isAr ? 'تسجيل يدوي' : 'Manual')}
                          </span>
                        </td>
                        <td className="p-3 text-slate-400 text-[11px]">
                          {ci.performedByName}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="p-4 bg-[#070b13] border-t border-slate-800 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                handleQuickCheckIn(member);
              }}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-emerald-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>{isAr ? 'تسجيل حضور تمرين اليوم (+1)' : 'Record Today Check-In'}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  audioAlertService.playSuccess();
                  pdfPrintService.printMemberActivityAndWorkoutReportPDF(member, currentUser.nameAr);
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4 text-sky-400" />
                <span>{isAr ? 'طباعة تقرير الحضور والتمارين' : 'Print PDF'}</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedAttendanceMember(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
              >
                {isAr ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16">
      {/* Daily Coach Attendance & Working Hours Widget */}
      <EmployeeAttendanceWidget 
        currentUser={currentUser} 
        lang={lang} 
        onAttendanceChanged={refreshData} 
      />

      {/* 1. COACH EXECUTIVE HERO BANNER */}
      <div className="bg-gradient-to-br from-[#0c1322] via-[#080d17] to-[#04060b] rounded-3xl p-6 border-2 border-sky-500/40 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 relative z-10">
          <div className="flex items-center gap-4">
            <img
              src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=150'}
              alt={currentUser.nameAr}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-sky-400 shadow-xl shadow-sky-500/20 shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-sky-500 text-slate-950 font-black flex items-center gap-1">
                  <Dumbbell className="w-3 h-3" />
                  <span>{isAr ? 'كابتن ومدرب معتمد' : 'Certified Coach'}</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                  {isAr ? 'الصلاحيات التدريبية مفعلة بالكامل' : 'All Coaching Privileges Active'}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                {currentUser.nameAr}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {isAr ? 'تخصيص الجداول التدريبية، رفع وتصوير فيديوهات التمارين من جهازك لكل لاعب' : 'Manage Trainees, customize routines, and attach exercise videos'}
              </p>
            </div>
          </div>

          {/* Quick Stats Cards */}
          <div className="grid grid-cols-3 gap-2.5 sm:min-w-[340px]">
            <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block">{isAr ? 'المتدربين' : 'Trainees'}</span>
              <strong className="text-base font-black text-sky-400 font-mono block mt-0.5">{members.length}</strong>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block">{isAr ? 'نشطين' : 'Active'}</span>
              <strong className="text-base font-black text-emerald-400 font-mono block mt-0.5">{activeTraineesCount}</strong>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block">{isAr ? 'أوشك الانتهاء' : 'Expiring'}</span>
              <strong className="text-base font-black text-rose-400 font-mono block mt-0.5">{expiringCount}</strong>
            </div>
          </div>
        </div>

        {/* Coach Action Bar */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-[11px]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-sky-300 font-black flex items-center gap-1.5 ml-2 rtl:ml-2 ltr:mr-2">
              <ShieldCheck className="w-4 h-4 text-sky-400" />
              <span>{isAr ? 'خيارات الكابتن السريعة:' : 'Coach Actions:'}</span>
            </span>

            <span className="px-2.5 py-1 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-300 font-bold flex items-center gap-1.5">
              <Film className="w-3.5 h-3.5 text-sky-400" />
              <span>{isAr ? 'رفع وتخصيص فيديوهات التمارين من هاتفك/جهازك' : 'Upload Videos from Device'}</span>
            </span>

            <span className="px-2.5 py-1 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-300 font-bold flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-sky-400" />
              <span>{isAr ? 'مكتبة التمارين المعتمدة متاحة للاستيراد الفوري' : 'Ready Exercise Library'}</span>
            </span>
          </div>

          {/* Captain Official Employment & Operational Contract Button */}
          <button
            type="button"
            onClick={() => setIsContractModalOpen(true)}
            className={`px-3.5 py-2 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg active:scale-98 ${
              hasSignedContract
                ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                : 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 font-black hover:scale-105 shadow-amber-500/20 animate-pulse'
            }`}
          >
            <Signature className="w-4 h-4" />
            <span>{isAr ? '📄 عقدي والمهام التشغيلية المعتمدة' : '📄 My Operational Contract'}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
              hasSignedContract 
                ? 'bg-emerald-500 text-slate-950' 
                : 'bg-slate-950 text-amber-400'
            }`}>
              {hasSignedContract ? (isAr ? 'معتمد وموقّع ✓' : 'Signed ✓') : (isAr ? 'توقيع العقد ✍️' : 'Sign Now')}
            </span>
          </button>
        </div>
      </div>

      {/* 2. SEARCH & FILTER BAR */}
      <div className="bg-[#0b0f18] rounded-2xl p-4 border border-slate-800 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute right-3.5 rtl:right-3.5 ltr:left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isAr ? 'ابحث باسم اللاعب، رقم الهاتف، أو رقم العضوية...' : 'Search by name, phone, or ID...'}
            className="w-full bg-[#06080e] border border-slate-800 rounded-xl py-2 px-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              filterStatus === 'all'
                ? 'bg-sky-500 text-slate-950 font-black'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            {isAr ? 'جميع اللاعبين' : 'All'}
          </button>

          <button
            onClick={() => setFilterStatus('active')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              filterStatus === 'active'
                ? 'bg-emerald-500 text-slate-950 font-black'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            {isAr ? 'النشطين فقط' : 'Active'}
          </button>

          <button
            onClick={() => setFilterStatus('expiring')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              filterStatus === 'expiring'
                ? 'bg-rose-500 text-white font-black'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            {isAr ? 'أوشك على الانتهاء' : 'Expiring'}
          </button>
        </div>
      </div>

      {/* 3. TRAINEES CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTrainees.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-[#090d16] rounded-3xl border border-slate-800">
            <Users className="w-12 h-12 text-slate-600 mx-auto mb-2" />
            <p className="text-slate-400 font-bold text-sm">
              {isAr ? 'لا يوجد لاعبين مطابقين للبحث' : 'No matching trainees found'}
            </p>
          </div>
        ) : (
          filteredTrainees.map(m => {
            const isFrozen = m.status === 'frozen';
            const isExpiring = m.remainingDays <= 7 && m.remainingDays > 0;
            const programDays = m.currentProgram?.days || [];
            const totalExercisesWithVideo = programDays.reduce(
              (acc, d) => acc + (d.exercises ? d.exercises.filter(e => !!e.videoUrl).length : 0), 
              0
            );

            return (
              <div 
                key={m.id} 
                className="bg-[#0b0f19] rounded-3xl p-5 border border-slate-800/90 hover:border-sky-500/50 transition-all shadow-xl space-y-4 relative group"
              >
                {/* Member Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={m.avatarUrl || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'}
                      alt={m.fullNameAr}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-700 group-hover:border-sky-400 transition-colors"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-mono font-black text-sky-300 bg-sky-950/70 px-2 py-0.5 rounded border border-sky-500/30">
                          #{m.membershipNumber}
                        </span>
                        <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          {m.tier}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white mt-1 group-hover:text-sky-300 transition-colors">{m.fullNameAr}</h4>
                      <span className="text-[11px] text-slate-400 font-mono block mt-0.5">
                        {m.phone}
                      </span>
                    </div>
                  </div>

                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase border ${
                    isFrozen
                      ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
                      : m.status === 'active'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                        : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                  }`}>
                    {isFrozen ? (isAr ? 'مجمد' : 'Frozen') : m.status}
                  </span>
                </div>

                {/* Assigned Program Box */}
                <div className="bg-[#070b13] p-3.5 rounded-2xl border border-slate-800/80 text-xs space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Dumbbell className="w-3.5 h-3.5 text-sky-400" />
                      <span>{isAr ? 'البرنامج التدريبي المسند:' : 'Routine:'}</span>
                    </span>
                    <span className="text-sky-400 font-mono font-bold">
                      {programDays.length} {isAr ? 'أيام تدريب' : 'days'}
                    </span>
                  </div>

                  <strong className="text-white text-xs block font-bold truncate">
                    {m.currentProgram?.titleAr || (isAr ? 'جدول مخصص للكابتن' : 'Custom Routine')}
                  </strong>

                  <div className="flex items-center justify-between pt-1.5 text-[10px] text-slate-400 border-t border-slate-800/50">
                    <span className="flex items-center gap-1 text-sky-400 font-bold">
                      <Film className="w-3 h-3" />
                      <span>{totalExercisesWithVideo} {isAr ? 'فيديو تمرين مرفق' : 'videos attached'}</span>
                    </span>
                    <span className={`font-bold font-mono ${isExpiring ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>
                      {m.remainingDays} {isAr ? 'يوم متبقي' : 'days left'}
                    </span>
                  </div>
                </div>

                {/* Member Attendance Info & Quick Actions */}
                <div className="bg-[#070b13] p-3 rounded-2xl border border-emerald-500/20 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5 font-bold text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{isAr ? 'سجل الحضور والزيارات:' : 'Attendance:'}</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-black text-xs border border-emerald-500/30">
                      {m.attendanceCount || 0} {isAr ? 'زيارات مؤكدة' : 'visits'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-0.5">
                    <button
                      type="button"
                      onClick={() => handleQuickCheckIn(m)}
                      className="py-1.5 px-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 hover:text-white text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                      title={isAr ? 'تسجيل حضور وتدريب اليوم للاعب' : 'Record Check-In'}
                    >
                      <Plus className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{isAr ? 'حضور اليوم (+1)' : 'Check-In Today'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedAttendanceMember(m)}
                      className="py-1.5 px-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                      title={isAr ? 'استعراض تفاصيل كافة الزيارات السابقة' : 'View Check-ins'}
                    >
                      <Calendar className="w-3.5 h-3.5 text-sky-400" />
                      <span>{isAr ? 'كشف الزيارات' : 'History'}</span>
                    </button>
                  </div>
                </div>

                {/* Coach Actions */}
                <div className="space-y-2 pt-1">
                  <button
                    onClick={() => handleOpenRoutineEditor(m)}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-sky-600/20 cursor-pointer active:scale-95"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{isAr ? 'تعديل الجدول وإرفاق الفيديوهات 🎥' : 'Customize Routine & Videos'}</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        audioAlertService.playBeep(659.25, 0.08);
                        setPreviewHistoryMember(m);
                      }}
                      className="py-2 px-2.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/40 text-sky-300 hover:text-white text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      title={isAr ? 'معاينة ومتابعة سجل تمارين المتدرب على الشاشة' : 'Preview Workout Log'}
                    >
                      <Eye className="w-3.5 h-3.5 text-sky-400" />
                      <span>{isAr ? 'معاينة التمارين 👁️' : 'View Log'}</span>
                    </button>

                    <button
                      onClick={() => {
                        audioAlertService.playSuccess();
                        pdfPrintService.printMemberActivityAndWorkoutReportPDF(m, currentUser.nameAr);
                      }}
                      className="py-2 px-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-sky-500/40 text-slate-300 hover:text-white text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      title={isAr ? 'طباعة تقرير وبيانات المتدرب والحضور والتمارين PDF' : 'Print PDF'}
                    >
                      <Printer className="w-3.5 h-3.5 text-sky-400" />
                      <span>{isAr ? 'طباعة PDF' : 'Print PDF'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* =============================================================
          4. INTERACTIVE WORKOUT ROUTINE BUILDER MODAL (محرر وتصميم التمارين)
          ============================================================= */}
      {selectedMember && editingProgram && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-[#0b0f18] border-2 border-sky-500/40 text-slate-100 shadow-2xl relative overflow-hidden text-right rtl:text-right ltr:text-left">
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-[#101b2c] via-[#0b1420] to-[#070b12] border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/40 flex items-center justify-center font-bold">
                  <Dumbbell className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 font-bold">
                      {isAr ? 'محرر وتصميم التمارين وإرفاق الفيديوهات' : 'Routine & Video Builder'}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      #{selectedMember.membershipNumber}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-white mt-0.5">
                    {isAr ? `تخصيص جدول تمارين وفيديوهات: ${selectedMember.fullNameAr}` : `Routine & Videos for ${selectedMember.fullNameEn}`}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrintRoutine}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 border border-sky-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title={isAr ? 'طباعة كشف الجدول التدريبي PDF' : 'Print PDF'}
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{isAr ? 'طباعة PDF' : 'Print PDF'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedMember(null);
                    setEditingProgram(null);
                  }}
                  className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Program Title Input */}
            <div className="p-4 bg-[#080c14] border-b border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <label className="text-xs font-bold text-slate-300 shrink-0">
                {isAr ? 'عنوان البرنامج التدريبي:' : 'Routine Title:'}
              </label>
              <input
                type="text"
                value={editingProgram.titleAr}
                onChange={(e) => setEditingProgram({ ...editingProgram, titleAr: e.target.value })}
                placeholder={isAr ? 'مثال: برنامج التنشيف وبناء الكتل العضلية...' : 'Routine title...'}
                className="flex-1 bg-[#05070d] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-bold focus:border-sky-500"
              />
              <span className="text-[11px] text-sky-400 font-bold shrink-0">
                {isAr ? `الكابتن المشرف: ${currentUser.nameAr}` : `Coach: ${currentUser.nameEn}`}
              </span>
            </div>

            {/* Days Tabs Header */}
            <div className="px-4 pt-3 bg-[#090d16] border-b border-slate-800 flex items-center gap-2 overflow-x-auto scrollbar-none">
              {editingProgram.days.map((day, idx) => (
                <button
                  key={day.id || idx}
                  onClick={() => setActiveDayIndex(idx)}
                  className={`px-4 py-2 rounded-t-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 border-t-2 cursor-pointer ${
                    activeDayIndex === idx
                      ? 'bg-[#0e1424] text-sky-300 border-sky-400 shadow'
                      : 'bg-slate-900/60 text-slate-400 border-transparent hover:text-white'
                  }`}
                >
                  <span>{day.titleAr}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 font-mono">
                    {day.exercises?.length || 0}
                  </span>
                </button>
              ))}

              <button
                type="button"
                onClick={handleAddDay}
                className="px-3 py-1.5 mb-1 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs font-bold flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isAr ? '+ يوم جديد' : '+ New Day'}</span>
              </button>
            </div>

            {/* Active Day Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {editingProgram.days[activeDayIndex] && (
                <div className="space-y-4">
                  {/* Day Title input & Quick Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1">
                      <label className="text-xs font-bold text-slate-400 shrink-0">
                        {isAr ? 'تسمية اليوم:' : 'Day Name:'}
                      </label>
                      <input
                        type="text"
                        value={editingProgram.days[activeDayIndex].titleAr}
                        onChange={(e) => {
                          const updated = { ...editingProgram };
                          updated.days[activeDayIndex].titleAr = e.target.value;
                          setEditingProgram(updated);
                        }}
                        className="flex-1 bg-[#070b13] border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white font-bold focus:border-sky-500"
                      />
                    </div>

                    {/* Import from Exercise Video Library Button */}
                    <button
                      type="button"
                      onClick={() => setIsLibraryPickerOpen(true)}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-[#f7cb55] border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow"
                    >
                      <BookOpen className="w-4 h-4 text-amber-400" />
                      <span>{isAr ? '📂 اختيار تمرين جاهز بالفيديو من المكتبة' : 'Import from Library'}</span>
                    </button>
                  </div>

                  {/* Exercises List Table */}
                  <div className="bg-[#070a12] rounded-2xl border border-slate-800 overflow-hidden">
                    <div className="p-3 bg-[#05070d] border-b border-slate-800 flex items-center justify-between text-xs font-bold text-slate-300">
                      <span>{isAr ? 'تمارين هذا اليوم التدريبي' : 'Exercises for this day'}</span>
                      <span className="text-sky-400 font-mono">
                        {editingProgram.days[activeDayIndex].exercises?.length || 0} {isAr ? 'تمرين مسجل' : 'exercises'}
                      </span>
                    </div>

                    {(!editingProgram.days[activeDayIndex].exercises || editingProgram.days[activeDayIndex].exercises.length === 0) ? (
                      <div className="p-8 text-center text-slate-500 text-xs font-bold space-y-2">
                        <p>{isAr ? 'لا توجد تمارين مسجلة لهذا اليوم بعد.' : 'No exercises added yet.'}</p>
                        <p className="text-[11px] text-sky-400">
                          {isAr ? '👇 استخدم نموذج الإضافة بالأسفل لإضافة تمرين وفيديو من جهازك مباشرة.' : 'Use form below to add exercises and videos.'}
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-800/60">
                        {editingProgram.days[activeDayIndex].exercises.map((ex, idx) => (
                          <div key={ex.id || idx} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-900/40 transition-colors">
                            <div className="flex items-center gap-3">
                              <span className="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-400 text-xs font-bold flex items-center justify-center shrink-0">
                                {idx + 1}
                              </span>
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <strong className="text-white text-xs block font-bold">{ex.nameAr}</strong>
                                  {ex.videoUrl ? (
                                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
                                      <Film className="w-3 h-3" />
                                      <span>{isAr ? 'فيديو مرفق ✓' : 'Video Attached'}</span>
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-medium border border-slate-700">
                                      {isAr ? 'بدون فيديو' : 'No Video'}
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-slate-400 block mt-0.5">
                                  العضلة: <span className="text-amber-400 font-bold">{ex.targetMuscle}</span> • {ex.equipment}
                                  {ex.targetWeightKg ? ` • الوزن المقترح: ${ex.targetWeightKg} كجم` : ''}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center flex-wrap gap-2 sm:gap-3">
                              <div className="text-center font-mono">
                                <span className="text-[10px] text-slate-400 block">{isAr ? 'المجموعات' : 'Sets'}</span>
                                <strong className="text-xs font-black text-sky-300">{ex.sets}</strong>
                              </div>

                              <div className="text-center font-mono">
                                <span className="text-[10px] text-slate-400 block">{isAr ? 'التكرارات' : 'Reps'}</span>
                                <strong className="text-xs font-black text-emerald-300">{ex.reps}</strong>
                              </div>

                              <div className="text-center font-mono">
                                <span className="text-[10px] text-slate-400 block">{isAr ? 'الراحة' : 'Rest'}</span>
                                <strong className="text-xs font-bold text-slate-300">{ex.restSeconds}ث</strong>
                              </div>

                              {/* Attach / Edit Video Button */}
                              <button
                                type="button"
                                onClick={() => {
                                  setVideoUploadTarget({
                                    exercise: ex,
                                    dayIndex: activeDayIndex,
                                    exIndex: idx
                                  });
                                }}
                                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                                  ex.videoUrl
                                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 hover:bg-sky-500/30'
                                    : 'bg-slate-800/90 text-slate-300 border border-slate-700 hover:bg-sky-500/20 hover:text-sky-300 hover:border-sky-500/40'
                                }`}
                                title={isAr ? 'إرفاق أو تعديل فيديو التمرين من جهازك' : 'Attach video from device'}
                              >
                                <Video className="w-3.5 h-3.5 text-sky-400" />
                                <span>{ex.videoUrl ? (isAr ? 'تعديل الفيديو 🎥' : 'Edit Video') : (isAr ? '+ رفع فيديو 🎬' : '+ Attach Video')}</span>
                              </button>

                              {/* Preview Video if attached */}
                              {ex.videoUrl && (
                                <button
                                  type="button"
                                  onClick={() => setPreviewExerciseVideo(ex)}
                                  className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-pointer"
                                  title={isAr ? 'مشاهدة الفيديو' : 'Preview'}
                                >
                                  <Play className="w-3.5 h-3.5" />
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => handleRemoveExercise(ex.id)}
                                className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-400 transition-colors cursor-pointer"
                                title={isAr ? 'حذف التمرين' : 'Remove'}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Add Exercise Form Box with Direct Video Option */}
                  <form onSubmit={handleAddExercise} className="bg-[#090d16] p-4 rounded-2xl border-2 border-sky-900/50 space-y-3.5">
                    <div className="flex items-center justify-between text-xs font-bold text-sky-300">
                      <div className="flex items-center gap-2">
                        <Plus className="w-4 h-4 text-sky-400" />
                        <span>{isAr ? 'إضافة وتصميم تمرين جديد لهذا اليوم:' : 'Add New Exercise:'}</span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-normal">
                        {isAr ? 'يمكنك كتابة التمرين ورفع الفيديو مباشرة' : 'Add details and attach video'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 text-xs">
                      {/* Name */}
                      <div className="sm:col-span-2">
                        <label className="text-[10px] text-slate-400 block mb-1 font-bold">{isAr ? 'اسم التمرين*' : 'Exercise Name*'}</label>
                        <input
                          type="text"
                          required
                          value={newExName}
                          onChange={(e) => setNewExName(e.target.value)}
                          placeholder={isAr ? 'مثال: بار بنش بريس مستوي...' : 'e.g. Bench Press'}
                          className="w-full bg-[#05070d] border border-slate-800 rounded-xl p-2.5 text-xs text-white font-bold focus:border-sky-500 focus:outline-none"
                        />
                      </div>

                      {/* Muscle */}
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1 font-bold">{isAr ? 'العضلة المستهدفة' : 'Target Muscle'}</label>
                        <select
                          value={newExMuscle}
                          onChange={(e) => setNewExMuscle(e.target.value)}
                          className="w-full bg-[#05070d] border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 font-bold focus:border-sky-500 focus:outline-none"
                        >
                          <option value="صدر">صدر</option>
                          <option value="ظهر">ظهر</option>
                          <option value="أرجل">أرجل</option>
                          <option value="أكتاف">أكتاف</option>
                          <option value="بايسبس">بايسبس</option>
                          <option value="ترايسبس">ترايسبس</option>
                          <option value="بطن">بطن</option>
                          <option value="كارديو">كارديو</option>
                        </select>
                      </div>

                      {/* Sets */}
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1 font-bold">{isAr ? 'المجموعات' : 'Sets'}</label>
                        <input
                          type="number"
                          min={1}
                          max={10}
                          value={newExSets}
                          onChange={(e) => setNewExSets(Number(e.target.value))}
                          className="w-full bg-[#05070d] border border-slate-800 rounded-xl p-2.5 text-xs text-white font-mono font-bold text-center focus:border-sky-500 focus:outline-none"
                        />
                      </div>

                      {/* Reps */}
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1 font-bold">{isAr ? 'التكرار' : 'Reps'}</label>
                        <input
                          type="text"
                          value={newExReps}
                          onChange={(e) => setNewExReps(e.target.value)}
                          placeholder="10-12"
                          className="w-full bg-[#05070d] border border-slate-800 rounded-xl p-2.5 text-xs text-white font-mono font-bold text-center focus:border-sky-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Optional Video & Tips Attachment inside form */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs">
                      <div>
                        <label className="text-[10px] text-amber-300 block mb-1 font-bold flex items-center gap-1">
                          <Film className="w-3 h-3 text-amber-400" />
                          <span>{isAr ? 'فيديو التمرين (رفع ملف من جهازك أو رابط):' : 'Video File or URL:'}</span>
                        </label>
                        
                        <div className="flex items-center gap-1.5">
                          <input
                            ref={newExFileInputRef}
                            type="file"
                            accept="video/*"
                            onChange={handleNewExerciseVideoFile}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => newExFileInputRef.current?.click()}
                            className="px-3 py-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 text-[11px] font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                          >
                            <Upload className="w-3 h-3" />
                            <span>{newExFileName ? 'تغيير الملف' : 'رفع فيديو'}</span>
                          </button>

                          <input
                            type="text"
                            value={newExVideoUrl}
                            onChange={(e) => setNewExVideoUrl(e.target.value)}
                            placeholder={isAr ? 'أو الصق رابط يوتيوب...' : 'YouTube or video URL...'}
                            className="flex-1 bg-[#05070d] border border-slate-800 rounded-xl p-2 text-xs text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none"
                          />
                        </div>

                        {newExFileName && (
                          <span className="text-[10px] text-emerald-400 font-bold block mt-1">
                            ✓ تم اختيار الملف: {newExFileName}
                          </span>
                        )}
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-300 block mb-1 font-bold">
                          {isAr ? 'توجيهات ونصائح الكابتن الفنية للاعب:' : 'Coach Technical Tips:'}
                        </label>
                        <input
                          type="text"
                          value={newExCoachTips}
                          onChange={(e) => setNewExCoachTips(e.target.value)}
                          placeholder={isAr ? 'مثال: افرد ظهرك تماماً واثبت ثانية في أسفل الحركة...' : 'Cues for athlete...'}
                          className="w-full bg-[#05070d] border border-slate-800 rounded-xl p-2 text-xs text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-sky-500/20 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{isAr ? '+ إدراج وحفظ التمرين في جدول اللاعب فوراً' : '+ Add Exercise to Day Routine'}</span>
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Modal Bottom Actions */}
            <div className="p-4 bg-[#080c14] border-t border-slate-800 flex items-center justify-between gap-3">
              <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>{isAr ? 'التعديلات تُحفظ وتظهر فوراً في حساب المشترك' : 'Changes sync in real-time'}</span>
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveProgram}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  <span>{isAr ? 'اعتماد وحفظ جدول التمارين' : 'Save Routine'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedMember(null);
                    setEditingProgram(null);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  {isAr ? 'إغلاق' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Video Uploader Modal */}
      {videoUploadTarget && (
        <ExerciseVideoUploaderModal
          exercise={videoUploadTarget.exercise}
          isOpen={!!videoUploadTarget}
          onClose={() => setVideoUploadTarget(null)}
          onSave={handleSaveExerciseVideo}
          coachName={currentUser.nameAr}
          lang={lang}
        />
      )}

      {/* Video Player Modal */}
      {previewExerciseVideo && (
        <ExerciseVideoModal
          exercise={previewExerciseVideo}
          isOpen={!!previewExerciseVideo}
          onClose={() => setPreviewExerciseVideo(null)}
          lang={lang}
        />
      )}

      {/* 5. LIBRARY PICKER MODAL (اختيار تمرين من المكتبة المعتمدة) */}
      {isLibraryPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-[#0a0d16] border-2 border-amber-500/50 rounded-3xl overflow-hidden shadow-2xl relative text-slate-100 flex flex-col max-h-[85vh]">
            <div className="p-4 bg-gradient-to-r from-[#141b2c] to-[#0a0d16] border-b border-amber-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-sm font-black text-white">
                    {isAr ? 'اختر تمريناً جاهزاً من مكتبة الجيم' : 'Pick Exercise from Library'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {isAr ? 'التمارين مجهزة بفيديوهات الشرح ورقم الجهاز بالصالة' : 'Pre-configured with videos and machine station'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsLibraryPickerOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-2.5 flex-1 divide-y divide-slate-800">
              {exerciseLibrary.map(item => (
                <div key={item.id} className="pt-2.5 flex items-center justify-between gap-3">
                  <div>
                    <strong className="text-xs text-white block">{item.titleAr}</strong>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                      <span className="text-amber-400">{item.folderCategory}</span>
                      <span>•</span>
                      <span className="text-sky-300 font-mono">{item.machineName || item.machineNumber || 'أجهزة عامة'}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleImportFromLibrary(item)}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all cursor-pointer shadow shrink-0"
                  >
                    {isAr ? '+ إضافة للجدول' : '+ Import'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. TRAINEE ATTENDANCE & CHECK-IN HISTORY MODAL (كشف وسجل حضور وزيارات المتدرب) */}
      {selectedAttendanceMember && renderTraineeAttendanceModal(selectedAttendanceMember)}

      {/* Trainee Workout History & Exercise Log Interactive Preview Modal */}
      {previewHistoryMember && (
        <MemberWorkoutHistoryPreviewModal
          member={previewHistoryMember}
          currentUser={currentUser}
          lang={lang}
          onClose={() => setPreviewHistoryMember(null)}
          onEditProgram={(mem) => {
            setPreviewHistoryMember(null);
            handleOpenRoutineEditor(mem);
          }}
        />
      )}

      {/* Coach Employment & Operational Contract Modal */}
      {isContractModalOpen && (
        <EmployeeContractModal
          currentUser={currentUser}
          lang={lang}
          onClose={() => {
            setIsContractModalOpen(false);
            refreshData();
          }}
        />
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
