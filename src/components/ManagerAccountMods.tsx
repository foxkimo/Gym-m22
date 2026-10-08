import React, { useState, useEffect } from 'react';
import { AccountModificationLog } from '../types/gym';
import { StorageService } from '../services/storageService';
import { ShieldCheck, Search, Clock, ArrowRight, UserCheck, CheckCircle2, Lock } from 'lucide-react';

interface ManagerAccountModsProps {
  lang: 'ar' | 'en';
}

export const ManagerAccountMods: React.FC<ManagerAccountModsProps> = ({ lang }) => {
  const isAr = lang === 'ar';
  const [mods, setMods] = useState<AccountModificationLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setMods(StorageService.getAccountModifications());
  }, []);

  const filteredMods = mods.filter(m => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      m.targetName.toLowerCase().includes(q) ||
      m.fieldNameAr.toLowerCase().includes(q) ||
      m.changedBy.toLowerCase().includes(q) ||
      (m.reasonAr || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-gradient-to-br from-[#121624] via-[#0a0e1a] to-[#070912] rounded-3xl p-6 border border-purple-500/30 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/40 flex items-center justify-center shadow-lg">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <span>{isAr ? 'سجل الرقابة على تعديلات الحسابات والخصومات' : 'Account Overrides & Modifications Log'}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  {filteredMods.length} {isAr ? 'تعديل موثق' : 'mods'}
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {isAr ? 'مراقبة التعديل على أسعار الاشتراكات، الخصومات الاستثنائية، تجميد الحسابات، والأكواد السرية' : 'Audit trail for price adjustments, manual discounts, and security codes'}
              </p>
            </div>
          </div>

          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 rtl:right-3.5 ltr:left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? 'بحث في التعديلات...' : 'Search modifications...'}
              className="w-full bg-[#080b12] border border-slate-800 rounded-xl py-2 pr-10 pl-4 rtl:pr-10 rtl:pl-4 ltr:pl-10 ltr:pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
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
                <th className="p-4">{isAr ? 'الحساب المستهدف' : 'Target Account'}</th>
                <th className="p-4">{isAr ? 'الحقل المعدل' : 'Field Modified'}</th>
                <th className="p-4 text-center">{isAr ? 'القيمة السابقة ➔ الجديدة' : 'Old ➔ New'}</th>
                <th className="p-4">{isAr ? 'القائم بالتعديل والسبب' : 'Changed By & Reason'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredMods.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-500">
                    <ShieldCheck className="w-10 h-10 mx-auto mb-3 opacity-30 text-purple-400" />
                    <p className="font-bold">{isAr ? 'لا توجد تعديلات حسابات مسجلة' : 'No account modification logs'}</p>
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
                      <div className="font-bold text-white">{mod.targetName}</div>
                      <span className="text-[10px] text-purple-400 uppercase font-mono">{mod.targetType}</span>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-bold text-[11px]">
                        {mod.fieldNameAr}
                      </span>
                    </td>
                    <td className="p-4 text-center whitespace-nowrap">
                      {mod.fieldName === 'password' || mod.fieldName === 'accessCode' || mod.fieldName === 'passwordPin' || mod.fieldNameAr?.includes('مرور') || mod.fieldNameAr?.includes('سري') ? (
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-950 border border-slate-800">
                          <span className="text-rose-400 font-mono tracking-widest text-xs">••••••••</span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-500 rtl:rotate-180" />
                          <span className="text-emerald-400 font-mono tracking-widest text-xs">••••••••</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-950 border border-slate-800">
                          <span className="text-rose-400 line-through text-[11px] font-mono">{String(mod.oldValue)}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-500 rtl:rotate-180" />
                          <span className="text-emerald-400 font-bold text-[11px] font-mono">{String(mod.newValue)}</span>
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-200">{mod.changedBy}</div>
                      <div className="text-slate-400 text-[11px] mt-0.5">{mod.reasonAr || 'تعديل إداري معتمد'}</div>
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
