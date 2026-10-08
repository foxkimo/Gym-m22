import React, { useRef, useState, useEffect } from 'react';
import { Exercise } from '../types/gym';
import { videoMediaService } from '../services/videoMediaService';
import { 
  X, 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Dumbbell, 
  Sparkles, 
  CheckCircle2, 
  Maximize2,
  UserCheck,
  Film
} from 'lucide-react';

interface ExerciseVideoModalProps {
  exercise: Exercise | null;
  isOpen: boolean;
  onClose: () => void;
  lang: 'ar' | 'en';
}

export const ExerciseVideoModal: React.FC<ExerciseVideoModalProps> = ({
  exercise,
  isOpen,
  onClose,
  lang
}) => {
  const isAr = lang === 'ar';
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const [resolvedVideoUrl, setResolvedVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (exercise && isOpen) {
      setVideoError(false);
      if (exercise.videoUrl) {
        setResolvedVideoUrl(exercise.videoUrl);
      } else {
        // Check IndexedDB
        videoMediaService.getVideoUrl(exercise.id).then(url => {
          if (active && url) {
            setResolvedVideoUrl(url);
          }
        });
      }
    }
    return () => {
      active = false;
    };
  }, [exercise, isOpen]);

  if (!isOpen || !exercise) return null;

  const parsedSource = videoMediaService.parseVideoSource(resolvedVideoUrl || exercise.videoUrl);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const handleRestart = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    videoRef.current.play();
    setIsPlaying(true);
  };

  const handleFullscreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-[#0a0d16] border-2 border-amber-500/40 rounded-3xl overflow-hidden shadow-2xl relative text-slate-100 flex flex-col max-h-[92vh]"
        dir={isAr ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#111726] to-[#0a0d16] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-[#f7cb55] border border-amber-500/40 flex items-center justify-center font-bold">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">{exercise.nameAr}</h3>
                {exercise.videoUploadedBy ? (
                  <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400 text-[10px] font-black border border-sky-500/30 flex items-center gap-1">
                    <UserCheck className="w-3 h-3" />
                    <span>{isAr ? `فيديو الكابتن: ${exercise.videoUploadedBy}` : `By: ${exercise.videoUploadedBy}`}</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold border border-amber-500/30">
                    {isAr ? 'فيديو توضيحي' : 'Demo Video'}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">{exercise.nameEn}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player Container */}
        <div className="relative bg-black aspect-video w-full flex items-center justify-center overflow-hidden group">
          {parsedSource.type === 'youtube' && parsedSource.embedUrl ? (
            <iframe
              src={parsedSource.embedUrl}
              title={exercise.nameAr}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : parsedSource.type === 'vimeo' && parsedSource.embedUrl ? (
            <iframe
              src={parsedSource.embedUrl}
              title={exercise.nameAr}
              className="w-full h-full border-0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          ) : (resolvedVideoUrl || exercise.videoUrl) && !videoError ? (
            <>
              <video
                ref={videoRef}
                src={resolvedVideoUrl || exercise.videoUrl}
                autoPlay
                loop
                muted={isMuted}
                playsInline
                onError={() => setVideoError(true)}
                className="w-full h-full object-contain"
              />

              {/* Overlay Controls */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4">
                <div className="flex justify-between items-center text-xs font-bold text-white">
                  <span className="bg-black/60 px-2.5 py-1 rounded-lg backdrop-blur-sm">
                    {exercise.targetMuscle}
                  </span>
                  <span className="bg-amber-500/80 text-slate-950 px-2.5 py-1 rounded-lg font-black">
                    {exercise.sets} مجموعات × {exercise.reps}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={togglePlay}
                      className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all font-black cursor-pointer"
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={handleRestart}
                      className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-white transition-all cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    <button
                      onClick={toggleMute}
                      className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-white transition-all cursor-pointer"
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                  </div>

                  <button
                    onClick={handleFullscreen}
                    className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-white transition-all cursor-pointer"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="p-8 text-center space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-amber-500/20 text-[#f7cb55] mx-auto flex items-center justify-center animate-pulse">
                <Dumbbell className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-white text-sm">{exercise.nameAr}</h4>
              <p className="text-xs text-slate-400 max-w-sm">
                {exercise.coachTipsAr || (isAr ? 'أداء تمرين احترافي بتركيز عالي وحركة سلسة منتظمة.' : 'Focus on proper form.')}
              </p>
            </div>
          )}
        </div>

        {/* Exercise Details & Execution Coaching */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-2xl bg-[#0e1320] border border-slate-800">
              <span className="block text-[10px] text-slate-400 mb-0.5">{isAr ? 'العضلة المستهدفة' : 'Target Muscle'}</span>
              <strong className="text-amber-400 font-bold">{exercise.targetMuscle}</strong>
            </div>
            <div className="p-2.5 rounded-2xl bg-[#0e1320] border border-slate-800">
              <span className="block text-[10px] text-slate-400 mb-0.5">{isAr ? 'الجهاز / الأداة' : 'Equipment'}</span>
              <strong className="text-white font-bold">{exercise.equipment}</strong>
            </div>
            <div className="p-2.5 rounded-2xl bg-[#0e1320] border border-slate-800">
              <span className="block text-[10px] text-slate-400 mb-0.5">{isAr ? 'الراحة المقترحة' : 'Rest'}</span>
              <strong className="text-emerald-400 font-bold font-mono">{exercise.restSeconds} ثانية</strong>
            </div>
          </div>

          {/* Target Weight if assigned by Coach */}
          {exercise.targetWeightKg && (
            <div className="p-3 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-between text-xs">
              <span className="text-sky-300 font-bold flex items-center gap-1.5">
                <Dumbbell className="w-4 h-4 text-sky-400" />
                <span>{isAr ? 'الوزن المستهدف المحدد من الكابتن:' : 'Target Weight by Coach:'}</span>
              </span>
              <strong className="text-base font-black text-white font-mono">{exercise.targetWeightKg} كجم</strong>
            </div>
          )}

          {/* Coach Execution Guidance */}
          {exercise.coachTipsAr && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-amber-300 font-bold mb-1">
                  {isAr ? 'نصيحة وتوجيهات الكابتن للأداء الصحيح:' : 'Coach Pro Tips:'}
                </strong>
                <p className="leading-relaxed">{exercise.coachTipsAr}</p>
              </div>
            </div>
          )}

          {/* Step-by-Step execution checklist */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{isAr ? 'خطوات تنفيذ التمرين النموذجية:' : 'Form & Execution Steps:'}</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-300">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-[#f7cb55] flex items-center justify-center font-bold text-[10px] shrink-0">1</span>
                <span>الوضعية المبدئية: تثبيت الجذع وشد عضلات البطن Core وضبط المقعد.</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-[#f7cb55] flex items-center justify-center font-bold text-[10px] shrink-0">2</span>
                <span>الحركة السلبية (النزول): التحكم في الوزن لمد 2 إلى 3 ثوانٍ ببطء.</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-[#f7cb55] flex items-center justify-center font-bold text-[10px] shrink-0">3</span>
                <span>الحركة الإيجابية (الدفع/السحب): تفجير القوة مع إخراج الزفير في القمة.</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-[#f7cb55] flex items-center justify-center font-bold text-[10px] shrink-0">4</span>
                <span>الثبات: عصر العضلة المستهدفة لمدة ثانية كاملة لتعظيم الاستفادة.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Close */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow cursor-pointer"
          >
            {isAr ? 'حسناً، فهمت التمرين' : 'Got It, Start Workout'}
          </button>
        </div>
      </div>
    </div>
  );
};
