import React, { useState, useRef, useEffect } from 'react';
import { Exercise } from '../types/gym';
import { videoMediaService } from '../services/videoMediaService';
import { audioAlertService } from '../services/audioService';
import { 
  X, 
  Upload, 
  Video, 
  Link as LinkIcon, 
  Camera, 
  Play, 
  Pause, 
  CheckCircle2, 
  Trash2, 
  Sparkles, 
  Dumbbell, 
  RefreshCw,
  AlertCircle,
  Save,
  Check,
  Film
} from 'lucide-react';

interface ExerciseVideoUploaderModalProps {
  exercise: Exercise | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedExercise: Exercise) => void;
  coachName: string;
  lang: 'ar' | 'en';
}

export const ExerciseVideoUploaderModal: React.FC<ExerciseVideoUploaderModalProps> = ({
  exercise,
  isOpen,
  onClose,
  onSave,
  coachName,
  lang
}) => {
  const isAr = lang === 'ar';
  
  const [activeTab, setActiveTab] = useState<'upload' | 'link' | 'camera'>('upload');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoType, setVideoType] = useState<'file' | 'youtube' | 'vimeo' | 'link'>('file');
  const [coachTips, setCoachTips] = useState('');
  const [targetWeight, setTargetWeight] = useState<number | undefined>(undefined);
  const [sets, setSets] = useState(4);
  const [reps, setReps] = useState('10-12');
  
  // Local file upload state
  const [selectedFileName, setSelectedFileName] = useState('');
  const [selectedFileSize, setSelectedFileSize] = useState('');
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Live Camera recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const liveVideoRef = useRef<HTMLVideoElement>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const timerRef = useRef<any>(null);

  // Load initial exercise values
  useEffect(() => {
    if (exercise) {
      setVideoUrl(exercise.videoUrl || '');
      setVideoType(exercise.videoType || (exercise.videoUrl?.includes('youtube') || exercise.videoUrl?.includes('youtu.be') ? 'youtube' : 'file'));
      setCoachTips(exercise.coachTipsAr || '');
      setTargetWeight(exercise.targetWeightKg);
      setSets(exercise.sets || 4);
      setReps(exercise.reps || '10-12');
      setPreviewBlobUrl(exercise.videoUrl || null);
      setSelectedFileName(exercise.videoUrl ? 'فيديو تمرين محفوظ' : '');
    }
  }, [exercise, isOpen]);

  // Clean up camera stream on close
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  if (!isOpen || !exercise) return null;

  // Handle local video file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      alert(isAr ? 'يرجى اختيار ملف فيديو صالح (MP4, WebM, MOV)' : 'Please select a valid video file');
      return;
    }

    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    setSelectedFileName(file.name);
    setSelectedFileSize(`${sizeMb} MB`);

    try {
      // Save locally to IndexedDB and get blob URL
      const savedUrl = await videoMediaService.saveLocalVideo(exercise.id, file);
      setPreviewBlobUrl(savedUrl);
      setVideoUrl(savedUrl);
      setVideoType('file');
      audioAlertService.playSuccess();
    } catch (err) {
      console.error('Error saving local video:', err);
      const url = URL.createObjectURL(file);
      setPreviewBlobUrl(url);
      setVideoUrl(url);
      setVideoType('file');
    }
  };

  // Start Camera
  const startCamera = async () => {
    try {
      stopCamera();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: true
      });
      setCameraStream(stream);
      if (liveVideoRef.current) {
        liveVideoRef.current.srcObject = stream;
        liveVideoRef.current.play();
      }
    } catch (err) {
      console.error('Camera access error:', err);
      alert(isAr ? 'تعذر فتح الكاميرا. يرجى التحقق من صلاحيات المتصفح.' : 'Unable to access camera');
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setIsRecording(false);
  };

  // Start Recording from Camera
  const startRecording = () => {
    if (!cameraStream) return;
    const chunks: Blob[] = [];
    setRecordedChunks([]);
    setRecordingSeconds(0);

    try {
      const recorder = new MediaRecorder(cameraStream, { mimeType: 'video/webm;codecs=vp8,opus' });
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const savedUrl = await videoMediaService.saveLocalVideo(exercise.id, blob);
        setPreviewBlobUrl(savedUrl);
        setVideoUrl(savedUrl);
        setVideoType('file');
        setSelectedFileName(`تسجيل_مباشر_${new Date().toLocaleTimeString('ar-EG')}.webm`);
        setSelectedFileSize(`${(blob.size / (1024 * 1024)).toFixed(1)} MB`);
        stopCamera();
        audioAlertService.playSuccess();
      };

      recorder.start(500);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);

      timerRef.current = setInterval(() => {
        setRecordingSeconds(s => s + 1);
      }, 1000);

      audioAlertService.playBeep(880, 0.1);
    } catch (err) {
      console.error('Recording start error:', err);
    }
  };

  // Stop Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  // Handle Save
  const handleSave = () => {
    const updated: Exercise = {
      ...exercise,
      videoUrl: videoUrl.trim() || undefined,
      videoType: videoType,
      videoUploadedBy: coachName,
      videoUploadedAt: new Date().toISOString(),
      coachTipsAr: coachTips.trim() || undefined,
      targetWeightKg: targetWeight ? Number(targetWeight) : undefined,
      sets: Number(sets) || 4,
      reps: reps.trim() || '10-12'
    };

    onSave(updated);
    audioAlertService.playSuccess();
    onClose();
  };

  const parsedSource = videoMediaService.parseVideoSource(videoUrl);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-[#0a0d16] border-2 border-sky-500/50 rounded-3xl overflow-hidden shadow-2xl relative text-slate-100 flex flex-col max-h-[92vh]"
        dir={isAr ? 'rtl' : 'ltr'}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#0c1628] via-[#0d1c33] to-[#0a0d16] border-b border-sky-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/40 flex items-center justify-center font-bold">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">{exercise.nameAr}</h3>
                <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400 text-[10px] font-black border border-sky-500/30">
                  {isAr ? 'إرفاق فيديو توضيحي' : 'Attach Coach Video'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {isAr ? `تخصيص الفيديو والتوجيهات الفنية للاعب بواسطة: ${coachName}` : `Customized by: ${coachName}`}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* Method Selection Tabs */}
          <div className="grid grid-cols-3 gap-2 bg-[#06080e] p-1.5 rounded-2xl border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setActiveTab('upload');
                stopCamera();
              }}
              className={`py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'upload'
                  ? 'bg-sky-500 text-slate-950 shadow-lg shadow-sky-500/20 font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>{isAr ? 'رفع من جهازي' : 'Upload File'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('link');
                stopCamera();
              }}
              className={`py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'link'
                  ? 'bg-sky-500 text-slate-950 shadow-lg shadow-sky-500/20 font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LinkIcon className="w-4 h-4" />
              <span>{isAr ? 'رابط يوتيوب / ويب' : 'Video Link'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('camera');
                startCamera();
              }}
              className={`py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'camera'
                  ? 'bg-sky-500 text-slate-950 shadow-lg shadow-sky-500/20 font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>{isAr ? 'تصوير بالكاميرا' : 'Live Camera'}</span>
            </button>
          </div>

          {/* TAB 1: UPLOAD FROM DEVICE */}
          {activeTab === 'upload' && (
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-sky-500/40 hover:border-sky-400 bg-sky-500/5 hover:bg-sky-500/10 rounded-2xl p-6 text-center cursor-pointer transition-all group"
              >
                <div className="w-14 h-14 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/30 mx-auto flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Upload className="w-7 h-7" />
                </div>
                <h4 className="font-black text-white text-sm">
                  {isAr ? 'اضغط لاختيار فيديو التمرين من هاتفك أو جهازك' : 'Click to select video from device'}
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  {isAr ? 'يدعم صيغ MP4, MOV, WebM (فيديو الأداء الصحيح من الكابتن)' : 'Supports MP4, MOV, WebM'}
                </p>
              </div>

              {selectedFileName && (
                <div className="p-3 bg-[#0d1424] rounded-xl border border-sky-500/30 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-sky-300 truncate">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="font-bold truncate">{selectedFileName}</span>
                    {selectedFileSize && <span className="text-slate-400">({selectedFileSize})</span>}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewBlobUrl(null);
                      setVideoUrl('');
                      setSelectedFileName('');
                    }}
                    className="text-rose-400 hover:text-rose-300 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: EXTERNAL LINK / YOUTUBE */}
          {activeTab === 'link' && (
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-300">
                {isAr ? 'رابط الفيديو (YouTube Shorts / YouTube Video / Direct MP4 URL):' : 'Video Link:'}
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => {
                    setVideoUrl(e.target.value);
                    setVideoType(e.target.value.includes('youtu') ? 'youtube' : 'link');
                    setPreviewBlobUrl(e.target.value);
                  }}
                  placeholder={isAr ? 'مثال: https://www.youtube.com/watch?v=... أو شورتس' : 'https://youtube.com/...'}
                  className="w-full bg-[#0e1320] border border-slate-700 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 pl-10"
                />
                <LinkIcon className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
              </div>
              <p className="text-[11px] text-slate-400">
                {isAr ? '💡 يمكنك نسخ رابط أي شورتس أو فيديو توضيحي من يوتيوب وسيتم تضمينه وتشغيله مباشرة للمتدرب.' : 'You can paste YouTube shorts or video links.'}
              </p>
            </div>
          )}

          {/* TAB 3: LIVE CAMERA RECORDING */}
          {activeTab === 'camera' && (
            <div className="space-y-3">
              <div className="relative bg-black aspect-video rounded-2xl overflow-hidden border border-sky-500/40 flex items-center justify-center">
                <video
                  ref={liveVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />

                {isRecording && (
                  <div className="absolute top-3 right-3 flex items-center gap-2 bg-rose-600/90 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                    <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
                    <span>{isAr ? `جاري التسجيل (${recordingSeconds} ث)` : `Recording (${recordingSeconds}s)`}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-center gap-3">
                {!isRecording ? (
                  <button
                    type="button"
                    onClick={startRecording}
                    className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
                  >
                    <span className="w-3 h-3 rounded-full bg-white"></span>
                    <span>{isAr ? 'بدء تسجيل التمرين' : 'Start Recording'}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-rose-500 text-rose-400 text-xs font-black flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <span className="w-3 h-3 bg-rose-500"></span>
                    <span>{isAr ? 'إيقاف وحفظ التسجيل' : 'Stop & Save'}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={startCamera}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>{isAr ? 'إعادة تشغيل الكاميرا' : 'Restart Camera'}</span>
                </button>
              </div>
            </div>
          )}

          {/* VIDEO LIVE PREVIEW BOX */}
          {videoUrl && (
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                <Play className="w-3.5 h-3.5" />
                <span>{isAr ? 'معاينة الفيديو للتأكد قبل الاعتماد:' : 'Video Preview:'}</span>
              </span>

              <div className="relative bg-black rounded-2xl overflow-hidden aspect-video border border-slate-700 max-h-56 mx-auto">
                {parsedSource.type === 'youtube' && parsedSource.embedUrl ? (
                  <iframe
                    src={parsedSource.embedUrl}
                    title="Exercise Preview"
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={videoUrl}
                    controls
                    playsInline
                    className="w-full h-full object-contain"
                  />
                )}
              </div>
            </div>
          )}

          {/* COACH TECHNICAL TIPS & TARGET WEIGHT */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <div>
              <label className="block text-xs font-bold text-amber-300 mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{isAr ? 'توجيهات ونصائح الكابتن الفنية للاعب أثناء الأداء:' : 'Coach Technical Tips:'}</span>
              </label>
              <textarea
                value={coachTips}
                onChange={(e) => setCoachTips(e.target.value)}
                rows={2}
                placeholder={isAr ? 'مثال: التركيز على فرد الذراعين ببطء، والتنفس مع كل عدة، وتجنب تقوس الظهر.' : 'Keep back straight...'}
                className="w-full bg-[#0e1320] border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  {isAr ? 'المجموعات (Sets)' : 'Sets'}
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={sets}
                  onChange={(e) => setSets(Number(e.target.value))}
                  className="w-full bg-[#0e1320] border border-slate-700 rounded-xl p-2.5 text-xs text-white font-mono text-center font-bold focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  {isAr ? 'التكرار (Reps)' : 'Reps'}
                </label>
                <input
                  type="text"
                  value={reps}
                  onChange={(e) => setReps(e.target.value)}
                  placeholder="10-12"
                  className="w-full bg-[#0e1320] border border-slate-700 rounded-xl p-2.5 text-xs text-white font-mono text-center font-bold focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  {isAr ? 'الوزن المقترح (كجم)' : 'Target Wt (kg)'}
                </label>
                <input
                  type="number"
                  min={0}
                  step={0.5}
                  value={targetWeight || ''}
                  onChange={(e) => setTargetWeight(e.target.value ? Number(e.target.value) : undefined)}
                  placeholder={isAr ? 'اختياري' : 'Optional'}
                  className="w-full bg-[#0e1320] border border-slate-700 rounded-xl p-2.5 text-xs text-white font-mono text-center font-bold focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#0a0d16] border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
          >
            {isAr ? 'إلغاء' : 'Cancel'}
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-sky-500/20 transition-all cursor-pointer hover:scale-105 active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>{isAr ? 'حفظ وإرفاق الفيديو للاعب' : 'Save & Attach Video'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
