import React, { useState, useEffect } from 'react';
import { EmployeeAttendanceRecord, EmployeeAccount } from '../types/gym';
import { StorageService } from '../services/storageService';
import { audioAlertService } from '../services/audioService';
import { pdfPrintService } from '../services/pdfPrintService';
import { 
  Clock, 
  UserCheck, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  PlusCircle, 
  Search, 
  X,
  Sparkles,
  Lock,
  Printer,
  Timer,
  CheckCircle,
  Briefcase,
  DollarSign,
  Filter,
  Calculator,
  FileText
} from 'lucide-react';

interface ManagerEmployeeAttendanceProps {
  lang: 'ar' | 'en';
}

export const ManagerEmployeeAttendance: React.FC<ManagerEmployeeAttendanceProps> = ({ lang }) => {
  const isAr = lang === 'ar';
  const [attendances, setAttendances] = useState<EmployeeAttendanceRecord[]>([]);
  const [coaches, setCoaches] = useState<EmployeeAccount[]>([]);
  const [staff, setStaff] = useState<EmployeeAccount[]>([]);
  const [accountants, setAccountants] = useState<EmployeeAccount[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterEmployeeId, setFilterEmployeeId] = useState<string>('all');
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);

  // Check in form
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [checkInTime, setCheckInTime] = useState(new Date().toTimeString().split(' ')[0].substring(0, 5));
  const [notes, setNotes] = useState('');

  const refreshData = () => {
    setAttendances(StorageService.getEmployeeAttendances());
    setCoaches(StorageService.getCoaches());
    setStaff(StorageService.getStaff());
    setAccountants(StorageService.getAccountants());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const allEmployees = React.useMemo(() => {
    const seen = new Set<string>();
    return [...coaches, ...staff, ...accountants].filter(emp => {
      if (!emp || !emp.id || seen.has(emp.id)) return false;
      seen.add(emp.id);
      return true;
    });
  }, [coaches, staff, accountants]);

  // Helper: calculate exact net worked hours between checkIn and checkOut
  const calculateNetWorkedHours = (dateStr: string, inTime: string, outTime: string): { hours: number; formatted: string } => {
    try {
      const [inH, inM, inS] = inTime.split(':').map(n => parseInt(n || '0', 10));
      const [outH, outM, outS] = outTime.split(':').map(n => parseInt(n || '0', 10));

      const inDate = new Date(`${dateStr}T${inH.toString().padStart(2, '0')}:${inM.toString().padStart(2, '0')}:${(inS || 0).toString().padStart(2, '0')}`);
      let outDate = new Date(`${dateStr}T${outH.toString().padStart(2, '0')}:${outM.toString().padStart(2, '0')}:${(outS || 0).toString().padStart(2, '0')}`);

      if (outDate < inDate) {
        outDate.setDate(outDate.getDate() + 1);
      }

      const diffMs = outDate.getTime() - inDate.getTime();
      const totalMinutes = Math.max(0, Math.floor(diffMs / (1000 * 60)));
      const h = Math.floor(totalMinutes / 60);
      const m = totalMinutes % 60;
      const decimalHours = Number((totalMinutes / 60).toFixed(2));

      const formatted = `${h} ${isAr ? 'ساعة' : 'hrs'}${m > 0 ? ` و ${m} ${isAr ? 'دقيقة' : 'mins'}` : ''}`;
      return { hours: decimalHours, formatted };
    } catch {
      return { hours: 8, formatted: '8 س' };
    }
  };

  const handleManualCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = allEmployees.find(e => e.id === selectedEmployeeId);
    if (!emp) return;

    const newRecord: EmployeeAttendanceRecord = {
      id: `att-${Date.now()}`,
      employeeId: emp.id,
      employeeName: emp.nameAr,
      role: emp.role,
      date: new Date().toISOString().split('T')[0],
      checkInTime: `${checkInTime}:00`,
      status: 'present',
      notes: notes.trim() || undefined
    };

    StorageService.recordEmployeeAttendance(newRecord);
    audioAlertService.playSuccess();
    setIsCheckInModalOpen(false);
    setSelectedEmployeeId('');
    setNotes('');
    refreshData();
  };

  const handleCheckOut = (record: EmployeeAttendanceRecord) => {
    const nowTime = new Date().toTimeString().split(' ')[0];
    const { hours, formatted } = calculateNetWorkedHours(record.date, record.checkInTime, nowTime);

    const updated: EmployeeAttendanceRecord = {
      ...record,
      checkOutTime: nowTime,
      totalHoursWorked: hours,
      status: 'completed',
      notes: record.notes ? `${record.notes} | إجمالي الوقت: ${formatted}` : `إجمالي ساعات العمل اليومية: ${formatted}`
    };

    StorageService.recordEmployeeAttendance(updated);
    audioAlertService.playSuccess();
    refreshData();
  };

  // Helper: get employee's hourly rate & compute wages
  const getEmployeeHourlyInfo = (empId: string, empRole: string) => {
    const emp = allEmployees.find(e => e.id === empId);
    const baseSalary = emp?.baseSalary || (empRole === 'coach' ? 7000 : empRole === 'staff' ? 5500 : 7500);
    const hourlyRate = emp?.hourlyRate || Math.round(baseSalary / 200) || 30;
    return { emp, baseSalary, hourlyRate };
  };

  // Filtering records
  const filteredAttendances = attendances.filter(att => {
    if (filterRole !== 'all' && att.role !== filterRole) return false;
    if (filterEmployeeId !== 'all' && att.employeeId !== filterEmployeeId) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return att.employeeName.toLowerCase().includes(q) || att.date.includes(q);
  });

  // Analytics summary for Manager
  const totalWorkedHoursFiltered = filteredAttendances
    .filter(a => a.totalHoursWorked)
    .reduce((sum, a) => sum + (a.totalHoursWorked || 0), 0);

  const totalEarnedPayoutFiltered = filteredAttendances.reduce((sum, a) => {
    const { hourlyRate } = getEmployeeHourlyInfo(a.employeeId, a.role);
    return sum + ((a.totalHoursWorked || 0) * hourlyRate);
  }, 0);

  const openShiftsCount = filteredAttendances.filter(a => !a.checkOutTime).length;
  const completedShiftsCount = filteredAttendances.filter(a => a.checkOutTime).length;

  const handlePrintPDFReport = () => {
    audioAlertService.playSuccess();
    pdfPrintService.printAttendanceReportPDF(
      attendances,
      allEmployees,
      filterEmployeeId,
      'المدير العام',
      'سجل أوقات الحضور والانصراف ومستحقات الساعات'
    );
  };

  const selectedTargetEmp = allEmployees.find(e => e.id === filterEmployeeId);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Executive Hero Banner */}
      <div className="bg-gradient-to-br from-[#0c1322] via-[#080d19] to-[#04060a] rounded-3xl p-6 border-2 border-cyan-500/40 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center shadow-lg shadow-cyan-500/10 shrink-0">
              <UserCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-black border border-rose-500/30 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-rose-400" />
                  <span>{isAr ? 'حصري بالمدير العام فقط' : 'GM Confidential'}</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
                  {filteredAttendances.length} {isAr ? 'سجل حضور' : 'records'}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                {isAr ? 'سجل الحضور والانصراف واحتساب أجر الساعات' : 'Staff Attendance & Hourly Salary Log'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {isAr ? 'متابعة أوقات الحضور والانصراف، احتساب إجمالي ساعات العمل، واستخراج كشوفات الرواتب حسب أجر الساعة' : 'Track exact check-ins, check-outs, net worked hours and calculated wages'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Consolidate & Auto-Archive Payout */}
            <button
              onClick={() => {
                audioAlertService.playSuccess();
                StorageService.archiveReport({
                  id: `arch-att-${Date.now()}`,
                  reportNumber: `ATT-REP-${Math.floor(Math.random() * 90000) + 10000}`,
                  periodTitleAr: `كشف تحصيل وتجميع رواتب الحضور - ${new Date().toLocaleDateString('ar-EG')}`,
                  periodTitleEn: `Consolidated Attendance & Payroll Payout - ${new Date().toISOString().split('T')[0]}`,
                  dateRange: {
                    start: new Date().toISOString().split('T')[0],
                    end: new Date().toISOString().split('T')[0]
                  },
                  archivedAt: new Date().toISOString(),
                  archivedBy: 'المدير العام',
                  archivedByRole: 'manager',
                  metrics: {
                    totalRevenue: 0,
                    totalExpenses: totalEarnedPayoutFiltered,
                    netProfit: -totalEarnedPayoutFiltered,
                    cashAmount: 0,
                    electronicAmount: 0,
                    activeMembersCount: allEmployees.length,
                    renewalsCount: 0,
                    newMembersCount: 0,
                    totalAttendances: filteredAttendances.length,
                    completedShiftsCount: completedShiftsCount
                  },
                  notesAr: `تم تجميع وتحصيل ساعات الحضور لجميع الموظفين. إجمالي الساعات: ${totalWorkedHoursFiltered.toFixed(2)} ساعة. إجمالي الرواتب المستحقة: ${totalEarnedPayoutFiltered.toLocaleString()} ج.م`,
                  notesEn: `Consolidated attendance payroll. Total hours: ${totalWorkedHoursFiltered.toFixed(2)}`
                });
                alert(isAr ? '⚡ تم تحصيل تقارير الحضور وأرشفة التقرير المالي تلقائياً في أرشيف التقارير المركزي' : 'Attendance reports successfully consolidated and auto-archived.');
              }}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-95 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>{isAr ? '⚡ تحصيل وأرشفة تقارير الحضور' : 'Consolidate & Archive'}</span>
            </button>

            {/* Print PDF Button */}
            <button
              onClick={handlePrintPDFReport}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{isAr ? '🖨️ طباعة كشف الحضور والساعات PDF' : 'Print Attendance PDF'}</span>
            </button>

            {/* Check in button */}
            <button
              onClick={() => setIsCheckInModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all active:scale-95 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{isAr ? '+ تسجيل حضور موظف / كابتن' : '+ Manual Check-In'}</span>
            </button>
          </div>
        </div>

        {/* Manager KPI Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800/80">
          <div className="bg-[#070b13]/80 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-bold">{isAr ? 'ساعات العمل المنجزة' : 'Worked Hours'}</span>
            <strong className="text-base font-black text-cyan-400 font-mono block mt-1">
              {totalWorkedHoursFiltered.toFixed(2)} {isAr ? 'ساعة' : 'hrs'}
            </strong>
          </div>

          <div className="bg-[#070b13]/80 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-bold">{isAr ? 'إجمالي المستحق حسب أجر الساعة' : 'Earned Wages'}</span>
            <strong className="text-base font-black text-emerald-400 font-mono block mt-1">
              {Math.round(totalEarnedPayoutFiltered).toLocaleString()} {isAr ? 'ج.م' : 'EGP'}
            </strong>
          </div>

          <div className="bg-[#070b13]/80 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-bold">{isAr ? 'الورديات المكتملة' : 'Completed Shifts'}</span>
            <strong className="text-base font-black text-sky-400 font-mono block mt-1">
              {completedShiftsCount} {isAr ? 'وردية' : 'shifts'}
            </strong>
          </div>

          <div className="bg-[#070b13]/80 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-bold">{isAr ? 'الموظفون في الخدمة الآن' : 'Currently Working'}</span>
            <strong className="text-base font-black text-amber-400 font-mono block mt-1 animate-pulse">
              {openShiftsCount} {isAr ? 'موظف' : 'active'}
            </strong>
          </div>
        </div>
      </div>

      {/* Filter & Search Controls */}
      <div className="bg-[#0c101a] rounded-2xl p-4 border border-slate-800 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-2.5 items-center w-full md:w-auto flex-1">
          {/* Employee Dropdown Filter */}
          <div className="relative w-full sm:w-64 shrink-0">
            <select
              value={filterEmployeeId}
              onChange={(e) => setFilterEmployeeId(e.target.value)}
              className="w-full bg-[#06080e] border border-cyan-500/40 rounded-xl py-2 px-3 text-xs text-cyan-300 font-bold focus:outline-none focus:border-cyan-400 cursor-pointer"
            >
              <option value="all">{isAr ? '📋 جميع الموظفين والكباتن (كشف شامل)' : 'All Employees'}</option>
              {allEmployees.map((emp, idx) => (
                <option key={`att-filter-${emp.role}-${emp.id}-${idx}`} value={emp.id}>
                  👤 {emp.nameAr} ({emp.role === 'coach' ? 'كابتن' : emp.role === 'staff' ? 'استقبال' : 'محاسب'})
                </option>
              ))}
            </select>
          </div>

          {/* Text Search */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-500 absolute right-3.5 rtl:right-3.5 ltr:left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? 'ابحث باسم الموظف أو التاريخ (YYYY-MM-DD)...' : 'Search by name or date...'}
              className="w-full bg-[#06080e] border border-slate-800 rounded-xl py-2 px-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Role Preset Tabs */}
        <div className="flex items-center gap-1.5 w-full md:w-auto justify-end">
          <button
            onClick={() => setFilterRole('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterRole === 'all'
                ? 'bg-cyan-500 text-slate-950 font-black'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            {isAr ? 'الكل' : 'All'}
          </button>

          <button
            onClick={() => setFilterRole('coach')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterRole === 'coach'
                ? 'bg-amber-500 text-slate-950 font-black'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            {isAr ? 'الكباتن' : 'Coaches'}
          </button>

          <button
            onClick={() => setFilterRole('staff')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterRole === 'staff'
                ? 'bg-sky-500 text-slate-950 font-black'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            {isAr ? 'الاستقبال' : 'Reception'}
          </button>

          <button
            onClick={() => setFilterRole('accountant')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterRole === 'accountant'
                ? 'bg-emerald-500 text-slate-950 font-black'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            {isAr ? 'المحاسبين' : 'Accountants'}
          </button>
        </div>
      </div>

      {/* Active Target Banner when employee filtered */}
      {selectedTargetEmp && (
        <div className="bg-gradient-to-r from-cyan-950/80 via-[#0a1526] to-[#080d18] rounded-2xl p-4 border border-cyan-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <img
              src={selectedTargetEmp.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'}
              alt={selectedTargetEmp.nameAr}
              className="w-10 h-10 rounded-xl object-cover border border-cyan-400"
            />
            <div>
              <div className="font-black text-white text-sm flex items-center gap-2">
                <span>{selectedTargetEmp.nameAr}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold uppercase">
                  {selectedTargetEmp.role}
                </span>
              </div>
              <div className="text-slate-400 text-[11px] mt-0.5">
                تاريخ التعيين: {selectedTargetEmp.hiredDate} | الهاتف: {selectedTargetEmp.phone}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-slate-200 border-t sm:border-t-0 border-slate-800 pt-2 sm:pt-0 font-bold">
            <div>
              <span className="text-slate-400 text-[10px] block">{isAr ? 'الراتب الأساسي' : 'Base Salary'}</span>
              <span className="text-emerald-400 font-mono">{(selectedTargetEmp.baseSalary || 5000).toLocaleString()} ج.م</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">{isAr ? 'أجر الساعة المعتمد' : 'Hourly Rate'}</span>
              <span className="text-amber-400 font-mono">{selectedTargetEmp.hourlyRate || Math.round((selectedTargetEmp.baseSalary || 5000) / 200)} ج.م/ساعة</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">{isAr ? 'مستحق الساعات بالفترة' : 'Hours Wage Earned'}</span>
              <span className="text-cyan-400 font-mono">{Math.round(totalEarnedPayoutFiltered).toLocaleString()} ج.م</span>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Table */}
      <div className="bg-[#0c101a] rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right rtl:text-right ltr:text-left text-xs">
            <thead className="bg-[#070a12] text-slate-400 uppercase tracking-wider border-b border-slate-800 font-bold">
              <tr>
                <th className="p-4 w-12 text-center">#</th>
                <th className="p-4">{isAr ? 'اسم الموظف / الكابتن' : 'Employee'}</th>
                <th className="p-4">{isAr ? 'تاريخ الوردية' : 'Date'}</th>
                <th className="p-4">{isAr ? 'وقت الحضور' : 'Check-In'}</th>
                <th className="p-4">{isAr ? 'وقت الانصراف' : 'Check-Out'}</th>
                <th className="p-4 text-center">{isAr ? 'ساعات العمل' : 'Total Hours'}</th>
                <th className="p-4 text-center">{isAr ? 'أجر الساعة' : 'Hourly Rate'}</th>
                <th className="p-4 text-center">{isAr ? 'المستحق المالي' : 'Earned Wage'}</th>
                <th className="p-4 text-center">{isAr ? 'الحالة والإجراء' : 'Status & Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredAttendances.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-12 text-center text-slate-500">
                    <UserCheck className="w-10 h-10 mx-auto mb-3 opacity-30 text-cyan-400" />
                    <p className="font-bold">{isAr ? 'لا توجد سجلات حضور مطابق للبحث' : 'No attendance records found'}</p>
                  </td>
                </tr>
              ) : (
                filteredAttendances.map((att, index) => {
                  const roleLabels: Record<string, string> = {
                    manager: 'مدير عام',
                    accountant: 'مسؤول حسابات',
                    staff: 'موظف استقبال',
                    coach: 'كابتن ومدرب'
                  };

                  const { hourlyRate } = getEmployeeHourlyInfo(att.employeeId, att.role);
                  const hrs = att.totalHoursWorked || 0;
                  const earnedWage = hrs * hourlyRate;

                  return (
                    <tr key={att.id} className="hover:bg-slate-900/60 transition-colors">
                      <td className="p-4 text-center text-slate-500 font-bold">{index + 1}</td>
                      <td className="p-4 whitespace-nowrap">
                        <div className="font-bold text-white">{att.employeeName}</div>
                        <span className="text-[10px] text-cyan-400 font-semibold">
                          {roleLabels[att.role] || att.role}
                        </span>
                      </td>
                      <td className="p-4 whitespace-nowrap font-mono font-bold text-slate-300">{att.date}</td>
                      <td className="p-4 whitespace-nowrap font-mono text-emerald-400 font-black text-xs">
                        {att.checkInTime}
                      </td>
                      <td className="p-4 whitespace-nowrap font-mono text-amber-400 font-black text-xs">
                        {att.checkOutTime || (
                          <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-bold text-[11px] animate-pulse">
                            {isAr ? 'في الوردية حالياً' : 'Working'}
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-center whitespace-nowrap font-mono">
                        {hrs ? (
                          <span className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700 text-sky-300 font-black text-xs inline-block">
                            {hrs} {isAr ? 'ساعة' : 'hrs'}
                          </span>
                        ) : (
                          <span className="text-slate-600 font-bold">—</span>
                        )}
                      </td>
                      <td className="p-4 text-center whitespace-nowrap font-mono text-slate-400 font-bold">
                        {hourlyRate} {isAr ? 'ج.م' : 'EGP'}
                      </td>
                      <td className="p-4 text-center whitespace-nowrap font-mono">
                        {hrs ? (
                          <span className="px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-black text-xs inline-block">
                            {Math.round(earnedWage).toLocaleString()} {isAr ? 'ج.م' : 'EGP'}
                          </span>
                        ) : (
                          <span className="text-slate-600 font-bold">—</span>
                        )}
                      </td>
                      <td className="p-4 text-center whitespace-nowrap">
                        {!att.checkOutTime ? (
                          <button
                            onClick={() => handleCheckOut(att)}
                            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs transition-all shadow-md shadow-amber-500/20 cursor-pointer active:scale-95"
                          >
                            {isAr ? 'تسجيل انصراف واحتساب الساعات' : 'Check Out'}
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-emerald-400 text-xs font-bold px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{isAr ? 'وردية مكتملة' : 'Completed'}</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {filteredAttendances.length > 0 && (
              <tfoot className="bg-[#080c14] border-t-2 border-slate-800 text-xs font-bold">
                <tr>
                  <td colSpan={5} className="p-4 text-slate-300 font-black text-left rtl:text-right">
                    {isAr ? 'إجمالي الساعات والمستحقات لكافة الحركات المفلترة أعلاه:' : 'Totals for filtered attendance:'}
                  </td>
                  <td className="p-4 text-center font-mono text-sky-300 font-black">
                    {totalWorkedHoursFiltered.toFixed(2)} {isAr ? 'ساعة' : 'hrs'}
                  </td>
                  <td className="p-4"></td>
                  <td className="p-4 text-center font-mono text-emerald-400 font-black text-sm">
                    {Math.round(totalEarnedPayoutFiltered).toLocaleString()} {isAr ? 'ج.م' : 'EGP'}
                  </td>
                  <td className="p-4"></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Manual CheckIn Modal */}
      {isCheckInModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-[#0e1320] border-2 border-cyan-500/40 p-6 text-slate-100 shadow-2xl relative text-right rtl:text-right ltr:text-left">
            <button
              onClick={() => setIsCheckInModalOpen(false)}
              className="absolute top-4 left-4 rtl:left-4 rtl:right-auto ltr:right-4 ltr:left-auto p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/60"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-black text-white mb-4 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-cyan-400" />
              <span>{isAr ? 'تسجيل حضور موظف أو كابتن' : 'Record Employee Attendance'}</span>
            </h3>

            <form onSubmit={handleManualCheckIn} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">{isAr ? 'اختر الموظف / الكابتن' : 'Select Employee'}</label>
                <select
                  required
                  value={selectedEmployeeId}
                  onChange={(e) => setSelectedEmployeeId(e.target.value)}
                  className="w-full bg-[#080b12] border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-500 font-bold"
                >
                  <option value="">{isAr ? '-- اختر الموظف من القائمة --' : '-- Select --'}</option>
                  {allEmployees.map((emp, idx) => (
                    <option key={`att-modal-${emp.role}-${emp.id}-${idx}`} value={emp.id}>{emp.nameAr} ({emp.role})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1.5">{isAr ? 'ساعة الحضور' : 'Check-In Time'}</label>
                <input
                  type="time"
                  required
                  value={checkInTime}
                  onChange={(e) => setCheckInTime(e.target.value)}
                  className="w-full bg-[#080b12] border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-500 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1.5">{isAr ? 'ملاحظات' : 'Notes'}</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={isAr ? 'ملاحظات اختيارية...' : 'Optional notes...'}
                  className="w-full bg-[#080b12] border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs transition-colors shadow-lg shadow-cyan-500/20 cursor-pointer"
                >
                  {isAr ? 'تأكيد تسجيل الحضور' : 'Confirm Check-In'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsCheckInModalOpen(false)}
                  className="px-4 py-3 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs cursor-pointer"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
