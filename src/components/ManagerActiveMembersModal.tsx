import React, { useState, useMemo } from 'react';
import { GymMember } from '../types/gym';
import { StorageService } from '../services/storageService';
import { pdfPrintService } from '../services/pdfPrintService';
import { audioAlertService } from '../services/audioService';
import {
  X,
  Users,
  Search,
  Filter,
  Printer,
  ShieldCheck,
  Calendar,
  Phone,
  Crown,
  Sparkles,
  Dumbbell,
  CheckCircle2,
  AlertCircle,
  Clock,
  Edit,
  UserCheck,
  QrCode,
  Trash2,
  CalendarCheck
} from 'lucide-react';
import { CurrentUser } from '../types/gym';
import { ExtendSubscriptionModal } from './ExtendSubscriptionModal';

interface ManagerActiveMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: GymMember[];
  onOpenEditMember: (member: GymMember) => void;
  onDeleteMember?: (member: GymMember) => void;
  lang: 'ar' | 'en';
  managerName?: string;
  currentUser?: CurrentUser;
  onRefreshData?: () => void;
}

export const ManagerActiveMembersModal: React.FC<ManagerActiveMembersModalProps> = ({
  isOpen,
  onClose,
  members,
  onOpenEditMember,
  onDeleteMember,
  lang,
  managerName = 'المدير العام',
  currentUser = { id: 'admin-manager', nameAr: 'المدير العام', nameEn: 'General Manager', role: 'manager' },
  onRefreshData
}) => {
  const isAr = lang === 'ar';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [selectedCoach, setSelectedCoach] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expired' | 'frozen'>('all');
  const [expiryFilter, setExpiryFilter] = useState<'all' | 'safe' | 'expiring_soon'>('all');
  const [selectedExtendMember, setSelectedExtendMember] = useState<GymMember | null>(null);

  if (!isOpen) return null;

  // Tier counts across all members
  const standardCount = members.filter(m => m.tier === 'standard').length;
  const vipCount = members.filter(m => m.tier === 'vip').length;
  const goldCount = members.filter(m => m.tier === 'gold').length;
  const diamondCount = members.filter(m => m.tier === 'diamond').length;
  const expiringSoonCount = members.filter(m => m.remainingDays <= 7 && m.remainingDays > 0).length;

  // Coaches list
  const coaches = Array.from(new Set(members.map(m => m.assignedCoachName).filter(Boolean)));

  // Filtered members
  const filtered = members.filter(m => {
    // Search
    const q = searchQuery.toLowerCase().trim();
    const matchSearch = !q || 
      m.fullNameAr.toLowerCase().includes(q) ||
      m.fullNameEn.toLowerCase().includes(q) ||
      m.phone.includes(q) ||
      m.membershipNumber.includes(q) ||
      (m.assignedCoachName && m.assignedCoachName.toLowerCase().includes(q));

    // Status Filter
    let matchStatus = true;
    const isExpired = m.status === 'expired' || m.remainingDays <= 0;
    if (statusFilter === 'active') matchStatus = !isExpired && m.status !== 'frozen';
    else if (statusFilter === 'expired') matchStatus = isExpired;
    else if (statusFilter === 'frozen') matchStatus = m.status === 'frozen';

    // Tier
    const matchTier = selectedTier === 'all' || m.tier === selectedTier;

    // Coach
    const matchCoach = selectedCoach === 'all' || m.assignedCoachName === selectedCoach;

    // Expiry
    let matchExpiry = true;
    if (expiryFilter === 'expiring_soon') {
      matchExpiry = m.remainingDays <= 7 && m.remainingDays > 0;
    } else if (expiryFilter === 'safe') {
      matchExpiry = m.remainingDays > 7;
    }

    return matchSearch && matchStatus && matchTier && matchCoach && matchExpiry;
  });

  const getTierLabelAr = (tier: string) => {
    switch (tier) {
      case 'diamond': return 'عضوية ماسية فاخرة';
      case 'gold': return 'عضوية ذهبية مميزة';
      case 'vip': return 'عضوية كبار الشخصيات (VIP)';
      case 'standard': default: return 'عضوية قياسية';
    }
  };

  const handlePrintActiveMembersRoster = () => {
    audioAlertService.playSuccess();
    const currentDateStr = new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
    const currentTimeStr = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

    // Notify General Manager on Active Members Report Print
    try {
      let currentUserName = managerName || 'المدير العام';
      let currentUserRole = 'المدير العام';
      let currentUserId = 'emp-gm';
      if (typeof window !== 'undefined') {
        const saved = sessionStorage.getItem('gym_m22_current_user');
        if (saved) {
          const u = JSON.parse(saved);
          if (u && (u.nameAr || u.role)) {
            currentUserName = u.nameAr;
            currentUserRole = u.role === 'manager' ? 'المدير العام' :
                              u.role === 'coach' ? 'كابتن ومدرب' :
                              u.role === 'accountant' ? 'مسؤول حسابات' :
                              u.role === 'staff' ? 'موظف استقبال' : 'عضو';
            currentUserId = u.id || 'emp';
          }
        }
      }

      StorageService.notifyManagerReportPrinted({
        employeeId: currentUserId,
        employeeName: currentUserName,
        employeeRole: currentUserRole,
        reportType: 'كشف شؤون واشتراكات الأعضاء',
        reportTitle: `كشف بيان وسجل الأعضاء المشتركين النشطين (${filtered.length} عضواً)`,
        isDownload: false,
        details: `قام الموظف ${currentUserName} (${currentUserRole}) بإصدار وطباعة كشف الأعضاء المشتركين النشطين بعدد ${filtered.length} عضواً في تمام الساعة ${currentTimeStr}.`
      });
    } catch (e) {
      console.warn('Failed to notify manager on members print:', e);
    }

    const contentHtml = `
      <div class="print-container">
        <div class="header-box">
          <div>
            <div class="brand-title">نادي جيم M22 الرياضي</div>
            <div class="brand-sub">الإدارة العامة • كشف بيان وسجل الأعضاء المشتركين النشطين المعتمد</div>
          </div>
          <div class="meta-tag">
            <strong>كشف الأعضاء النشطين المعتمد</strong><br/>
            تاريخ: ${currentDateStr}<br/>
            الوقت: ${currentTimeStr}
          </div>
        </div>

        <div style="background: #f0f9ff; border: 1.5px solid #0284c7; border-radius: 12px; padding: 14px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <span style="font-size: 11pt; color: #0369a1; font-weight: 800;">إجمالي الأعضاء النشطين المقيدين بالصالة:</span>
            <strong style="font-size: 18pt; color: #0284c7; margin-right: 8px;">${filtered.length} عضواً</strong>
          </div>
          <div style="font-size: 9.5pt; color: #475569;">
            المعتمد: <strong>${managerName}</strong>
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 9pt;">
          <thead>
            <tr style="background: #0f172a; color: #ffffff;">
              <th style="padding: 8px; border: 1px solid #334155; text-align: center;">#</th>
              <th style="padding: 8px; border: 1px solid #334155; text-align: center;">رقم العضوية</th>
              <th style="padding: 8px; border: 1px solid #334155;">اسم المشترك</th>
              <th style="padding: 8px; border: 1px solid #334155; text-align: center;">رقم الهاتف</th>
              <th style="padding: 8px; border: 1px solid #334155; text-align: center;">فئة الاشتراك</th>
              <th style="padding: 8px; border: 1px solid #334155; text-align: center;">تاريخ النهاية</th>
              <th style="padding: 8px; border: 1px solid #334155; text-align: center;">المتبقي</th>
              <th style="padding: 8px; border: 1px solid #334155;">الكابتن المشرف</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.map((m, idx) => `
              <tr style="background: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
                <td style="padding: 6px; border: 1px solid #e2e8f0; text-align: center; color: #64748b;">${idx + 1}</td>
                <td style="padding: 6px; border: 1px solid #e2e8f0; font-family: monospace; font-weight: 800; color: #0284c7; text-align: center;">
                  رقم ${m.membershipNumber}
                </td>
                <td style="padding: 6px; border: 1px solid #e2e8f0; font-weight: 700; color: #0f172a;">${m.fullNameAr}</td>
                <td style="padding: 6px; border: 1px solid #e2e8f0; font-family: monospace; color: #475569; text-align: center;">${m.phone}</td>
                <td style="padding: 6px; border: 1px solid #e2e8f0; text-align: center; font-weight: 700; color: #0284c7;">
                  ${getTierLabelAr(m.tier)}
                </td>
                <td style="padding: 6px; border: 1px solid #e2e8f0; font-family: monospace; font-size: 8.5pt; color: #475569; text-align: center;">${m.endDate}</td>
                <td style="padding: 6px; border: 1px solid #e2e8f0; text-align: center; font-weight: 800; color: ${m.remainingDays <= 7 ? '#e11d48' : '#16a34a'};">
                  ${m.remainingDays} يوم
                </td>
                <td style="padding: 6px; border: 1px solid #e2e8f0; color: #334155;">${m.assignedCoachName || 'كابتن الصالة العام'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer-signatures" style="margin-top: 35px;">
          <div class="sig-box">
            <strong>مسؤول شؤون الأعضاء</strong>
            <div style="font-size: 8.5pt; color: #64748b; margin-top: 2px;">الاستقبال وشؤون الأعضاء</div>
            <div class="sig-line"></div>
          </div>
          <div style="text-align: center;">
            <div class="official-stamp" style="border-color: #0284c7; color: #0284c7;">
              نادي جيم M22<br/>
              شؤون الأعضاء والاشتراكات<br/>
              ★ معتمد رسمي ★
            </div>
          </div>
          <div class="sig-box">
            <strong>اعتماد المدير العام</strong>
            <div style="font-size: 8.5pt; color: #64748b; margin-top: 2px;">${managerName}</div>
            <div class="sig-line"></div>
          </div>
        </div>
      </div>
    `;

    // Print
    const printWindow = window.open('', '_blank', 'width=900,height=750');
    if (!printWindow) return;
    printWindow.document.open();
    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
        <head>
          <meta charset="UTF-8" />
          <title>كشف الأعضاء النشطين - GYM-M22</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet">
          <style>
            @page { size: A4; margin: 12mm; }
            * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            body { font-family: 'Cairo', sans-serif; background: #ffffff; color: #0f172a; padding: 20px; font-size: 11pt; }
            .header-box { display: flex; justify-content: space-between; align-items: center; border-bottom: 2.5px solid #0284c7; padding-bottom: 12px; margin-bottom: 18px; }
            .brand-title { font-size: 20pt; font-weight: 900; color: #0f172a; }
            .brand-sub { font-size: 9.5pt; color: #64748b; }
            .meta-tag { text-align: left; font-size: 9pt; color: #475569; }
            .footer-signatures { display: grid; grid-template-columns: repeat(3, 1fr); align-items: center; gap: 20px; }
            .sig-box { text-align: center; }
            .sig-line { width: 140px; border-bottom: 1px dashed #94a3b8; margin: 25px auto 0; }
            .official-stamp { width: 110px; height: 110px; border: 2.5px solid #0284c7; border-radius: 50%; display: flex; align-items: center; justify-content: center; text-align: center; font-weight: 900; font-size: 8.5pt; margin: 0 auto; color: #0284c7; text-transform: uppercase; }
            @media print { .no-print { display: none !important; } }
          </style>
        </head>
        <body>
          <div class="no-print" style="margin-bottom: 15px; text-align: center;">
            <button onclick="window.print()" style="padding: 10px 24px; background: #0284c7; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 14px;">
              🖨️ بدء الطباعة / حفظ PDF
            </button>
          </div>
          ${contentHtml}
        </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-5xl max-h-[92vh] flex flex-col rounded-3xl bg-[#0b0f19] border-2 border-sky-500/40 text-slate-100 shadow-2xl relative overflow-hidden text-right rtl:text-right ltr:text-left">
        
        {/* Top Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#101b2b] via-[#0b1420] to-[#070b12] border-b border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/40 flex items-center justify-center font-black shadow-lg shadow-sky-500/10">
              <Users className="w-6 h-6" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 font-bold">
                  {isAr ? 'بيانات المشتركين والرقابة المركزية' : 'Executive Member Roster'}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                  {members.filter(m => m.status === 'active').length} {isAr ? 'عضو نشط' : 'Active'}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white mt-1">
                {isAr ? 'سجل وبيانات الأعضاء النشطين بالصالة' : 'Active Gym Members Detailed Roster'}
              </h2>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handlePrintActiveMembersRoster}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-sky-500/20 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{isAr ? 'طباعة كشف الأعضاء PDF' : 'Print Roster PDF'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Breakdown Stats Cards */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-[#080d16] grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-center">
          <div className="bg-[#0e1626] p-3 rounded-2xl border border-sky-900/50">
            <span className="text-[10px] text-slate-400 block">{isAr ? 'عضوية Standard' : 'Standard'}</span>
            <strong className="text-base font-black text-sky-400 font-mono block mt-0.5">{standardCount}</strong>
          </div>

          <div className="bg-[#0e1626] p-3 rounded-2xl border border-purple-900/50">
            <span className="text-[10px] text-slate-400 block">{isAr ? 'عضوية VIP' : 'VIP'}</span>
            <strong className="text-base font-black text-purple-400 font-mono block mt-0.5">{vipCount}</strong>
          </div>

          <div className="bg-[#0e1626] p-3 rounded-2xl border border-amber-900/50">
            <span className="text-[10px] text-slate-400 block">{isAr ? 'عضوية Gold' : 'Gold'}</span>
            <strong className="text-base font-black text-amber-400 font-mono block mt-0.5">{goldCount}</strong>
          </div>

          <div className="bg-[#0e1626] p-3 rounded-2xl border border-cyan-900/50">
            <span className="text-[10px] text-slate-400 block">{isAr ? 'عضوية Diamond' : 'Diamond'}</span>
            <strong className="text-base font-black text-cyan-400 font-mono block mt-0.5">{diamondCount}</strong>
          </div>

          <div className="bg-[#1b0d10] p-3 rounded-2xl border border-rose-900/50 col-span-2 sm:col-span-1">
            <span className="text-[10px] text-rose-300 block">{isAr ? 'تنتهي خلال 7 أيام' : 'Expiring < 7d'}</span>
            <strong className="text-base font-black text-rose-400 font-mono block mt-0.5">{expiringSoonCount}</strong>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 bg-[#090e18] border-b border-slate-800 flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute right-3.5 rtl:right-3.5 ltr:left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? 'بحث بالاسم، رقم الهاتف، رقم العضوية، أو الكابتن...' : 'Search members...'}
              className="w-full bg-[#05070d] border border-slate-800 rounded-xl py-2 px-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-[#05070d] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-sky-500 font-bold"
          >
            <option value="all">{isAr ? 'جميع الحالات' : 'All Statuses'}</option>
            <option value="active">{isAr ? 'النشطون فقط' : 'Active Only'}</option>
            <option value="expired">{isAr ? 'المنتهية اشتراكاتهم' : 'Expired'}</option>
            <option value="frozen">{isAr ? 'المجمدة' : 'Frozen'}</option>
          </select>

          {/* Tier filter */}
          <select
            value={selectedTier}
            onChange={(e) => setSelectedTier(e.target.value)}
            className="bg-[#05070d] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-sky-500 font-bold"
          >
            <option value="all">{isAr ? 'جميع الفئات' : 'All Tiers'}</option>
            <option value="standard">Standard</option>
            <option value="vip">VIP</option>
            <option value="gold">Gold</option>
            <option value="diamond">Diamond</option>
          </select>

          {/* Coach filter */}
          <select
            value={selectedCoach}
            onChange={(e) => setSelectedCoach(e.target.value)}
            className="bg-[#05070d] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-sky-500 font-bold"
          >
            <option value="all">{isAr ? 'جميع الكباتن' : 'All Coaches'}</option>
            {coaches.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Expiry filter */}
          <select
            value={expiryFilter}
            onChange={(e) => setExpiryFilter(e.target.value as any)}
            className="bg-[#05070d] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-sky-500 font-bold"
          >
            <option value="all">{isAr ? 'جميع الاشتراكات' : 'All Dates'}</option>
            <option value="expiring_soon">{isAr ? '⚠️ أوشكت على الانتهاء (≤ 7 أيام)' : 'Expiring Soon'}</option>
            <option value="safe">{isAr ? '✅ سارية ومستقرة (> 7 أيام)' : 'Safe'}</option>
          </select>
        </div>

        {/* Members Table */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          <div className="bg-[#090d16] rounded-2xl border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right rtl:text-right ltr:text-left text-xs">
                <thead className="bg-[#06080f] text-slate-400 font-bold border-b border-slate-800">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">{isAr ? 'رقم العضوية' : 'Member ID'}</th>
                    <th className="p-3">{isAr ? 'المشترك' : 'Member'}</th>
                    <th className="p-3">{isAr ? 'الهاتف' : 'Phone'}</th>
                    <th className="p-3">{isAr ? 'الفئة' : 'Tier'}</th>
                    <th className="p-3">{isAr ? 'نهاية الاشتراك' : 'End Date'}</th>
                    <th className="p-3">{isAr ? 'الأيام المتبقية' : 'Days Left'}</th>
                    <th className="p-3">{isAr ? 'الكابتن' : 'Coach'}</th>
                    <th className="p-3 text-center">{isAr ? 'إجراء المدير' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-500 font-bold">
                        {isAr ? 'لا يوجد أعضاء مطابقين للبحث' : 'No matching active members found'}
                      </td>
                    </tr>
                  ) : (
                    filtered.map((m, idx) => {
                      const isClose = m.remainingDays <= 7;
                      return (
                        <tr key={m.id || idx} className="hover:bg-slate-900/60 transition-colors">
                          <td className="p-3 text-slate-500 font-bold">{idx + 1}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded-md bg-sky-950/70 text-sky-300 font-mono font-black border border-sky-500/30">
                              رقم {m.membershipNumber}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <img
                                src={m.avatarUrl || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100'}
                                alt={m.fullNameAr}
                                className="w-7 h-7 rounded-lg object-cover border border-slate-700"
                              />
                              <div>
                                <strong className="text-white block font-bold">{m.fullNameAr}</strong>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 font-mono text-slate-300 text-[11px]">{m.phone}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-md font-black text-[10px] border ${
                              m.tier === 'diamond' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' :
                              m.tier === 'gold' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                              m.tier === 'vip' ? 'bg-purple-500/10 text-purple-400 border-purple-500/30' :
                              'bg-sky-500/10 text-sky-400 border-sky-500/30'
                            }`}>
                              {getTierLabelAr(m.tier)}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-[11px] text-slate-300">{m.endDate}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] font-mono border ${
                              isClose 
                                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse' 
                                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            }`}>
                              {m.remainingDays} {isAr ? 'يوم' : 'days'}
                            </span>
                          </td>
                          <td className="p-3 text-[11px] text-slate-300">{m.assignedCoachName || 'عام'}</td>
                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* Extend Subscription (GM Only) */}
                              <button
                                onClick={() => setSelectedExtendMember(m)}
                                className="p-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-600 hover:text-white text-purple-300 border border-purple-500/40 transition-all cursor-pointer"
                                title={isAr ? 'تمديد وتأخير تاريخ نهاية الاشتراك' : 'Extend / Postpone Subscription'}
                              >
                                <CalendarCheck className="w-3.5 h-3.5" />
                              </button>

                              {/* Edit Account (GM Only) */}
                              <button
                                onClick={() => {
                                  onClose();
                                  onOpenEditMember(m);
                                }}
                                className="p-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500 hover:text-slate-950 text-[#f7cb55] border border-amber-500/40 transition-all cursor-pointer"
                                title={isAr ? 'تعديل بيانات الحساب (صلاحية المدير العام)' : 'Edit Account (GM Only)'}
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>

                              {/* Print Member Report */}
                              <button
                                onClick={() => {
                                  audioAlertService.playSuccess();
                                  pdfPrintService.printMemberActivityAndWorkoutReportPDF(m, managerName);
                                }}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-sky-500 hover:text-slate-950 text-slate-400 transition-colors cursor-pointer"
                                title={isAr ? 'طباعة تقرير وبيانات العضو PDF' : 'Print Member PDF'}
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete Member to Archive (GM Only) */}
                              {onDeleteMember && (
                                <button
                                  onClick={() => {
                                    onClose();
                                    onDeleteMember(m);
                                  }}
                                  className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900 hover:text-white text-rose-400 border border-rose-900/50 transition-all cursor-pointer"
                                  title={isAr ? 'حذف الحساب ونقله للأرشيف' : 'Delete Account'}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#080c14] border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-sky-400" />
            <span>{isAr ? 'جميع صلاحيات تعديل الحسابات وتجديد الاشتراكات مقصورة على المدير العام فقط' : 'Account modification is restricted to General Manager only'}</span>
          </span>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors cursor-pointer"
          >
            {isAr ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>

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
    </div>
  );
};
