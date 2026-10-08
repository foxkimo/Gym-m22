import React, { useState, useEffect, useMemo } from 'react';
import { 
  GymMember, 
  FinancialTransaction, 
  CashShift, 
  CurrentUser 
} from '../types/gym';
import { StorageService } from '../services/storageService';
import { audioAlertService } from '../services/audioService';
import { pdfPrintService } from '../services/pdfPrintService';
import { VoucherModal } from './VoucherModal';
import { DeleteVoucherModal } from './DeleteVoucherModal';
import { ClubServicesPOS } from './ClubServicesPOS';
import { EmployeeAttendanceWidget } from './EmployeeAttendanceWidget';
import { RenewSubscriptionModal } from './RenewSubscriptionModal';
import { OpenShiftModal } from './OpenShiftModal';
import { 
  DollarSign, 
  Users, 
  CreditCard, 
  Receipt, 
  PlusCircle, 
  Clock, 
  Search, 
  CheckCircle2, 
  Printer, 
  ArrowDownLeft, 
  ArrowUpRight, 
  X,
  Sparkles,
  UserPlus,
  Eye,
  Trash2,
  ShoppingBag,
  Coffee,
  Lock,
  AlertCircle
} from 'lucide-react';

interface AdminGymDashboardProps {
  currentUser: CurrentUser;
  lang: 'ar' | 'en';
}

