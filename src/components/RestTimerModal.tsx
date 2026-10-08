import React, { useState, useEffect } from 'react';
import { audioAlertService } from '../services/audioService';
import { X, Play, Pause, RotateCcw, Timer, Plus, Minus, Sparkles } from 'lucide-react';

interface RestTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSeconds?: number;
  lang: 'ar' | 'en';
}

export const RestTimerModal: React.FC<RestTimerModalProps> = ({
  isOpen,
  onClose,
  initialSeconds = 60,
  lang
}) => {
  const isAr = lang === 'ar';
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [targetDuration, setTargetDuration] = useState(initialSeconds);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 4 && t > 1) {
            audioAlertService.playTimerCountdown();
          }
          if (t <= 1) {
            audioAlertService.playTimerFinished();
            setIsRunning(false);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft]);

  const handleReset = (secs: number) => {
    setTargetDuration(secs);
    setTimeLeft(secs);
    setIsRunning(true);
    audioAlertService.playBeep(659.25, 0.1);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progressPercent = ((targetDuration - timeLeft) / targetDuration) * 100;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xs sm:max-w-sm rounded-3xl bg-gradient-to-b from-[#121724] via-[#0b101c] to-[#07090e] border-2 border-amber-500/50 p-6 text-slate-100 shadow-2xl relative text-center"
        dir={isAr ? 'rtl' : 'ltr'}
      >
        <button
          onClick={onClose}
          className="absolute top-4 left-4 rtl:left-4 rtl:right-auto ltr:right-4 ltr:left-auto p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/60"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center justify-center gap-2 mb-2">
          <Timer className="w-5 h-5 text-amber-400" />
          <h3 className="text-base font-black text-white">
            {isAr ? 'مؤقت الراحة بين المجموعات' : 'Rest Timer'}
          </h3>
        </div>
        <p className="text-[11px] text-slate-400 mb-6">
          {isAr ? 'استعد للمجموعة القادمة بأفضل استشفاء عضلي' : 'Recover for the next set'}
        </p>

        {/* Circular Dial / Digital Countdown */}
        <div className="relative w-44 h-44 mx-auto mb-6 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="88"
              cy="88"
              r="76"
              className="stroke-slate-800"
              strokeWidth="10"
              fill="transparent"
            />
            <circle
              cx="88"
              cy="88"
              r="76"
              className="stroke-amber-500 transition-all duration-300 ease-linear"
              strokeWidth="10"
              strokeDasharray="477"
              strokeDashoffset={477 - (477 * progressPercent) / 100}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-black font-mono text-white tracking-wider">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
            <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider mt-1">
              {timeLeft === 0 ? (isAr ? 'انتهت الراحة - ابدأ 💪' : 'GO') : (isRunning ? (isAr ? 'استراحة...' : 'Resting') : (isAr ? 'متوقف' : 'Paused'))}
            </span>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="grid grid-cols-4 gap-1.5 mb-6">
          {[30, 60, 90, 120].map(s => (
            <button
              key={s}
              onClick={() => handleReset(s)}
              className={`py-2 rounded-xl text-xs font-mono font-bold border transition-all ${
                targetDuration === s ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
              }`}
            >
              {s}s
            </button>
          ))}
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`flex-1 py-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 ${
              isRunning ? 'bg-rose-600 hover:bg-rose-500 text-white' : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950'
            }`}
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isRunning ? (isAr ? 'إيقاف مؤقت' : 'Pause') : (isAr ? 'بدء المؤقت' : 'Start')}</span>
          </button>

          <button
            onClick={() => handleReset(targetDuration)}
            className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title={isAr ? 'إعادة ضبط' : 'Reset'}
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
