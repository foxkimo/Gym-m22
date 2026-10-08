import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  FileText, 
  ShieldCheck, 
  Dumbbell, 
  Users, 
  DollarSign, 
  Briefcase, 
  ScrollText, 
  CheckCircle2, 
  Search, 
  Sparkles, 
  Download,
  BadgeCheck,
  Building2,
  Lock,
  HeartPulse
} from 'lucide-react';
import { audioAlertService } from '../services/audioService';
import { pdfPrintService } from '../services/pdfPrintService';

interface ManagerOperationalCharterModalProps {
  lang: 'ar' | 'en';
  onClose: () => void;
}

export const ManagerOperationalCharterModal: React.FC<ManagerOperationalCharterModalProps> = ({
  lang,
  onClose
}) => {
  const isAr = lang === 'ar';
  const [activeTab, setActiveTab] = useState<'all' | 'coach' | 'staff' | 'accountant' | 'manager' | 'member' | 'general'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const coachDuties = [
    'الإشراف الميداني المباشر على صالة الحديد والأجهزة وتوجيه المتدربين لتطبيق التكنيك السليم وتجنب الإصابات الرياضية.',
    'تصميم ومتابعة البرامج التدريبية المخصصة والأنظمة الغذائية المناسبة وتحديث قياسات المتدربين (InBody) بشكل دوري.',
    'الالتزام بالحضور والانضباط في مواعيد وردية التدريب المحددة والظهور بالزي الرياضي الرسمي الموحد لنادي M22.',
    'فحص واختبار أمان وجاهزية الأجهزة والمعدات الرياضية بالصالة يومياً والإبلاغ الفوري عن أي أعطال أو احتياجات صيانة للإدارة.',
    'تقديم حصص التدريب الخاص (Personal Training - PT) بأعلى معايير الجودة والتحفيز والاحترافية والالتزام بمواعيد اللاعبين.',
    'الإشراف على تنظيم وترتيب الأوزان الحرة والدامبلز والبارات وإعادتها لأماكنها لضمان انسيابية وأمان الصالة الرياضية.',
    'المحافظة التامة على خصوصية المتدربين وأسرار النادي، والالتزام بأخلاقيات المهنة وعدم استقطاب أو تدريب اللاعبين خارج النادي.',
    'تقديم الإسعافات الأولية والتصرف السريع والمهني في حالات الطوارئ والإجهاد العضلي وفق بروتوكولات السلامة والصحة المهنية.'
  ];

  const staffDuties = [
    'الاستقبال والترحيب الراقي بجميع المشتركين والزوار وتقديم شرح وافٍ واحترافي لباقات اشتراكات النادي والخدمات المتاحة.',
    'تسجيل الاشتراكات وتجديدها فورياً وإصدار بطاقات العضوية الرقمية مع فحص صلاحية الدخول ومطابقة الهوية الشخصية.',
    'مطابقة الكاش والدرج مع المبيعات وسندات القبض اليومية بنسبة 100% وتسليم الوردية للمدير أو الوردية التالية بدقة وأمانة.',
    'الالتزام بالحضور بالزي الرسمي والتواجد المستمر على مكتب الاستقبال طوال فترة الوردية دون مغادرة بدون إذن رسمي.',
    'الرد اللبق والسريع على الهاتف واستفسارات الأعضاء وتسجيل الملاحظات والشكاوى ورفعها للمدير العام فوراً لاتخاذ اللازم.'
  ];

  const accountantDuties = [
    'مراجعة وتدقيق جميع المعاملات المالية وسندات القبض والصرف اليومية بدقة تامة ومطابقتها دفترياً وسحابياً.',
    'مطابقة الخزينة وحسابات البنوك وإعداد قيود اليومية وميزان المراجعة ودفتر الأستاذ العام والتقارير المحاسبية.',
    'حساب وصرف رواتب الموظفين وعمولات كباتن التدريب الخاص (PT) والمكافآت في المواعيد المقررة دون تأخير.',
    'الحفاظ الصارم على سرية البيانات والمستندات المالية للنادي وعدم إفشائها لأي طرف خارج الإدارة العليا.',
    'إعداد التقارير المالية الدورية والتحليل المالي للإيرادات والمصروفات ورفعها للمدير العام مع التوصيات الاقتصادية.'
  ];

  const managerDuties = [
    'إدارة ومتابعة العمليات التشغيلية اليومية والتأكد من انضباط جميع الموظفين والكباتن وحسن سير العمل والخدمات.',
    'مراجعة تقارير الحضور والانصراف، الورديات، ومتابعة مؤشرات أداء النادي ورضا الأعضاء وجودة التدريب.',
    'الرقابة المستمرة على صيانة المرافق ونظافة الصالة والأجهزة وتوفر كافة شروط السلامة والصحة المهنية.',
    'تطبيق لوائح النادي والتحقيق في الشكاوى واتخاذ الإجراءات التصحيحية والتطويرية اللازمة لرفع الكفاءة التشغيلية.'
  ];

  const memberRules = [
    'الالتزام بالزي والحذاء الرياضي المناسب واستخدام المنشفة الشخصية (الفوطة) على كافة الأجهزة والمقاعد الرياضية.',
    'إرجاع الأوزان الحرة والدامبلز والبارات إلى أماكنها المخصصة بعد الانتهاء من التمرين مباشرة حفاظاً على النظام والسلامة.',
    'الحفاظ على نظافة المرافق العامة وغرف تبديل الملابس والخزائن (Lockers) واتباع إرشادات وتوجيهات الكباتن.',
    'منع التدخين واستخدام السجائر الإلكترونية منعاً باتاً داخل كافة مرافق وصالات وغرف النادي.',
    'المحافظة على المقتنيات الشخصية داخل الخزائن واستخدام القفل الخاص، والنادي غير مسؤول عن ترك المتعلقات خارجها.',
    'الالتزام بالسلوك الرياضي الراقي والاحترام المتبادل بين كافة الأعضاء وأسرة العمل بالنادي.'
  ];

  const generalPolicies = [
    'تعتبر هذه اللائحة وثيقة إدارية وتشغيلية رسمية عامة ملزمة لكافة العاملين بالنادي وتطبق فور اعتمادها ونشرها.',
    'يحظر إفشاء أي معلومات سرية أو سجلات مالية أو بيانات شخصية للأعضاء لأي طرف خارجي تحت طائلة المساءلة القانونية.',
    'يحق لإدارة النادي مراجعة وتحديث بنود هذه اللائحة دورياً بما يخدم مصلحة العمل ورفع كفاءة النادي وسلامة الجميع.'
  ];

  const handlePrint = (section: string = 'all') => {
    audioAlertService.playBeep(523.25, 0.1);
    pdfPrintService.printGeneralOperationalCharterPDF(section);
  };

  const filterList = (list: string[]) => {
    if (!searchQuery.trim()) return list;
    return list.filter(item => item.toLowerCase().includes(searchQuery.toLowerCase().trim()));
  };

  const filteredCoach = filterList(coachDuties);
  const filteredStaff = filterList(staffDuties);
  const filteredAccountant = filterList(accountantDuties);
  const filteredManager = filterList(managerDuties);
  const filteredMember = filterList(memberRules);
  const filteredGeneral = filterList(generalPolicies);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-4xl rounded-3xl bg-[#0e1320] border-2 border-sky-500/40 p-5 sm:p-6 text-slate-100 shadow-2xl relative text-right rtl:text-right scrollbar-thin overflow-y-auto max-h-[94vh] flex flex-col">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/60 cursor-pointer transition-colors"
          title={isAr ? 'إغلاق' : 'Close'}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500/20 to-sky-600/10 text-sky-400 border border-sky-500/30 flex items-center justify-center shrink-0 shadow-lg">
              <ScrollText className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30">
                  {isAr ? 'نسخة عامة معتمدة للطباعة (بدون أسماء)' : 'General Official Charter'}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                  {isAr ? 'جاهز للـ PDF 🖨️' : 'Ready to Print'}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white mt-1">
                {isAr ? '📜 اللائحة العامة للمهام والواجبات التشغيلية واللوائح التنظيمية' : '📜 Official Operational Charter & Rules'}
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {isAr ? 'دليل وبنود العمل والالتزامات لكافة الأدوار (كباتن، استقبال، محاسبة، إدارة، وأعضاء) قابلة للطباعة والتنزيل ورقياً' : 'Official standardized duties & code of conduct printable handbook'}
              </p>
            </div>
          </div>

          {/* Quick Dual Print / Download Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handlePrint('all')}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-lg active:scale-98"
            >
              <Printer className="w-4 h-4" />
              <span>{isAr ? '🖨️ طباعة اللائحة كاملة' : 'Print All'}</span>
            </button>

            <button
              onClick={() => handlePrint(activeTab === 'all' ? 'all' : activeTab)}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-sky-500 to-sky-400 hover:from-sky-400 hover:to-sky-300 text-slate-950 font-black text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-lg active:scale-98"
            >
              <Download className="w-4 h-4" />
              <span>{isAr ? '📥 تنزيل PDF' : 'Download PDF'}</span>
            </button>
          </div>
        </div>

        {/* Filter Navigation & Search Bar */}
        <div className="bg-[#080b12] p-3 rounded-2xl border border-slate-800 space-y-3 mb-4">
          <div className="flex items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute right-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isAr ? 'ابحث داخل بنود ومهام اللائحة...' : 'Search within charter rules...'}
                className="w-full bg-[#050810] border border-slate-700 rounded-xl py-1.5 px-9 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* Print Active Section Only button */}
            {activeTab !== 'all' && (
              <button
                onClick={() => handlePrint(activeTab)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 border border-sky-500/30 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{isAr ? 'طباعة هذا القسم فقط' : 'Print Section'}</span>
              </button>
            )}
          </div>

          {/* Section Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'all', labelAr: 'الكل (اللائحة الشاملة) 📑', icon: ScrollText },
              { id: 'coach', labelAr: 'الكباتن والمدربين 🏋️', icon: Dumbbell },
              { id: 'staff', labelAr: 'الاستقبال والكاشير 👥', icon: Users },
              { id: 'accountant', labelAr: 'المحاسبة والخزينة 💰', icon: DollarSign },
              { id: 'manager', labelAr: 'الإدارة والتشغيل 👔', icon: Briefcase },
              { id: 'member', labelAr: 'ميثاق الأعضاء 📜', icon: HeartPulse },
              { id: 'general', labelAr: 'السياسات والسلامة 🛡️', icon: ShieldCheck },
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-sky-500 text-slate-950 font-black shadow-md'
                      : 'bg-slate-900/80 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.labelAr}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* CHARTER DOCUMENT SHEET (Official Document Preview) */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          
          {/* SECTION 1: COACHES */}
          {(activeTab === 'all' || activeTab === 'coach') && (
            <div className="bg-[#0a0f1c] rounded-2xl p-4 border border-sky-500/40 shadow-md space-y-3">
              <div className="flex items-center justify-between border-b border-sky-500/30 pb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400">
                    <Dumbbell className="w-4 h-4" />
                  </div>
                  <h3 className="font-black text-sm text-sky-300">
                    {isAr ? '1. لائحة مهام ومسؤوليات كباتن ومدربي الصالة والتدريب الرياضي (PT):' : '1. Coaches & PT Duties:'}
                  </h3>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-mono font-bold">
                  {filteredCoach.length} {isAr ? 'بنود معتمدة' : 'items'}
                </span>
              </div>

              <div className="space-y-2">
                {filteredCoach.map((duty, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 bg-[#050810] p-2.5 rounded-xl border border-slate-800 text-xs text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">
                      <strong className="text-amber-400 ml-1 font-mono font-bold">{idx + 1}.</strong> {duty}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 2: FRONT DESK */}
          {(activeTab === 'all' || activeTab === 'staff') && (
            <div className="bg-[#0a0f1c] rounded-2xl p-4 border border-amber-500/40 shadow-md space-y-3">
              <div className="flex items-center justify-between border-b border-amber-500/30 pb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                    <Users className="w-4 h-4" />
                  </div>
                  <h3 className="font-black text-sm text-amber-300">
                    {isAr ? '2. لائحة مهام ومسؤوليات موظفي الاستقبال وخدمة العملاء والكاشير:' : '2. Front Desk Duties:'}
                  </h3>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold">
                  {filteredStaff.length} {isAr ? 'بنود معتمدة' : 'items'}
                </span>
              </div>

              <div className="space-y-2">
                {filteredStaff.map((duty, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 bg-[#050810] p-2.5 rounded-xl border border-slate-800 text-xs text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">
                      <strong className="text-amber-400 ml-1 font-mono font-bold">{idx + 1}.</strong> {duty}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 3: ACCOUNTING */}
          {(activeTab === 'all' || activeTab === 'accountant') && (
            <div className="bg-[#0a0f1c] rounded-2xl p-4 border border-emerald-500/40 shadow-md space-y-3">
              <div className="flex items-center justify-between border-b border-emerald-500/30 pb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <h3 className="font-black text-sm text-emerald-300">
                    {isAr ? '3. لائحة مهام ومسؤوليات الإدارة المالية ومسؤولي الخزينة:' : '3. Finance Duties:'}
                  </h3>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                  {filteredAccountant.length} {isAr ? 'بنود معتمدة' : 'items'}
                </span>
              </div>

              <div className="space-y-2">
                {filteredAccountant.map((duty, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 bg-[#050810] p-2.5 rounded-xl border border-slate-800 text-xs text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">
                      <strong className="text-emerald-400 ml-1 font-mono font-bold">{idx + 1}.</strong> {duty}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 4: MANAGEMENT */}
          {(activeTab === 'all' || activeTab === 'manager') && (
            <div className="bg-[#0a0f1c] rounded-2xl p-4 border border-purple-500/40 shadow-md space-y-3">
              <div className="flex items-center justify-between border-b border-purple-500/30 pb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <h3 className="font-black text-sm text-purple-300">
                    {isAr ? '4. لائحة مهام ومسؤوليات الإشراف الإداري والمدير العام:' : '4. General Management Duties:'}
                  </h3>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono font-bold">
                  {filteredManager.length} {isAr ? 'بنود معتمدة' : 'items'}
                </span>
              </div>

              <div className="space-y-2">
                {filteredManager.map((duty, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 bg-[#050810] p-2.5 rounded-xl border border-slate-800 text-xs text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">
                      <strong className="text-purple-400 ml-1 font-mono font-bold">{idx + 1}.</strong> {duty}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 5: MEMBER CHARTER */}
          {(activeTab === 'all' || activeTab === 'member') && (
            <div className="bg-[#0a0f1c] rounded-2xl p-4 border border-rose-500/40 shadow-md space-y-3">
              <div className="flex items-center justify-between border-b border-rose-500/30 pb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400">
                    <HeartPulse className="w-4 h-4" />
                  </div>
                  <h3 className="font-black text-sm text-rose-300">
                    {isAr ? '5. ميثاق حقوق والتزامات الأعضاء والمشتركين داخل النادي:' : '5. Member Code of Conduct:'}
                  </h3>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono font-bold">
                  {filteredMember.length} {isAr ? 'بنود معتمدة' : 'items'}
                </span>
              </div>

              <div className="space-y-2">
                {filteredMember.map((duty, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 bg-[#050810] p-2.5 rounded-xl border border-slate-800 text-xs text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">
                      <strong className="text-rose-400 ml-1 font-mono font-bold">{idx + 1}.</strong> {duty}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 6: GENERAL POLICIES */}
          {(activeTab === 'all' || activeTab === 'general') && (
            <div className="bg-[#0a0f1c] rounded-2xl p-4 border border-slate-700 shadow-md space-y-3">
              <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-slate-800 text-slate-300">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <h3 className="font-black text-sm text-slate-200">
                    {isAr ? '6. الأحكام العامة والسلامة والسرية والعهدة:' : '6. General Policies & Safety:'}
                  </h3>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono font-bold">
                  {filteredGeneral.length} {isAr ? 'بنود' : 'items'}
                </span>
              </div>

              <div className="space-y-2">
                {filteredGeneral.map((duty, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 bg-[#050810] p-2.5 rounded-xl border border-slate-800 text-xs text-slate-300">
                    <span className="text-slate-500 font-bold">•</span>
                    <span className="leading-relaxed">{duty}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="mt-4 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
            <BadgeCheck className="w-4 h-4 text-emerald-400" />
            <span>{isAr ? 'وثيقة تنظيمية موثقة ومعتمدة من إدارة نادي GYM-M22' : 'Official certified operating charter'}</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => handlePrint('all')}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow"
            >
              <Printer className="w-4 h-4" />
              <span>{isAr ? 'طباعة كاملة (PDF)' : 'Print All PDF'}</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-colors cursor-pointer"
            >
              {isAr ? 'إغلاق' : 'Close'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
