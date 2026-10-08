import React, { useState } from 'react';
import { GymMember, CurrentUser } from '../types/gym';
import { Users, Search, QrCode, Calendar, CreditCard, ShieldCheck, Printer, CheckCircle2, AlertCircle, Phone, User, RefreshCw, CalendarCheck, Edit, Eye } from 'lucide-react';
import { audioAlertService } from '../services/audioService';
import { pdfPrintService } from '../services/pdfPrintService';
import { RenewSubscriptionModal } from './RenewSubscriptionModal';
import { ExtendSubscriptionModal } from './ExtendSubscriptionModal';
import { MemberProfileModal } from './MemberProfileModal';

interface ManagerMembersDirectoryProps {
  members: GymMember[];
  lang: 'ar' | 'en';
  onSelectMember: (member: GymMember) => void;
  onEditMember?: (member: GymMember) => void;
  currentUser: CurrentUser;
  onRefreshData?: () => void;
}

export const ManagerMembersDirectory: React.FC<ManagerMembersDirectoryProps> = ({
  members,
  lang,
  onSelectMember,
  onEditMember,
  currentUser,
  onRefreshData
}) => {
  const isAr = lang === 'ar';
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expired' | 'frozen'>('all');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [selectedRenewMember, setSelectedRenewMember] = useState<GymMember | null>(null);
  const [selectedExtendMember, setSelectedExtendMember] = useState<GymMember | null>(null);
  const [selectedProfileMember, setSelectedProfileMember] = useState<GymMember | null>(null);

  // Filter members
  const filteredMembers = members.filter(m => {
    const matchesSearch = 
      m.fullNameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.fullNameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.phone.includes(searchQuery) ||
      m.membershipNumber.toString().includes(searchQuery);

    const isExpired = m.status === 'expired' || m.remainingDays <= 0;
    const matchesStatus = 
      statusFilter === 'all' ? true :
      statusFilter === 'active' ? !isExpired && m.status !== 'frozen' :
      statusFilter === 'expired' ? isExpired :
      statusFilter === 'frozen' ? m.status === 'frozen' : true;

    const matchesTier = tierFilter === 'all' ? true : m.tier.toLowerCase() === tierFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesTier;
  });

  const activeCount = members.filter(m => m.status === 'active' && m.remainingDays > 0).length;
  const expiredCount = members.filter(m => m.status === 'expired' || m.remainingDays <= 0).length;
  const frozenCount = members.filter(m => m.status === 'frozen').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#121826] via-[#0b101b] to-[#060910] p-6 rounded-3xl border border-amber-500/30 shadow-2xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/20">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 font-bold uppercase">
                {isAr ? 'إدارة المشتركين والأعضاء' : 'Members Management'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
              {isAr ? 'دليل وشامل أعضاء النادي' : 'Club Members Directory'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isAr ? 'استعراض بيانات كافة الأعضاء، الاشتراكات، الحضور، وتصدير التقارير التاريخية PDF' : 'Inspect all member profiles, subscriptions, check-ins, and export PDF reports'}
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
            <span className="text-[9px] text-slate-400 block font-bold">{isAr ? 'النشطون' : 'Active'}</span>
            <strong className="text-emerald-400 font-mono font-black text-sm">{activeCount}</strong>
          </div>
          <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
            <span className="text-[9px] text-slate-400 block font-bold">{isAr ? 'المنتهية' : 'Expired'}</span>
            <strong className="text-rose-400 font-mono font-black text-sm">{expiredCount}</strong>
          </div>
          <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
            <span className="text-[9px] text-slate-400 block font-bold">{isAr ? 'المجمدة' : 'Frozen'}</span>
            <strong className="text-amber-400 font-mono font-black text-sm">{frozenCount}</strong>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-[#080b12] p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="absolute right-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isAr ? 'بحث بالاسم، رقم العضوية أو الهاتف...' : 'Search by name, membership #, phone...'}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-10 pl-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              statusFilter === 'all' ? 'bg-amber-500 text-slate-950 font-black shadow' : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            {isAr ? 'جميع الأعضاء' : 'All Members'}
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              statusFilter === 'active' ? 'bg-emerald-500 text-slate-950 font-black shadow' : 'bg-slate-900 text-emerald-300 hover:text-white border border-slate-800'
            }`}
          >
            {isAr ? 'النشطون فقط' : 'Active Only'}
          </button>
          <button
            onClick={() => setStatusFilter('expired')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              statusFilter === 'expired' ? 'bg-rose-500 text-white font-black shadow' : 'bg-slate-900 text-rose-300 hover:text-white border border-slate-800'
            }`}
          >
            {isAr ? 'المنتهية اشتراكاتهم' : 'Expired'}
          </button>
          <button
            onClick={() => setStatusFilter('frozen')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              statusFilter === 'frozen' ? 'bg-amber-600 text-white font-black shadow' : 'bg-slate-900 text-amber-300 hover:text-white border border-slate-800'
            }`}
          >
            {isAr ? 'المجمدة' : 'Frozen'}
          </button>
        </div>
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMembers.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-slate-950/60 rounded-3xl border border-dashed border-slate-800 text-slate-400 text-xs">
            {isAr ? 'لا توجد نتائج مطابقة لبحثك' : 'No members found matching your query.'}
          </div>
        ) : (
          filteredMembers.map((member) => {
            const isExpired = member.status === 'expired' || member.remainingDays <= 0;
            return (
              <div
                key={member.id}
                onClick={() => {
                  audioAlertService.playBeep(659.25, 0.05);
                  setSelectedProfileMember(member);
                  onSelectMember(member);
                }}
                className="bg-gradient-to-br from-[#0c101b] to-[#07090e] p-5 rounded-3xl border border-slate-800 hover:border-amber-500/60 transition-all cursor-pointer group shadow-lg hover:shadow-amber-500/10 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-slate-900 text-amber-400 border border-slate-800 font-bold">
                      #{member.membershipNumber}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                      !isExpired && member.status !== 'frozen'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : member.status === 'frozen'
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                    }`}>
                      {!isExpired && member.status !== 'frozen' ? (isAr ? 'ساري النشاط' : 'ACTIVE') : member.status === 'frozen' ? (isAr ? 'مجمد' : 'FROZEN') : (isAr ? 'منتهي' : 'EXPIRED')}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center font-black border border-amber-500/30 shrink-0">
                      {member.avatarUrl ? (
                        <img src={member.avatarUrl} alt="" className="w-full h-full object-cover rounded-2xl" />
                      ) : (
                        <User className="w-6 h-6" />
                      )}
                    </div>
                    <div className="overflow-hidden">
                      <h3 className="font-black text-white text-sm truncate group-hover:text-amber-400 transition-colors">
                        {member.fullNameAr}
                      </h3>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 font-mono">
                        <Phone className="w-3 h-3 text-slate-500" />
                        <span>{member.phone || 'بدون هاتف'}</span>
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-4 text-center text-xs">
                    <div className="bg-slate-950/90 p-2 rounded-xl border border-slate-900">
                      <span className="text-[8px] text-slate-400 block font-bold">{isAr ? 'الباقة' : 'Tier'}</span>
                      <strong className="text-amber-400 font-mono font-black text-xs uppercase">{member.tier}</strong>
                    </div>
                    <div className="bg-slate-950/90 p-2 rounded-xl border border-slate-900">
                      <span className="text-[8px] text-slate-400 block font-bold">{isAr ? 'المتبقي' : 'Days'}</span>
                      <strong className={`font-mono font-black text-xs ${member.remainingDays > 5 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {member.remainingDays} {isAr ? 'يوم' : 'd'}
                      </strong>
                    </div>
                    <div className="bg-slate-950/90 p-2 rounded-xl border border-slate-900">
                      <span className="text-[8px] text-slate-400 block font-bold">{isAr ? 'حضور' : 'Check-ins'}</span>
                      <strong className="text-sky-400 font-mono font-black text-xs">{member.attendanceCount || 0}</strong>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        audioAlertService.playBeep(650, 0.05);
                        setSelectedExtendMember(member);
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/40 text-[11px] font-black flex items-center gap-1 transition-all cursor-pointer shadow"
                      title={isAr ? 'تمديد وتأخير تاريخ نهاية الاشتراك' : 'Extend / Postpone End Date'}
                    >
                      <CalendarCheck className="w-3.5 h-3.5" />
                      <span>{isAr ? 'تمديد الاشتراك' : 'Extend'}</span>
                    </button>

                    {onEditMember && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          audioAlertService.playBeep(650, 0.05);
                          onEditMember(member);
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500 text-sky-300 hover:text-slate-950 border border-sky-500/40 text-[11px] font-black flex items-center gap-1 transition-all cursor-pointer shadow"
                        title={isAr ? 'تعديل بيانات العضو واشتراكه' : 'Edit Member'}
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>{isAr ? 'تعديل' : 'Edit'}</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        audioAlertService.playBeep(650, 0.05);
                        setSelectedRenewMember(member);
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/40 text-[11px] font-black flex items-center gap-1 transition-all cursor-pointer shadow"
                      title={isAr ? 'تجديد اشتراك العضو وتحديد الباقة وتاريخ البداية' : 'Renew Subscription'}
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>{isAr ? 'تجديد' : 'Renew'}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-slate-400 group-hover:text-amber-300 font-bold transition-colors">
                    <span>{isAr ? 'سجل العضو' : 'Profile'}</span>
                    <span>←</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* RENEW SUBSCRIPTION MODAL */}
      <RenewSubscriptionModal
        member={selectedRenewMember}
        isOpen={!!selectedRenewMember}
        onClose={() => setSelectedRenewMember(null)}
        currentUser={currentUser}
        lang={lang}
        onSuccess={() => {
          if (onRefreshData) onRefreshData();
        }}
      />

      {/* EXTEND SUBSCRIPTION END DATE MODAL */}
      <ExtendSubscriptionModal
        member={selectedExtendMember}
        isOpen={!!selectedExtendMember}
        onClose={() => setSelectedExtendMember(null)}
        currentUser={currentUser}
        lang={lang}
        onSuccess={() => {
          if (onRefreshData) onRefreshData();
        }}
      />

      {/* MEMBER PROFILE & HISTORY MODAL */}
      {selectedProfileMember && (
        <MemberProfileModal
          member={selectedProfileMember}
          isOpen={!!selectedProfileMember}
          onClose={() => setSelectedProfileMember(null)}
          currentUser={currentUser}
          lang={lang}
          onMemberUpdated={() => {
            if (onRefreshData) onRefreshData();
          }}
        />
      )}
    </div>
  );
};
