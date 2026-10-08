import React, { useState, useEffect } from 'react';
import { 
  X, 
  Signature, 
  Check, 
  Printer, 
  AlertCircle, 
  FileText,
  BadgeCheck,
  CheckCircle2,
  ListOrdered,
  Sparkles,
  ShieldCheck,
  Dumbbell
} from 'lucide-react';
import { CurrentUser, EmploymentContract } from '../types/gym';
import { StorageService } from '../services/storageService';
import { audioAlertService } from '../services/audioService';
import { pdfPrintService } from '../services/pdfPrintService';

interface EmployeeContractModalProps {
  currentUser: CurrentUser;
  lang: 'ar' | 'en';
  onClose: () => void;
  onReject?: () => void;
  isForcedOnboarding?: boolean;
}

export const EmployeeContractModal: React.FC<EmployeeContractModalProps> = ({
  currentUser,
  lang,
  onClose,
  onReject,
  isForcedOnboarding = false
}) => {
  const isAr = lang === 'ar';
  const isCoach = currentUser.role === 'coach';
  const [contract, setContract] = useState<EmploymentContract | null>(null);
  const [isSaved, setIsSigned] = useState(false);
  
  // Need to call handleReject
  const handleReject = () => {
    if (contract) {
      StorageService.rejectEmploymentContract(contract.id, currentUser.nameAr);
      if (onReject) onReject();
    }
  };

  // ... (form stuff) ...
  // ... (add button in JSX) ...

  // Form states if drafting/signing from employee side
  const [nameAr, setNameAr] = useState(currentUser.nameAr || '');
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [salary, setSalary] = useState(0);
  const [hiredDate, setHiredDate] = useState(new Date().toISOString().split('T')[0]);
  const [agreementTerms, setAgreementTerms] = useState('');
  const [signedPlace, setSignedPlace] = useState('إدارة نادي GYM-M22 الرياضي - الفرع الرئيسي');
  const [operationalDuties, setOperationalDuties] = useState<string[]>([]);
  const [dutiesAgreed, setDutiesAgreed] = useState(true);

  useEffect(() => {
    const contracts = StorageService.getEmploymentContracts();
    const existing = contracts.find(c => c.employeeId === currentUser.id);
    const defaultDuties = StorageService.getDefaultOperationalDuties(currentUser.role);

    if (existing) {
      setContract(existing);
      setIsSigned(existing.isEmployeeAgreed);
      setOperationalDuties(existing.operationalDuties && existing.operationalDuties.length > 0 ? existing.operationalDuties : defaultDuties);
      setDutiesAgreed(existing.dutiesAgreed !== false);
    } else {
      // Prefill some defaults depending on role
      setNameAr(currentUser.nameAr || '');
      setPhone(currentUser.phone || '');
      setOperationalDuties(defaultDuties);
      setDutiesAgreed(true);
      
      let initialSalary = 5500;
      if (currentUser.role === 'accountant') initialSalary = 8000;
      else if (currentUser.role === 'coach') initialSalary = 8500;
      else if (currentUser.role === 'manager') initialSalary = 12000;
      setSalary(initialSalary);
      
      let terms = '';
      if (currentUser.role === 'accountant') {
        terms = `1. الالتزام بساعات العمل الرسمية ومطابقة الحسابات واليوميات بدقة.\n2. الحفاظ التام على سرية البيانات المالية ومستندات الخزينة للنادي.\n3. إعداد وتقديم التقارير الختامية في المواعيد المحددة بكل أمانة.`;
      } else if (currentUser.role === 'coach') {
        terms = `1. تنفيذ وتصميم الجداول الرياضية والبرامج التدريبية للأعضاء وفق أسس علمية.\n2. الالتزام بالسلامة والصحة المهنية لجميع اللاعبين داخل الصالة الرياضية.\n3. الالتزام بسلوك رياضي وتدريبي راقٍ، والمحافظة على خصوصية المتدربين.`;
      } else if (currentUser.role === 'staff') {
        terms = `1. الالتزام بالزي الرسمي وحسن استقبال وترحيب الأعضاء والزوار.\n2. إدارة وتسجيل اشتراكات العملاء بدقة تامة طبقاً للوائح النادي.\n3. تسليم واستلام الوردية اليومية بدقة ومطابقة الكاش والدرج.`;
      } else {
        terms = `1. إدارة العمليات اليومية ومراقبة انضباط الموظفين وسير العمل.\n2. الإشراف العام على مرافق الجيم ورفع التقارير الدورية للإدارة.`;
      }
      setAgreementTerms(terms);
    }
  }, [currentUser]);

  const handleAgreeAndSign = (e: React.FormEvent) => {
    e.preventDefault();

    if (!dutiesAgreed) {
      alert(isAr ? 'يرجى تأكيد الموافقة على المهام والمسؤوليات التشغيلية لإتمام توقيع العقد.' : 'Please confirm agreement with operational duties to sign.');
      return;
    }

    const signedContract: EmploymentContract = {
      id: currentUser.id + '-contract',
      employeeId: currentUser.id,
      employeeName: contract ? contract.employeeName : nameAr.trim(),
      employeePhone: contract ? contract.employeePhone : phone.trim(),
      employeeRole: currentUser.role as any,
      hiredDate: contract ? contract.hiredDate : hiredDate,
      contractDate: contract ? contract.contractDate : new Date().toISOString().split('T')[0],
      salary: contract ? contract.salary : salary,
      agreementTerms: contract ? contract.agreementTerms : agreementTerms.trim(),
      operationalDuties: operationalDuties.length > 0 ? operationalDuties : StorageService.getDefaultOperationalDuties(currentUser.role),
      dutiesAgreed: true,
      isEmployeeAgreed: true,
      agreeTimestamp: new Date().toLocaleString(),
      status: 'active',
      signedPlace: contract ? contract.signedPlace : signedPlace.trim()
    };

    StorageService.saveEmploymentContract(signedContract);
    setContract(signedContract);
    setIsSigned(true);
    audioAlertService.playSuccess();

    StorageService.logActivity({
      performerId: currentUser.id,
      performerName: currentUser.nameAr,
      performerRole: currentUser.role as any,
      category: 'system',
      actionType: 'login',
      titleAr: `توقيع عقد العمل والمهام التشغيلية: ${currentUser.nameAr}`,
      titleEn: `Employee signed operational contract: ${currentUser.nameAr}`,
      detailsAr: `قام ${isCoach ? 'الكابتن' : 'الموظف'} (${currentUser.nameAr}) بالاطلاع والموافقة الإلكترونية على المهام والمسؤوليات التشغيلية وتوقيع عقد العمل الرسمي براتب (${signedContract.salary} ج.م)`,
      detailsEn: `Employee signed work contract and operational duties with salary ${signedContract.salary} EGP.`
    });
  };

  const roleNameArabic = currentUser.role === 'coach' 
    ? 'كابتن ومدرب الصالة PT' 
    : currentUser.role === 'accountant' 
      ? 'المسؤول المالي والمحاسب' 
      : currentUser.role === 'staff' 
        ? 'موظف الاستقبال والكاشير' 
        : 'المدير العام';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-3xl bg-[#0e1320] border-2 border-amber-500/40 p-5 sm:p-6 text-slate-100 shadow-2xl relative text-right rtl:text-right scrollbar-thin overflow-y-auto max-h-[92vh]">

        {!isForcedOnboarding && (
          <button
            onClick={onClose}
            className="absolute top-4 left-4 p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/60 cursor-pointer transition-colors print:hidden"
            title={isAr ? 'إغلاق' : 'Close'}
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5 border-b border-slate-800 pb-4 print:hidden">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
            {isCoach ? <Dumbbell className="w-6 h-6 animate-pulse" /> : <Signature className="w-6 h-6 animate-pulse" />}
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
              <span>{isAr ? `📄 عقد العمل والمهام التشغيلية المعتمدة - ${roleNameArabic}` : '📄 Official Employment Contract & Operational Duties'}</span>
            </h3>
            <span className="text-[11px] text-[#f7cb55] font-bold block mt-0.5">
              {isAr ? 'مراجعة وتأكيد بنود التوظيف والمهام التشغيلية والموافقة على الراتب' : 'Review operational duties, salary agreement & digital signature'}
            </span>
          </div>
        </div>

        {/* If already signed and agreed, show print-ready preview! */}
        {isSaved && contract ? (
          <div className="space-y-4">
            <div className="p-3.5 bg-emerald-500/10 border-2 border-emerald-500/30 text-emerald-300 rounded-2xl flex items-center justify-between gap-2 text-xs font-black shadow-lg print:hidden">
              <div className="flex items-center gap-2">
                <BadgeCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>{isAr ? '✓ هذا العقد موقّع رسمياً والمهام التشغيلية معتمدة ومحفوظة بالإدارة' : 'This contract & duties are officially agreed and saved'}</span>
              </div>
              <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                {contract.agreeTimestamp || 'معتمد'}
              </span>
            </div>

            {/* Dual Print & Download Buttons */}
            <div className="grid grid-cols-2 gap-2.5 print:hidden">
              <button
                type="button"
                onClick={() => {
                  audioAlertService.playBeep(523.25, 0.1);
                  pdfPrintService.printEmploymentContractPDF(contract);
                }}
                className="py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-98"
              >
                <Printer className="w-4 h-4" />
                <span>{isAr ? '🖨️ طباعة العقد والمهام' : 'Print Contract & Duties'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  audioAlertService.playBeep(523.25, 0.1);
                  pdfPrintService.printEmploymentContractPDF(contract);
                }}
                className="py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-950 font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-98"
              >
                <FileText className="w-4 h-4" />
                <span>{isAr ? '📥 تنزيل العقد PDF' : 'Download Contract PDF'}</span>
              </button>
            </div>

            {/* Official Contract Sheet Visual Preview */}
            <div id="printable-contract-sheet" className="p-5 sm:p-6 bg-white text-slate-900 rounded-3xl border border-slate-200 space-y-4 text-[11px] leading-relaxed text-right select-text shadow-xl">
              {/* Center Logo & Title */}
              <div className="flex flex-col items-center justify-center text-center pb-3 border-b-2 border-slate-900">
                <div className="w-14 h-14 bg-slate-950 rounded-full flex items-center justify-center border-4 border-slate-950 shadow-md">
                  <span className="text-white font-black text-base tracking-widest font-mono">M22</span>
                </div>
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-1">نادي M22 الرياضي</span>
                <h1 className="text-base font-black text-slate-950 mt-1 tracking-wider">{isAr ? 'عَقْـد عَمَـلْ وَاتِّفَـاقِيَّة مَهَـام تَشْـغِيلِيَّة مُعْتَمَـدَة' : 'OFFICIAL WORK & OPERATIONAL CONTRACT'}</h1>
              </div>

              {/* Left-Right Info Sub-Header */}
              <div className="flex justify-between items-center text-[10px] text-slate-600 font-bold px-1 pb-1 border-b border-dashed border-slate-200">
                <div>
                  <span>جمهورية مصر العربية</span>
                </div>
                <div>
                  <span>تاريخ الصياغة: {contract.contractDate}</span>
                </div>
              </div>

              {/* Contract Parties Info */}
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <p><strong>اسم الموظف:</strong> <span className="font-black text-slate-950">{contract.employeeName}</span></p>
                <p><strong>رقم الهاتف:</strong> <span className="font-mono font-bold text-slate-900">{contract.employeePhone}</span></p>
                <p><strong>الرتبة والوظيفة:</strong> <span className="font-bold text-amber-700">{isAr ? (contract.employeeRole === 'coach' ? 'كابتن ومدرب صالة لياقة PT' : contract.employeeRole === 'accountant' ? 'مسؤول حسابات وخزينة' : contract.employeeRole === 'manager' ? 'مدير عام' : 'موظف استقبال وكاشير') : contract.employeeRole}</span></p>
                <p><strong>تاريخ بداية العمل:</strong> {contract.hiredDate}</p>
                <p className="col-span-2"><strong>الراتب الشهري المعتمد:</strong> <span className="font-black text-amber-600 text-xs font-mono">{contract.salary.toLocaleString()} ج.م</span> (تمت الموافقة عليه)</p>
                <p className="col-span-2"><strong>مقر العمل:</strong> {contract.signedPlace}</p>
              </div>

              {/* 1. Operational Duties Annex (الملحق التشغيلي) */}
              <div className="border border-sky-200 bg-sky-50/70 rounded-2xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-sky-950 text-xs flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-sky-600" />
                    <span>{isAr ? 'ملحق المهام والمسؤوليات التشغيلية الرسمية (تمت موافقة الكابتن عليها):' : 'Approved Operational Duties:'}</span>
                  </h4>
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                    {isAr ? 'موافق عليها بالعقد ✓' : 'Agreed in Contract ✓'}
                  </span>
                </div>

                <div className="space-y-1.5 pr-1">
                  {(contract.operationalDuties && contract.operationalDuties.length > 0 
                    ? contract.operationalDuties 
                    : StorageService.getDefaultOperationalDuties(contract.employeeRole)
                  ).map((duty, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-[10.5px] text-slate-800 bg-white p-2 rounded-xl border border-sky-100 shadow-2xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="leading-relaxed font-semibold">
                        <strong className="text-slate-950 ml-1 font-mono">{idx + 1}.</strong> {duty}
                      </span>
                    </div>
                  ))}
                </div>
                
                {/* Custom Clauses */}
                {contract.customClauses && contract.customClauses.length > 0 && (
                  <div className="mt-3 border-t border-amber-200 pt-2.5">
                    <h4 className="font-black text-amber-950 text-xs mb-1.5">{isAr ? 'بنود إضافية خاصة:' : 'Custom Clauses:'}</h4>
                    <div className="space-y-1">
                      {contract.customClauses.map((clause, idx) => (
                        <div key={idx} className="text-[10.5px] text-slate-800 bg-amber-50 p-2 rounded-lg border border-amber-100">
                          <strong className="text-amber-950 ml-1">{idx + 1}.</strong> {clause}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Explicit Captain Approval Clause */}
                <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl text-[10px] text-emerald-950 font-bold flex items-center gap-2 mt-3">
                  <BadgeCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    {isAr 
                      ? '✓ إقرار الكابتن/الموظف: أقر بالموافقة التامة والالتزام بجميع المهام التشغيلية المذكورة أعلاه كجزء أصيل ولا يتجزأ من عقدي الرسمي.'
                      : '✓ Captain/Employee acknowledges and agrees to all operational duties as an integral part of this contract.'}
                  </span>
                </div>
              </div>

              {/* 2. General Terms & Obligations */}
              <div className="border-t border-slate-200 pt-2 space-y-1">
                <strong className="block text-slate-950 font-bold">شروط الالتزام واللوائح العامة:</strong>
                <p className="whitespace-pre-line text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200">{contract.agreementTerms}</p>
              </div>

              {/* Digital Stamp & Signature Section (منطقة مخصصة للختم الرقمي وتوقيع الطرفين عند الطباعة والمعاينة) */}
              <div className="pt-4 border-t-2 border-slate-900 flex justify-between items-center text-center font-bold text-slate-800 text-[10px]">
                <div className="space-y-1">
                  <span>توقيع الموظف / الكابتن (الطرف الثاني)</span>
                  <div className="text-emerald-700 font-black block">موقّع وموافق إلكترونياً - M22</div>
                  <span className="text-[8.5px] text-slate-500 block font-mono">تاريخ التوقيع: {contract.agreeTimestamp || contract.contractDate}</span>
                </div>

                {/* Circular Empty Digital Stamp Area */}
                <div className="flex flex-col items-center justify-center p-1">
                  <div className="w-24 h-24 rounded-full border-2 border-dashed border-slate-600 flex flex-col items-center justify-center p-2 bg-slate-50 shadow-sm my-1 text-center">
                    <span className="text-[9px] font-black text-slate-900">الختم الرقمي</span>
                    <span className="text-[7.5px] font-bold text-slate-600 uppercase tracking-tight">Digital Stamp</span>
                    <span className="text-[6.5px] font-mono text-slate-500 mt-0.5">{contract.agreeTimestamp || contract.contractDate}</span>
                  </div>
                  <span className="text-[7.5px] font-bold text-slate-600">منطقة الختم الرقمي المعتمد</span>
                </div>

                <div className="space-y-1">
                  <span>توقيع الإدارة (الطرف الأول)</span>
                  <div className="text-slate-600 italic block font-bold">إدارة نادي M22 الرياضي</div>
                  <span className="text-[8.5px] text-slate-500 block font-mono">تاريخ الاعتماد: {contract.contractDate}</span>
                </div>
              </div>

              {/* Print-Only Digital Stamp Footer Box */}
              <div className="hidden print:flex flex-col sm:flex-row items-center justify-between p-3 rounded-2xl border-2 border-dashed border-slate-800 bg-slate-50 text-[9px] font-bold text-slate-800 mt-4">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-full border-2 border-dashed border-slate-800 flex items-center justify-center text-center p-1 bg-white shrink-0">
                    <div>
                      <span className="block font-black text-[8px] text-slate-900">ختم النادي</span>
                      <span className="block text-[6.5px] text-slate-500 font-mono">Digital Stamp</span>
                    </div>
                  </div>
                  <div>
                    <h5 className="font-black text-slate-950 text-[10px]">منطقة الختم الرقمي المعتمد (Digital Stamp Area)</h5>
                    <p className="text-slate-600 text-[8.5px] mt-0.5">وثيقة توظيف رسمية موثقة إلكترونياً وصادرة عن إدارة نادي M22 الرياضي</p>
                  </div>
                </div>

                <div className="text-left rtl:text-left font-mono text-[8.5px] space-y-0.5 mt-2 sm:mt-0">
                  <div><strong>تاريخ التوقيع:</strong> {contract.agreeTimestamp || contract.contractDate}</div>
                  <div><strong>رقم القيد السري:</strong> {contract.id}</div>
                </div>
              </div>
            </div>

            {/* If forced onboarding, show the Enter Workspace Button */}
            {isForcedOnboarding && (
              <button
                type="button"
                onClick={onClose}
                className="w-full py-4 mt-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs transition-all shadow-lg shadow-emerald-500/20 cursor-pointer flex items-center justify-center gap-2 active:scale-98 animate-pulse"
              >
                <span>{isAr ? 'تأكيد الحفظ ودخول لوحة العمل والمهام للوردية الآن 🚀' : 'Confirm & Enter Workspace Now 🚀'}</span>
              </button>
            )}
          </div>
        ) : (
          /* Create / Confirm Contract Form */
          <form onSubmit={handleAgreeAndSign} className="space-y-4 text-xs">
            <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 p-3.5 rounded-2xl flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-amber-400" />
              <p className="text-[11px] leading-relaxed">
                {isAr 
                  ? `يرجى مراجعة وتأكيد بيانات التوظيف والمهام التشغيلية المعتمدة لكابتن/موظف النادي، والموافقة على البنود والراتب لحفظ العقد رسمياً في سجلات الإدارة.`
                  : 'Please review your contract, operational duties, and salary agreement to digitally sign.'}
              </p>
            </div>

            {/* Editable/Preview Fields */}
            <div className="space-y-3 bg-[#080b12] p-4 rounded-2xl border border-slate-800">
              <h4 className="text-xs font-black text-slate-200 mb-2 border-b border-slate-800 pb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{isAr ? '1. البيانات الوظيفية والراتب الأساسي' : '1. Employment Details'}</span>
              </h4>

              <div>
                <label className="block text-slate-300 font-bold mb-1">{isAr ? 'الاسم بالكامل (ثلاثي)' : 'Full Name'}</label>
                <input
                  type="text"
                  required
                  disabled={!!contract}
                  value={nameAr}
                  onChange={(e) => setNameAr(e.target.value)}
                  placeholder={isAr ? 'أدخل اسمك بالكامل...' : 'Your full name'}
                  className="w-full bg-[#050810] border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500 font-bold disabled:opacity-60"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">{isAr ? 'رقم الهاتف' : 'Phone'}</label>
                  <input
                    type="tel"
                    required
                    disabled={!!contract}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01011223344"
                    className="w-full bg-[#050810] border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500 font-mono font-bold disabled:opacity-60"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">{isAr ? 'تاريخ بداية التوظيف' : 'Start Date'}</label>
                  <input
                    type="date"
                    required
                    disabled={!!contract}
                    value={hiredDate}
                    onChange={(e) => setHiredDate(e.target.value)}
                    className="w-full bg-[#050810] border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500 font-mono font-bold disabled:opacity-60"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">{isAr ? 'الراتب الشهري المتفق عليه (ج.م)' : 'Salary (EGP)'}</label>
                  <input
                    type="number"
                    required
                    disabled={!!contract}
                    value={salary}
                    onChange={(e) => setSalary(Number(e.target.value))}
                    className="w-full bg-[#050810] border border-slate-700 rounded-xl p-2.5 text-amber-400 font-black focus:outline-none focus:border-amber-500 font-mono disabled:opacity-75 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">{isAr ? 'مقر ومكان العمل' : 'Work Location'}</label>
                  <input
                    type="text"
                    required
                    disabled={!!contract}
                    value={signedPlace}
                    onChange={(e) => setSignedPlace(e.target.value)}
                    className="w-full bg-[#050810] border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500 disabled:opacity-60"
                  />
                </div>
              </div>
            </div>

            {/* 2. OPERATIONAL DUTIES SECTION (المهام التشغيلية المطلوبة من الكابتن/الموظف) */}
            <div className="bg-gradient-to-br from-[#0c1322] to-[#080d17] p-4 rounded-2xl border-2 border-sky-500/40 space-y-3">
              <div className="flex items-center justify-between border-b border-sky-500/30 pb-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-sky-400" />
                  <h4 className="text-xs font-black text-sky-300">
                    {isAr ? `2. المهام والمسؤوليات التشغيلية الرسمية المطلوبة (${roleNameArabic}):` : '2. Operational Duties & Responsibilities:'}
                  </h4>
                </div>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 font-bold">
                  {operationalDuties.length} مهام معتمدة
                </span>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-thin pr-1">
                {operationalDuties.map((duty, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 bg-[#050810] p-2.5 rounded-xl border border-slate-800 text-[11px] text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div className="leading-relaxed">
                      <strong className="text-amber-400 ml-1 font-mono">{idx + 1}.</strong> {duty}
                    </div>
                  </div>
                ))}
              </div>

              {/* Explicit Checkbox to Agree to Operational Duties */}
              <label className="flex items-start gap-3 p-3 rounded-xl bg-sky-950/60 border border-sky-500/40 text-sky-200 cursor-pointer hover:bg-sky-900/60 transition-colors">
                <input
                  type="checkbox"
                  checked={dutiesAgreed}
                  onChange={(e) => setDutiesAgreed(e.target.checked)}
                  className="w-4 h-4 text-sky-500 rounded border-slate-700 mt-0.5 accent-sky-500 shrink-0"
                />
                <span className="text-[11px] font-bold leading-relaxed">
                  {isAr 
                    ? '✓ أقر أنا الكابتن/الموظف بالاطلاع التام والموافقة والالتزام بجميع المهام التشغيلية المذكورة أعلاه كجزء لا يتجزأ من عقدي الرسمي.'
                    : '✓ I formally confirm agreement and commitment to all operational duties listed above.'}
                </span>
              </label>
            </div>

            {/* General Agreement Terms */}
            <div>
              <label className="block text-slate-300 font-bold mb-1">{isAr ? '3. شروط الالتزام واللوائح العامة' : '3. Terms of Commitment'}</label>
              <textarea
                required
                rows={3}
                disabled={!!contract}
                value={agreementTerms}
                onChange={(e) => setAgreementTerms(e.target.value)}
                placeholder={isAr ? 'شروط العقد...' : 'Terms of execution...'}
                className="w-full bg-[#080b12] border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500 font-semibold leading-relaxed disabled:opacity-60 text-xs"
              />
            </div>

            {/* Final Digital Signature Consent */}
            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-1.5">
              <strong className="text-white font-bold block text-[11px]">{isAr ? 'التوقيع والموافقة الرقمية الملزمة:' : 'Binding Digital Signature:'}</strong>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                {isAr 
                  ? 'بالضغط على الزر أدناه، أقر بموافقتي الكاملة على الراتب المحدد، شروط الالتزام، وكافة المهام التشغيلية، ويعد ذلك توقيعاً رسمياً ملزماً قانونياً.'
                  : 'By submitting, I legally sign and agree to the salary, operational tasks, and contractual terms.'}
              </p>
            </div>

            <button
              type="submit"
              disabled={!dutiesAgreed}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-amber-500 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-black text-xs transition-all shadow-lg shadow-purple-600/20 cursor-pointer flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Signature className="w-4 h-4" />
              <span>{isAr ? 'أوافق وأوقّع العقد والمهام التشغيلية إلكترونياً ✍️' : 'Agree & Sign Contract and Duties Digitally ✍️'}</span>
            </button>
            <button
              type="button"
              onClick={handleReject}
              className="w-full py-3.5 rounded-2xl bg-slate-800 hover:bg-rose-900 text-rose-300 font-black text-xs transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" />
              <span>{isAr ? 'رفض العقد' : 'Reject Contract'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
