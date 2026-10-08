import React, { useState, useEffect } from 'react';
import { SensitiveModificationLog } from '../types/gym';
import { StorageService } from '../services/storageService';
import { ShieldAlert, Search, Clock, ArrowRight, UserCheck, CheckCircle2, Lock, AlertTriangle, Zap, DollarSign, History } from 'lucide-react';

interface ManagerSensitiveModsProps {
  lang: 'ar' | 'en';
}

export const ManagerSensitiveMods: React.FC<ManagerSensitiveModsProps> = ({ lang }) => {
  const isAr = lang === 'ar';
  const [mods, setMods] = useState<SensitiveModificationLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setMods(StorageService.getSensitiveModifications());
  }, []);

  const filteredMods = mods.filter(m => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      m.titleAr.toLowerCase().includes(q) ||
      m.titleEn.toLowerCase().includes(q) ||
      m.detailsAr.toLowerCase().includes(q) ||
      m.performerName.toLowerCase().includes(q) ||
      (m.targetName || '').toLowerCase().includes(q)
    );
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'price_override': return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
      case 'manual_subscription': return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'data_deletion': return 'text-red-400 bg-red-500/10 border-red-500/30';
      case 'settings_change': return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      case 'balance_adjustment': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'plan_update': return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
      case 'financial_override': return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'price_override': return <DollarSign className="w-3.5 h-3.5" />;
      case 'manual_subscription': return <Zap className="w-3.5 h-3.5" />;
      case 'data_deletion': return <AlertTriangle className="w-3.5 h-3.5" />;
      case 'settings_change': return <Zap className="w-3.5 h-3.5" />;
      case 'balance_adjustment': return <DollarSign className="w-3.5 h-3.5" />;
      case 'plan_update': return <History className="w-3.5 h-3.5" />;
      case 'financial_override': return <ShieldAlert className="w-3.5 h-3.5" />;
      default: return <Clock className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-gradient-to-br from-[#121624] via-[#0a0e1a] to-[#070912] rounded-3xl p-6 border border-rose-500/30 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center shadow-lg">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <span>{isAr ? 'سجل الرقابة على التعديلات الحساسة' : 'Sensitive Modifications Log'}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  {filteredMods.length} {isAr ? 'إجراء حساس' : 'actions'}
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {isAr ? 'مراقبة التعديلات على الأسعار، تمديد الاشتراكات يدوياً، وحذف البيانات المالية' : 'Monitoring price overrides, manual subscription extensions, and financial data deletions'}
              </p>
            </div>
          </div>

          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 rtl:right-3.5 ltr:left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? 'بحث في السجلات الحساسة...' : 'Search sensitive logs...'}
              className="w-full bg-[#080b12] border border-slate-800 rounded-xl py-2 pr-10 pl-4 rtl:pr-10 rtl:pl-4 ltr:pl-10 ltr:pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-[#0c101a] rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right rtl:text-right ltr:text-left text-xs">
            <thead className="bg-[#070a12] text-slate-400 uppercase tracking-wider border-b border-slate-800 font-bold">
              <tr>
                <th className="p-4 w-12 text-center">#</th>
                <th className="p-4">{isAr ? 'التاريخ والوقت' : 'Date / Time'}</th>
                <th className="p-4">{isAr ? 'نوع الإجراء' : 'Action Type'}</th>
                <th className="p-4">{isAr ? 'التفاصيل والهدف' : 'Details & Target'}</th>
                <th className="p-4 text-center">{isAr ? 'التغيير' : 'Change'}</th>
                <th className="p-4">{isAr ? 'القائم بالإجراء والسبب' : 'Performed By & Reason'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredMods.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-500">
                    <ShieldAlert className="w-10 h-10 mx-auto mb-3 opacity-30 text-rose-400" />
                    <p className="font-bold">{isAr ? 'لا توجد إجراءات حساسة مسجلة' : 'No sensitive actions recorded'}</p>
                  </td>
                </tr>
              ) : (
                filteredMods.map((mod, index) => (
                  <tr key={mod.id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="p-4 text-center text-slate-500 font-bold">{index + 1}</td>
                    <td className="p-4 whitespace-nowrap">
                      <div className="font-bold text-slate-200">{mod.date}</div>
                      <div className="text-[11px] text-slate-500">{mod.time}</div>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase ${getCategoryColor(mod.category)}`}>
                        {getCategoryIcon(mod.category)}
                        <span>{mod.category.replace('_', ' ')}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-white mb-0.5">{mod.titleAr}</div>
                      <div className="text-slate-400 text-[11px] max-w-md">{mod.detailsAr}</div>
                      {mod.targetName && (
                        <div className="mt-1 flex items-center gap-1 text-[10px] text-rose-400 font-bold">
                          <Zap className="w-3 h-3" />
                          <span>الهدف: {mod.targetName}</span>
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-center whitespace-nowrap">
                      {(mod.oldValue !== undefined && mod.newValue !== undefined) ? (
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-950 border border-slate-800">
                          <span className="text-rose-400 line-through text-[11px] font-mono">{String(mod.oldValue)}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-500 rtl:rotate-180" />
                          <span className="text-emerald-400 font-bold text-[11px] font-mono">{String(mod.newValue)}</span>
                        </div>
                      ) : (
                        <span className="text-slate-600 font-mono italic">--</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-200">{mod.performerName}</div>
                      <div className="text-slate-400 text-[11px] mt-0.5">{mod.reason || 'إجراء إداري معتمد'}</div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
