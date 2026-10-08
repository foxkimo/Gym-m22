import React, { useState, useEffect } from 'react';
import { 
  Signature, 
  X, 
  Printer, 
  Check, 
  AlertCircle, 
  CheckSquare, 
  Square,
  ShieldCheck,
  CheckCircle2,
  Plus,
  Trash2,
  Sparkles,
  Dumbbell,
  Users,
  FileText,
  ScrollText,
  Download
} from 'lucide-react';
import { EmployeeAccount, EmploymentContract, CurrentUser } from '../types/gym';
import { StorageService } from '../services/storageService';
import { audioAlertService } from '../services/audioService';
import { pdfPrintService } from '../services/pdfPrintService';
import { ManagerOperationalCharterModal } from './ManagerOperationalCharterModal';

interface ManagerContractsProps {
  lang: 'ar' | 'en';
  currentUser: CurrentUser;
  managers: EmployeeAccount[];
  accountants: EmployeeAccount[];
  staff: EmployeeAccount[];
  coaches: EmployeeAccount[];
}

export const ManagerContracts: React.FC<ManagerContractsProps> = ({
  lang,
  currentUser,
  managers,
  accountants,
  staff,
  coaches
}) => {
  const isAr = lang === 'ar';
  const [contractsList, setContractsList] = useState<EmploymentContract[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeAccount | null>(null);
  const [isDrafting, setIsDrafting] = useState(false);
  const [isViewing, setIsViewing] = useState<EmploymentContract | null>(null);
  const [isCharterModalOpen, setIsCharterModalOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'manager' | 'accountant' | 'staff' | 'coach'>('all');
  const [quickEmpId, setQuickEmpId] = useState('');

  // Drafting Form State
  const [startingDate, setStartingDate] = useState(new Date().toISOString().split('T')[0]);
  const [contractSalary, setContractSalary] = useState(0);
  const [contractTerms, setContractTerms] = useState('');
  const [operationalDuties, setOperationalDuties] = useState<string[]>([]);
  const [newDutyInput, setNewDutyInput] = useState('');
  const [customClauses, setCustomClauses] = useState<string[]>([]);
  const [newClauseInput, setNewClauseInput] = useState('');
  const [isAgreed, setIsAgreed] = useState(true);
  const [signedPlace, setSignedPlace] = useState('إدارة نادي GYM-M22 الرياضي - الفرع الرئيسي');

  useEffect(() => {
    setContractsList(StorageService.getEmploymentContracts());
  }, []);

  const employees = React.useMemo(() => {
    const seen = new Set<string>();
    return [...managers, ...accountants, ...staff, ...coaches].filter(emp => {
      if (!emp || !emp.id || seen.has(emp.id)) return false;
      seen.add(emp.id);
      return true;
    });
  }, [managers, accountants, staff, coaches]);

  const handleSelectPresetTerms = (role: string) => {
    const defaultDuties = StorageService.getDefaultOperationalDuties(role);
    setOperationalDuties(defaultDuties);

    if (role === 'accountant') {
      setContractTerms(
        `1. الالتزام بساعات العمل الرسمية ومطابقة الحسابات واليوميات بدقة.\n` +
        `2. الحفاظ التام على سرية البيانات المالية للنادي وعدم مشاركتها خارج الإدارة.\n` +
        `3. إعداد وتقديم التقارير الختامية في المواعيد المحددة بكل دقة وأمانة.\n` +
        `4. الحفاظ على العهدة المالية والمطابقة المستمرة للخزينة.`
      );
    } else if (role === 'staff') {
      setContractTerms(
        `1. الالتزام بالحضور بالزي الرسمي وحسن استقبال وترحيب الأعضاء والزوار.\n` +
        `2. إدارة وتسجيل اشتراكات العملاء بدقة تامة طبقاً للوائح النادي.\n` +
        `3. تسليم واستلام الوردية اليومية بدقة ومطابقة الكاش والدرج بنسبة 100%.\n` +
        `4. تقديم الدعم الفني والإجابة على استفسارات المشتركين بلطف ورقي.`
      );
    } else if (role === 'coach') {
      setContractTerms(
        `1. تنفيذ وتصميم الجداول الرياضية والبرامج التدريبية للأعضاء حسب اللياقة البدنية والهدف الرياضي.\n` +
        `2. الالتزام بالسلامة والصحة المهنية لجميع اللاعبين داخل الصالة الرياضية وتوجيه التكنيك الصحيح.\n` +
        `3. الالتزام بسلوك رياضي وتدريبي راقٍ، والمحافظة على خصوصية وأسرار المتدربين.\n` +
        `4. تقديم وتفعيل الحصص الخاصة PT باحترافية ونشاط متميز ومتابعة قياسات InBody شهرياً.`
      );
    } else {
      setContractTerms(
        `1. إدارة العمليات اليومية ومراقبة انضباط الموظفين وسير العمل.\n` +
        `2. المحافظة على سلامة الأجهزة والمعدات والإشراف العام على مرافق الجيم.\n` +
        `3. رفع التقارير الدورية للإدارة والعمل على تحسين الكفاءة التشغيلية للنادي.\n` +
        `4. التعامل الراقي والمهني مع الشكاوى والمقترحات.`
      );
    }
  };

  const handleStartDrafting = (emp: EmployeeAccount) => {
    setSelectedEmployee(emp);
    setContractSalary(emp.baseSalary || (emp.role === 'manager' ? 12000 : emp.role === 'coach' ? 8500 : emp.role === 'accountant' ? 8000 : 5500));
    setStartingDate(emp.hiredDate || new Date().toISOString().split('T')[0]);
    handleSelectPresetTerms(emp.role);
    setIsAgreed(true);
    setSignedPlace('إدارة نادي GYM-M22 الرياضي - الفرع الرئيسي');
    setNewDutyInput('');
    setNewClauseInput('');
    
    const existing = contractsList.find(c => c.employeeId === emp.id);
    setCustomClauses(existing?.customClauses || []);

    if (existing) {
      setContractSalary(existing.salary);
      setStartingDate(existing.hiredDate);
      setContractTerms(existing.agreementTerms);
      setOperationalDuties(existing.operationalDuties && existing.operationalDuties.length > 0 ? existing.operationalDuties : StorageService.getDefaultOperationalDuties(emp.role));
      setIsAgreed(existing.isEmployeeAgreed);
      setSignedPlace(existing.signedPlace);
      setCustomClauses(existing.customClauses || []);
    }
    
    setIsDrafting(true);
  };

  const handleAddDuty = () => {
    if (!newDutyInput.trim()) return;
    setOperationalDuties(prev => [...prev, newDutyInput.trim()]);
    setNewDutyInput('');
  };

  const handleRemoveDuty = (index: number) => {
    setOperationalDuties(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveContract = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    const newContract: EmploymentContract = {
      id: selectedEmployee.id + '-contract',
      employeeId: selectedEmployee.id,
      employeeName: selectedEmployee.nameAr,
      employeePhone: selectedEmployee.phone,
      employeeRole: selectedEmployee.role,
      hiredDate: startingDate,
      contractDate: new Date().toISOString().split('T')[0],
      salary: contractSalary,
      agreementTerms: contractTerms.trim(),
      operationalDuties: operationalDuties.length > 0 ? operationalDuties : StorageService.getDefaultOperationalDuties(selectedEmployee.role),
      customClauses: customClauses,
      dutiesAgreed: isAgreed,
      isEmployeeAgreed: isAgreed,
      agreeTimestamp: isAgreed ? new Date().toLocaleString() : undefined,
      status: 'active',
      signedPlace: signedPlace.trim()
    };

    StorageService.saveEmploymentContract(newContract);
    const updated = StorageService.getEmploymentContracts();
    setContractsList(updated);
    setIsDrafting(false);
    setSelectedEmployee(null);
    audioAlertService.playSuccess();

    StorageService.logActivity({
      performerId: currentUser.id,
      performerName: currentUser.nameAr,
      performerRole: 'manager',
      category: 'system',
      actionType: 'login',
      titleAr: `صياغة عقد عمل ومهام تشغيلية: ${selectedEmployee.nameAr}`,
      titleEn: `Drafted operational contract for ${selectedEmployee.nameAr}`,
      detailsAr: `قام المدير العام بصياغة وتوثيق عقد العمل والمهام التشغيلية للموظف (${selectedEmployee.nameAr}) براتب قدره ${contractSalary} ج.م مع اعتماد (${operationalDuties.length}) مهام تشغيلية`,
      detailsEn: `Manager documented work contract and duties for ${selectedEmployee.nameAr} with salary ${contractSalary} EGP.`
    });
  };

  const filteredEmployees = employees.filter(emp => {
    if (roleFilter !== 'all' && emp.role !== roleFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return emp.nameAr.toLowerCase().includes(q) || emp.phone.includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-black text-white flex items-center gap-2">
            <Signature className="w-5 h-5 text-purple-400" />
            <span>{isAr ? 'مركز إدارة عقود العمل والمهام التشغيلية الرسمية' : 'Official Employment & Operational Contracts'}</span>
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {isAr ? 'صياغة واعتماد عقود العمل والمهام والمسؤوليات التشغيلية للكباتن والموظفين وتوثيق موافقة الكابتن' : 'Draft, manage, and verify operational duties and contracts for all staff & coaches'}
          </p>
        </div>

        {/* Top Direct Button for General Charter PDF */}
        <button
          type="button"
          onClick={() => setIsCharterModalOpen(true)}
          className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-sky-500 via-sky-400 to-sky-500 hover:from-sky-400 hover:to-sky-300 text-slate-950 font-black text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 active:scale-98 cursor-pointer shrink-0"
        >
          <ScrollText className="w-4 h-4" />
          <span>{isAr ? '📜 لائحة المهام والعقود العامة (PDF)' : 'General Duties Charter (PDF)'}</span>
        </button>
      </div>

      {/* SPECIAL HIGHLIGHT CARD: GENERAL OPERATIONAL CHARTER (بدون أسماء) */}
      <div className="bg-gradient-to-br from-[#0c182a] via-[#091222] to-[#050b14] p-4 sm:p-5 rounded-3xl border-2 border-sky-500/50 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 z-10">
          <div className="w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/40 flex items-center justify-center shrink-0 shadow-lg">
            <ScrollText className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-sky-500 text-slate-950 font-black">
                {isAr ? 'وثيقة تنظيمية عامة (بدون أسماء)' : 'General Bylaws Charter'}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                {isAr ? 'جاهزة للطباعة والتنزيل PDF' : 'Ready for Print & PDF'}
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-black text-white mt-1">
              {isAr ? '📜 اللائحة العامة للمهام والواجبات التشغيلية واللوائح الداخلية للنادي' : 'General Operational Duties & Code of Conduct Charter'}
            </h3>
            <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed max-w-2xl">
              {isAr 
                ? 'وثيقة عامة شاملة لكافة مهام الكباتن، موظفي الاستقبال، المحاسبين، الإدارة، وميثاق الأعضاء. يتاح للمدير طباعتها ورقياً أو تنزيلها بصيغة PDF لتعميمها دون أسماء محددة.'
                : 'Comprehensive duties for coaches, staff, accounting, management, and member policies. Ready for direct printing and distribution.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto shrink-0 z-10">
          <button
            type="button"
            onClick={() => setIsCharterModalOpen(true)}
            className="flex-1 md:flex-none px-4 py-2.5 rounded-2xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow"
          >
            <FileText className="w-4 h-4" />
            <span>{isAr ? 'تصفح اللائحة 👁️' : 'Browse Charter'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              audioAlertService.playBeep(523.25, 0.1);
              pdfPrintService.printGeneralOperationalCharterPDF('all');
            }}
            className="flex-1 md:flex-none px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg active:scale-98"
          >
            <Printer className="w-4 h-4" />
            <span>{isAr ? '🖨️ طباعة اللائحة (PDF)' : 'Print Charter PDF'}</span>
          </button>
        </div>
      </div>

      {/* Quick Employee Selector Header */}
      <div className="bg-gradient-to-r from-[#121826] via-[#0b101d] to-[#050810] p-5 rounded-3xl border-2 border-amber-500/40 shadow-2xl space-y-3">
        <div className="flex items-center gap-2 text-[#f7cb55] font-black text-xs">
          <Signature className="w-4 h-4" />
          <span>{isAr ? 'اختر الموظف أو الكابتن لطلب وعرض عقد العمل باسمه فوراً:' : 'Select Employee by Name to Issue/View Contract:'}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <select
            value={quickEmpId}
            onChange={(e) => {
              const empId = e.target.value;
              setQuickEmpId(empId);
              const targetEmp = employees.find(emp => emp.id === empId);
              if (targetEmp) {
                handleStartDrafting(targetEmp);
              }
            }}
            className="bg-[#050810] border-2 border-amber-500/60 rounded-2xl p-3 text-xs text-amber-300 font-black focus:outline-none focus:border-amber-400 cursor-pointer shadow-lg"
          >
            <option value="">{isAr ? '--- اضغط هنا لاختيار الموظف باسمه لحرر عقده ---' : '--- Select Employee Name ---'}</option>
            {employees.map(e => (
              <option key={e.id} value={e.id} className="bg-[#0e1320] text-white font-bold">
                {e.nameAr} ({e.role === 'manager' ? 'مدير عام' : e.role === 'accountant' ? 'محاسب' : e.role === 'coach' ? 'كابتن ومدرب PT' : 'موظف استقبال'}) - {e.phone}
              </option>
            ))}
          </select>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isAr ? 'ابحث باسم الموظف أو رقم الهاتف...' : 'Search by name or phone...'}
            className="bg-[#050810] border border-slate-800 rounded-2xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80">
          <span className="text-[11px] text-slate-400 font-bold ml-1">{isAr ? 'تصفية حسب الرتبة:' : 'Filter Role:'}</span>
          {(['all', 'coach', 'staff', 'accountant', 'manager'] as const).map(rf => (
            <button
              key={rf}
              onClick={() => setRoleFilter(rf)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                roleFilter === rf
                  ? 'bg-amber-500 text-slate-950 font-black shadow'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {rf === 'all' && (isAr ? 'الكل' : 'All')}
              {rf === 'coach' && (isAr ? 'الكباتن والمدربين PT 🏋️' : 'Coaches')}
              {rf === 'staff' && (isAr ? 'الاستقبال والكاشير 👥' : 'Staff')}
              {rf === 'accountant' && (isAr ? 'المحاسبين 💰' : 'Accountants')}
              {rf === 'manager' && (isAr ? 'الإدارة 👔' : 'Managers')}
            </button>
          ))}
        </div>
      </div>

      {/* Employees Contracts Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-black text-slate-300 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Users className="w-4 h-4 text-sky-400" />
            <span>{isAr ? 'سجل عقود العمل والمهام التشغيلية للكادر الرياضي والإداري:' : 'Staff Contracts & Operational Duties Directory:'}</span>
          </span>
          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-900 text-slate-400 font-mono">
            {filteredEmployees.length} {isAr ? 'موظف' : 'employees'}
          </span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredEmployees.map(emp => {
            const contract = contractsList.find(c => c.employeeId === emp.id);
            const isSigned = contract?.isEmployeeAgreed;
            const dutiesCount = contract?.operationalDuties?.length || StorageService.getDefaultOperationalDuties(emp.role).length;

            return (
              <div
                key={emp.id}
                className="bg-[#0b101d] rounded-2xl p-4 border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col justify-between gap-3 shadow-lg"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400 font-black shrink-0">
                      {emp.role === 'coach' ? <Dumbbell className="w-5 h-5 text-sky-400" /> : <Signature className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="font-black text-white text-sm flex items-center gap-1.5">
                        <span>{emp.nameAr}</span>
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                        <span className="font-mono">{emp.phone}</span>
                        <span>•</span>
                        <span className="text-amber-400 font-bold">
                          {emp.role === 'coach' ? 'كابتن ومدرب PT' : emp.role === 'accountant' ? 'محاسب مالي' : emp.role === 'manager' ? 'مدير عام' : 'موظف استقبال'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold border shrink-0 ${
                    isSigned 
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                      : contract?.status === 'rejected'
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                        : contract 
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                          : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                  }`}>
                    {isSigned ? (isAr ? 'موقّع ومعتمد ✓' : 'Signed ✓') : contract?.status === 'rejected' ? (isAr ? 'مرفوض من الموظف ❌' : 'Rejected ❌') : contract ? (isAr ? 'بانتظار التوقيع ⏳' : 'Pending') : (isAr ? 'غير محرر ⚠️' : 'Not drafted')}
                  </span>
                </div>

                {/* Contract Status & Operational Duties Summary */}
                <div className="bg-[#050810] p-3 rounded-xl border border-slate-800/80 flex items-center justify-between text-[11px]">
                  <div className="space-y-0.5">
                    <span className="text-slate-400 block text-[10px]">{isAr ? 'المهام التشغيلية والراتب:' : 'Duties & Salary:'}</span>
                    <strong className="text-[#f7cb55] font-black font-mono text-xs">
                      {contract ? `${contract.salary.toLocaleString()} ج.م` : `${(emp.baseSalary || 0).toLocaleString()} ج.م`}
                    </strong>
                    <span className="text-sky-400 text-[10px] font-bold block">
                      {dutiesCount} {isAr ? 'مهام تشغيلية معتمدة' : 'operational tasks'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {contract && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsViewing(contract);
                          audioAlertService.playSuccess();
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5 text-sky-400" />
                        <span>{isAr ? 'عرض العقد' : 'View'}</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleStartDrafting(emp)}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs transition-all cursor-pointer flex items-center gap-1 shadow"
                    >
                      <Signature className="w-3.5 h-3.5" />
                      <span>{contract?.status === 'rejected' ? (isAr ? 'إعادة إرسال' : 'Resend') : contract ? (isAr ? 'تعديل العقد' : 'Edit') : (isAr ? 'صياغة العقد +' : 'Draft +')}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL 1: CONTRACT & OPERATIONAL DUTIES DRAFTING FORM */}
      {isDrafting && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-2xl rounded-3xl bg-[#0e1320] border-2 border-purple-500/40 p-5 sm:p-6 text-slate-100 shadow-2xl relative text-right rtl:text-right scrollbar-thin overflow-y-auto max-h-[92vh]">
            <button
              onClick={() => {
                setIsDrafting(false);
                setSelectedEmployee(null);
              }}
              className="absolute top-4 left-4 p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/60 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4 border-b border-slate-800 pb-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                <Signature className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white">
                  {isAr ? `صياغة عقد العمل والمهام التشغيلية: ${selectedEmployee.nameAr}` : `Draft Contract & Duties: ${selectedEmployee.nameAr}`}
                </h3>
                <span className="text-xs text-[#f7cb55] font-bold">
                  {isAr ? `تحديد المهام التشغيلية، الراتب المعتمد، وشروط التعاقد` : `Set operational duties, salary & terms`}
                </span>
              </div>
            </div>

            <form onSubmit={handleSaveContract} className="space-y-4 text-xs">
              {/* Basic Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#080b12] p-3.5 rounded-2xl border border-slate-800">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">{isAr ? 'تاريخ بداية العمل الفعلي' : 'Start Date'}</label>
                  <input
                    type="date"
                    required
                    value={startingDate}
                    onChange={(e) => setStartingDate(e.target.value)}
                    className="w-full bg-[#050810] border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-purple-500 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">{isAr ? 'الراتب الشهري المتفق عليه (ج.م)' : 'Monthly Salary (EGP)'}</label>
                  <input
                    type="number"
                    required
                    value={contractSalary}
                    onChange={(e) => setContractSalary(Number(e.target.value))}
                    className="w-full bg-[#050810] border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-purple-500 font-mono text-amber-400 font-black text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-bold mb-1">{isAr ? 'مكان توقيع العقد والمقر الرسمي' : 'Signing Place'}</label>
                  <input
                    type="text"
                    required
                    value={signedPlace}
                    onChange={(e) => setSignedPlace(e.target.value)}
                    className="w-full bg-[#050810] border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* OPERATIONAL DUTIES BUILDER */}
              <div className="bg-gradient-to-br from-[#0c1322] to-[#080d17] p-4 rounded-2xl border-2 border-sky-500/40 space-y-3">
                <div className="flex items-center justify-between border-b border-sky-500/30 pb-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-sky-400" />
                    <h4 className="text-xs font-black text-sky-300">
                      {isAr ? 'المهام والمسؤوليات التشغيلية الرسمية المعتمدة للعقد:' : 'Approved Operational Duties:'}
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSelectPresetTerms(selectedEmployee.role)}
                    className="text-amber-400 hover:underline font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isAr ? 'استعادة المهام القياسية للوظيفة' : 'Reset Standard Duties'}</span>
                  </button>
                </div>

                {/* Duty Items List */}
                <div className="space-y-2 max-h-52 overflow-y-auto scrollbar-thin pr-1">
                  {operationalDuties.map((duty, idx) => (
                    <div key={idx} className="flex items-start justify-between gap-2 bg-[#050810] p-2.5 rounded-xl border border-slate-800 text-[11px] text-slate-200 group">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">
                          <strong className="text-amber-400 ml-1 font-mono">{idx + 1}.</strong> {duty}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveDuty(idx)}
                        className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer opacity-80 group-hover:opacity-100 transition-all shrink-0"
                        title={isAr ? 'حذف هذه المهمة' : 'Delete duty'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Custom Duty */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                  <input
                    type="text"
                    value={newDutyInput}
                    onChange={(e) => setNewDutyInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddDuty();
                      }
                    }}
                    placeholder={isAr ? 'أضف مهمة تشغيلية إضافية للعقد...' : 'Add custom operational duty...'}
                    className="flex-1 bg-[#050810] border border-slate-700 rounded-xl p-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddDuty}
                    className="px-3 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs transition-all cursor-pointer flex items-center gap-1 shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isAr ? 'إضافة مهمة' : 'Add Duty'}</span>
                  </button>
                </div>
              </div>

              {/* CUSTOM CLAUSES BUILDER */}
              <div className="bg-[#0c1322] p-4 rounded-2xl border border-amber-500/30 space-y-3 mt-4">
                <div className="flex items-center gap-2 border-b border-amber-500/20 pb-2">
                  <FileText className="w-5 h-5 text-amber-400" />
                  <h4 className="text-xs font-black text-amber-300">
                    {isAr ? 'بنود إضافية خاصة بالعقد:' : 'Custom Contract Clauses:'}
                  </h4>
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto scrollbar-thin pr-1">
                  {customClauses.map((clause, idx) => (
                    <div key={idx} className="flex items-start justify-between gap-2 bg-[#050810] p-2.5 rounded-xl border border-slate-800 text-[11px] text-slate-200 group">
                      <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <span className="leading-relaxed"><strong className="text-amber-400 ml-1 font-mono">{idx + 1}.</strong> {clause}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCustomClauses(prev => prev.filter((_, i) => i !== idx))}
                        className="p-1 rounded-lg text-slate-500 hover:text-rose-400 cursor-pointer opacity-80"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="text"
                    value={newClauseInput}
                    onChange={(e) => setNewClauseInput(e.target.value)}
                    placeholder={isAr ? 'أضف بنداً خاصاً...' : 'Add custom clause...'}
                    className="flex-1 bg-[#050810] border border-slate-700 rounded-xl p-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!newClauseInput.trim()) return;
                      setCustomClauses(prev => [...prev, newClauseInput.trim()]);
                      setNewClauseInput('');
                    }}
                    className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all cursor-pointer"
                  >
                    {isAr ? 'إضافة بند' : 'Add Clause'}
                  </button>
                </div>
              </div>

              {/* General Agreement Terms */}
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">{isAr ? 'بنود العقد والالتزامات الوظيفية العامة' : 'Contract Terms & Obligations'}</label>
                <textarea
                  required
                  rows={4}
                  value={contractTerms}
                  onChange={(e) => setContractTerms(e.target.value)}
                  className="w-full bg-[#080b12] border border-slate-800 rounded-2xl p-3 text-white focus:outline-none focus:border-purple-500 leading-relaxed font-semibold text-right text-xs"
                />
              </div>

              {/* Salary Agreement & Employee consent status */}
              <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2">
                <strong className="text-white font-bold block text-[11px]">{isAr ? 'إقرار وموافقة الموظف/الكابتن على الراتب والمهام التشغيلية' : 'Employee Consent'}</strong>
                <div
                  onClick={() => setIsAgreed(!isAgreed)}
                  className={`p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                    isAgreed
                      ? 'bg-purple-950/20 border-purple-500/40'
                      : 'bg-slate-900/40 border-slate-800'
                  }`}
                >
                  <span className="font-bold text-white text-[11px]">{isAr ? 'نعم، تم اعتماد وتوقيع العقد والموافقة على المهام' : 'Yes, contract and duties agreed & consented'}</span>
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                    isAgreed ? 'bg-purple-600 text-white shadow-md' : 'bg-slate-800 text-slate-500'
                  }`}>
                    {isAgreed ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                  </div>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-amber-500 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-black text-xs transition-colors shadow-lg shadow-purple-600/20 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Signature className="w-4 h-4" />
                  <span>{isAr ? 'تأكيد وحفظ العقد والمهام التشغيلية ✍️' : 'Save & Certify Contract & Duties ✍️'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsDrafting(false);
                    setSelectedEmployee(null);
                  }}
                  className="px-5 py-3.5 rounded-2xl bg-slate-800 text-slate-300 font-bold text-xs cursor-pointer"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: OFFICIAL CONTRACT VIEW & PRINTING */}
      {isViewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-2xl rounded-3xl bg-white text-slate-900 p-6 sm:p-8 shadow-2xl relative text-right rtl:text-right scrollbar-thin overflow-y-auto max-h-[92vh]">

            {/* Close and Print Button Controls */}
            <div className="absolute top-4 left-4 flex items-center gap-2 z-20 print:hidden">
              <button
                onClick={() => {
                  audioAlertService.playBeep(523.25, 0.1);
                  pdfPrintService.printEmploymentContractPDF(isViewing);
                }}
                className="px-3 py-2 bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-black rounded-xl hover:from-amber-400 hover:to-amber-300 cursor-pointer flex items-center gap-1.5 text-xs shadow-md"
              >
                <Printer className="w-4 h-4" />
                <span>{isAr ? 'طباعة العقد والمهام (PDF)' : 'Print Contract'}</span>
              </button>
              <button
                onClick={() => setIsViewing(null)}
                className="p-2 text-slate-500 hover:text-slate-900 rounded-xl bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* REAL OFFICIAL ATHLETIC CONTRACT DOCUMENT SHEET (جاهز للطباعة) */}
            <div id="printable-contract-sheet" className="space-y-5 pt-4 text-xs select-text">
              {/* Center Logo & Title */}
              <div className="flex flex-col items-center justify-center text-center pb-3 border-b-2 border-slate-950">
                <div className="w-16 h-16 bg-slate-950 rounded-full flex items-center justify-center border-4 border-slate-950 shadow-md">
                  <span className="text-white font-black text-lg tracking-widest font-mono">M22</span>
                </div>
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-1">GYM-M22 SPORTS CLUB</span>
                <h1 className="text-base sm:text-lg font-black text-slate-950 mt-1 tracking-widest">{isAr ? 'عَقْـد عَمَـلْ وَاتِّفَـاقِيَّة مَهَـام تَشْـغِيلِيَّة رَسْـمِيَّة' : 'OFFICIAL WORK & OPERATIONAL CONTRACT'}</h1>
              </div>

              {/* Left-Right Info Sub-Header */}
              <div className="flex justify-between items-center text-[10px] text-slate-600 font-bold px-1 border-b border-dashed border-slate-200 pb-1">
                <div>
                  <span>جمهورية مصر العربية</span>
                </div>
                <div>
                  <span>تاريخ الصياغة: {isViewing.contractDate}</span>
                </div>
              </div>

              {/* Introductory Text */}
              <p className="leading-relaxed font-semibold text-slate-800">
                إنه في يوم <span className="font-mono font-bold text-slate-950">{isViewing.contractDate}</span>، تم الاتفاق والتعاقد بين نادي <strong className="text-slate-950">GYM-M22 الرياضي</strong> كطرف أول (صاحب العمل)، وبين السيد/الطرف الثاني المذكور تفاصيله أدناه:
              </p>

              {/* Employee Profile Information */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block">{isAr ? 'اسم الموظف بالكامل:' : 'Full Name:'}</span>
                  <strong className="text-slate-950 font-black">{isViewing.employeeName}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block">{isAr ? 'رقم الهاتف والتواصل:' : 'Phone No:'}</span>
                  <strong className="text-slate-950 font-black font-mono">{isViewing.employeePhone}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block">{isAr ? 'الرتبة والمسؤولية في الجيم:' : 'Role:'}</span>
                  <strong className="text-amber-700 font-black">
                    {isViewing.employeeRole === 'manager' ? 'مدير عام' : isViewing.employeeRole === 'accountant' ? 'مسؤول حسابات' : isViewing.employeeRole === 'coach' ? 'كابتن ومدرب لياقة بدنية PT' : 'موظف استقبال وكاشير'}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block">{isAr ? 'تاريخ بداية التعيين والمباشرة:' : 'Start Date:'}</span>
                  <strong className="text-slate-950 font-black font-mono">{isViewing.hiredDate}</strong>
                </div>
              </div>

              {/* OPERATIONAL DUTIES ANNEX (الملحق التشغيلي وموافقة الكابتن) */}
              <div className="border border-sky-200 bg-sky-50/70 rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-sky-950 text-xs flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-sky-600" />
                    <span>{isAr ? 'ملحق المهام والمسؤوليات التشغيلية المعتمدة بالعقد (موافق عليها):' : 'Approved Operational Duties:'}</span>
                  </h4>
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                    {isAr ? 'موافق عليها بالعقد ✓' : 'Agreed ✓'}
                  </span>
                </div>

                <div className="space-y-1.5 pr-1">
                  {(isViewing.operationalDuties && isViewing.operationalDuties.length > 0 
                    ? isViewing.operationalDuties 
                    : StorageService.getDefaultOperationalDuties(isViewing.employeeRole)
                  ).map((duty, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-[10.5px] text-slate-800 bg-white p-2 rounded-xl border border-sky-100 shadow-2xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="leading-relaxed font-semibold">
                        <strong className="text-slate-950 ml-1 font-mono">{idx + 1}.</strong> {duty}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl text-[10px] text-emerald-950 font-bold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    {isAr 
                      ? '✓ إقرار الكابتن/الموظف: أقر بالموافقة التامة والالتزام بجميع المهام التشغيلية المذكورة أعلاه كجزء أصيل ولا يتجزأ من عقدي الرسمي.'
                      : '✓ The employee acknowledges and agrees to all operational duties as an integral part of this contract.'}
                  </span>
                </div>
              </div>

              {/* Salary & Consent Clause */}
              <div className="p-4 border-2 border-slate-950 rounded-2xl bg-slate-50 space-y-2">
                <h4 className="text-[11px] font-black text-slate-950 flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>{isAr ? 'البند المالي وموافقة الموظف الرسمية:' : 'Salary Consented & Agreed:'}</span>
                </h4>
                <p className="leading-relaxed font-bold text-slate-800">
                  {isAr 
                    ? `يتعهد الطرف الأول (صاحب العمل) بدفع راتب شهري أساسي قدره (${isViewing.salary.toLocaleString()} ج.م) للطرف الثاني (الموظف) لقاء أداء واجباته الموكلة إليه، وقد أقر الطرف الثاني بموافقته التامة والكاملة على هذا الأجر دون أي تحفظ.`
                    : `The employer agrees to pay a monthly salary of ${isViewing.salary.toLocaleString()} EGP to the employee, which has been fully consented, signed, and accepted by the employee.`}
                </p>
                {isViewing.isEmployeeAgreed && (
                  <div className="text-[10px] text-emerald-700 font-bold mt-1.5 flex items-center gap-1 bg-emerald-50 border border-emerald-200/50 p-2 rounded-xl">
                    <Check className="w-4 h-4" />
                    <span>{isAr ? `تم التوقيع والموافقة الإلكترونية بتاريخ: ${isViewing.agreeTimestamp || isViewing.contractDate}` : `Digitally accepted and signed on: ${isViewing.agreeTimestamp}`}</span>
                  </div>
                )}
              </div>

              {/* Agreed Terms & Obligations */}
              <div className="space-y-2">
                <h4 className="font-black text-slate-950 text-[11px]">{isAr ? 'شروط الالتزام واللوائح العامة المعتمدة:' : 'Obligations & Terms:'}</h4>
                <div className="p-3.5 border border-slate-200 rounded-2xl bg-slate-50/50 leading-relaxed font-semibold text-slate-700 whitespace-pre-line text-right">
                  {isViewing.agreementTerms}
                </div>
              </div>

              {/* Signatures & Stamps section */}
              <div className="pt-6 grid grid-cols-2 gap-8 text-center border-t-2 border-slate-950">
                <div className="space-y-2">
                  <strong className="text-slate-950 font-bold block">{isAr ? 'توقيع الطرف الأول (المدير العام)' : 'Employer Signature'}</strong>
                  <div className="h-10 border-b border-slate-400 flex items-center justify-center italic text-slate-500 font-serif text-[11px]">
                    إدارة نادي M22 الرياضي
                  </div>
                  <span className="text-[10px] text-slate-500 font-bold">{currentUser.nameAr}</span>
                </div>
                <div className="space-y-2">
                  <strong className="text-slate-950 font-bold block">{isAr ? 'توقيع الطرف الثاني (الموظف / الكابتن)' : 'Employee Signature'}</strong>
                  <div className="h-10 border-b border-slate-400 flex items-center justify-center text-emerald-700 font-black font-mono text-[11px] tracking-wider">
                    {isViewing.isEmployeeAgreed ? 'SIGNED_DIGITALLY_M22' : '________________________'}
                  </div>
                  <span className="text-[10px] text-slate-500 font-bold">{isViewing.employeeName}</span>
                </div>
              </div>

              {/* Terms Stamp Place */}
              <div className="text-center pt-2 text-[9px] text-slate-400 font-semibold font-mono">
                {isViewing.id} | Place: {isViewing.signedPlace}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: GENERAL OPERATIONAL CHARTER & BYLAWS (بدون أسماء) */}
      {isCharterModalOpen && (
        <ManagerOperationalCharterModal
          lang={lang}
          onClose={() => setIsCharterModalOpen(false)}
        />
      )}
    </div>
  );
};