export const AdminGymDashboard: React.FC<AdminGymDashboardProps> = ({ currentUser, lang }) => {
  const isAr = lang === 'ar';
  const isManager = currentUser.role === 'manager' || currentUser.id === 'manager-1';
  const [members, setMembers] = useState<GymMember[]>([]);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [shifts, setShifts] = useState<CashShift[]>([]);
  const [activeShift, setActiveShift] = useState<CashShift | undefined>(undefined);

  // Modals
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isNewMemberModalOpen, setIsNewMemberModalOpen] = useState(false);
  const [isPOSModalOpen, setIsPOSModalOpen] = useState(false);
  const [selectedVoucherForModal, setSelectedVoucherForModal] = useState<FinancialTransaction | null>(null);
  const [voucherToDelete, setVoucherToDelete] = useState<FinancialTransaction | null>(null);

  // Voucher Filter Tab
  const [activeVoucherFilter, setActiveVoucherFilter] = useState<'all' | 'receipts' | 'expenses'>('all');

  // New payment state
  const [payMemberId, setPayMemberId] = useState('');
  const [payAmount, setPayAmount] = useState<number | string>('');
  const [payType, setPayType] = useState<'subscription' | 'renewal' | 'pt_package' | 'expense'>('renewal');
  const [payMethod, setPayMethod] = useState<'cash' | 'card' | 'instapay' | 'vodafone_cash'>('cash');
  const [payNotes, setPayNotes] = useState('');

  // Dedicated Expense Voucher state (إذن صرف نقدية ومصروفات)
  const [expenseBeneficiary, setExpenseBeneficiary] = useState('');
  const [expenseCategory, setExpenseCategory] = useState<'maintenance' | 'cleaning' | 'supplies' | 'buffet' | 'utilities' | 'other'>('maintenance');
  const [expenseAmount, setExpenseAmount] = useState<number | string>('');
  const [expenseMethod, setExpenseMethod] = useState<'cash' | 'card' | 'instapay' | 'vodafone_cash'>('cash');
  const [expenseNotes, setExpenseNotes] = useState('');

  // New member state
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberPhone, setNewMemberPhone] = useState('');
  const [newMemberBirthDate, setNewMemberBirthDate] = useState('');
  const [newMemberAddress, setNewMemberAddress] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberAvatarUrl, setNewMemberAvatarUrl] = useState('');

  // Shift Auto-Prompt for Reception Staff
  const [isOpenShiftPromptModalOpen, setIsOpenShiftPromptModalOpen] = useState(false);
  const [selectedRenewMember, setSelectedRenewMember] = useState<GymMember | null>(null);
  const [isCloseShiftModalOpen, setIsCloseShiftModalOpen] = useState(false);
  const [closeShiftAmount, setCloseShiftAmount] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isShiftsManagerModalOpen, setIsShiftsManagerModalOpen] = useState(false);
  const [shiftToDelete, setShiftToDelete] = useState<CashShift | null>(null);
  const [shiftDeleteReason, setShiftDeleteReason] = useState('');
  const [shiftsSearchQuery, setShiftsSearchQuery] = useState('');

  const refreshData = () => {
    setMembers(StorageService.getMembers());
    setTransactions(StorageService.getTransactions());
    const allShifts = StorageService.getShifts();
    setShifts(allShifts);
    const openS = allShifts.find(s => s.status === 'open');
    setActiveShift(openS);
    return openS;
  };

  useEffect(() => {
    const openShift = refreshData();
    // If reception staff logs in and no shift is open, prompt shift opening
    if (!openShift && currentUser.role === 'staff') {
      setIsOpenShiftPromptModalOpen(true);
    }

    const handleSync = () => refreshData();
    window.addEventListener('gym_storage_updated', handleSync);
    window.addEventListener('storage', handleSync);

    return () => {
      window.removeEventListener('gym_storage_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [currentUser.role]);

  // Transactions visible to this user
  const displayedTransactions = useMemo(() => {
    // General Manager sees ALL historical transactions
    if (currentUser.role === 'manager') {
      return transactions;
    }
    // Reception Staff CANNOT view closed shifts / previous shifts!
    // If no active shift is open right now, reception staff sees 0 past transactions
    if (!activeShift) {
      return [];
    }
    // Reception Staff ONLY sees transactions recorded during their currently active shift
    return transactions.filter(t => t.shiftId === activeShift.id);
  }, [currentUser.role, activeShift, transactions]);

  const isStaffLocked = currentUser.role === 'staff' && !activeShift;

  // Guarded modal openers
  const handleOpenPOSModal = () => {
    if (isStaffLocked) {
      audioAlertService.playWarning();
      setToastMessage(isAr ? '⛔ فتح المناوبة إجباري لموظف الاستقبال قبل بيع أي منتجات من البار' : 'Shift required before selling POS items');
      setTimeout(() => setToastMessage(null), 3500);
      setIsOpenShiftPromptModalOpen(true);
      return;
    }
    const openShift = activeShift;
    if (!openShift) {
      audioAlertService.playWarning();
      setToastMessage(isAr ? '⛔ تنبيه نظام الخزينة: لا توجد وردية مفتوحة حالياً' : 'No open shift');
      setTimeout(() => setToastMessage(null), 3500);
      setIsOpenShiftPromptModalOpen(true);
      return;
    }
    setIsPOSModalOpen(true);
  };

  const handleOpenNewMemberModal = () => {
    if (isStaffLocked) {
      audioAlertService.playWarning();
      setToastMessage(isAr ? '⛔ فتح المناوبة إجباري لموظف الاستقبال قبل تسجيل أي مشترك جديد' : 'Shift required before registering new member');
      setTimeout(() => setToastMessage(null), 3500);
      setIsOpenShiftPromptModalOpen(true);
      return;
    }
    setIsNewMemberModalOpen(true);
  };

  const handleOpenPaymentModal = () => {
    if (isStaffLocked) {
      audioAlertService.playWarning();
      setToastMessage(isAr ? '⛔ فتح المناوبة إجباري لموظف الاستقبال قبل إصدار أي سند قبض مالي أو توريد اشتراك' : 'Shift required before recording payments');
      setTimeout(() => setToastMessage(null), 3500);
      setIsOpenShiftPromptModalOpen(true);
      return;
    }
    if (!activeShift) {
      audioAlertService.playWarning();
      if (!confirm(isAr 
        ? '⚠️ تنبيه: لا توجد وردية مفتوحة حالياً. هل تريد تسجيل العملية بدون ربطها بوردية؟ (لن تظهر في تقارير جرد الورديات التفصيلية)' 
        : 'Warning: No open shift. Record without shift linkage? (It won\'t show in detailed shift reports)')) {
        setIsOpenShiftPromptModalOpen(true);
        return;
      }
    }
    setIsPaymentModalOpen(true);
  };

  const handleOpenExpenseModal = () => {
    if (isStaffLocked) {
      audioAlertService.playWarning();
      setToastMessage(isAr ? '⛔ فتح المناوبة إجباري لموظف الاستقبال قبل إصدار أي إذن صرف نقدية أو مصروفات' : 'Shift required before recording expenses');
      setTimeout(() => setToastMessage(null), 3500);
      setIsOpenShiftPromptModalOpen(true);
      return;
    }
    if (!activeShift) {
      audioAlertService.playWarning();
      if (!confirm(isAr 
        ? '⚠️ تنبيه: لا توجد وردية مفتوحة حالياً. هل تريد تسجيل المصروف بدون ربطه بوردية؟' 
        : 'Warning: No open shift. Record expense without shift linkage?')) {
        setIsOpenShiftPromptModalOpen(true);
        return;
      }
    }
    setIsExpenseModalOpen(true);
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (isStaffLocked) {
      audioAlertService.playWarning();
      setToastMessage(isAr ? '⛔ فتح المناوبة إجباري لموظف الاستقبال قبل إصدار أي سند قبض مالي' : 'Shift required');
      setTimeout(() => setToastMessage(null), 3500);
      setIsOpenShiftPromptModalOpen(true);
      return;
    }

    const amountNum = Number(payAmount) || 0;
    if (amountNum <= 0) return;

    const mem = members.find(m => m.id === payMemberId);
    const isExpense = payType === 'expense';
    const kind: 'receipt' | 'payment' = isExpense ? 'payment' : 'receipt';

    const newTx: FinancialTransaction = {
      id: `tx-${Date.now()}`,
      memberId: mem?.id,
      memberName: isExpense ? (payNotes.trim() || 'مصروفات عامة') : (mem?.fullNameAr || 'عضو غير مسجل'),
      membershipNumber: mem?.membershipNumber,
      type: payType,
      voucherKind: kind,
      amount: amountNum,
      paymentMethod: payMethod,
      date: StorageService.getLocalCurrentDateTimeString(),
      recordedBy: currentUser.nameAr,
      notes: payNotes.trim() || undefined,
      shiftId: activeShift?.id
    };

    const savedTx = StorageService.addTransaction(newTx);
    const seq = savedTx.voucherSequenceNumber || 1;
    const vTitle = isExpense ? `سند صرف #${seq}` : `سند قبض #${seq}`;

    // Audit log
    StorageService.logActivity({
      performerId: currentUser.id,
      performerName: currentUser.nameAr,
      performerRole: currentUser.role,
      category: 'financial',
      actionType: 'payment',
      titleAr: `تسجيل ${vTitle}`,
      titleEn: `Recorded Voucher #${seq}`,
      detailsAr: `تسجيل ${vTitle} بمبلغ ${amountNum.toLocaleString()} ج.م (${payMethod}) للطرف: ${savedTx.memberName}`,
      detailsEn: `Recorded voucher #${seq} (${amountNum} EGP)`,
      targetId: savedTx.id,
      targetName: savedTx.memberName,
      targetType: 'transaction'
    });

    audioAlertService.playSuccess();
    setIsPaymentModalOpen(false);
    setPayNotes('');
    setPayAmount('');
    refreshData();
  };

  const handleCloseShift = () => {
    if (!activeShift) return;
    setCloseShiftAmount(String(activeShift.expectedCash || 0));
    setIsCloseShiftModalOpen(true);
  };

  const confirmCloseShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeShift) return;
    
    const actualNum = Number(closeShiftAmount) || 0;
    StorageService.closeShift(activeShift.id, currentUser.id, currentUser.nameAr, actualNum);
    audioAlertService.playSuccess();
    
    setIsCloseShiftModalOpen(false);
    setCloseShiftAmount('');
    
    setToastMessage(
      isAr
        ? `✓ تم إغلاق الوردية بنجاح ومطابقة النقدية (${actualNum.toLocaleString()} ج.م). تم قفل الوردية وتصدير البيانات للمدير العام.`
        : 'Shift closed and exported to General Manager.'
    );
    setTimeout(() => setToastMessage(null), 6000);
    refreshData();
  };

  const handleOpenShift = () => {
    if (activeShift) {
      alert(isAr ? '⚠️ تنبيه: يوجد وردية مفتوحة بالفعل. يجب إغلاقها أولاً قبل البدء بوردية جديدة.' : 'A shift is already open. You must close it first.');
      return;
    }
    setIsOpenShiftPromptModalOpen(true);
  };

  const handleRecordExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser.role === 'staff' && !activeShift) {
      audioAlertService.playWarning();
      alert(isAr ? '⛔ عذراً: يجب فتح الوردية أولاً قبل إصدار أي إذن صرف نقدية أو مصروفات' : 'Open shift first.');
      setIsOpenShiftPromptModalOpen(true);
      return;
    }

    const expNum = Number(expenseAmount) || 0;
    if (expNum <= 0) return;

    const categoryLabels: Record<string, string> = {
      maintenance: 'صيانة وتصليح أجهزة',
      cleaning: 'مستلزمات نظافة وتعقيم',
      supplies: 'أدوات ومهمات الصالة',
      buffet: 'مشتريات بوفيه وبار',
      utilities: 'فواتير ومرافق (كهرباء/مياه/إنترنت)',
      other: 'مصروفات نثرية وتشغيلية'
    };

    const beneficiary = expenseBeneficiary.trim() || categoryLabels[expenseCategory] || 'مصروف عام';
    const notesText = `${categoryLabels[expenseCategory]} - ${expenseNotes.trim()}`.replace(/ - $/, '');

    const newExpenseTx: FinancialTransaction = {
      id: `tx-exp-${Date.now()}`,
      memberName: beneficiary,
      beneficiaryName: beneficiary,
      type: 'expense',
      voucherKind: 'payment',
      amount: expNum,
      paymentMethod: expenseMethod,
      date: new Date().toISOString().replace('T', ' ').substring(0, 19),
      recordedBy: currentUser.nameAr,
      notes: notesText,
      shiftId: activeShift?.id
    };

    const savedTx = StorageService.addTransaction(newExpenseTx);
    const seq = savedTx.voucherSequenceNumber || 1;

    // Audit log
    StorageService.logActivity({
      performerId: currentUser.id,
      performerName: currentUser.nameAr,
      performerRole: currentUser.role,
      category: 'financial',
      actionType: 'payment',
      titleAr: `تسجيل إذن صرف نقدية #${seq}`,
      titleEn: `Recorded Expense Voucher #${seq}`,
      detailsAr: `قام موظف الاستقبال (${currentUser.nameAr}) بتسجيل إذن صرف نقدية #${seq} بمبلغ ${expNum.toLocaleString()} ج.م للطرف: ${beneficiary}`,
      detailsEn: `Recorded expense voucher #${seq} (${expNum} EGP)`,
      targetId: savedTx.id,
      targetName: beneficiary,
      targetType: 'transaction'
    });

    audioAlertService.playSuccess();
    setIsExpenseModalOpen(false);
    setExpenseBeneficiary('');
    setExpenseNotes('');
    setExpenseAmount('');
    refreshData();

    // Prompt to print PDF
    if (confirm(isAr ? `تم تسجيل إذن صرف نقدية #${seq} بنجاح.\nهل تريد طباعة إذن الصرف الرسمي PDF الآن؟` : 'Print official Expense Voucher PDF?')) {
      pdfPrintService.printSingleVoucherPDF(savedTx);
    }
  };

  const handleDeleteTransaction = (tx: FinancialTransaction) => {
    if (!isManager) {
      audioAlertService.playWarning();
      alert(isAr ? '⛔ عذراً: حذف وتعديل السندات المالية والمعاملات مقصور على المدير العام فقط' : 'Deletion restricted to Manager only.');
      return;
    }
    setVoucherToDelete(tx);
  };

  const handleConfirmDelete = (tx: FinancialTransaction, reason: string) => {
    const success = StorageService.deleteTransaction(tx.id, currentUser.nameAr, 'manager', reason);
    if (success) {
      audioAlertService.playDelete();
      refreshData();
    }
  };

  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser.role === 'staff' && !activeShift) {
      audioAlertService.playWarning();
      alert(isAr ? '⛔ عذراً: يجب فتح الوردية أولاً قبل تسجيل أي مشترك جديد في النادي' : 'Open shift first.');
      setIsOpenShiftPromptModalOpen(true);
      return;
    }

    if (!newMemberName.trim() || !newMemberPhone.trim()) return;

    const newNum = String(Math.floor(1000 + Math.random() * 9000));
    const newMember: GymMember = {
      id: `mem-${Date.now()}`,
      membershipNumber: newNum,
      fullNameAr: newMemberName.trim(),
      fullNameEn: newMemberName.trim(),
      phone: newMemberPhone.trim(),
      gender: 'male',
      tier: 'standard', // default standard tier
      birthDate: newMemberBirthDate.trim(),
      address: newMemberAddress.trim(),
      email: newMemberEmail.trim(),
      avatarUrl: newMemberAvatarUrl.trim(),
      startDate: StorageService.getLocalTodayString(),
      endDate: StorageService.getLocalTodayString(), // expired by default till they pay
      remainingDays: 0,
      status: 'expired',
      currentProgram: members[0]?.currentProgram || {
        id: 'prog-1',
        titleAr: 'البرنامج العام للمشترك',
        titleEn: 'General Fitness Program',
        coachName: 'كابتن الصالة',
        createdAt: StorageService.getLocalTodayString(),
        days: []
      } as any,
      history: [],
      attendanceCount: 0,
      balanceDue: 0
    };

    StorageService.saveMember(newMember);

    // Audit log
    StorageService.logActivity({
      performerId: currentUser.id,
      performerName: currentUser.nameAr,
      performerRole: currentUser.role,
      category: 'membership',
      actionType: 'create',
      titleAr: `تسجيل عضو جديد: ${newMember.fullNameAr} (#${newMember.membershipNumber})`,
      titleEn: `Registered New Gym Member: ${newMember.fullNameEn}`,
      detailsAr: `تم إنشاء حساب عضوية رقم (#${newMember.membershipNumber}) باسم (${newMember.fullNameAr}) وهاتف (${newMember.phone})`,
      detailsEn: `New membership registered`,
      targetId: newMember.id,
      targetName: newMember.fullNameAr,
      targetType: 'member'
    });

    audioAlertService.playSuccess();
    setIsNewMemberModalOpen(false);
    setNewMemberName('');
    setNewMemberPhone('');
    setNewMemberBirthDate('');
    setNewMemberAddress('');
    setNewMemberEmail('');
    setNewMemberAvatarUrl('');
    refreshData();
    // Prompt subscription renewal immediately for the newly registered member
    setSelectedRenewMember(newMember);
  };

  const handleConfirmShiftDeletion = () => {
    if (!shiftToDelete) return;
    const success = StorageService.deleteShift(shiftToDelete.id, currentUser.nameAr);
    if (success) {
      audioAlertService.playDelete();
      setToastMessage(
        isAr 
          ? `✅ تم حذف سجل المناوبة للموظف (${shiftToDelete.staffName}) بنجاح وتحديث الخزينة.`
          : `Shift record for ${shiftToDelete.staffName} deleted successfully.`
      );
      setTimeout(() => setToastMessage(null), 3500);
      setShiftToDelete(null);
      refreshData();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-20 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] px-6 py-4 rounded-2xl bg-[#0c101a] border-2 border-emerald-500/60 text-emerald-300 font-bold text-sm shadow-[0_0_50px_rgba(16,185,129,0.2)] flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Daily Staff Attendance & Working Hours Widget */}
      <EmployeeAttendanceWidget 
        currentUser={currentUser} 
        lang={lang} 
        onAttendanceChanged={refreshData} 
      />

      {/* Front Desk Header */}
      <div className="bg-gradient-to-br from-[#0c181c] via-[#081216] to-[#050b0e] rounded-3xl p-6 border border-emerald-500/30 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shadow-lg">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">
                {isAr ? 'الاستقبال، الخزينة، وإدارة المشتركين' : 'Front Desk & Cash Management'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {isAr ? `مسؤول الاستقبال: ${currentUser.nameAr} | سندات القبض والصرف وتسجيل الاشتراكات` : `Cashier: ${currentUser.nameEn}`}
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            {!activeShift ? (
              <button
                onClick={handleOpenShift}
                className="px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all cursor-pointer shadow-lg active:scale-95"
              >
                {isAr ? '🟢 فتح وردية' : 'Open Shift'}
              </button>
            ) : (
              <button
                onClick={handleCloseShift}
                className="px-4 py-2.5 rounded-2xl bg-rose-500 hover:bg-rose-400 text-white font-black text-xs transition-all cursor-pointer shadow-lg active:scale-95"
              >
                {isAr ? '🔴 إغلاق الوردية' : 'Close Shift'}
              </button>
            )}

            {isManager && activeShift && (
              <button
                onClick={() => setShiftToDelete(activeShift)}
                className="px-3.5 py-2.5 rounded-2xl bg-rose-950/70 hover:bg-rose-900 text-rose-300 border border-rose-600/60 font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-lg active:scale-95"
                title={isAr ? 'حذف هذه الوردية النشطة بالكامل' : 'Delete Active Shift'}
              >
                <Trash2 className="w-4 h-4 text-rose-400" />
                <span>{isAr ? 'حذف الوردية النشطة' : 'Delete Shift'}</span>
              </button>
            )}

            {isManager && (
              <button
                onClick={() => setIsShiftsManagerModalOpen(true)}
                className="px-3.5 py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/50 font-black text-xs flex items-center gap-1.5 shadow-lg shadow-rose-600/20 transition-all active:scale-95 cursor-pointer"
                title={isAr ? 'إدارة وحذف مناوبات الموظفين (صلاحية المدير العام)' : 'Manage & Delete Shifts'}
              >
                <Trash2 className="w-4 h-4 text-rose-400" />
                <span>{isAr ? 'إدارة وحذف المناوبات' : 'Delete Shifts'}</span>
              </button>
            )}

            {/* POS Supplement & Bar Button */}
            <button
              onClick={handleOpenPOSModal}
              className={`px-3.5 py-2.5 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-lg ${
                isStaffLocked 
                  ? 'bg-rose-950/60 border border-rose-500/50 text-rose-300 hover:bg-rose-900/60' 
                  : 'bg-gradient-to-r from-[#f7cb55] to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/20'
              }`}
            >
              {isStaffLocked ? <Lock className="w-4 h-4 text-rose-400 shrink-0" /> : <ShoppingBag className="w-4 h-4 shrink-0" />}
              <span>{isStaffLocked ? (isAr ? '🔒 بيع البار (يلزم فتح وردية)' : '🔒 POS (Shift Required)') : (isAr ? '🛒 نقطة بيع المكملات والبار (POS)' : '🛒 Supplements & Bar POS')}</span>
            </button>

            <button
              onClick={handleOpenNewMemberModal}
              className={`px-3.5 py-2.5 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer ${
                isStaffLocked
                  ? 'bg-rose-950/60 border border-rose-500/50 text-rose-300 hover:bg-rose-900/60'
                  : 'bg-sky-500 hover:bg-sky-400 text-slate-950'
              }`}
            >
              {isStaffLocked ? <Lock className="w-4 h-4 text-rose-400 shrink-0" /> : <UserPlus className="w-4 h-4 shrink-0" />}
              <span>{isStaffLocked ? (isAr ? '🔒 مشترك جديد (يلزم وردية)' : '🔒 New Member (Shift Req.)') : (isAr ? '+ مشترك جديد' : '+ New Member')}</span>
            </button>

            <button
              onClick={handleOpenPaymentModal}
              className={`px-3.5 py-2.5 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-lg ${
                isStaffLocked
                  ? 'bg-rose-950/60 border border-rose-500/50 text-rose-300 hover:bg-rose-900/60'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 shadow-emerald-500/20'
              }`}
            >
              {isStaffLocked ? <Lock className="w-4 h-4 text-rose-400 shrink-0" /> : <Receipt className="w-4 h-4 shrink-0" />}
              <span>{isStaffLocked ? (isAr ? '🔒 سند قبض (يلزم وردية)' : '🔒 Receipt (Shift Req.)') : (isAr ? '+ سند قبض إيراد' : '+ New Receipt')}</span>
            </button>

            {/* Dedicated Expense Voucher Button */}
            <button
              onClick={handleOpenExpenseModal}
              className={`px-3.5 py-2.5 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-lg ${
                isStaffLocked
                  ? 'bg-rose-950/60 border border-rose-500/50 text-rose-300 hover:bg-rose-900/60'
                  : 'bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white shadow-rose-500/20'
              }`}
            >
              {isStaffLocked ? <Lock className="w-4 h-4 text-rose-400 shrink-0" /> : <ArrowUpRight className="w-4 h-4 shrink-0" />}
              <span>{isStaffLocked ? (isAr ? '🔒 إذن صرف (يلزم وردية)' : '🔒 Expense (Shift Req.)') : (isAr ? '+ إذن صرف نقدية / مصروفات' : '+ Expense Voucher')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Reception Staff Closed Shift Notice */}
      {currentUser.role === 'staff' && !activeShift && (
        <div className="bg-gradient-to-r from-rose-950/80 via-[#101422] to-slate-950 border-2 border-rose-500/50 rounded-3xl p-5 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center font-black shrink-0">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-black text-rose-300">
                {isAr ? '🔒 الوردية مغلقة حالياً - يلزم فتح الوردية لبدء العمليات' : 'Shift Closed - Open Shift Required'}
              </h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {isAr 
                  ? 'لا يمكن تسجيل أي مبيعات من البار، تجديد اشتراكات، إضافة أعضاء، أو تسجيل سندات قبض وصرف إلا بعد فتح الوردية. تم تصدير جميع الورديات المغلقة للمدير العام فقط.' 
                  : 'Cannot process POS, renewals, new members, or vouchers until a shift is opened. Closed shifts are exported to General Manager.'}
              </p>
            </div>
          </div>
          <button
            onClick={handleOpenShift}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs whitespace-nowrap shadow-xl shadow-emerald-500/20 active:scale-95 cursor-pointer transition-all flex items-center gap-2 shrink-0"
          >
            <Clock className="w-4 h-4" />
            <span>{isAr ? '🟢 فتح الوردية الآن' : 'Open Shift Now'}</span>
          </button>
        </div>
      )}

      {/* Transactions Table & Expense Management */}
      <div className="bg-[#0c101a] rounded-3xl border border-slate-800 overflow-hidden shadow-xl space-y-4 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-400" />
            <span>{isAr ? 'سجل السندات المالية وأذون الصرف' : 'Financial Vouchers & Expenses'}</span>
          </h3>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-2xl border border-slate-800">
            <button
              onClick={() => setActiveVoucherFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeVoucherFilter === 'all'
                  ? 'bg-amber-500 text-slate-950 font-black shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {isAr ? 'الكل' : 'All'} ({displayedTransactions.length})
            </button>
            <button
              onClick={() => setActiveVoucherFilter('receipts')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeVoucherFilter === 'receipts'
                  ? 'bg-emerald-500 text-slate-950 font-black shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {isAr ? 'سندات القبض (الإيرادات)' : 'Receipts'} ({displayedTransactions.filter(t => (t.voucherKind || (t.type === 'expense' ? 'payment' : 'receipt')) === 'receipt').length})
            </button>
            <button
              onClick={() => setActiveVoucherFilter('expenses')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeVoucherFilter === 'expenses'
                  ? 'bg-rose-500 text-white font-black shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {isAr ? 'أذون الصرف (المصروفات)' : 'Expenses'} ({displayedTransactions.filter(t => (t.voucherKind || (t.type === 'expense' ? 'payment' : 'receipt')) === 'payment').length})
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right rtl:text-right ltr:text-left text-xs">
            <thead className="bg-[#070a12] text-slate-400 font-bold border-b border-slate-800">
              <tr>
                <th className="p-3">#</th>
                <th className="p-3">{isAr ? 'رقم السند / إذن الصرف' : 'Voucher Serial #'}</th>
                <th className="p-3">{isAr ? 'الطرف / المستفيد' : 'Member / Beneficiary'}</th>
                <th className="p-3 text-center">{isAr ? 'نوع السند' : 'Type'}</th>
                <th className="p-3 text-center">{isAr ? 'طريقة الدفع' : 'Method'}</th>
                <th className="p-3">{isAr ? 'المبلغ' : 'Amount'}</th>
                <th className="p-3">{isAr ? 'التاريخ والمسؤول' : 'Date / Cashier'}</th>
                <th className="p-3 text-center">{isAr ? 'معاينة وطباعة' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {displayedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500 font-bold">
                    {currentUser.role === 'staff' && !activeShift 
                      ? (isAr ? '🔒 لا توجد وردية مفتوحة حالياً. تم تصدير جميع المعاملات السابقة للمدير العام.' : 'No active shift. Past transactions exported to GM.')
                      : (isAr ? 'لا توجد سندات أو معاملات مسجلة في هذه الوردية حتى الآن' : 'No transactions recorded in this shift yet')}
                  </td>
                </tr>
              ) : (
                displayedTransactions
                  .filter(tx => {
                    const isExp = (tx.voucherKind || (tx.type === 'expense' ? 'payment' : 'receipt')) === 'payment';
                    if (activeVoucherFilter === 'receipts') return !isExp;
                    if (activeVoucherFilter === 'expenses') return isExp;
                    return true;
                  })
                  .sort((a, b) => {
                    const timeA = a.date ? new Date(a.date.replace(' ', 'T')).getTime() : 0;
                    const timeB = b.date ? new Date(b.date.replace(' ', 'T')).getTime() : 0;
                    if (timeA !== timeB) return timeA - timeB;
                    return (a.voucherSequenceNumber || 0) - (b.voucherSequenceNumber || 0);
                  })
                  .map((tx, idx) => {
                  const isExpense = (tx.voucherKind || (tx.type === 'expense' ? 'payment' : 'receipt')) === 'payment';
                  const seq = tx.voucherSequenceNumber || (idx + 1);

                  return (
                    <tr key={tx.id} className="hover:bg-slate-900/60 transition-colors">
                      <td className="p-3 font-bold text-slate-500">{idx + 1}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-black border ${
                            isExpense 
                              ? 'bg-rose-950/80 text-rose-300 border-rose-500/40' 
                              : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                          }`}>
                            {isExpense ? `سند صرف #${seq}` : `سند قبض #${seq}`}
                          </span>
                        </div>
                      </td>
                      <td className="p-3 font-bold text-white">
                        <div>{tx.memberName}</div>
                        {tx.membershipNumber && (
                          <div className="text-[10px] text-slate-400 font-mono">عضوية #{tx.membershipNumber}</div>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isExpense ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'
                        }`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="p-3 text-center font-mono text-slate-300">{tx.paymentMethod}</td>
                      <td className="p-3 font-bold text-slate-100 font-mono text-sm">
                        <span className={isExpense ? 'text-rose-400' : 'text-emerald-400'}>
                          {tx.amount.toLocaleString()}
                        </span> ج.م
                      </td>
                      <td className="p-3 text-slate-400 text-[11px]">
                        <div>{tx.date}</div>
                        <div className="text-slate-500">{tx.recordedBy}</div>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedVoucherForModal(tx)}
                            className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-[#f7cb55] text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                            title="معاينة تفاصيل السند"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>{isAr ? 'عرض' : 'View'}</span>
                          </button>
                          <button
                            onClick={() => pdfPrintService.printSingleVoucherPDF(tx)}
                            className="px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-[#f7cb55] border border-[#f7cb55]/30 text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                            title="طباعة وتصدير السند الرسمي"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>{isAr ? 'طباعة' : 'Print'}</span>
                          </button>
                          
                          {/* DELETE BUTTON: ONLY VISIBLE TO GENERAL MANAGER */}
                          {currentUser.role === 'manager' && (
                            <button
                              onClick={() => handleDeleteTransaction(tx)}
                              className="px-2 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                              title="حذف وتعديل السند المالي (صلاحية المدير العام)"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>{isAr ? 'حذف' : 'Delete'}</span>
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

      {/* Payment Modal */}
      {isPaymentModalOpen && (() => {
        const nextVoucherPreview = StorageService.peekNextVoucherSequence(payType === 'expense' ? 'payment' : 'receipt');

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
            <div className="w-full max-w-md max-h-[calc(100dvh-2rem)] sm:max-h-[85vh] flex flex-col rounded-3xl bg-[#0e1320] border border-emerald-500/40 text-slate-100 shadow-2xl relative overflow-hidden my-auto">
              <div className="p-5 pb-3 border-b border-slate-800/80 shrink-0 flex items-center justify-between bg-[#0a0e18]">
                <h3 className="text-base font-black text-white">
                  {isAr ? 'تسجيل سند مالي جديد' : 'New Payment / Receipt Voucher'}
                </h3>
                <button
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/60 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleRecordPayment} className="flex-1 min-h-0 flex flex-col overflow-hidden">
                <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs overscroll-contain pb-6">
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-bold">الرقم التسلسلي المخصص تلقائياً:</span>
                    <span className={`px-2.5 py-0.5 rounded-lg text-xs font-mono font-black border ${
                      payType === 'expense' 
                        ? 'bg-rose-950 text-rose-300 border-rose-500/50' 
                        : 'bg-emerald-950 text-emerald-300 border-emerald-500/50'
                    }`}>
                      {nextVoucherPreview.labelAr}
                    </span>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1.5">{isAr ? 'اختر العضو' : 'Select Member'}</label>
                    <select
                      value={payMemberId}
                      onChange={(e) => setPayMemberId(e.target.value)}
                      className="w-full bg-[#080b12] border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="">{isAr ? '-- بدون عضو (مصروف عام) --' : '-- General Expense --'}</option>
                      {members.map(m => (
                        <option key={m.id} value={m.id}>#{m.membershipNumber} - {m.fullNameAr}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1.5">{isAr ? 'المبلغ (ج.م)' : 'Amount (EGP)'}</label>
                      <input
                        type="number"
                        required
                        value={payAmount}
                        onChange={(e) => setPayAmount(e.target.value === '' ? '' : Number(e.target.value))}
                        placeholder={isAr ? 'أدخل المبلغ...' : 'Enter amount...'}
                        className="w-full bg-[#080b12] border border-slate-800 rounded-xl p-2.5 text-white font-mono font-bold text-emerald-400"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-bold mb-1.5">{isAr ? 'نوع المعاملة' : 'Type'}</label>
                      <select
                        value={payType}
                        onChange={(e) => setPayType(e.target.value as any)}
                        className="w-full bg-[#080b12] border border-slate-800 rounded-xl p-2.5 text-white"
                      >
                        <option value="renewal">{isAr ? 'سند قبض - تجديد اشتراك' : 'Renewal'}</option>
                        <option value="subscription">{isAr ? 'سند قبض - اشتراك جديد' : 'New Sub'}</option>
                        <option value="pt_package">{isAr ? 'سند قبض - تدريب خاص PT' : 'PT'}</option>
                        <option value="expense">{isAr ? 'سند صرف - مصروفات وتشغيل' : 'Expense'}</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1.5">{isAr ? 'طريقة الدفع' : 'Payment Method'}</label>
                    <div className="grid grid-cols-4 gap-1">
                      {(['cash', 'card', 'instapay', 'vodafone_cash'] as const).map(method => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setPayMethod(method)}
                          className={`p-2 rounded-xl text-[11px] font-bold border transition-all ${
                            payMethod === method ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-[#080b12] text-slate-400 border-slate-800'
                          }`}
                        >
                          {method}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1.5">{isAr ? 'البيان والملاحظات' : 'Notes'}</label>
                    <input
                      type="text"
                      value={payNotes}
                      onChange={(e) => setPayNotes(e.target.value)}
                      placeholder={isAr ? 'ملاحظات السند...' : 'Notes...'}
                      className="w-full bg-[#080b12] border border-slate-800 rounded-xl p-3 text-white"
                    />
                  </div>
                </div>

                <div className="p-3.5 sm:p-4 px-4 sm:px-6 bg-[#0a0e18] border-t-2 border-slate-800 shrink-0 flex items-center gap-3 z-30 shadow-[0_-12px_24px_rgba(0,0,0,0.85)]">
                  <button
                    type="submit"
                    className="flex-1 py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm transition-all shadow-xl shadow-emerald-600/25 cursor-pointer flex items-center justify-center gap-2 active:scale-95 shrink-0"
                  >
                    {isAr ? 'حفظ وإصدار السند المرقم' : 'Issue Voucher'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPaymentModalOpen(false)}
                    className="px-5 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs sm:text-sm cursor-pointer transition-colors shrink-0"
                  >
                    {isAr ? 'إلغاء' : 'Cancel'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

      {/* Dedicated Reception Expense Voucher Modal (إذن صرف نقدية / مصروفات مع رقم مسلسل رسمي) */}
      {isExpenseModalOpen && (() => {
        const nextExpensePreview = StorageService.peekNextVoucherSequence('payment');

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
            <div className="w-full max-w-lg rounded-3xl bg-[#0e1320] border-2 border-rose-500/50 p-6 text-slate-100 shadow-2xl relative">
              <button
                onClick={() => setIsExpenseModalOpen(false)}
                className="absolute top-4 left-4 rtl:left-4 rtl:right-auto ltr:right-4 ltr:left-auto p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/60"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center font-bold">
                    <ArrowUpRight className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">
                      {isAr ? 'إذن صرف نقدية ومصروفات (الاستقبال)' : 'Reception Expense Voucher'}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      {isAr ? 'تسجيل المصروفات الصادرة وخصمها من عهدة الوردية برقم مسلسل لا يتكرر' : 'Sequential Outgoing Cash Voucher'}
                    </p>
                  </div>
                </div>

                {/* Serial Voucher Badge */}
                <div className="mt-3 p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-bold">
                    {isAr ? 'الرقم المسلسل المعتمد للإذن:' : 'Sequential Voucher #:'}
                  </span>
                  <span className="px-3 py-1 rounded-xl text-xs font-mono font-black bg-rose-950 text-rose-300 border border-rose-500/50 shadow-inner">
                    {nextExpensePreview.labelAr}
                  </span>
                </div>
              </div>

              <form onSubmit={handleRecordExpense} className="space-y-4 text-xs">
                {/* Category & Beneficiary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1.5">{isAr ? 'بند / تصنيف المصروف' : 'Expense Category'}</label>
                    <select
                      value={expenseCategory}
                      onChange={(e) => setExpenseCategory(e.target.value as any)}
                      className="w-full bg-[#080b12] border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-rose-500 font-bold"
                    >
                      <option value="maintenance">{isAr ? '🔧 صيانة وتصليح أجهزة' : 'Equipment Maintenance'}</option>
                      <option value="cleaning">{isAr ? '🧹 مستلزمات نظافة وتعقيم' : 'Cleaning & Hygiene'}</option>
                      <option value="supplies">{isAr ? '🏋️ أدوات ومهمات الصالة' : 'Gym Supplies'}</option>
                      <option value="buffet">{isAr ? '☕ مشتريات بوفيه وبار' : 'Buffet / Bar'}</option>
                      <option value="utilities">{isAr ? '💡 فواتير ومرافق (كهرباء/مياه/نت)' : 'Utilities'}</option>
                      <option value="other">{isAr ? '📋 مصروفات نثرية وتشغيلية أخرى' : 'Other Expenses'}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1.5">{isAr ? 'اسم المستلم / المستفيد' : 'Beneficiary / Recipient'}</label>
                    <input
                      type="text"
                      required
                      value={expenseBeneficiary}
                      onChange={(e) => setExpenseBeneficiary(e.target.value)}
                      placeholder={isAr ? 'مثال: فني الصيانة / شركة النظافة' : 'Recipient name...'}
                      className="w-full bg-[#080b12] border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                {/* Amount & Method */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1.5">{isAr ? 'المبلغ المنصرف (ج.م)' : 'Amount (EGP)'}</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={expenseAmount}
                      onChange={(e) => setExpenseAmount(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder={isAr ? 'أدخل مبلغ المصروف...' : 'Enter amount...'}
                      className="w-full bg-[#080b12] border border-slate-800 rounded-xl p-3 text-rose-400 font-mono font-black text-sm focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1.5">{isAr ? 'طريقة الصرف' : 'Payment Method'}</label>
                    <select
                      value={expenseMethod}
                      onChange={(e) => setExpenseMethod(e.target.value as any)}
                      className="w-full bg-[#080b12] border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-rose-500 font-bold"
                    >
                      <option value="cash">{isAr ? '💵 نقداً من عهدة الخزينة' : 'Cash'}</option>
                      <option value="instapay">{isAr ? '⚡ إنستاباي (InstaPay)' : 'InstaPay'}</option>
                      <option value="vodafone_cash">{isAr ? '📱 فودافون كاش' : 'Vodafone Cash'}</option>
                      <option value="card">{isAr ? '💳 بطاقة بنكية / تحويل' : 'Card / Transfer'}</option>
                    </select>
                  </div>
                </div>

                {/* Shift Impact info */}
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 flex items-center justify-between">
                  <span>{isAr ? 'الوردية المحمل عليها المصروف:' : 'Assigned Shift:'}</span>
                  <span className="font-bold text-white font-mono">
                    {activeShift ? `${activeShift.staffName} (مفتوحة)` : 'وردية الاستقبال الحالية'}
                  </span>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">{isAr ? 'بيان وتفاصيل المصروف' : 'Expense Details & Notes'}</label>
                  <textarea
                    rows={2}
                    value={expenseNotes}
                    onChange={(e) => setExpenseNotes(e.target.value)}
                    placeholder={isAr ? 'أدخل تفاصيل وملاحظات إذن الصرف إن وجدت...' : 'Enter details...'}
                    className="w-full bg-[#080b12] border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-rose-500 resize-none"
                  />
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black text-xs transition-all shadow-lg shadow-rose-600/30 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Receipt className="w-4 h-4" />
                    <span>{isAr ? 'حفظ إذن الصرف وطباعة السند PDF' : 'Save & Print Voucher'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsExpenseModalOpen(false)}
                    className="px-5 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
                  >
                    {isAr ? 'إلغاء' : 'Cancel'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

      {/* New Member Modal */}
      {isNewMemberModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="w-full max-w-md max-h-[calc(100dvh-2rem)] sm:max-h-[85vh] flex flex-col rounded-3xl bg-[#0e1320] border border-sky-500/40 text-slate-100 shadow-2xl relative overflow-hidden my-auto">
            <div className="p-5 pb-3 border-b border-slate-800/80 shrink-0 flex items-center justify-between bg-[#0a0e18]">
              <h3 className="text-base font-black text-white">
                {isAr ? '+ تسجيل مشترك جديد في النادي' : 'Register New Member'}
              </h3>
              <button
                onClick={() => setIsNewMemberModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/60 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMember} className="flex-1 min-h-0 flex flex-col overflow-hidden">
              <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs overscroll-contain pb-6">
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">{isAr ? 'اسم المشترك بالكامل' : 'Full Name'}</label>
                  <input
                    type="text"
                    required
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    placeholder={isAr ? 'الاسم ثلاثي...' : 'Full Name'}
                    className="w-full bg-[#080b12] border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">{isAr ? 'رقم الهاتف' : 'Phone'}</label>
                  <input
                    type="tel"
                    required
                    value={newMemberPhone}
                    onChange={(e) => setNewMemberPhone(e.target.value)}
                    placeholder="01012345678"
                    className="w-full bg-[#080b12] border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1.5">{isAr ? 'تاريخ الميلاد (مجهول افتراضياً)' : 'Birth Date (Optional)'}</label>
                    <input
                      type="text"
                      name="admin_no_suggest_mem_birth"
                      value={newMemberBirthDate}
                      onChange={(e) => setNewMemberBirthDate(e.target.value)}
                      autoComplete="off"
                      placeholder={isAr ? 'مجهول / غير محدد (أدخل يدوياً إن وُجد)' : 'Unknown / Not specified (optional)'}
                      className="w-full bg-[#080b12] border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-sky-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1.5">{isAr ? 'العنوان' : 'Address'}</label>
                    <input
                      type="text"
                      value={newMemberAddress}
                      onChange={(e) => setNewMemberAddress(e.target.value)}
                      placeholder={isAr ? 'العنوان والتفاصيل السكنية' : 'Address'}
                      className="w-full bg-[#080b12] border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-sky-500 font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1.5">{isAr ? 'البريد الإلكتروني' : 'Email'}</label>
                    <input
                      type="email"
                      value={newMemberEmail}
                      onChange={(e) => setNewMemberEmail(e.target.value)}
                      placeholder="example@email.com"
                      className="w-full bg-[#080b12] border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-sky-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1.5">{isAr ? 'رابط صورة العضو' : 'Avatar URL'}</label>
                    <input
                      type="text"
                      value={newMemberAvatarUrl}
                      onChange={(e) => setNewMemberAvatarUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-[#080b12] border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-sky-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3.5 sm:p-4 px-4 sm:px-6 bg-[#0a0e18] border-t-2 border-slate-800 shrink-0 flex items-center gap-3 z-30 shadow-[0_-12px_24px_rgba(0,0,0,0.85)]">
                <button
                  type="submit"
                  className="flex-1 py-3.5 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs sm:text-sm transition-all shadow-xl shadow-sky-500/25 cursor-pointer flex items-center justify-center gap-2 active:scale-95 shrink-0"
                >
                  {isAr ? 'تأكيد التسجيل وإصدار البطاقة' : 'Register Member'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsNewMemberModalOpen(false)}
                  className="px-5 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs sm:text-sm cursor-pointer transition-colors shrink-0"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sequential Voucher View & Print Modal */}
      <VoucherModal
        isOpen={!!selectedVoucherForModal}
        transaction={selectedVoucherForModal}
        onClose={() => setSelectedVoucherForModal(null)}
        onDeleteVoucher={(tx) => {
          setSelectedVoucherForModal(null);
          setVoucherToDelete(tx);
        }}
        isManager={isManager}
      />

      {/* Delete Voucher Confirmation In-App Modal */}
      <DeleteVoucherModal
        isOpen={!!voucherToDelete}
        transaction={voucherToDelete}
        onClose={() => setVoucherToDelete(null)}
        onConfirmDelete={handleConfirmDelete}
        lang={lang}
        managerName={currentUser.nameAr || 'المدير العام'}
      />

      {/* 5. CLUB SERVICES & BAR SUPPLEMENTS POS MODAL (نقطة بيع المكملات والبار) */}
      {isPOSModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-6xl max-h-[94vh] flex flex-col rounded-3xl bg-[#0b0f18] border-2 border-amber-500/40 text-slate-100 shadow-2xl relative overflow-hidden text-right rtl:text-right ltr:text-left">
            <div className="p-4 bg-[#080c14] border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black flex items-center gap-1">
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>{isAr ? 'نقطة بيع المكملات والبار والخدمات' : 'Supplements & Bar POS'}</span>
                </span>
                <span className="text-xs text-slate-400">
                  {isAr ? `الموظف المسؤول: ${currentUser.nameAr}` : `Staff: ${currentUser.nameEn}`}
                </span>
              </div>

              <button
                onClick={() => {
                  setIsPOSModalOpen(false);
                  refreshData();
                }}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 sm:p-4">
              <ClubServicesPOS 
                currentUser={currentUser} 
                lang={lang} 
                activeShift={activeShift}
                onRequireOpenShift={() => {
                  setIsPOSModalOpen(false);
                  setIsOpenShiftPromptModalOpen(true);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* RECEPTION SHIFT PROMPT MODAL */}
      <OpenShiftModal
        isOpen={isOpenShiftPromptModalOpen || isStaffLocked}
        onClose={() => {
          if (!isStaffLocked) {
            setIsOpenShiftPromptModalOpen(false);
          }
        }}
        currentUser={currentUser}
        lang={lang}
        isMandatory={isStaffLocked}
        onShiftOpened={(shift) => {
          setActiveShift(shift);
          setIsOpenShiftPromptModalOpen(false);
          refreshData();
        }}
      />

      {/* CLOSE SHIFT MODAL */}
      {isCloseShiftModalOpen && activeShift && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#0c101a] border-2 border-rose-500/50 rounded-3xl p-6 shadow-2xl relative text-slate-100 text-right rtl:text-right ltr:text-left">
            <button
              onClick={() => setIsCloseShiftModalOpen(false)}
              className="absolute top-4 left-4 rtl:left-4 rtl:right-auto ltr:right-4 ltr:left-auto p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/60"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold border border-rose-500/30">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">
                  {isAr ? 'إغلاق الوردية ومطابقة الخزينة' : 'Close Shift & Match Cash'}
                </h3>
                <span className="text-xs text-slate-400">
                  {isAr ? `المسؤول: ${activeShift.staffName}` : `Operator: ${activeShift.staffName}`}
                </span>
              </div>
            </div>

            <form onSubmit={confirmCloseShift} className="space-y-5">
              <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 space-y-3">
                {(() => {
                  const shiftTxs = transactions.filter(t => t.shiftId === activeShift.id);
                  const isExp = (t: FinancialTransaction) => t.voucherKind === 'payment' || ['expense', 'refund'].includes(t.type);
                  const isGymSub = (t: FinancialTransaction) => {
                    if (isExp(t)) return false;
                    if (['subscription', 'renewal', 'pt_package', 'locker'].includes(t.type)) return true;
                    const n = ((t.notes || '') + ' ' + (t.memberName || '')).toLowerCase();
                    return n.includes('vip') || n.includes('اشتراك') || n.includes('باقة') || n.includes('ذهبي') || n.includes('عضوية') || n.includes('سنوي') || n.includes('شهري') || n.includes('تجديد') || n.includes('تدريب') || n.includes('pt') || n.includes('خزائن') || n.includes('locker');
                  };
                  
                  const subsTotal = shiftTxs.filter(t => !isExp(t) && isGymSub(t)).reduce((s, t) => s + t.amount, 0);
                  const barTotal = shiftTxs.filter(t => !isExp(t) && !isGymSub(t)).reduce((s, t) => s + t.amount, 0);
                  const expTotal = shiftTxs.filter(t => isExp(t)).reduce((s, t) => s + t.amount, 0);
                  const startCash = activeShift.startingCash || 0;
                  const calculatedExpected = startCash + subsTotal + barTotal - expTotal;
                  
                  return (
                    <>
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-slate-400">{isAr ? 'قسم الاشتراكات:' : 'Subscriptions:'}</span>
                        <span className="text-sky-400 font-mono font-bold">{subsTotal.toLocaleString()} ج</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-slate-400">{isAr ? 'قسم مبيعات البار:' : 'Bar Sales:'}</span>
                        <span className="text-amber-400 font-mono font-bold">{barTotal.toLocaleString()} ج</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] border-b border-slate-800/50 pb-2">
                        <span className="text-slate-400">{isAr ? 'المصروفات:' : 'Expenses:'}</span>
                        <span className="text-rose-400 font-mono font-bold">{expTotal.toLocaleString()} ج</span>
                      </div>
                      <div className="flex justify-between items-center text-xs pt-1">
                        <span className="text-emerald-400 font-bold">{isAr ? 'الصافي المفروض بالخزنة:' : 'Expected in Treasury:'}</span>
                        <strong className="text-emerald-400 font-mono text-sm">{calculatedExpected.toLocaleString()} ج.م</strong>
                      </div>
                    </>
                  );
                })()}
                
                <div className="flex justify-between items-center text-xs border-t border-slate-800/50 pt-2">
                  <span className="text-slate-400">{isAr ? 'وقت الافتتاح:' : 'Opened At:'}</span>
                  <span className="text-slate-300 font-mono text-[10px]">
                    {activeShift.openedAt.split(' ')[0]} {(() => {
                      try {
                        const parts = activeShift.openedAt.split(' ');
                        const tPart = parts.length > 1 ? parts[1] : parts[0];
                        const [h, m] = tPart.split(':');
                        const date = new Date();
                        date.setHours(parseInt(h), parseInt(m));
                        return date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: true });
                      } catch {
                        return '';
                      }
                    })()}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  {isAr ? 'أدخل إجمالي النقدية الموجودة في الدرج فعلياً (للمطابقة):' : 'Actual Cash in Drawer:'}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    min="0"
                    value={closeShiftAmount}
                    onChange={(e) => setCloseShiftAmount(e.target.value)}
                    className="w-full bg-[#050810] border-2 border-rose-500/40 rounded-xl p-4 pr-12 text-xl font-mono font-black text-white focus:border-rose-500 focus:outline-none"
                    placeholder="0"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">ج.م</span>
                </div>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[10px] text-amber-200/80 leading-relaxed">
                  {isAr 
                    ? 'تنبيه: عند الإغلاق سيتم ترحيل كافة العمليات للمدير العام ولن تتمكن من تعديل الوردية مرة أخرى.' 
                    : 'Notice: Once closed, all transactions are exported to GM and cannot be edited.'}
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-xl bg-gradient-to-r from-rose-500 to-rose-700 hover:from-rose-400 hover:to-rose-600 text-white font-black text-sm transition-all shadow-xl shadow-rose-500/20 active:scale-95 cursor-pointer"
              >
                {isAr ? '🔴 تأكيد الإغلاق النهائي وتصدير البيانات' : 'Confirm Close & Export'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* RENEW SUBSCRIPTION MODAL */}
      <RenewSubscriptionModal
        member={selectedRenewMember}
        isOpen={!!selectedRenewMember}
        onClose={() => setSelectedRenewMember(null)}
        currentUser={currentUser}
        lang={lang}
        activeShift={activeShift}
        onSuccess={() => {
          refreshData();
        }}
      />

      {/* SHIFTS MANAGER MODAL (صلاحية المدير العام لحذف وإدارة المناوبات) */}
      {isShiftsManagerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-4xl max-h-[88vh] flex flex-col rounded-3xl bg-[#0c101a] border-2 border-rose-500/50 text-slate-100 shadow-2xl relative text-right rtl:text-right ltr:text-left overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-[#070a12] shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center font-bold">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    {isAr ? 'إدارة وحذف مناوبات الموظفين (صلاحية المدير العام)' : 'Manage & Delete Shifts'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {isAr ? 'عرض كافة المناوبات المفتوحة والمغلقة وحذف أي مناوبة خاطئة فوراً' : 'View all shifts and permanently delete any shift record'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsShiftsManagerModalOpen(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Bar */}
            <div className="p-4 border-b border-slate-800/80 bg-[#080b12] shrink-0">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 rtl:right-3 ltr:left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={shiftsSearchQuery}
                  onChange={(e) => setShiftsSearchQuery(e.target.value)}
                  placeholder={isAr ? 'بحث باسم الموظف أو التاريخ...' : 'Search staff or date...'}
                  className="w-full bg-[#0d1322] border border-slate-800 rounded-xl pr-9 pl-3 rtl:pr-9 rtl:pl-3 ltr:pl-9 ltr:pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            {/* Shifts List Table */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {(() => {
                const filtered = shifts.filter(s => {
                  if (!shiftsSearchQuery.trim()) return true;
                  const q = shiftsSearchQuery.toLowerCase();
                  return s.staffName.toLowerCase().includes(q) || (s.openedAt || '').includes(q);
                });

                if (filtered.length === 0) {
                  return (
                    <div className="p-8 text-center text-slate-500 font-bold">
                      {isAr ? 'لا توجد مناوبات مسجلة حالياً' : 'No shifts found'}
                    </div>
                  );
                }

                return (
                  <div className="space-y-2.5">
                    {filtered.map(shift => {
                      const isOpen = shift.status === 'open';
                      const shiftTxs = transactions.filter(t => t.shiftId === shift.id);

                      return (
                        <div
                          key={shift.id}
                          className="bg-[#080d1a] border border-slate-800/80 hover:border-slate-700 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <strong className="text-sm font-bold text-white">{shift.staffName}</strong>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${
                                isOpen
                                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 animate-pulse'
                                  : 'bg-slate-800 text-slate-400 border-slate-700'
                              }`}>
                                {isOpen ? (isAr ? '🟢 مفتوحة' : 'OPEN') : (isAr ? '🔒 مغلقة' : 'CLOSED')}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">
                                ({shiftTxs.length} {isAr ? 'معاملة' : 'txs'})
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                              <span>{isAr ? 'الافتتاح:' : 'Opened:'} <span className="font-mono text-slate-300">{shift.openedAt}</span></span>
                              {shift.closedAt && (
                                <span>{isAr ? 'الإغلاق:' : 'Closed:'} <span className="font-mono text-slate-300">{shift.closedAt}</span></span>
                              )}
                              <span>{isAr ? 'العهدة:' : 'Float:'} <span className="font-mono font-bold text-amber-400">{(shift.startingCash || 0).toLocaleString()} ج</span></span>
                              <span>{isAr ? 'الفعلي:' : 'Actual:'} <span className="font-mono font-bold text-emerald-400">{(shift.actualCash || 0).toLocaleString()} ج</span></span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => {
                                audioAlertService.playSuccess();
                                pdfPrintService.printShiftReportPDF(shift, transactions, currentUser.nameAr);
                              }}
                              className="p-2 rounded-xl bg-slate-800 hover:bg-[#e5a91b] hover:text-slate-950 text-slate-300 transition-colors cursor-pointer"
                              title={isAr ? 'طباعة تقرير الوردية PDF' : 'Print Shift PDF'}
                            >
                              <Printer className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => {
                                setShiftToDelete(shift);
                              }}
                              className="px-3 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600 hover:text-white text-rose-300 border border-rose-500/50 text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
                              title={isAr ? 'حذف سجل المناوبة بالكامل' : 'Delete Shift'}
                            >
                              <Trash2 className="w-4 h-4 text-rose-400 group-hover:text-white" />
                              <span>{isAr ? 'حذف المناوبة' : 'Delete'}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* IN-APP SHIFT DELETION CONFIRMATION MODAL IN FRONT DESK */}
      {shiftToDelete && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-[#0e1320] border-2 border-rose-500/50 p-6 text-slate-100 shadow-2xl relative text-right rtl:text-right ltr:text-left">
            <button
              onClick={() => setShiftToDelete(null)}
              className="absolute top-4 left-4 rtl:left-4 rtl:right-auto ltr:right-4 ltr:left-auto p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center font-bold shadow-lg shadow-rose-500/10 shrink-0">
                <Trash2 className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                  {isAr ? 'صلاحية المدير العام الحصرية' : 'Exclusive GM Authority'}
                </span>
                <h3 className="text-base sm:text-lg font-black text-white mt-1">
                  {isAr ? 'تأكيد حذف سجل المناوبة والخزينة' : 'Confirm Shift Deletion'}
                </h3>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#080b12] border border-rose-950/80 mb-4 space-y-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">{isAr ? 'الموظف المسؤول:' : 'Staff:'}</span>
                  <strong className="text-sm font-bold text-white">{shiftToDelete.staffName}</strong>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                  shiftToDelete.status === 'open'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 animate-pulse'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                  {shiftToDelete.status === 'open' ? (isAr ? '🟢 مناوبة نشطة مفتوحة' : 'OPEN') : (isAr ? '🔒 مناوبة مغلقة' : 'CLOSED')}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                <div>
                  <span className="text-slate-500 block text-[10px]">{isAr ? 'وقت الافتتاح' : 'Opened At'}</span>
                  <span className="font-mono text-slate-300">{shiftToDelete.openedAt}</span>
                </div>
                {shiftToDelete.closedAt && (
                  <div>
                    <span className="text-slate-500 block text-[10px]">{isAr ? 'وقت الإغلاق' : 'Closed At'}</span>
                    <span className="font-mono text-slate-300">{shiftToDelete.closedAt}</span>
                  </div>
                )}
                <div>
                  <span className="text-slate-500 block text-[10px]">{isAr ? 'رصيد البداية (العهدة)' : 'Starting Float'}</span>
                  <span className="font-mono font-bold text-amber-400">{(shiftToDelete.startingCash || 0).toLocaleString()} ج.م</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">{isAr ? 'الدرج الفعلي المسجل' : 'Actual Cash'}</span>
                  <span className="font-mono font-bold text-emerald-400">{(shiftToDelete.actualCash || 0).toLocaleString()} ج.م</span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs mb-5 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>
                {isAr
                  ? 'سيتم حذف سجل هذه المناوبة بشكل نهائي من قاعدة البيانات، وسيتيح ذلك فتح وردية جديدة فوراً. يُسجّل هذا الإجراء في السجل الرقابي للمدير العام.'
                  : 'This shift record will be permanently deleted from the database and logged to GM audit logs.'}
              </span>
            </div>

            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={handleConfirmShiftDeletion}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 transition-all cursor-pointer active:scale-95"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isAr ? 'تأكيد الحذف النهائي للمناوبة' : 'Confirm Shift Deletion'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShiftToDelete(null)}
                className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs transition-colors cursor-pointer"
              >
                {isAr ? 'إلغاء والتراجع' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
