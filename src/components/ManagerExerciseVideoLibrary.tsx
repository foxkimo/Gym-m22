import React, { useState, useEffect } from 'react';
import { ExerciseLibraryItem, CurrentUser } from '../types/gym';
import { StorageService } from '../services/storageService';
import { audioAlertService } from '../services/audioService';
import { videoMediaService } from '../services/videoMediaService';
import { ExerciseVideoModal } from './ExerciseVideoModal';
import { 
  Film, 
  Folder, 
  FolderPlus, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Play, 
  Clock, 
  Dumbbell, 
  Tag, 
  Sparkles, 
  CheckCircle2, 
  X, 
  Upload, 
  Link as LinkIcon, 
  Camera, 
  Save, 
  RefreshCw, 
  Layers, 
  Printer, 
  Activity, 
  Info,
  Tv,
  Check
} from 'lucide-react';

interface ManagerExerciseVideoLibraryProps {
  currentUser: CurrentUser;
  lang: 'ar' | 'en';
}

export const ManagerExerciseVideoLibrary: React.FC<ManagerExerciseVideoLibraryProps> = ({
  currentUser,
  lang
}) => {
  const isAr = lang === 'ar';
  const [exercises, setExercises] = useState<ExerciseLibraryItem[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');
  
  // Modal states
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ExerciseLibraryItem | null>(null);
  const [previewVideoItem, setPreviewVideoItem] = useState<ExerciseLibraryItem | null>(null);

  // New folder inline prompt
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const refreshData = () => {
    setExercises(StorageService.getExerciseLibrary());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const folders = StorageService.getExerciseLibraryFolders();

  // Filtered exercises
  const filteredList = exercises.filter(item => {
    if (selectedFolder !== 'all' && item.folderCategory !== selectedFolder) {
      return false;
    }

    if (filterDifficulty !== 'all' && item.difficultyLevel !== filterDifficulty) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const match = 
        item.titleAr.toLowerCase().includes(q) ||
        (item.titleEn && item.titleEn.toLowerCase().includes(q)) ||
        item.targetMuscle.toLowerCase().includes(q) ||
        (item.machineNumber && item.machineNumber.toLowerCase().includes(q)) ||
        (item.machineName && item.machineName.toLowerCase().includes(q)) ||
        item.descriptionAr.toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  });

  const handleDelete = (item: ExerciseLibraryItem) => {
    if (window.confirm(isAr ? `هل أنت متأكد من حذف فيديو التمرين: "${item.titleAr}"؟` : `Delete video "${item.titleAr}"?`)) {
      StorageService.deleteExerciseLibraryItem(item.id, currentUser.nameAr);
      audioAlertService.playDelete();
      refreshData();
      setToastMessage(isAr ? 'تم حذف فيديو التمرين بنجاح' : 'Exercise video deleted');
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleOpenNew = () => {
    setEditingItem({
      id: `vid-lib-${Date.now()}`,
      titleAr: '',
      titleEn: '',
      targetMuscle: 'عضلات الصدر',
      folderCategory: selectedFolder !== 'all' ? selectedFolder : 'مجلد عضلات الصدر',
      descriptionAr: '',
      durationMinutes: 15,
      machineNumber: '',
      machineName: '',
      difficultyLevel: 'beginner',
      videoUrl: '',
      videoType: 'file',
      addedBy: currentUser.nameAr,
      addedByRole: 'manager',
      createdAt: StorageService.getLocalCurrentDateTimeString(),
      targetSets: 4,
      targetReps: '10-12',
      equipment: 'أجهزة وأوزان'
    });
    setIsEditorOpen(true);
  };

  const handleEdit = (item: ExerciseLibraryItem) => {
    setEditingItem({ ...item });
    setIsEditorOpen(true);
  };

  const handleAddFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    const name = newFolderName.trim().startsWith('مجلد') ? newFolderName.trim() : `مجلد ${newFolderName.trim()}`;
    setSelectedFolder(name);
    setNewFolderName('');
    setIsCreatingFolder(false);
    audioAlertService.playSuccess();
  };

  const totalMachines = new Set(exercises.map(e => e.machineNumber).filter(Boolean)).size;

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16">
      {/* 1. EXECUTIVE HEADER BANNER */}
      <div className="bg-gradient-to-br from-[#0c1628] via-[#08101e] to-[#040810] rounded-3xl p-6 border-2 border-amber-500/40 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-[#f7cb55] border-2 border-amber-500/40 flex items-center justify-center font-bold shadow-xl shadow-amber-500/10 shrink-0">
              <Film className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black flex items-center gap-1">
                  <Tv className="w-3 h-3" />
                  <span>{isAr ? 'مكتبة ومجلدات التمارين والأجهزة' : 'Exercise Video Library'}</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30">
                  {isAr ? 'صلاحية المدير العام' : 'General Manager'}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                {isAr ? 'أرشيف ومجلدات فيديوهات تمارين الجيم والأجهزة' : 'Gym Video Library & Station Archive'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {isAr ? 'إضافة وتصنيف فيديوهات شرح الأداء والتكنيك، ربطها بأرقام الأجهزة بالصالة والمدة التقديرية' : 'Manage exercise demonstration videos and gym station mapping'}
              </p>
            </div>
          </div>

          {/* Quick Stat Badges & Action */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-[#091122]/90 px-4 py-2.5 rounded-2xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block">{isAr ? 'إجمالي الفيديوهات' : 'Total Videos'}</span>
              <strong className="text-lg font-black text-amber-400 font-mono block mt-0.5">{exercises.length}</strong>
            </div>

            <div className="bg-[#091122]/90 px-4 py-2.5 rounded-2xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block">{isAr ? 'المجلدات' : 'Folders'}</span>
              <strong className="text-lg font-black text-sky-400 font-mono block mt-0.5">{folders.length}</strong>
            </div>

            <div className="bg-[#091122]/90 px-4 py-2.5 rounded-2xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block">{isAr ? 'أجهزة الصالة' : 'Stations'}</span>
              <strong className="text-lg font-black text-emerald-400 font-mono block mt-0.5">#{totalMachines}</strong>
            </div>

            <button
              type="button"
              onClick={handleOpenNew}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs flex items-center gap-2 shadow-xl shadow-amber-500/20 transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>{isAr ? '+ إضافة فيديو تمرين جديد' : '+ Add Exercise Video'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. INTERACTIVE FOLDERS TABS (نظام المجلدات) */}
      <div className="bg-[#090e1a] p-4 rounded-3xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
            <Folder className="w-4 h-4 text-amber-400" />
            <span>{isAr ? 'مجلدات التمارين حسب المجموعات العضلية والأقسام:' : 'Exercise Category Folders:'}</span>
          </div>

          {!isCreatingFolder ? (
            <button
              type="button"
              onClick={() => setIsCreatingFolder(true)}
              className="text-xs text-sky-400 hover:text-sky-300 font-bold flex items-center gap-1 cursor-pointer"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>{isAr ? '+ إنشاء مجلد جديد' : '+ New Folder'}</span>
            </button>
          ) : (
            <form onSubmit={handleAddFolder} className="flex items-center gap-2">
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder={isAr ? 'اسم المجلد الجديد...' : 'Folder name...'}
                className="bg-[#050810] border border-sky-500/50 rounded-xl px-3 py-1 text-xs text-white focus:outline-none"
                autoFocus
              />
              <button
                type="submit"
                className="p-1 rounded-lg bg-sky-500 text-slate-950 text-xs font-bold px-2"
              >
                {isAr ? 'حفظ' : 'Add'}
              </button>
              <button
                type="button"
                onClick={() => setIsCreatingFolder(false)}
                className="text-slate-400 hover:text-white p-1 text-xs"
              >
                <X className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>

        {/* Folder Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pt-1 pb-1">
          <button
            type="button"
            onClick={() => setSelectedFolder('all')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 shrink-0 transition-all cursor-pointer ${
              selectedFolder === 'all'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-black'
                : 'bg-slate-900/90 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{isAr ? 'جميع المجلدات' : 'All Folders'}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/30 font-mono">
              {exercises.length}
            </span>
          </button>

          {folders.map(folder => {
            const countInFolder = exercises.filter(e => e.folderCategory === folder).length;
            const isSelected = selectedFolder === folder;

            return (
              <button
                key={folder}
                type="button"
                onClick={() => setSelectedFolder(folder)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 shrink-0 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-black'
                    : 'bg-slate-900/90 text-slate-300 hover:text-white border border-slate-800'
                }`}
              >
                <Folder className="w-3.5 h-3.5" />
                <span>{folder}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/30 font-mono">
                  {countInFolder}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. SEARCH & FILTERS BAR */}
      <div className="bg-[#0b0f19] rounded-2xl p-4 border border-slate-800 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute right-3.5 rtl:right-3.5 ltr:left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isAr ? 'ابحث باسم التمرين، رقم الجهاز بالصالة (#12)، العضلة، أو الوصف...' : 'Search by name, machine #, muscle, or description...'}
            className="w-full bg-[#06080f] border border-slate-800 rounded-xl py-2 px-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-400 font-bold shrink-0">{isAr ? 'المستوى:' : 'Level:'}</span>
          <select
            value={filterDifficulty}
            onChange={(e: any) => setFilterDifficulty(e.target.value)}
            className="bg-[#06080f] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-bold focus:outline-none focus:border-amber-500"
          >
            <option value="all">{isAr ? 'جميع المستويات' : 'All Levels'}</option>
            <option value="beginner">{isAr ? 'مبتدئ' : 'Beginner'}</option>
            <option value="intermediate">{isAr ? 'متوسط' : 'Intermediate'}</option>
            <option value="advanced">{isAr ? 'متقدم' : 'Advanced'}</option>
          </select>
        </div>
      </div>

      {/* 4. EXERCISE VIDEOS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredList.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-[#090d16] rounded-3xl border border-slate-800">
            <Film className="w-12 h-12 text-slate-600 mx-auto mb-2" />
            <p className="text-slate-400 font-bold text-sm">
              {isAr ? 'لا توجد تمارين مسجلة في هذا المجلد أو مطابقة للبحث' : 'No exercise videos found'}
            </p>
            <button
              type="button"
              onClick={handleOpenNew}
              className="mt-3 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
            >
              {isAr ? '+ إضافة أول فيديو في هذا المجلد' : '+ Add Video in this Folder'}
            </button>
          </div>
        ) : (
          filteredList.map(item => {
            const hasMachine = !!item.machineNumber;

            return (
              <div
                key={item.id}
                className="bg-[#0b101c] rounded-3xl border border-slate-800 hover:border-amber-500/50 transition-all shadow-xl overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  {/* Top Thumbnail / Video Card Header */}
                  <div className="relative bg-black aspect-video w-full flex items-center justify-center overflow-hidden border-b border-slate-800">
                    <img
                      src={item.thumbnailUrl || item.videoUrl || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500'}
                      alt={item.titleAr}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-70"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-between p-3.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2.5 py-1 rounded-xl bg-amber-500/90 text-slate-950 text-[10px] font-black shadow">
                          {item.folderCategory}
                        </span>

                        {hasMachine && (
                          <span className="px-2.5 py-1 rounded-xl bg-sky-500/90 text-slate-950 text-[11px] font-black font-mono shadow flex items-center gap-1">
                            <Tag className="w-3 h-3" />
                            <span>{isAr ? `جهاز صالة ${item.machineNumber}` : `Station ${item.machineNumber}`}</span>
                          </span>
                        )}
                      </div>

                      {/* Play Button Overlay */}
                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => setPreviewVideoItem(item)}
                          className="w-11 h-11 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center shadow-xl shadow-amber-500/30 transition-transform group-hover:scale-110 active:scale-95 cursor-pointer font-bold"
                          title={isAr ? 'تشغيل ومعاينة الفيديو' : 'Play Video'}
                        >
                          <Play className="w-5 h-5 fill-slate-950 ml-0.5 rtl:ml-0 rtl:mr-0.5" />
                        </button>

                        <div className="flex items-center gap-2 text-[10px] text-white bg-black/70 px-2.5 py-1 rounded-xl backdrop-blur-sm">
                          <Clock className="w-3 h-3 text-amber-400" />
                          <span className="font-mono font-bold">{item.durationMinutes || 15} {isAr ? 'دقيقة' : 'min'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Body Details */}
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="text-sm sm:text-base font-black text-white group-hover:text-amber-300 transition-colors">
                        {item.titleAr}
                      </h3>
                      {item.titleEn && (
                        <p className="text-[11px] text-slate-400 mt-0.5 font-mono">{item.titleEn}</p>
                      )}
                    </div>

                    {/* Machine & Target Muscle Box */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] bg-[#070b14] p-2.5 rounded-2xl border border-slate-800/80">
                      <div>
                        <span className="text-[10px] text-slate-400 block">{isAr ? 'العضلة المستهدفة:' : 'Target Muscle:'}</span>
                        <strong className="text-amber-400 font-bold block truncate">{item.targetMuscle}</strong>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 block">{isAr ? 'الجهاز المستخدم:' : 'Equipment:'}</span>
                        <strong className="text-sky-300 font-bold block truncate font-mono">
                          {item.machineName || item.machineNumber || (isAr ? 'أوزان حرة' : 'Free Weights')}
                        </strong>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed bg-[#080d1a] p-2.5 rounded-xl border border-slate-800/50">
                      {item.descriptionAr}
                    </p>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="p-4 bg-[#080c16] border-t border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setPreviewVideoItem(item)}
                      className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>{isAr ? 'مشاهدة' : 'Play'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleEdit(item)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                      title={isAr ? 'تعديل بيانات التمرين' : 'Edit'}
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(item)}
                    className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-400 transition-colors cursor-pointer"
                    title={isAr ? 'حذف من المكتبة' : 'Delete'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 5. ADD / EDIT VIDEO MODAL */}
      {isEditorOpen && editingItem && (
        <ExerciseVideoEditorModal
          isOpen={isEditorOpen}
          item={editingItem}
          folders={folders}
          onClose={() => {
            setIsEditorOpen(false);
            setEditingItem(null);
          }}
          onSave={(saved) => {
            StorageService.saveExerciseLibraryItem(saved, currentUser.nameAr);
            audioAlertService.playSuccess();
            refreshData();
            setIsEditorOpen(false);
            setEditingItem(null);
            setToastMessage(isAr ? `✓ تم حفظ التمرين (${saved.titleAr}) في ${saved.folderCategory}` : 'Exercise video saved');
            setTimeout(() => setToastMessage(null), 3000);
          }}
          lang={lang}
        />
      )}

      {/* 6. PLAY VIDEO MODAL */}
      {previewVideoItem && (
        <ExerciseVideoModal
          exercise={{
            id: previewVideoItem.id,
            nameAr: previewVideoItem.titleAr,
            nameEn: previewVideoItem.titleEn || previewVideoItem.titleAr,
            targetMuscle: previewVideoItem.targetMuscle,
            targetMuscleEn: previewVideoItem.targetMuscle,
            equipment: previewVideoItem.machineName || previewVideoItem.equipment || 'جهاز صالة',
            sets: previewVideoItem.targetSets || 4,
            reps: previewVideoItem.targetReps || '10-12',
            restSeconds: 60,
            videoUrl: previewVideoItem.videoUrl,
            coachTipsAr: previewVideoItem.descriptionAr,
            videoUploadedBy: previewVideoItem.addedBy
          }}
          isOpen={!!previewVideoItem}
          onClose={() => setPreviewVideoItem(null)}
          lang={lang}
        />
      )}

      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-slate-900 border-2 border-emerald-500/60 text-emerald-300 font-bold text-xs shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

// =============================================================
// SUB-COMPONENT: EXERCISE VIDEO EDITOR MODAL
// =============================================================
interface ExerciseVideoEditorModalProps {
  isOpen: boolean;
  item: ExerciseLibraryItem;
  folders: string[];
  onClose: () => void;
  onSave: (item: ExerciseLibraryItem) => void;
  lang: 'ar' | 'en';
}

const ExerciseVideoEditorModal: React.FC<ExerciseVideoEditorModalProps> = ({
  isOpen,
  item,
  folders,
  onClose,
  onSave,
  lang
}) => {
  const isAr = lang === 'ar';
  
  const [titleAr, setTitleAr] = useState(item.titleAr);
  const [titleEn, setTitleEn] = useState(item.titleEn || '');
  const [targetMuscle, setTargetMuscle] = useState(item.targetMuscle);
  const [folderCategory, setFolderCategory] = useState(item.folderCategory);
  const [descriptionAr, setDescriptionAr] = useState(item.descriptionAr);
  const [durationMinutes, setDurationMinutes] = useState(item.durationMinutes || 15);
  const [machineNumber, setMachineNumber] = useState(item.machineNumber || '');
  const [machineName, setMachineName] = useState(item.machineName || '');
  const [difficultyLevel, setDifficultyLevel] = useState(item.difficultyLevel || 'beginner');
  const [videoUrl, setVideoUrl] = useState(item.videoUrl || '');
  const [videoType, setVideoType] = useState(item.videoType || 'file');
  const [targetSets, setTargetSets] = useState(item.targetSets || 4);
  const [targetReps, setTargetReps] = useState(item.targetReps || '10-12');

  const [activeVideoTab, setActiveVideoTab] = useState<'upload' | 'link' | 'camera'>('upload');
  const [fileName, setFileName] = useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      alert(isAr ? 'يرجى اختيار ملف فيديو صالح' : 'Please select a valid video file');
      return;
    }

    setFileName(file.name);
    try {
      const url = await videoMediaService.saveLocalVideo(item.id, file);
      setVideoUrl(url);
      setVideoType('file');
      audioAlertService.playSuccess();
    } catch {
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      setVideoType('file');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleAr.trim() || !descriptionAr.trim()) {
      alert(isAr ? 'يرجى إدخال اسم التمرين ووصف الأداء' : 'Please fill title and description');
      return;
    }

    onSave({
      ...item,
      titleAr: titleAr.trim(),
      titleEn: titleEn.trim() || undefined,
      targetMuscle: targetMuscle.trim(),
      folderCategory: folderCategory.trim() || 'مجلد عام',
      descriptionAr: descriptionAr.trim(),
      durationMinutes: Number(durationMinutes) || 15,
      machineNumber: machineNumber.trim() || undefined,
      machineName: machineName.trim() || undefined,
      difficultyLevel,
      videoUrl: videoUrl.trim() || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500',
      videoType,
      targetSets: Number(targetSets) || 4,
      targetReps: targetReps.trim() || '10-12'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-3xl bg-[#0a0d16] border-2 border-amber-500/50 rounded-3xl overflow-hidden shadow-2xl relative text-slate-100 flex flex-col max-h-[92vh]"
        dir={isAr ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#141b2c] via-[#0d1524] to-[#0a0d16] border-b border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-[#f7cb55] border border-amber-500/40 flex items-center justify-center font-bold">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white">
                {item.titleAr ? (isAr ? `تعديل فيديو: ${item.titleAr}` : 'Edit Exercise Video') : (isAr ? 'إضافة فيديو تمرين جديد للمكتبة' : 'New Exercise Video')}
              </h3>
              <p className="text-xs text-slate-400">
                {isAr ? 'تخصيص بيانات التمرين، المجلد، رقم الجهاز بالصالة، ووقت التمرين' : 'Specify exercise metadata, folder, gym machine number, and duration'}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Row 1: Exercise Names */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-amber-300 mb-1">
                {isAr ? 'اسم التمرين (بالعربي)*:' : 'Exercise Name (Arabic)*:'}
              </label>
              <input
                type="text"
                required
                value={titleAr}
                onChange={(e) => setTitleAr(e.target.value)}
                placeholder={isAr ? 'مثال: سحب عالي للظهر بالكيبل...' : 'e.g. Lat Pulldown'}
                className="w-full bg-[#070a12] border border-slate-700 rounded-xl p-2.5 text-xs text-white font-bold focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                {isAr ? 'اسم التمرين (بالإنجليزية):' : 'Exercise Name (English):'}
              </label>
              <input
                type="text"
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                placeholder="e.g. Wide Grip Lat Pulldown"
                className="w-full bg-[#070a12] border border-slate-700 rounded-xl p-2.5 text-xs text-white font-bold focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Row 2: Target Muscle & Folder & Difficulty */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                {isAr ? 'المجموعة العضلية (تخص إيه)*:' : 'Target Muscle*:'}
              </label>
              <select
                value={targetMuscle}
                onChange={(e) => setTargetMuscle(e.target.value)}
                className="w-full bg-[#070a12] border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 font-bold focus:border-amber-500 focus:outline-none"
              >
                <option value="عضلات الصدر">عضلات الصدر (Chest)</option>
                <option value="عضلات الظهر">عضلات الظهر (Back)</option>
                <option value="عضلات الأرجل">عضلات الأرجل (Legs)</option>
                <option value="عضلات الأكتاف">عضلات الأكتاف (Shoulders)</option>
                <option value="عضلات البايسبس">عضلات البايسبس (Biceps)</option>
                <option value="عضلات الترايسبس">عضلات الترايسبس (Triceps)</option>
                <option value="تمارين البطن والكور">تمارين البطن والكور (Core)</option>
                <option value="كارديو ولياقة">كارديو ولياقة (Cardio)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-amber-300 mb-1">
                {isAr ? 'المجلد في البرنامج*:' : 'Folder Category*:'}
              </label>
              <select
                value={folderCategory}
                onChange={(e) => setFolderCategory(e.target.value)}
                className="w-full bg-[#070a12] border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 font-bold focus:border-amber-500 focus:outline-none"
              >
                {folders.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                {isAr ? 'مستوى الصعوبة:' : 'Difficulty:'}
              </label>
              <select
                value={difficultyLevel}
                onChange={(e: any) => setDifficultyLevel(e.target.value)}
                className="w-full bg-[#070a12] border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 font-bold focus:border-amber-500 focus:outline-none"
              >
                <option value="beginner">{isAr ? 'مبتدئ (Beginner)' : 'Beginner'}</option>
                <option value="intermediate">{isAr ? 'متوسط (Intermediate)' : 'Intermediate'}</option>
                <option value="advanced">{isAr ? 'متقدم (Advanced)' : 'Advanced'}</option>
              </select>
            </div>
          </div>

          {/* Row 3: Machine Number, Machine Name, and Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-[#070b14] rounded-2xl border border-sky-500/30">
            <div>
              <label className="block text-xs font-black text-sky-400 mb-1 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" />
                <span>{isAr ? 'رقم الجهاز في الصالة*:' : 'Machine Station #*:'}</span>
              </label>
              <input
                type="text"
                value={machineNumber}
                onChange={(e) => setMachineNumber(e.target.value)}
                placeholder={isAr ? 'مثال: #12 أو جهاز 05' : '#12'}
                className="w-full bg-[#04060c] border border-sky-500/40 rounded-xl p-2 text-xs text-white font-mono font-bold text-center focus:border-sky-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                {isAr ? 'اسم الجهاز في الصالة:' : 'Machine Name:'}
              </label>
              <input
                type="text"
                value={machineName}
                onChange={(e) => setMachineName(e.target.value)}
                placeholder={isAr ? 'مثال: جهاز دفع الأرجل 45' : 'Leg Press Machine'}
                className="w-full bg-[#04060c] border border-slate-700 rounded-xl p-2 text-xs text-white font-bold focus:border-sky-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-emerald-400 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{isAr ? 'مدة التمرين التقديرية (دقيقة):' : 'Duration (min):'}</span>
              </label>
              <input
                type="number"
                min={1}
                max={120}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full bg-[#04060c] border border-emerald-500/40 rounded-xl p-2 text-xs text-white font-mono font-bold text-center focus:border-emerald-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Description & Technical Performance Instructions */}
          <div>
            <label className="block text-xs font-bold text-amber-300 mb-1">
              {isAr ? 'وصف التمرين وشرح الأداء والتكنيك بالتفصيل*:' : 'Exercise Description & Form Cues*:'}
            </label>
            <textarea
              required
              rows={3}
              value={descriptionAr}
              onChange={(e) => setDescriptionAr(e.target.value)}
              placeholder={isAr ? 'اكتب خطوات الأداء الصحيحة، وضعية الجذع، التنفس، وكيفية تفادي الإصابات...' : 'Detailed form cues and execution steps...'}
              className="w-full bg-[#070a12] border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none leading-relaxed"
            />
          </div>

          {/* Video Attachment Section */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <label className="block text-xs font-bold text-white flex items-center gap-1.5">
              <Film className="w-4 h-4 text-amber-400" />
              <span>{isAr ? 'فيديو التمرين (رفع من جهازك أو رابط):' : 'Exercise Demonstration Video:'}</span>
            </label>

            {/* Video Input Tabs */}
            <div className="grid grid-cols-2 gap-2 bg-[#06080e] p-1 rounded-2xl border border-slate-800">
              <button
                type="button"
                onClick={() => setActiveVideoTab('upload')}
                className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeVideoTab === 'upload'
                    ? 'bg-amber-500 text-slate-950 font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{isAr ? 'رفع فيديو من جهازي' : 'Upload File'}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveVideoTab('link')}
                className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeVideoTab === 'link'
                    ? 'bg-amber-500 text-slate-950 font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>{isAr ? 'رابط يوتيوب / ويب' : 'Video URL'}</span>
              </button>
            </div>

            {activeVideoTab === 'upload' && (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-amber-500/40 hover:border-amber-400 bg-amber-500/5 hover:bg-amber-500/10 rounded-2xl p-5 text-center cursor-pointer transition-all"
                >
                  <Upload className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                  <strong className="text-xs text-white block">
                    {fileName ? fileName : (isAr ? 'اضغط لاختيار ملف فيديو من الكمبيوتر أو الهاتف' : 'Click to select video file')}
                  </strong>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {isAr ? 'يدعم MP4, WebM, MOV' : 'Supports MP4, WebM, MOV'}
                  </span>
                </div>
              </div>
            )}

            {activeVideoTab === 'link' && (
              <div>
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => {
                    setVideoUrl(e.target.value);
                    setVideoType(e.target.value.includes('youtu') ? 'youtube' : 'link');
                  }}
                  placeholder={isAr ? 'رابط يوتيوب أو رابط مباشر للفيديو...' : 'https://youtube.com/watch?v=...'}
                  className="w-full bg-[#070a12] border border-slate-700 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* Sets & Reps Defaults */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                {isAr ? 'المجموعات المقترحة:' : 'Suggested Sets:'}
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={targetSets}
                onChange={(e) => setTargetSets(Number(e.target.value))}
                className="w-full bg-[#070a12] border border-slate-700 rounded-xl p-2 text-xs text-white font-mono text-center font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                {isAr ? 'التكرارات المقترحة:' : 'Suggested Reps:'}
              </label>
              <input
                type="text"
                value={targetReps}
                onChange={(e) => setTargetReps(e.target.value)}
                placeholder="10-12"
                className="w-full bg-[#070a12] border border-slate-700 rounded-xl p-2 text-xs text-white font-mono text-center font-bold"
              />
            </div>
          </div>

          {/* Footer Save Actions */}
          <div className="p-4 bg-[#080c14] border-t border-slate-800 flex items-center justify-between gap-3 -mx-4 -mb-4 sm:-mx-6 sm:-mb-6 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>{isAr ? 'حفظ وتثبيت التمرين في المجلد' : 'Save Exercise Video'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
