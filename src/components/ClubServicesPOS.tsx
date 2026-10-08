import React, { useState, useEffect } from 'react';
import { 
  ClubServiceItem, 
  ClubCartItem, 
  ClubOrderReceipt, 
  GymMember, 
  CurrentUser 
} from '../types/gym';
import { StorageService } from '../services/storageService';
import { audioAlertService } from '../services/audioService';
import { pdfPrintService } from '../services/pdfPrintService';
import { 
  ShoppingBag, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard, 
  CheckCircle2, 
  Sparkles, 
  Printer, 
  Search, 
  Crown, 
  Dumbbell, 
  Activity, 
  Coffee, 
  Zap, 
  HeartHandshake, 
  Waves, 
  Lock, 
  ShieldCheck, 
  Calendar, 
  Flame, 
  User, 
  X,
  Receipt,
  ArrowRight,
  Filter,
  AlertTriangle,
  Clock,
  ShieldAlert
} from 'lucide-react';
import { CashShift } from '../types/gym';

interface ClubServicesPOSProps {
  currentUser: CurrentUser;
  lang: 'ar' | 'en';
  activeShift?: CashShift;
  onRequireOpenShift?: () => void;
}

export const ClubServicesPOS: React.FC<ClubServicesPOSProps> = ({ 
  currentUser, 
  lang,
  activeShift,
  onRequireOpenShift
}) => {
  const isAr = lang === 'ar';
  const [services, setServices] = useState<ClubServiceItem[]>([]);
  const [members, setMembers] = useState<GymMember[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Cart State
  const [cart, setCart] = useState<ClubCartItem[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'instapay' | 'vodafone_cash'>('cash');
  const [discountAmount, setDiscountAmount] = useState<number | string>('');
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [lastOrder, setLastOrder] = useState<ClubOrderReceipt | null>(null);

  useEffect(() => {
    setServices(StorageService.getClubServices());
    setMembers(StorageService.getMembers());
  }, []);

  const categories = [
    { id: 'all', nameAr: 'جميع الخدمات والمنتجات', nameEn: 'All Services', icon: ShoppingBag },
    { id: 'subscription', nameAr: 'باقات الاشتراكات والعضويات', nameEn: 'Memberships', icon: Crown },
    { id: 'pt_session', nameAr: 'التدريب الخاص (Private PT)', nameEn: 'PT Sessions', icon: Dumbbell },
    { id: 'inbody', nameAr: 'فحص وتحليل الجسم InBody', nameEn: 'InBody Scan', icon: Activity },
    { id: 'bar_supplements', nameAr: 'بار البروتين والمكملات', nameEn: 'Protein Bar', icon: Coffee },
    { id: 'recovery_spa', nameAr: 'السبا والمساج والاستشفاء', nameEn: 'Spa & Recovery', icon: Waves },
    { id: 'locker_gear', nameAr: 'الخزائن والمستلزمات الرياضية', nameEn: 'Lockers & Gear', icon: Lock },
  ];

  const currentActiveShift = activeShift || StorageService.getActiveShift();

  const filteredServices = services.filter(srv => {
    const matchCat = selectedCategory === 'all' || srv.category === selectedCategory;
    const matchQuery = !searchQuery.trim() || 
      srv.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) || 
      srv.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      srv.descriptionAr.includes(searchQuery);
    return matchCat && matchQuery;
  });

  // Cart operations with Shift Guard
  const handleAddToCart = (service: ClubServiceItem) => {
    const shift = activeShift;
    if (!shift) {
      audioAlertService.playWarning();
      alert(isAr 
        ? '⛔ تنبيه أمان الخزينة: لا يمكن بيع أي مكملات أو مشروبات من البار إلا بعد فتح وردية مالية نشطة أولاً.' 
        : 'Shift Required: You must open an active cash shift before adding items or selling from the Bar.');
      if (onRequireOpenShift) onRequireOpenShift();
      return;
    }

    audioAlertService.playBeep(880, 0.04);
    setCart(prev => {
      const existing = prev.find(item => item.service.id === service.id);
      if (existing) {
        return prev.map(item => 
          item.service.id === service.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { service, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (serviceId: string, delta: number) => {
    audioAlertService.playBeep(659.25, 0.03);
    setCart(prev => {
      return prev.map(item => {
        if (item.service.id === serviceId) {
          const newQ = item.quantity + delta;
          return newQ > 0 ? { ...item, quantity: newQ } : null;
        }
        return item;
      }).filter(Boolean) as ClubCartItem[];
    });
  };

  const handleRemoveFromCart = (serviceId: string) => {
    audioAlertService.playDelete();
    setCart(prev => prev.filter(item => item.service.id !== serviceId));
  };

  const handleClearCart = () => {
    audioAlertService.playDelete();
    setCart([]);
  };

  // Calculations
  const discountNum = Number(discountAmount) || 0;
  const subtotal = cart.reduce((sum, item) => sum + (item.service.price * item.quantity), 0);
  const totalAmount = Math.max(0, subtotal - discountNum);

  const selectedMember = members.find(m => m.id === selectedMemberId);

  // Complete Order with Strict Shift Enforcement
  const handleCheckout = () => {
    if (cart.length === 0) return;

    const shift = activeShift;
    if (!shift) {
      audioAlertService.playWarning();
      alert(isAr 
        ? '⛔ تم حظر عملية البيع: لا يمكن إتمام أي عملية بيع من البار أو تسجيل فواتير بدون وجود وردية مالية نشطة ومفتوحة.' 
        : 'Sale blocked: An active shift must be open to process Bar and POS sales.');
      if (onRequireOpenShift) onRequireOpenShift();
      return;
    }

    const orderNum = `ORD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();

    const newOrder: ClubOrderReceipt = {
      id: `ord-${Date.now()}`,
      orderNumber: orderNum,
      shiftId: shift.id,
      items: cart.map(it => ({
        serviceId: it.service.id,
        nameAr: it.service.nameAr,
        category: it.service.category,
        quantity: it.quantity,
        unitPrice: it.service.price,
        total: it.service.price * it.quantity
      })),
      subtotal,
      discountAmount: discountNum,
      taxAmount: 0,
      totalAmount,
      paymentMethod,
      memberId: selectedMember?.id,
      memberName: selectedMember ? selectedMember.fullNameAr : 'عميل نقدي مباشر (Guest)',
      membershipNumber: selectedMember?.membershipNumber,
      servedBy: currentUser.nameAr,
      servedByRole: currentUser.role === 'manager' ? 'المدير العام' : currentUser.role === 'accountant' ? 'مسؤول الحسابات' : 'موظف الاستقبال',
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().split(' ')[0]
    };

    StorageService.saveClubOrder(newOrder);

    // LOG SENSITIVE OVERRIDE IF DISCOUNT APPLIED
    if (discountNum > 0) {
      StorageService.recordSensitiveMod({
        category: 'price_override',
        titleAr: `خصم يدوي على فاتورة: ${orderNum}`,
        titleEn: `Manual discount on invoice: ${orderNum}`,
        detailsAr: `تم تطبيق خصم بقيمة ${discountNum.toLocaleString()} ج.م على إجمالي ${subtotal.toLocaleString()} ج.م لصالح ${newOrder.memberName}`,
        detailsEn: `Applied ${discountNum} EGP discount on total ${subtotal} EGP for ${newOrder.memberName}`,
        performerId: currentUser.id,
        performerName: currentUser.nameAr,
        performerRole: currentUser.role,
        targetId: orderNum,
        targetName: newOrder.memberName,
        oldValue: subtotal,
        newValue: totalAmount,
        reason: 'خصم استثنائي عند الدفع'
      });
    }

    audioAlertService.playSuccess();
    setLastOrder(newOrder);
    setIsReceiptModalOpen(true);
    setCart([]);
    setDiscountAmount(0);
  };

  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'Crown': return <Crown className="w-5 h-5 text-amber-400" />;
      case 'Flame': return <Flame className="w-5 h-5 text-rose-400" />;
      case 'Calendar': return <Calendar className="w-5 h-5 text-sky-400" />;
      case 'Dumbbell': return <Dumbbell className="w-5 h-5 text-amber-400" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5 text-purple-400" />;
      case 'Activity': return <Activity className="w-5 h-5 text-emerald-400" />;
      case 'Coffee': return <Coffee className="w-5 h-5 text-amber-500" />;
      case 'Zap': return <Zap className="w-5 h-5 text-yellow-400" />;
      case 'HeartHandshake': return <HeartHandshake className="w-5 h-5 text-pink-400" />;
      case 'Waves': return <Waves className="w-5 h-5 text-cyan-400" />;
      case 'Lock': return <Lock className="w-5 h-5 text-indigo-400" />;
      default: return <ShoppingBag className="w-5 h-5 text-amber-400" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ACTIVE SHIFT STATUS OR BLOCKED WARNING BANNER */}
      {!currentActiveShift ? (
        <div className="bg-gradient-to-r from-rose-950/80 via-slate-900 to-rose-950/70 border-2 border-rose-500 rounded-3xl p-5 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center font-black shrink-0">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-rose-500 text-white font-black text-[10px]">
                  {isAr ? '⛔ المبيعات معطلة - الوردية مغلقة' : 'POS Sales Locked'}
                </span>
                <span className="text-[10px] text-rose-300 font-bold">
                  {isAr ? '(يسري على المدير والموظف)' : '(All Users)'}
                </span>
              </div>
              <h3 className="text-sm font-black text-white mt-1">
                {isAr ? 'لا يمكن بيع أي شيء من البار أو المكملات إلا بعد فتح وردية مالية' : 'Open a cash shift before processing any sales'}
              </h3>
              <p className="text-[11px] text-slate-300 mt-0.5">
                {isAr 
                  ? 'وفقاً لتعليمات الإدارة الصارمة، يُمنع منعاً باتاً تسجيل أي بيع أو خصم نقدي بدون مناوبة كاش نشطة ومسجلة في الخزينة.' 
                  : 'Management requires an active cash shift to be opened before any Bar item or service can be sold.'}
              </p>
            </div>
          </div>

          {onRequireOpenShift && (
            <button
              type="button"
              onClick={onRequireOpenShift}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs transition-all shadow-lg shadow-amber-500/20 cursor-pointer flex items-center gap-2 shrink-0 active:scale-95"
            >
              <Clock className="w-4 h-4" />
              <span>{isAr ? '🔓 فتح وردية مالية جديدة الآن' : 'Open Shift Now'}</span>
            </button>
          )}
        </div>
      ) : (
        <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-950 border border-emerald-500/40 rounded-2xl p-3 px-4 flex items-center justify-between gap-3 text-xs shadow-md">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="text-emerald-300 font-bold">
              {isAr ? `الوردية النشطة المسؤولة عن المبيعات: ${currentActiveShift.staffName}` : `Active Sales Shift: ${currentActiveShift.staffName}`}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            {isAr ? 'وقت الفتح:' : 'Opened:'} {currentActiveShift.openedAt}
          </span>
        </div>
      )}
      {/* Services Header Banner */}
      <div className="bg-gradient-to-br from-[#121a24] via-[#091018] to-[#04080e] rounded-3xl p-6 border border-amber-500/40 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#f7cb55] via-[#e5a91b] to-[#b37a10] text-slate-950 flex items-center justify-center font-black shadow-xl shadow-amber-500/20">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-[#f7cb55] border border-amber-500/40 font-bold uppercase tracking-wider">
                  {isAr ? 'تطبيق الخدمات والمنتجات ونقاط البيع' : 'Club Services & POS Store'}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white mt-1">
                {isAr ? 'كتالوج خدمات النادي والاشتراكات والمبيعات' : 'Club Services & Membership Catalog'}
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                {isAr ? 'حجز الباقات، جلسات التدريب الخاص PT، قياس InBody، بار البروتين، والمساج' : 'Memberships, PT packages, InBody scans, protein bar & recovery spa'}
              </p>
            </div>
          </div>

          {/* Quick Cart Summary Badge on Mobile */}
          <div className="flex items-center gap-3">
            <div className="bg-slate-950/80 px-4 py-2.5 rounded-2xl border border-slate-800 flex items-center gap-3">
              <div>
                <span className="text-[10px] text-slate-400 block">{isAr ? 'سلة المشتريات' : 'Cart'}</span>
                <strong className="text-sm font-black text-[#f7cb55] font-mono">{totalAmount.toLocaleString()} ج.م</strong>
              </div>
              <span className="w-7 h-7 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center text-xs font-black">
                {cart.reduce((s, i) => s + i.quantity, 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Categories Horizontal Selector */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map(cat => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                  isSelected
                    ? 'bg-[#f7cb55] text-slate-950 shadow-lg shadow-[#e5a91b]/20 font-black'
                    : 'bg-slate-900/80 text-slate-300 hover:text-white border border-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{isAr ? cat.nameAr : cat.nameEn}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Catalog List (Left 8 cols) + Checkout Cart (Right 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ================= CATALOG SERVICES (8 COLS) ================= */}
        <div className="lg:col-span-8 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? 'ابحث عن خدمة، باقة اشتراك، مكمل، أو تدريب خاص...' : 'Search services, PT, supplements...'}
              className="w-full bg-[#0c101a] border border-slate-800 focus:border-[#f7cb55] rounded-2xl py-3.5 pr-11 pl-4 rtl:pr-11 rtl:pl-4 ltr:pl-11 ltr:pr-4 text-xs font-bold text-white placeholder-slate-500 focus:outline-none shadow-xl"
            />
            <Search className="w-5 h-5 text-slate-400 absolute right-3.5 rtl:right-3.5 ltr:left-3.5 top-3.5" />
          </div>

          {/* Services Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredServices.map(service => (
              <div 
                key={service.id}
                className="bg-[#0c101a] rounded-3xl p-5 border border-slate-800/80 hover:border-amber-500/50 transition-all shadow-xl flex flex-col justify-between group space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="w-10 h-10 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                      {getServiceIcon(service.iconType)}
                    </div>
                    {service.badge && (
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-[#f7cb55] border border-amber-500/30 font-bold">
                        {service.badge}
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                      {isAr ? service.nameAr : service.nameEn}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {service.descriptionAr}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 block">{isAr ? 'السعر' : 'Price'}</span>
                    <strong className="text-base font-black text-[#f7cb55] font-mono">
                      {service.price.toLocaleString()} {isAr ? 'ج.م' : 'EGP'}
                    </strong>
                  </div>

                  <button
                    onClick={() => handleAddToCart(service)}
                    className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isAr ? 'إضافة للسلة' : 'Add to Cart'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ================= POS CART & CHECKOUT (4 COLS) ================= */}
        <div className="lg:col-span-4 bg-[#0c101a] rounded-3xl p-5 border border-slate-800 shadow-2xl space-y-5 sticky top-20">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-black text-white">
                {isAr ? 'سلة الطلبات ونقطة البيع' : 'Order Cart & POS'}
              </h3>
            </div>
            {cart.length > 0 && (
              <button
                onClick={handleClearCart}
                className="text-[11px] text-rose-400 hover:text-rose-300 font-bold transition-colors cursor-pointer"
              >
                {isAr ? 'تفريغ السلة' : 'Clear'}
              </button>
            )}
          </div>

          {/* Customer Selection */}
          <div className="space-y-1.5 text-xs">
            <label className="block text-slate-300 font-bold flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-amber-400" />
              <span>{isAr ? 'تحديد العضو المستفيد (اختياري)' : 'Select Member (Optional)'}</span>
            </label>
            <select
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              className="w-full bg-[#07090f] border border-slate-800 focus:border-amber-400 rounded-xl p-2.5 text-white text-xs font-bold focus:outline-none"
            >
              <option value="">{isAr ? '-- عميل نقدي مباشر / ضيف --' : '-- Direct Cash Guest --'}</option>
              {members.map(m => (
                <option key={m.id} value={m.id}>#{m.membershipNumber} - {m.fullNameAr}</option>
              ))}
            </select>
          </div>

          {/* Cart Items List */}
          {cart.length === 0 ? (
            <div className="py-8 text-center text-slate-500 space-y-2">
              <ShoppingBag className="w-10 h-10 mx-auto opacity-40" />
              <p className="text-xs font-bold">{isAr ? 'السلة فارغة حالياً' : 'Cart is empty'}</p>
              <span className="text-[10px] block">{isAr ? 'اختر من الخدمات والمنتجات لإضافتها' : 'Select items to add'}</span>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {cart.map(item => (
                <div key={item.service.id} className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800/80 flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-white truncate">{item.service.nameAr}</h4>
                    <span className="text-[10px] text-amber-400 font-mono font-bold">
                      {(item.service.price * item.quantity).toLocaleString()} ج.م
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
                    <button
                      onClick={() => handleUpdateQuantity(item.service.id, -1)}
                      className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-mono text-xs font-bold text-white px-1.5">{item.quantity}</span>
                    <button
                      onClick={() => handleUpdateQuantity(item.service.id, 1)}
                      className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <button
                    onClick={() => handleRemoveFromCart(item.service.id)}
                    className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-950/40"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Payment Method Selector */}
          <div className="space-y-1.5 text-xs pt-2 border-t border-slate-800">
            <label className="block text-slate-300 font-bold mb-1">{isAr ? 'طريقة الدفع' : 'Payment Method'}</label>
            <div className="grid grid-cols-4 gap-1">
              {(['cash', 'card', 'instapay', 'vodafone_cash'] as const).map(method => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`py-2 px-1 rounded-xl text-[10px] font-bold border transition-all ${
                    paymentMethod === method
                      ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  {method === 'cash' ? (isAr ? 'كاش' : 'Cash') : method === 'card' ? (isAr ? 'فيزا' : 'Card') : method === 'instapay' ? 'InstaPay' : 'Vodafone'}
                </button>
              ))}
            </div>
          </div>

          {/* Summary Details */}
          <div className="bg-slate-950/90 p-3.5 rounded-2xl border border-slate-800/90 space-y-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>{isAr ? 'المجموع الفرعي:' : 'Subtotal:'}</span>
              <span className="font-mono font-bold text-slate-200">{subtotal.toLocaleString()} ج.م</span>
            </div>
            
            <div className="flex justify-between items-center text-slate-400">
              <span>{isAr ? 'خصم إضافي:' : 'Discount:'}</span>
              <input
                type="number"
                min="0"
                value={discountAmount}
                onChange={(e) => setDiscountAmount(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="0"
                className="w-20 bg-slate-900 border border-slate-800 rounded-lg p-1 text-center font-mono font-bold text-rose-400 text-xs placeholder-slate-600"
              />
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-sm font-black text-white">
              <span>{isAr ? 'صافي المبلغ الإجمالي:' : 'Net Total:'}</span>
              <span className="text-[#f7cb55] font-mono text-base">{totalAmount.toLocaleString()} ج.م</span>
            </div>
          </div>

          {/* Submit Checkout with Strict Shift Check */}
          {!currentActiveShift ? (
            <button
              type="button"
              onClick={() => {
                audioAlertService.playWarning();
                alert(isAr 
                  ? '⛔ عذراً: يجب فتح وردية مالية أولاً قبل تسجيل أو بيع أي منتجات من البار أو المكملات (يسري على المدير والموظف).' 
                  : 'Shift Required: You must open an active shift before completing sales.');
                if (onRequireOpenShift) onRequireOpenShift();
              }}
              className="w-full py-3.5 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-500/50 shadow-xl transition-all cursor-pointer animate-pulse"
            >
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>{isAr ? '⛔ الوردية مغلقة - افتح وردية للبيع' : 'Shift Closed - Open Shift First'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCheckout}
              disabled={cart.length === 0}
              className={`w-full py-3.5 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer ${
                cart.length > 0 
                  ? 'bg-gradient-to-r from-amber-500 via-[#f7cb55] to-amber-600 hover:from-amber-400 text-slate-950 shadow-amber-500/20 active:scale-95' 
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Receipt className="w-4 h-4" />
              <span>{isAr ? 'إتمام البيع وإصدار الفاتورة' : 'Complete Sale & Invoice'}</span>
            </button>
          )}
        </div>
      </div>

      {/* ================= ORDER SUCCESS RECEIPT MODAL ================= */}
      {isReceiptModalOpen && lastOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-[#0e1320] border-2 border-amber-500/50 p-6 text-slate-100 shadow-2xl relative text-right rtl:text-right ltr:text-left space-y-4">
            <button
              onClick={() => setIsReceiptModalOpen(false)}
              className="absolute top-4 left-4 rtl:left-4 rtl:right-auto ltr:right-4 ltr:left-auto p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/60"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1 pt-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto mb-2 font-black">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-base font-black text-white">
                {isAr ? 'تم إتمام البيع وتسجيل الفاتورة بنجاح' : 'Order & Invoice Completed'}
              </h3>
              <p className="text-xs text-amber-400 font-mono font-bold">
                #{lastOrder.orderNumber}
              </p>
            </div>

            <div className="bg-[#07090f] p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>{isAr ? 'العميل:' : 'Customer:'}</span>
                <strong className="text-white">{lastOrder.memberName}</strong>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>{isAr ? 'المسؤول / الكاشير:' : 'Cashier:'}</span>
                <span className="text-slate-200">{lastOrder.servedBy}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>{isAr ? 'طريقة الدفع:' : 'Payment:'}</span>
                <span className="font-mono text-emerald-400 font-bold">{lastOrder.paymentMethod}</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-sm">
                <span>{isAr ? 'إجمالي المدفوع:' : 'Total Paid:'}</span>
                <span className="text-[#f7cb55] font-mono">{lastOrder.totalAmount.toLocaleString()} ج.م</span>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => {
                  audioAlertService.playSuccess();
                  pdfPrintService.printOrderInvoicePDF(lastOrder);
                }}
                className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>{isAr ? 'طباعة الفاتورة PDF الرسمية' : 'Print Official PDF Invoice'}</span>
              </button>
              <button
                type="button"
                onClick={() => setIsReceiptModalOpen(false)}
                className="px-4 py-3 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs cursor-pointer"
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
