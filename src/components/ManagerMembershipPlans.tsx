import React, { useState, useEffect } from 'react';
import { MembershipPlan, CurrentUser } from '../types/gym';
import { StorageService } from '../services/storageService';
import { audioAlertService } from '../services/audioService';
import { 
  CreditCard, 
  Plus, 
  Edit, 
  Trash2, 
  Tag, 
  Sparkles, 
  CheckCircle2, 
  X, 
  Save, 
  Percent, 
  Flame, 
  Check, 
  Layers, 
  Crown, 
  Activity, 
  Calendar, 
  Snowflake, 
  Dumbbell, 
  HeartHandshake, 
  TrendingDown, 
  ShieldCheck, 
  Sliders,
  DollarSign
} from 'lucide-react';

interface ManagerMembershipPlansProps {
  currentUser: CurrentUser;
  lang: 'ar' | 'en';
}

export const ManagerMembershipPlans: React.FC<ManagerMembershipPlansProps> = ({
  currentUser,
  lang
}) => {
  const isAr = lang === 'ar';
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [selectedTierFilter, setSelectedTierFilter] = useState<string>('all');
  
  // Editor modal state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<MembershipPlan | null>(null);

  // Quick discount modal state
  const [discountModalPlan, setDiscountModalPlan] = useState<MembershipPlan | null>(null);
  const [quickDiscountPct, setQuickDiscountPct] = useState<number>(10);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const refreshData = () => {
    setPlans(StorageService.getMembershipPlans());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const filteredPlans = plans.filter(p => {
    if (selectedTierFilter !== 'all' && p.tierKey !== selectedTierFilter) {
      return false;
    }
    return true;
  });

  const handleOpenNewPlan = () => {
    setEditingPlan({
      id: `plan-${Date.now()}`,
      tierKey: 'vip',
      nameAr: '',
      nameEn: '',
      durationMonths: 1,
      durationDays: 30,
      originalPrice: 700,
      discountPercentage: 0,
      finalPrice: 700,
      badgeAr: 'باقة جديدة',
      featuresAr: [
        'دخول غير محدود للصالة وصالة الأوزان والكارديو',
        'استخدام الخزائن اليومية والشاور',
        'فحص قياس مكونات الجسم InBody مجاناً'
      ],
      featuresEn: [
        'Unlimited gym access',
        'Locker and shower access',
        '1 Free InBody test'
      ],
      freeInBodyCount: 1,
      freePTSessionsCount: 0,
      freeFreezeDays: 7,
      freeSpaSessions: 0,
      isPopular: false,
      isActive: true
    });
    setIsEditorOpen(true);
  };

  const handleEditPlan = (plan: MembershipPlan) => {
    setEditingPlan({ ...plan, featuresAr: [...plan.featuresAr] });
    setIsEditorOpen(true);
  };

  const handleDeletePlan = (plan: MembershipPlan) => {
    if (window.confirm(isAr ? `هل أنت متأكد من حذف باقة: "${plan.nameAr}"؟` : `Delete plan "${plan.nameAr}"?`)) {
      StorageService.deleteMembershipPlan(plan.id, currentUser.nameAr);
      audioAlertService.playDelete();
      refreshData();
      setToastMessage(isAr ? 'تم حذف باقة الاشتراك بنجاح' : 'Membership plan deleted');
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleToggleActive = (plan: MembershipPlan) => {
    const newState = StorageService.toggleMembershipPlanStatus(plan.id, currentUser.nameAr);
    audioAlertService.playSuccess();
    refreshData();
    setToastMessage(isAr ? `تم ${newState ? 'تفعيل' : 'إيقاف'} عرض الباقة بنجاح` : 'Plan status updated');
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleApplyQuickDiscount = () => {
    if (!discountModalPlan) return;
    const orig = discountModalPlan.originalPrice;
    const discountAmount = Math.round((orig * quickDiscountPct) / 100);
    const final = orig - discountAmount;

    const updated: MembershipPlan = {
      ...discountModalPlan,
      discountPercentage: quickDiscountPct,
      finalPrice: final,
      badgeAr: quickDiscountPct > 0 ? `عرض خاص 🔥 (خصم ${quickDiscountPct}%)` : discountModalPlan.badgeAr
    };

    StorageService.saveMembershipPlan(updated, currentUser.nameAr);

    // LOG SENSITIVE DISCOUNT
    StorageService.recordSensitiveMod({
      category: 'plan_update',
      titleAr: `تطبيق خصم سريع على باقة: ${updated.nameAr}`,
      titleEn: `Quick discount applied to plan: ${updated.nameAr}`,
      detailsAr: `تم تطبيق خصم ${quickDiscountPct}% على الباقة. السعر الجديد: ${final} ج.م بدلاً من ${orig} ج.م`,
      detailsEn: `Applied ${quickDiscountPct}% discount. New price: ${final} EGP instead of ${orig} EGP`,
      performerId: currentUser.id,
      performerName: currentUser.nameAr,
      performerRole: currentUser.role,
      targetId: updated.id,
      targetName: updated.nameAr,
      oldValue: orig,
      newValue: final,
      reason: 'تعديل عرض ترويجي سريع'
    });

    audioAlertService.playSuccess();
    refreshData();
    setDiscountModalPlan(null);
    setToastMessage(isAr ? `✓ تم تطبيق خصم ${quickDiscountPct}% على باقة (${updated.nameAr}) - السعر الجديد: ${final} ج.م` : 'Discount applied');
    setTimeout(() => setToastMessage(null), 3500);
  };

  const totalDiscountedCount = plans.filter(p => p.discountPercentage && p.discountPercentage > 0).length;
  const activePlansCount = plans.filter(p => p.isActive).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16">
      {/* 1. EXECUTIVE HERO BANNER */}
      <div className="bg-gradient-to-br from-[#131b2c] via-[#0b121e] to-[#050810] rounded-3xl p-6 border-2 border-amber-500/40 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-[#f7cb55] border-2 border-amber-500/40 flex items-center justify-center font-bold shadow-xl shadow-amber-500/10 shrink-0">
              <CreditCard className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black flex items-center gap-1">
                  <Percent className="w-3 h-3" />
                  <span>{isAr ? 'إدارة أسعار وخطط الاشتراكات' : 'Membership Plans & Pricing'}</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                  {isAr ? 'صلاحية المدير العام الحصرية' : 'Exclusive GM Privilege'}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                {isAr ? 'قائمة باقات وأسعار الاشتراكات والخصومات والمزايا' : 'Gym Membership Plans, Perks & Discounts'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {isAr ? 'تعديل أسعار الباقات، إضافة مزايا مجانية (InBody، PT، تجميد، سبا)، وتطبيق الخصومات والعروض الترويجية' : 'Manage packages, update pricing, customize member perks and set promotional discounts'}
              </p>
            </div>
          </div>

          {/* Quick Metrics & Add Button */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-[#091122]/90 px-4 py-2.5 rounded-2xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block">{isAr ? 'الباقات المفعلة' : 'Active Plans'}</span>
              <strong className="text-lg font-black text-emerald-400 font-mono block mt-0.5">{activePlansCount} / {plans.length}</strong>
            </div>

            <div className="bg-[#091122]/90 px-4 py-2.5 rounded-2xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block">{isAr ? 'باقات عليها عروض' : 'Discount Offers'}</span>
              <strong className="text-lg font-black text-amber-400 font-mono block mt-0.5">{totalDiscountedCount}</strong>
            </div>

            <button
              type="button"
              onClick={handleOpenNewPlan}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs flex items-center gap-2 shadow-xl shadow-amber-500/20 transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>{isAr ? '+ إضافة باقة اشتراك جديدة' : '+ Add New Plan'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. TIER FILTER BAR */}
      <div className="bg-[#090e1a] p-3 rounded-2xl border border-slate-800 flex items-center gap-2 overflow-x-auto scrollbar-none">
        <span className="text-xs font-bold text-slate-400 ml-2 rtl:ml-2 ltr:mr-2 flex items-center gap-1.5 shrink-0">
          <Layers className="w-3.5 h-3.5 text-amber-400" />
          <span>{isAr ? 'تصفية الفئات:' : 'Filter Tier:'}</span>
        </span>

        {[
          { id: 'all', label: isAr ? 'جميع الباقات' : 'All Plans' },
          { id: 'standard', label: isAr ? 'القياسية (Standard)' : 'Standard' },
          { id: 'vip', label: isAr ? 'الذهبية (VIP Gold)' : 'VIP Gold' },
          { id: 'gold', label: isAr ? 'الماسية (Diamond)' : 'Diamond' },
          { id: 'diamond', label: isAr ? 'السنوية الملكية' : 'Annual' },
          { id: 'student', label: isAr ? 'الطلبة والشباب' : 'Student' }
        ].map(t => (
          <button
            key={t.id}
            type="button"
            onClick={() => setSelectedTierFilter(t.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              selectedTierFilter === t.id
                ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 3. MEMBERSHIP PLANS CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredPlans.map(plan => {
          const hasDiscount = !!(plan.discountPercentage && plan.discountPercentage > 0);
          const savedAmount = plan.originalPrice - plan.finalPrice;

          return (
            <div
              key={plan.id}
              className={`rounded-3xl border transition-all shadow-xl flex flex-col justify-between overflow-hidden group ${
                plan.isActive
                  ? 'bg-[#0c111e] border-slate-800 hover:border-amber-500/50'
                  : 'bg-[#080c14] border-slate-900 opacity-60'
              }`}
            >
              <div>
                {/* Plan Card Header */}
                <div className="p-5 bg-gradient-to-br from-[#101728] via-[#0b101c] to-[#070b14] border-b border-slate-800/80 space-y-3 relative">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-300 text-[10px] font-mono font-black uppercase">
                      {plan.tierKey}
                    </span>

                    {plan.badgeAr && (
                      <span className="px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black flex items-center gap-1 shadow">
                        <Flame className="w-3 h-3 text-amber-400 animate-pulse" />
                        <span>{plan.badgeAr}</span>
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-black text-white group-hover:text-amber-300 transition-colors">
                      {plan.nameAr}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                      <Calendar className="w-3.5 h-3.5 text-sky-400" />
                      <span>{plan.durationMonths} {isAr ? 'شهور' : 'Months'} ({plan.durationDays || plan.durationMonths * 30} {isAr ? 'يوماً' : 'days'})</span>
                    </div>
                  </div>

                  {/* Pricing Display */}
                  <div className="bg-[#070a12] p-3 rounded-2xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block">{isAr ? 'سعر الاشتراك الحالي:' : 'Current Price:'}</span>
                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        <strong className="text-xl font-black text-amber-400 font-mono">
                          {plan.finalPrice.toLocaleString()}
                        </strong>
                        <span className="text-xs text-slate-400 font-bold">{isAr ? 'ج.م' : 'EGP'}</span>
                      </div>
                    </div>

                    {hasDiscount && (
                      <div className="text-left rtl:text-left ltr:text-right">
                        <span className="text-[10px] text-slate-500 line-through block font-mono">
                          {plan.originalPrice.toLocaleString()} ج.م
                        </span>
                        <span className="px-2 py-0.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-black">
                          {isAr ? `وفر ${savedAmount} ج (${plan.discountPercentage}%)` : `Save ${plan.discountPercentage}%`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Allowances & Counters Badges */}
                <div className="p-4 grid grid-cols-2 gap-2 bg-[#080d18] border-b border-slate-800/60 text-[11px]">
                  <div className="bg-[#050810] p-2 rounded-xl border border-slate-800/80 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <span className="text-[9px] text-slate-400 block">{isAr ? 'فحص InBody' : 'InBody'}</span>
                      <strong className="text-white font-bold">{plan.freeInBodyCount} {isAr ? 'مرات مجاناً' : 'Tests'}</strong>
                    </div>
                  </div>

                  <div className="bg-[#050810] p-2 rounded-xl border border-slate-800/80 flex items-center gap-2">
                    <Dumbbell className="w-4 h-4 text-sky-400 shrink-0" />
                    <div>
                      <span className="text-[9px] text-slate-400 block">{isAr ? 'تدريب خاص PT' : 'PT Sessions'}</span>
                      <strong className="text-white font-bold">{plan.freePTSessionsCount} {isAr ? 'حصص كابتن' : 'Sessions'}</strong>
                    </div>
                  </div>

                  <div className="bg-[#050810] p-2 rounded-xl border border-slate-800/80 flex items-center gap-2">
                    <Snowflake className="w-4 h-4 text-cyan-400 shrink-0" />
                    <div>
                      <span className="text-[9px] text-slate-400 block">{isAr ? 'تجميد العضوية' : 'Freeze'}</span>
                      <strong className="text-white font-bold">{plan.freeFreezeDays} {isAr ? 'أيام مجانية' : 'Days'}</strong>
                    </div>
                  </div>

                  <div className="bg-[#050810] p-2 rounded-xl border border-slate-800/80 flex items-center gap-2">
                    <HeartHandshake className="w-4 h-4 text-purple-400 shrink-0" />
                    <div>
                      <span className="text-[9px] text-slate-400 block">{isAr ? 'ساونا وسبا' : 'Spa'}</span>
                      <strong className="text-white font-bold">{plan.freeSpaSessions} {isAr ? 'جلسات استشفاء' : 'Sessions'}</strong>
                    </div>
                  </div>
                </div>

                {/* Features & Benefits List */}
                <div className="p-4 space-y-2">
                  <span className="text-xs font-bold text-slate-300 block mb-2">
                    {isAr ? 'المزايا والخدمات المشمولة في الباقة:' : 'Package Benefits & Perks:'}
                  </span>

                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {plan.featuresAr.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="leading-snug">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-4 bg-[#080c16] border-t border-slate-800 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleEditPlan(plan)}
                    className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>{isAr ? 'تعديل السعر والمزايا' : 'Edit'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDiscountModalPlan(plan);
                      setQuickDiscountPct(plan.discountPercentage || 15);
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    title={isAr ? 'تطبيق خصم سريع' : 'Quick Discount'}
                  >
                    <Percent className="w-3.5 h-3.5" />
                    <span>{isAr ? 'خصم %' : 'Discount'}</span>
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(plan)}
                    className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-colors cursor-pointer border ${
                      plan.isActive
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                  >
                    {plan.isActive ? (isAr ? 'نشطة' : 'Active') : (isAr ? 'معطلة' : 'Disabled')}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeletePlan(plan)}
                    className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-400 transition-colors cursor-pointer"
                    title={isAr ? 'حذف الباقة' : 'Delete'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. PLAN EDITOR MODAL */}
      {isEditorOpen && editingPlan && (
        <PlanEditorModal
          isOpen={isEditorOpen}
          plan={editingPlan}
          onClose={() => {
            setIsEditorOpen(false);
            setEditingPlan(null);
          }}
          onSave={(savedPlan) => {
            const oldPlan = plans.find(p => p.id === savedPlan.id);
            StorageService.saveMembershipPlan(savedPlan, currentUser.nameAr);

            // LOG SENSITIVE UPDATE IF PRICE OR DURATION CHANGED
            if (oldPlan && (oldPlan.finalPrice !== savedPlan.finalPrice || oldPlan.durationMonths !== savedPlan.durationMonths)) {
              StorageService.recordSensitiveMod({
                category: 'plan_update',
                titleAr: `تعديل جوهري في باقة: ${savedPlan.nameAr}`,
                titleEn: `Core plan update: ${savedPlan.nameAr}`,
                detailsAr: `تم تعديل السعر النهائي من ${oldPlan.finalPrice} إلى ${savedPlan.finalPrice}، والمدة من ${oldPlan.durationMonths} إلى ${savedPlan.durationMonths} شهر`,
                detailsEn: `Updated final price from ${oldPlan.finalPrice} to ${savedPlan.finalPrice}, and duration from ${oldPlan.durationMonths} to ${savedPlan.durationMonths} months`,
                performerId: currentUser.id,
                performerName: currentUser.nameAr,
                performerRole: currentUser.role,
                targetId: savedPlan.id,
                targetName: savedPlan.nameAr,
                oldValue: `${oldPlan.finalPrice} EGP / ${oldPlan.durationMonths}m`,
                newValue: `${savedPlan.finalPrice} EGP / ${savedPlan.durationMonths}m`,
                reason: 'تحديث تفاصيل الباقة من المحرر'
              });
            }

            audioAlertService.playSuccess();
            refreshData();
            setIsEditorOpen(false);
            setEditingPlan(null);
            setToastMessage(isAr ? `✓ تم حفظ وتحديث باقة (${savedPlan.nameAr}) بنجاح` : 'Plan saved successfully');
            setTimeout(() => setToastMessage(null), 3500);
          }}
          lang={lang}
        />
      )}

      {/* 5. QUICK DISCOUNT MODAL */}
      {discountModalPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#0d121f] border-2 border-rose-500/40 rounded-3xl p-6 shadow-2xl relative text-slate-100 text-right rtl:text-right ltr:text-left">
            <button
              onClick={() => setDiscountModalPlan(null)}
              className="absolute top-4 left-4 rtl:left-4 rtl:right-auto ltr:right-4 ltr:left-auto p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/60"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
                <Percent className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">
                  {isAr ? 'تطبيق خصم أو عرض ترويجي' : 'Apply Discount Offer'}
                </h3>
                <span className="text-xs text-amber-400 font-bold">
                  {discountModalPlan.nameAr}
                </span>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 bg-[#070b14] rounded-2xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 block text-[10px]">{isAr ? 'السعر الأصلي' : 'Original Price'}</span>
                  <strong className="text-sm font-black text-white font-mono">{discountModalPlan.originalPrice} ج.م</strong>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px]">{isAr ? 'السعر بعد الخصم' : 'New Price'}</span>
                  <strong className="text-base font-black text-emerald-400 font-mono">
                    {Math.round(discountModalPlan.originalPrice * (1 - quickDiscountPct / 100))} ج.م
                  </strong>
                </div>
              </div>

              {/* Preset Discount Buttons */}
              <div>
                <label className="block text-slate-300 font-bold mb-2">{isAr ? 'اختر نسبة الخصم المباشرة:' : 'Discount Percentage:'}</label>
                <div className="grid grid-cols-5 gap-1.5">
                  {[0, 10, 15, 20, 25, 30, 35, 40, 50].map(pct => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setQuickDiscountPct(pct)}
                      className={`py-2 rounded-xl text-xs font-black transition-all border cursor-pointer ${
                        quickDiscountPct === pct
                          ? 'bg-rose-500 text-white border-rose-400 shadow-md scale-105'
                          : 'bg-[#070a12] text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {pct === 0 ? (isAr ? 'بدون' : '0%') : `${pct}%`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleApplyQuickDiscount}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-white font-black text-xs transition-colors shadow-lg shadow-rose-500/20 cursor-pointer"
                >
                  {isAr ? 'تثبيت وتطبيق الخصم فوراً' : 'Apply Discount'}
                </button>
                <button
                  type="button"
                  onClick={() => setDiscountModalPlan(null)}
                  className="px-4 py-3 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs cursor-pointer"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-slate-900 border-2 border-emerald-500/60 text-emerald-300 font-bold text-xs shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

// =============================================================
// SUB-COMPONENT: FULL MEMBERSHIP PLAN EDITOR MODAL
// =============================================================
interface PlanEditorModalProps {
  isOpen: boolean;
  plan: MembershipPlan;
  onClose: () => void;
  onSave: (plan: MembershipPlan) => void;
  lang: 'ar' | 'en';
}

const PlanEditorModal: React.FC<PlanEditorModalProps> = ({
  isOpen,
  plan,
  onClose,
  onSave,
  lang
}) => {
  const isAr = lang === 'ar';

  const [nameAr, setNameAr] = useState(plan.nameAr);
  const [nameEn, setNameEn] = useState(plan.nameEn || '');
  const [tierKey, setTierKey] = useState(plan.tierKey);
  const [durationMonths, setDurationMonths] = useState(plan.durationMonths);
  const [originalPrice, setOriginalPrice] = useState(plan.originalPrice);
  const [discountPercentage, setDiscountPercentage] = useState(plan.discountPercentage || 0);
  const [finalPrice, setFinalPrice] = useState(plan.finalPrice);
  const [badgeAr, setBadgeAr] = useState(plan.badgeAr || '');
  
  // Perks
  const [freeInBodyCount, setFreeInBodyCount] = useState(plan.freeInBodyCount);
  const [freePTSessionsCount, setFreePTSessionsCount] = useState(plan.freePTSessionsCount);
  const [freeFreezeDays, setFreeFreezeDays] = useState(plan.freeFreezeDays);
  const [freeSpaSessions, setFreeSpaSessions] = useState(plan.freeSpaSessions);
  const [isActive, setIsActive] = useState(plan.isActive);

  // Features List State
  const [featuresList, setFeaturesList] = useState<string[]>(plan.featuresAr || []);
  const [newFeatureText, setNewFeatureText] = useState('');

  if (!isOpen) return null;

  const handleOriginalPriceChange = (val: number) => {
    setOriginalPrice(val);
    if (discountPercentage > 0) {
      setFinalPrice(Math.round(val * (1 - discountPercentage / 100)));
    } else {
      setFinalPrice(val);
    }
  };

  const handleDiscountChange = (pct: number) => {
    setDiscountPercentage(pct);
    setFinalPrice(Math.round(originalPrice * (1 - pct / 100)));
  };

  const handleFinalPriceChange = (val: number) => {
    setFinalPrice(val);
    if (originalPrice > val && originalPrice > 0) {
      const calculatedPct = Math.round(((originalPrice - val) / originalPrice) * 100);
      setDiscountPercentage(calculatedPct);
    } else {
      setDiscountPercentage(0);
    }
  };

  const handleAddFeature = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeatureText.trim()) return;
    setFeaturesList([...featuresList, newFeatureText.trim()]);
    setNewFeatureText('');
  };

  const handleRemoveFeature = (idx: number) => {
    setFeaturesList(featuresList.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameAr.trim() || originalPrice <= 0) {
      alert(isAr ? 'يرجى إدخال اسم الباقة والسعر بشكل صحيح' : 'Please enter valid name and price');
      return;
    }

    onSave({
      ...plan,
      nameAr: nameAr.trim(),
      nameEn: nameEn.trim() || nameAr.trim(),
      tierKey,
      durationMonths: Number(durationMonths) || 1,
      durationDays: (Number(durationMonths) || 1) * 30,
      originalPrice: Number(originalPrice),
      discountPercentage: Number(discountPercentage),
      finalPrice: Number(finalPrice) || Number(originalPrice),
      badgeAr: badgeAr.trim() || undefined,
      featuresAr: featuresList.length > 0 ? featuresList : ['دخول غير محدود لصالة الجيم'],
      freeInBodyCount: Number(freeInBodyCount) || 0,
      freePTSessionsCount: Number(freePTSessionsCount) || 0,
      freeFreezeDays: Number(freeFreezeDays) || 0,
      freeSpaSessions: Number(freeSpaSessions) || 0,
      isActive
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-3xl bg-[#0a0d16] border-2 border-amber-500/50 rounded-3xl overflow-hidden shadow-2xl relative text-slate-100 flex flex-col max-h-[92vh]"
        dir={isAr ? 'rtl' : 'ltr'}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#141b2c] via-[#0d1524] to-[#0a0d16] border-b border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-[#f7cb55] border border-amber-500/40 flex items-center justify-center font-bold">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white">
                {plan.nameAr ? (isAr ? `تعديل باقة: ${plan.nameAr}` : 'Edit Membership Plan') : (isAr ? 'إضافة باقة اشتراك جديدة' : 'New Membership Plan')}
              </h3>
              <p className="text-xs text-slate-400">
                {isAr ? 'تخصيص السعر، المزايا والخدمات المجانية، والخصومات الترويجية' : 'Configure pricing, benefits, and special discounts'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Row 1: Plan Name & Tier */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-amber-300 mb-1">
                {isAr ? 'اسم باقة الاشتراك (بالعربي)*:' : 'Plan Name (Arabic)*:'}
              </label>
              <input
                type="text"
                required
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
                placeholder={isAr ? 'مثال: باقة النخبة الذهبية 3 شهور...' : 'Plan name...'}
                className="w-full bg-[#070a12] border border-slate-700 rounded-xl p-2.5 text-xs text-white font-bold focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                {isAr ? 'فئة الباقة:' : 'Tier Key:'}
              </label>
              <select
                value={tierKey}
                onChange={(e) => setTierKey(e.target.value)}
                className="w-full bg-[#070a12] border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 font-bold focus:border-amber-500 focus:outline-none"
              >
                <option value="standard">{isAr ? 'القياسية (Standard)' : 'Standard'}</option>
                <option value="vip">{isAr ? 'الذهبية (VIP Gold)' : 'VIP Gold'}</option>
                <option value="gold">{isAr ? 'الماسية (Diamond)' : 'Diamond'}</option>
                <option value="diamond">{isAr ? 'السنوية الملكية (Annual)' : 'Annual'}</option>
                <option value="student">{isAr ? 'الطلبة والشباب (Student)' : 'Student'}</option>
              </select>
            </div>
          </div>

          {/* Row 2: Pricing & Discounts Box */}
          <div className="p-3.5 bg-[#070b14] rounded-2xl border border-amber-500/30 space-y-3">
            <span className="text-xs font-black text-amber-400 block flex items-center gap-1.5">
              <DollarSign className="w-4 h-4" />
              <span>{isAr ? 'تسعير الباقة ونسبة الخصم:' : 'Pricing & Discount Settings:'}</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  {isAr ? 'مدة الباقة (بالشهور):' : 'Duration (Months):'}
                </label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={durationMonths}
                  onChange={(e) => setDurationMonths(Number(e.target.value))}
                  className="w-full bg-[#04060c] border border-slate-700 rounded-xl p-2 text-xs text-white font-mono text-center font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  {isAr ? 'السعر الأساسي (ج.م)*:' : 'Original Price (EGP)*:'}
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={originalPrice}
                  onChange={(e) => handleOriginalPriceChange(Number(e.target.value))}
                  className="w-full bg-[#04060c] border border-slate-700 rounded-xl p-2 text-xs text-white font-mono text-center font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-rose-300 mb-1">
                  {isAr ? 'نسبة الخصم (%):' : 'Discount (%):'}
                </label>
                <input
                  type="number"
                  min={0}
                  max={90}
                  value={discountPercentage}
                  onChange={(e) => handleDiscountChange(Number(e.target.value))}
                  className="w-full bg-[#04060c] border border-rose-500/40 rounded-xl p-2 text-xs text-rose-300 font-mono text-center font-black"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-emerald-400 mb-1">
                  {isAr ? 'السعر النهائي للبيع (ج.م):' : 'Final Price (EGP):'}
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={finalPrice}
                  onChange={(e) => handleFinalPriceChange(Number(e.target.value))}
                  className="w-full bg-[#04060c] border border-emerald-500/50 rounded-xl p-2 text-xs text-emerald-400 font-mono text-center font-black text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                {isAr ? 'شارة العرض الترويجي (مثال: الأكثر مبيعاً 🔥 أو عرض الصيف):' : 'Promo Badge Text:'}
              </label>
              <input
                type="text"
                value={badgeAr}
                onChange={(e) => setBadgeAr(e.target.value)}
                placeholder={isAr ? 'مثال: عرض الصيف ☀️ (خصم 25%)' : 'e.g. Best Seller'}
                className="w-full bg-[#04060c] border border-slate-700 rounded-xl p-2 text-xs text-white font-bold focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Row 3: Allowances & Free Perks */}
          <div className="p-3.5 bg-[#070b14] rounded-2xl border border-sky-500/30 space-y-2">
            <span className="text-xs font-black text-sky-400 block flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>{isAr ? 'المزايا والخدمات المجانية المتاحة للمشترك:' : 'Free Allowances & Perks:'}</span>
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-300 mb-1">
                  {isAr ? 'فحوصات InBody مجاناً:' : 'Free InBody Tests:'}
                </label>
                <input
                  type="number"
                  min={0}
                  value={freeInBodyCount}
                  onChange={(e) => setFreeInBodyCount(Number(e.target.value))}
                  className="w-full bg-[#04060c] border border-slate-700 rounded-xl p-2 text-xs text-white font-mono text-center font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-300 mb-1">
                  {isAr ? 'حصص تدريب خاص PT:' : 'Free PT Sessions:'}
                </label>
                <input
                  type="number"
                  min={0}
                  value={freePTSessionsCount}
                  onChange={(e) => setFreePTSessionsCount(Number(e.target.value))}
                  className="w-full bg-[#04060c] border border-slate-700 rounded-xl p-2 text-xs text-white font-mono text-center font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-300 mb-1">
                  {isAr ? 'أيام تجميد مجانية:' : 'Free Freeze Days:'}
                </label>
                <input
                  type="number"
                  min={0}
                  value={freeFreezeDays}
                  onChange={(e) => setFreeFreezeDays(Number(e.target.value))}
                  className="w-full bg-[#04060c] border border-slate-700 rounded-xl p-2 text-xs text-white font-mono text-center font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-300 mb-1">
                  {isAr ? 'جلسات ساونا وسبا:' : 'Free Spa Sessions:'}
                </label>
                <input
                  type="number"
                  min={0}
                  value={freeSpaSessions}
                  onChange={(e) => setFreeSpaSessions(Number(e.target.value))}
                  className="w-full bg-[#04060c] border border-slate-700 rounded-xl p-2 text-xs text-white font-mono text-center font-bold"
                />
              </div>
            </div>
          </div>

          {/* Features List Dynamic Editor */}
          <div className="space-y-2 pt-1">
            <label className="block text-xs font-bold text-amber-300">
              {isAr ? 'قائمة مزايا وخدمات الباقة (تظهر للاعب والموظف):' : 'Package Benefits List:'}
            </label>

            {/* List of current features */}
            <div className="space-y-1.5">
              {featuresList.map((feat, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-[#06080e] rounded-xl border border-slate-800 text-xs">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{feat}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(idx)}
                    className="p-1 rounded-lg text-rose-400 hover:text-white hover:bg-rose-500/20"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add feature input */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={newFeatureText}
                onChange={(e) => setNewFeatureText(e.target.value)}
                placeholder={isAr ? 'اكتب ميزة جديدة (مثال: خصم 15% على البار والمكملات)...' : 'Add new benefit...'}
                className="flex-1 bg-[#070a12] border border-slate-700 rounded-xl p-2 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddFeature}
                className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shrink-0 cursor-pointer"
              >
                {isAr ? '+ إضافة ميزة' : '+ Add'}
              </button>
            </div>
          </div>

          {/* Footer Save Actions */}
          <div className="p-4 bg-[#080c14] border-t border-slate-800 flex items-center justify-between gap-3 -mx-4 -mb-4 sm:-mx-6 sm:-mb-6 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>{isAr ? 'حفظ وتحديث باقة الاشتراك' : 'Save Plan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
