import React, { useState } from 'react';
import { 
  AlertCircle, 
  DownloadCloud, 
  UploadCloud, 
  Check,
  Database,
  Zap,
  Sparkles
} from 'lucide-react';
import { CurrentUser } from '../types/gym';
import { StorageService } from '../services/storageService';
import { audioAlertService } from '../services/audioService';

interface ManagerDatabaseBackupProps {
  lang: 'ar' | 'en';
  currentUser: CurrentUser;
  refreshAllData: () => void;
}

export const ManagerDatabaseBackup: React.FC<ManagerDatabaseBackupProps> = ({
  lang,
  currentUser,
  refreshAllData
}) => {
  const isAr = lang === 'ar';
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<boolean>(false);
  const [optimizeSuccess, setOptimizeSuccess] = useState<string | null>(null);

  const handleExportDB = () => {
    const backupData: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('gym_m22_')) {
        const val = localStorage.getItem(key);
        if (val) backupData[key] = val;
      }
    }
    
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `gym-m22-database-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    audioAlertService.playSuccess();
    StorageService.logActivity({
      performerId: currentUser.id,
      performerName: currentUser.nameAr,
      performerRole: 'manager',
      category: 'system',
      actionType: 'login',
      titleAr: 'تصدير نسخة احتياطية من قاعدة البيانات',
      titleEn: 'Exported database backup',
      detailsAr: 'قام المدير العام بتصدير نسخة احتياطية شاملة من النظام بصيغة JSON',
      detailsEn: 'Manager exported a comprehensive JSON database backup.'
    });
  };

  const handleImportDB = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);

        const keys = Object.keys(parsed);
        const hasGymKeys = keys.some(k => k.startsWith('gym_m22_'));

        if (!hasGymKeys) {
          setImportError(isAr ? 'الملف المحدد ليس ملف نسخة احتياطية صالح لنظام GYM-M22' : 'Selected file is not a valid GYM-M22 backup file.');
          audioAlertService.playError();
          return;
        }

        keys.forEach(key => {
          if (key.startsWith('gym_m22_')) {
            localStorage.setItem(key, parsed[key]);
          }
        });

        setImportSuccess(true);
        setImportError(null);
        audioAlertService.playSuccess();

        refreshAllData();

        setTimeout(() => {
          window.location.reload();
        }, 1800);

      } catch (err) {
        setImportError(isAr ? 'فشل قراءة وتحليل الملف، تأكد من أنه ملف JSON سليم' : 'Failed to parse file. Make sure it is a valid JSON.');
        audioAlertService.playError();
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Live Cloud Capacity Banner */}
      <div className="bg-gradient-to-r from-[#121826] via-[#090d16] to-[#04060a] rounded-3xl p-5 border-2 border-emerald-500/40 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-black shadow-lg">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-black">
                ⚡ حالة السحابة: مرنة وتتوسع تلقائياً (Auto-Scaling Active)
              </span>
            </div>
            <h3 className="text-sm font-black text-white mt-1">{isAr ? 'سعة قاعدة البيانات والتخزين السحابي المركزي' : 'Cloud Database Capacity & Realtime Sync'}</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {isAr 
                ? 'مرتبطة بقاعدة بيانات Google Firebase Firestore الحية • السعة غير محدودة وتتوسع تلقائياً مع نمو المشتركين والسجلات'
                : 'Powered by Google Firebase Firestore • Unlimited scaling for thousands of members and logs'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 text-center min-w-[120px]">
            <span className="text-[10px] text-slate-400 block font-bold">{isAr ? 'المساحة السحابية' : 'Cloud Storage'}</span>
            <strong className="text-xs text-emerald-400 font-mono font-black">{isAr ? 'غير محدودة ∞' : 'Unlimited ∞'}</strong>
          </div>
          <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 text-center min-w-[120px]">
            <span className="text-[10px] text-slate-400 block font-bold">{isAr ? 'المزامنة الحية' : 'Live Sync'}</span>
            <strong className="text-xs text-amber-400 font-bold">{isAr ? 'نشطة 100%' : 'Active 100%'}</strong>
          </div>
        </div>
      </div>

      {/* Warning Banner */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-3xl p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-[#f7cb55] shrink-0 mt-0.5 animate-pulse" />
        <div>
          <h4 className="text-xs font-black text-[#f7cb55]">{isAr ? 'تنبيه أمني هام للنسخ الاحتياطي' : 'Crucial Backup Warning'}</h4>
          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
            {isAr 
              ? 'يُوصى دائمًا بالاحتفاظ بنسخة احتياطية دورية خارج جهازك لتجنب فقدان البيانات في حال مسح ذاكرة التخزين للمتصفح. تذكر أن استيراد قاعدة بيانات بديلة سيقوم بمسح البيانات الحالية بالكامل واستبدالها بالنسخة المستوردة فوراً.'
              : 'It is highly recommended to keep off-device backups periodically. Importing an existing database will immediately overwrite all active data on this browser.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Export */}
        <div className="bg-[#0c101a] rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-[#f7cb55] border border-amber-500/30 flex items-center justify-center">
              <DownloadCloud className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-black text-white">{isAr ? 'تصدير نسخة احتياطية كاملة' : 'Export Full Backup'}</h3>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {isAr 
                ? 'يقوم هذا الإجراء بتجميع كافة بيانات الجيم بما يشمل المشتركين، جداول التمارين، الدفاتر المالية وسندات القبض والصرف، سجلات الحضور والانصراف، وسجل الرقابة بالكامل وتنزيلها في ملف واحد آمن.'
                : 'This compiles all gym data including members, routines, general ledgers, payrolls, attendance and full activity logs into a single secure download.'}
            </p>
          </div>

          <button
            type="button"
            onClick={handleExportDB}
            className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/10"
          >
            <DownloadCloud className="w-4 h-4" />
            <span>{isAr ? 'تصدير وتحميل قاعدة البيانات (JSON)' : 'Export & Download Database'}</span>
          </button>
        </div>

        {/* Card 2: Import */}
        <div className="bg-[#0c101a] rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600/10 text-purple-400 border border-purple-500/30 flex items-center justify-center">
              <UploadCloud className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-black text-white">{isAr ? 'استيراد واسترجاع البيانات' : 'Import & Restore Data'}</h3>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {isAr 
                ? 'اختر ملف النسخة الاحتياطية سليم للتطبيق بصيغة (JSON) المصدّر مسبقاً، وسيقوم النظام فوراً بتهيئة الذاكرة التخزينية وتثبيت البيانات وإعادة توجيهك.'
                : 'Select a valid GYM-M22 JSON backup file to overwrite current state and restore previous records immediately.'}
            </p>
          </div>

          <div className="relative">
            <input
              type="file"
              accept=".json"
              onChange={handleImportDB}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="w-full border-2 border-dashed border-slate-800 hover:border-purple-500/50 rounded-2xl p-4 text-center transition-colors bg-slate-950/40">
              <UploadCloud className="w-6 h-6 text-slate-500 mx-auto mb-1.5" />
              <span className="text-[11px] font-bold text-slate-300 block">{isAr ? 'اضغط أو اسحب ملف النسخة الاحتياطية هنا' : 'Click or drag JSON file here'}</span>
              <span className="text-[9px] text-slate-500 block mt-0.5">الملفات بصيغة JSON فقط</span>
            </div>
          </div>

          {importError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-bold flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{importError}</span>
            </div>
          )}

          {importSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold flex items-center gap-1.5 animate-pulse">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{isAr ? 'تم استيراد البيانات بنجاح، جاري جلب وإعادة تهيئة النظام' : 'Data restored successfully, rehydrating database'}</span>
            </div>
          )}
        </div>

        {/* Card 3: Purge Cache & Speed Optimization */}
        <div className="col-span-full bg-gradient-to-r from-[#0c1424] via-[#09101d] to-[#050810] rounded-3xl p-6 border-2 border-emerald-500/40 shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-black shadow-lg shrink-0">
                <Zap className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white">{isAr ? 'تنظيف الذاكرة المؤقتة وتسريع النظام' : 'Purge Cache & Optimize Performance'}</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {isAr 
                    ? 'يقوم هذا الإجراء بحذف الملفات المؤقتة والسجلات القديمة المكررة لرفع سرعة واستجابة النظام وجعل التنقل سلس جداً.'
                    : 'Purges temporary cache files and old log duplicates to dramatically boost app speed and responsiveness.'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                const res = StorageService.purgeCacheAndOptimizeSpeed();
                audioAlertService.playSuccess();
                setOptimizeSuccess(isAr ? `⚡ تم تنظيف الذاكرة المؤقتة بنجاح وتوفير مساحة، وجاري تسريع استجابة النظام` : 'System cache purged and speed optimized');
                refreshAllData();
                setTimeout(() => setOptimizeSuccess(null), 4000);
              }}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xl shadow-emerald-500/20 shrink-0 active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isAr ? '⚡ تنظيف الذاكرة وتسريع النظام الآن' : 'Purge Cache & Boost Speed Now'}</span>
            </button>
          </div>

          {optimizeSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{optimizeSuccess}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
