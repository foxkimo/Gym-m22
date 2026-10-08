import React, { useState, useEffect } from 'react';
import { DeletedRecordItem } from '../types/gym';
import { StorageService } from '../services/storageService';
import { pdfPrintService } from '../services/pdfPrintService';
import { audioAlertService } from '../services/audioService';
import { 
  Trash2, 
  RotateCcw, 
  Search, 
  Printer, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  User, 
  DollarSign, 
  Dumbbell, 
  Clock, 
  X, 
  Eye,
  Sparkles,
  RefreshCw
} from 'lucide-react';

interface ManagerRecycleBinProps {
  lang: 'ar' | 'en';
  currentManagerName?: string;
  onRecordRestored?: () => void;
}

const getDefaultManagerName = () => {
  try {
    const saved = typeof window !== 'undefined' ? sessionStorage.getItem('gym_m22_current_user') : null;
    if (saved) {
      const u = JSON.parse(saved);
      if (u && u.nameAr) return `${u.nameAr} (المدير العام)`;
    }
  } catch (e) {}
  return 'المدير العام';
};

export const ManagerRecycleBin: React.FC<ManagerRecycleBinProps> = ({ 
  lang,
  currentManagerName = getDefaultManagerName(),
  onRecordRestored
}) => {
  const isAr = lang === 'ar';
  const [deletedRecords, setDeletedRecords] = useState<DeletedRecordItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [previewRecord, setPreviewRecord] = useState<DeletedRecordItem | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const refreshRecords = () => {
    setDeletedRecords(StorageService.getDeletedRecords());
  };

  useEffect(() => {
    refreshRecords();
  }, []);

  const filteredRecords = deletedRecords.filter(rec => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = rec.titleAr.toLowerCase().includes(q) || rec.titleEn.toLowerCase().includes(q);
      const matchId = rec.identifier.toLowerCase().includes(q);
      const matchBy = rec.deletedBy.toLowerCase().includes(q);
      const matchReason = (rec.reason || '').toLowerCase().includes(q);
      if (!matchTitle && !matchId && !matchBy && !matchReason) return false;
    }

    if (selectedType !== 'all' && rec.itemType !== selectedType) return false;

    return true;
  });

  const handleRestore = (record: DeletedRecordItem) => {
    if (!confirm(isAr ? `هل أنت متأكد من استرجاع: "${record.titleAr}" إلى النظام النشط؟` : `Restore "${record.titleEn}"?`)) {
      return;
    }

    const success = StorageService.restoreDeletedRecord(record.id, currentManagerName);
    if (success) {
      audioAlertService.playSuccess();
      setSuccessMessage(isAr ? `تم استرجاع "${record.titleAr}" بنجاح` : `Restored successfully`);
      setTimeout(() => setSuccessMessage(null), 3000);
      refreshRecords();
      if (onRecordRestored) onRecordRestored();
    } else {
      alert(isAr ? 'عذراً، تعذر استرجاع هذا السجل.' : 'Failed to restore record.');
    }
  };

  const handlePurge = (record: DeletedRecordItem) => {
    if (!confirm(isAr ? `⚠️ تحذير: سيتم حذف "${record.titleAr}" نهائياً من قاعدة البيانات ولا يمكن استرجاعه بعد ذلك. متابعة؟` : `Permanent delete "${record.titleEn}"?`)) {
      return;
    }

    StorageService.purgeDeletedRecord(record.id);
    audioAlertService.playDelete();
    refreshRecords();
  };

  const handleExportPDF = () => {
    audioAlertService.playSuccess();
    pdfPrintService.printRecycleBinPDF(filteredRecords, currentManagerName);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'member':
        return <User className="w-4 h-4 text-sky-400" />;
      case 'coach':
      case 'staff':
        return <Dumbbell className="w-4 h-4 text-amber-400" />;
      case 'transaction':
        return <DollarSign className="w-4 h-4 text-emerald-400" />;
      default:
        return <Trash2 className="w-4 h-4 text-rose-400" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="bg-gradient-to-br from-[#190d11] via-[#100a0d] to-[#07090e] rounded-3xl p-6 border border-rose-500/30 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center shadow-lg">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <span>{isAr ? 'سجل وسلة المحذوفات القابلة للاسترجاع' : 'Recycle Bin & Deleted Archives'}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40">
                  {filteredRecords.length} {isAr ? 'عنصر محذوف' : 'deleted items'}
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {isAr ? 'حماية فائقة من الحذف الخاطئ - إمكانية استعادة المشتركين والحسابات فوراً بكامل بياناتها السابقة' : 'Fail-safe data recovery - instantly restore deleted members, coaches, or staff'}
              </p>
            </div>
          </div>

          {/* Export & PDF Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={refreshRecords}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title={isAr ? 'تحديث السجل' : 'Refresh'}
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Official PDF Export Button */}
            <button
              onClick={handleExportPDF}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-rose-600/20 transition-all active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>{isAr ? 'تصدير وطباعة تقرير المحذوفات PDF' : 'Export Deleted Records PDF'}</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 rtl:right-3.5 ltr:left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? 'بحث بالاسم، رقم العضوية، أو سبب الحذف...' : 'Search deleted items...'}
              className="w-full bg-[#080b12] border border-slate-800 rounded-xl py-2.5 pr-10 pl-4 rtl:pr-10 rtl:pl-4 ltr:pl-10 ltr:pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
            />
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-[#080b12] border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
          >
            <option value="all">{isAr ? 'جميع أنواع العناصر المحذوفة' : 'All Deleted Types'}</option>
            <option value="member">{isAr ? 'المشتركين والأعضاء' : 'Gym Members'}</option>
            <option value="coach">{isAr ? 'الكباتن والمدربين' : 'Coaches'}</option>
            <option value="staff">{isAr ? 'طاقم الاستقبال' : 'Staff'}</option>
            <option value="transaction">{isAr ? 'المعاملات المالية' : 'Transactions'}</option>
          </select>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Deleted Items Table */}
      <div className="bg-[#0c101a] rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right rtl:text-right ltr:text-left text-xs">
            <thead className="bg-[#070a12] text-slate-400 uppercase tracking-wider border-b border-slate-800 font-bold">
              <tr>
                <th className="p-4 w-12 text-center">#</th>
                <th className="p-4">{isAr ? 'العنصر / الاسم' : 'Item / Name'}</th>
                <th className="p-4">{isAr ? 'المعرف / الهاتف' : 'Identifier'}</th>
                <th className="p-4">{isAr ? 'تاريخ الحذف' : 'Deleted Date'}</th>
                <th className="p-4">{isAr ? 'القائم بالحذف والسبب' : 'Deleted By & Reason'}</th>
                <th className="p-4 text-center">{isAr ? 'الإجراءات والاسترجاع' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-500">
                    <Trash2 className="w-10 h-10 mx-auto mb-3 opacity-30 text-rose-500" />
                    <p className="font-bold">{isAr ? 'سلة المحذوفات فارغة حالياً' : 'Recycle bin is empty'}</p>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record, index) => (
                  <tr key={record.id} className="hover:bg-slate-900/60 transition-colors group">
                    <td className="p-4 text-center text-slate-500 font-bold">{index + 1}</td>
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center shrink-0">
                          {getTypeIcon(record.itemType)}
                        </div>
                        <div>
                          <div className="font-bold text-white group-hover:text-rose-300 transition-colors">
                            {record.titleAr}
                          </div>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30 uppercase font-bold">
                            {record.itemType}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className="font-mono text-slate-300 font-semibold">{record.identifier}</span>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <div className="text-slate-300 font-medium">{record.deletedAt}</div>
                    </td>
                    <td className="p-4 max-w-xs">
                      <div className="font-bold text-slate-200">{record.deletedBy}</div>
                      <div className="text-rose-400 text-[11px] truncate mt-0.5">{record.reason || 'إجراء إداري'}</div>
                    </td>
                    <td className="p-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        {/* Snapshot Details */}
                        <button
                          onClick={() => setPreviewRecord(record)}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                          title={isAr ? 'معاينة بيانات النسخة المحفوظة' : 'View Snapshot'}
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* One-click Restore */}
                        {record.canRestore && (
                          <button
                            onClick={() => handleRestore(record)}
                            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-700/20 transition-all active:scale-95"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>{isAr ? 'استرجاع فوري' : 'Restore'}</span>
                          </button>
                        )}

                        {/* Permanent Purge */}
                        <button
                          onClick={() => handlePurge(record)}
                          className="p-2 rounded-xl bg-rose-950/40 hover:bg-rose-900 border border-rose-800/40 text-rose-400 hover:text-white transition-colors"
                          title={isAr ? 'حذف نهائي بدون استرجاع' : 'Permanent Purge'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Snapshot Preview Modal */}
      {previewRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-[#0e1320] border border-rose-500/40 p-6 text-slate-100 shadow-2xl relative">
            <button
              onClick={() => setPreviewRecord(null)}
              className="absolute top-4 left-4 rtl:left-4 rtl:right-auto ltr:right-4 ltr:left-auto p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/60"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{previewRecord.titleAr}</h3>
                <span className="text-xs text-slate-400">{previewRecord.identifier}</span>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs font-mono text-slate-300 max-h-60 overflow-y-auto">
              <pre className="whitespace-pre-wrap">{JSON.stringify(previewRecord.snapshotData, null, 2)}</pre>
            </div>

            <div className="mt-5 flex gap-2">
              {previewRecord.canRestore && (
                <button
                  onClick={() => {
                    const rec = previewRecord;
                    setPreviewRecord(null);
                    handleRestore(rec);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>{isAr ? 'استرجاع السجل الآن' : 'Restore Now'}</span>
                </button>
              )}
              <button
                onClick={() => setPreviewRecord(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
              >
                {isAr ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
