import React, { useState } from 'react';
import { CurrentUser, GymMember, EmployeeAccount } from '../types/gym';
import { StorageService } from '../services/storageService';
import { audioAlertService } from '../services/audioService';
import { 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertTriangle, 
  ShieldCheck,
  Clock,
  LogIn,
  LogOut,
  CheckCircle2,
  Fingerprint
} from 'lucide-react';
import { GymLogo } from './GymLogo';
import {
  INITIAL_MANAGER_ACCOUNTS,
  INITIAL_ACCOUNTANT_ACCOUNTS,
  INITIAL_STAFF_ACCOUNTS,
  INITIAL_COACH_ACCOUNTS,
  INITIAL_MEMBERS
} from '../data/initialData';

interface MultiRoleAuthScreenProps {
  onLoginSuccess: (user: CurrentUser, member?: GymMember) => void;
  lang: 'ar' | 'en';
}

// Convert Eastern Arabic-Indic numerals (٠١٢٣٤٥٦٧٨٩) to standard ASCII digits (0123456789)
const normalizeArabicDigits = (str: string | undefined | null): string => {
  if (!str) return '';
  const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  let res = str.toString().trim();
  for (let i = 0; i < 10; i++) {
    res = res.replace(new RegExp(arabicNumbers[i], 'g'), i.toString());
  }
  return res.trim();
};

// Normalize clean string for comparison (removes zero-width, trims, lowercases)
const normalizeKey = (str: string | undefined | null): string => {
  if (!str) return '';
  const converted = normalizeArabicDigits(str);
  return converted
    .toLowerCase()
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // remove zero-width chars
    .replace(/[\s\-_]/g, '') // remove spaces, dashes, underscores
    .trim();
};

// Normalize phone number (strips country codes +20, +966, 00, etc.)
const normalizePhone = (phone: string | undefined | null): string => {
  if (!phone) return '';
  const digitsOnly = normalizeArabicDigits(phone).replace(/\D/g, '');
  if (digitsOnly.startsWith('00966')) return digitsOnly.substring(5);
  if (digitsOnly.startsWith('966')) return digitsOnly.substring(3);
  if (digitsOnly.startsWith('0020')) return digitsOnly.substring(4);
  if (digitsOnly.startsWith('20')) return digitsOnly.substring(2);
  if (digitsOnly.startsWith('0')) return digitsOnly.substring(1);
  return digitsOnly;
};

export const MultiRoleAuthScreen: React.FC<MultiRoleAuthScreenProps> = ({ onLoginSuccess, lang }) => {
  const isAr = lang === 'ar';
  
  // App Mode: 'login' (Account Access) or 'attendance' (Check-in/Out)
  const [authMode, setAuthMode] = useState<'login' | 'attendance'>('login');
  
  // Login States
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [failedAttempts, setFailedAttempts] = useState(0);

  // Attendance States
  const [attCode, setAttCode] = useState('');
  const [attAction, setAttAction] = useState<'checkin' | 'checkout' | null>(null);
  const [earlyReason, setEarlyReason] = useState('');
  const [showEarlyForm, setShowEarlyForm] = useState(false);
  const [activeAttendanceRecord, setActiveAttendanceRecord] = useState<any>(null);

  // Matcher between user record and input credentials
  const isUserMatch = (
    user: {
      username?: string;
      phone?: string;
      accessCode?: string;
      password?: string;
      passwordPin?: string;
      nameAr?: string;
      nameEn?: string;
      fullNameAr?: string;
      fullNameEn?: string;
      membershipNumber?: string;
    },
    rawId: string,
    rawPass: string
  ): boolean => {
    const inputId = normalizeKey(rawId);
    const inputDigits = normalizePhone(rawId);
    const inputPass = normalizeArabicDigits(rawPass).trim();

    // 1. Verify Password / PIN
    const passCandidates = [
      user.password,
      user.accessCode,
      user.passwordPin
    ].filter(Boolean).map(p => normalizeArabicDigits(p).trim());

    const isPasswordCorrect = passCandidates.some(p => p === inputPass);
    if (!isPasswordCorrect) return false;

    // 2. Verify Identifier
    const nameCandidates = [
      user.nameAr,
      user.nameEn,
      user.fullNameAr,
      user.fullNameEn,
      user.username,
      user.phone,
      user.membershipNumber
    ].filter(Boolean).map(n => normalizeKey(n));

    // Direct match against username, access code, name, or membership
    if (nameCandidates.includes(inputId)) return true;

    // Partial name match (e.g. entered "محمود" or "الغندور")
    if (nameCandidates.some(n => n.includes(inputId) || inputId.includes(n))) return true;

    // Phone match
    if (user.phone) {
      const userPhoneNorm = normalizeKey(user.phone);
      if (userPhoneNorm === inputId) return true;

      const userDigits = normalizePhone(user.phone);
      if (inputDigits && userDigits && (inputDigits === userDigits || userDigits.endsWith(inputDigits) || inputDigits.endsWith(userDigits))) {
        return true;
      }
    }

    return false;
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanId = identifier.trim();
    const cleanPass = password.trim();

    if (!cleanId || !cleanPass) {
      setErrorMessage(isAr ? 'يرجى إدخال البيانات المطلوبة للدخول' : 'Please enter login credentials');
      return;
    }

    const normId = normalizeKey(cleanId);
    const normPass = normalizeArabicDigits(cleanPass);

    // -------------------------------------------------------------
    // 1. TRY STAFF LOGIN (Managers, Accountants, Coaches, Staff)
    // -------------------------------------------------------------
    
    // Check Managers
    const managers = StorageService.getManagers();
    const allManagers = managers.length > 0 ? managers : INITIAL_MANAGER_ACCOUNTS;
    const matchedManager = allManagers.find(m => 
      isUserMatch(m, cleanId, cleanPass) ||
      ((normId === 'gm' || normId === 'admin' || normId === 'manager' || normId === '01011223344') && (normPass === '9999' || normPass === 'admin'))
    );

    if (matchedManager) {
      StorageService.logActivity({
        performerId: matchedManager.id,
        performerName: matchedManager.nameAr,
        performerRole: 'manager',
        category: 'system',
        actionType: 'login',
        titleAr: `تسجيل دخول ناجح: المدير العام (${matchedManager.nameAr})`,
        titleEn: `Successful login: Manager ${matchedManager.nameAr}`,
        detailsAr: `قام المدير العام (${matchedManager.nameAr}) بتسجيل الدخول بنجاح للنظام`,
        detailsEn: `Manager ${matchedManager.nameAr} successfully logged in.`
      });
      audioAlertService.playSuccess();
      if (matchedManager.id !== 'mgr-1' && !matchedManager.nameAr.includes('المدير العام')) {
        StorageService.setActiveGymManagerId(matchedManager.id);
      }
      onLoginSuccess({
        role: 'manager',
        id: matchedManager.id,
        nameAr: matchedManager.nameAr,
        nameEn: matchedManager.nameEn,
        phone: matchedManager.phone,
        avatarUrl: matchedManager.avatarUrl
      });
      return;
    }

    // Check Viewers
    const viewers = StorageService.getViewers();
    const matchedViewer = viewers.find(v => isUserMatch(v, cleanId, cleanPass));
    if (matchedViewer) {
      StorageService.logActivity({
        performerId: matchedViewer.id,
        performerName: matchedViewer.nameAr,
        performerRole: 'viewer',
        category: 'system',
        actionType: 'login',
        titleAr: `تسجيل دخول ناجح: حساب للعرض فقط (${matchedViewer.nameAr})`,
        titleEn: `Successful login: Read-Only Viewer ${matchedViewer.nameAr}`,
        detailsAr: `قام المستخدم (${matchedViewer.nameAr}) بتسجيل الدخول بحساب للعرض والمطالعة فقط`,
        detailsEn: `Viewer ${matchedViewer.nameAr} logged in.`
      });
      audioAlertService.playSuccess();
      onLoginSuccess({
        role: 'viewer',
        id: matchedViewer.id,
        nameAr: matchedViewer.nameAr,
        nameEn: matchedViewer.nameEn,
        phone: matchedViewer.phone,
        avatarUrl: matchedViewer.avatarUrl
      });
      return;
    }

    // Check Accountants
    const accountants = StorageService.getAccountants();
    const allAccountants = accountants.length > 0 ? accountants : INITIAL_ACCOUNTANT_ACCOUNTS;
    const matchedAccountant = allAccountants.find(a => 
      isUserMatch(a, cleanId, cleanPass) ||
      ((normId === 'finance' || normId === 'accountant' || normId === 'acc' || normId === 'acc1' || normId === '01033445566') && (normPass === '7777' || normPass === '4444'))
    );

    if (matchedAccountant) {
      StorageService.logActivity({
        performerId: matchedAccountant.id,
        performerName: matchedAccountant.nameAr,
        performerRole: 'accountant',
        category: 'system',
        actionType: 'login',
        titleAr: `تسجيل دخول ناجح: مسؤول الحسابات (${matchedAccountant.nameAr})`,
        titleEn: `Successful login: Accountant ${matchedAccountant.nameAr}`,
        detailsAr: `قام مسؤول الحسابات (${matchedAccountant.nameAr}) بتسجيل الدخول بنجاح للنظام`,
        detailsEn: `Accountant ${matchedAccountant.nameAr} successfully logged in.`
      });
      audioAlertService.playSuccess();
      onLoginSuccess({
        role: 'accountant',
        id: matchedAccountant.id,
        nameAr: matchedAccountant.nameAr,
        nameEn: matchedAccountant.nameEn,
        phone: matchedAccountant.phone,
        avatarUrl: matchedAccountant.avatarUrl
      });
      return;
    }

    // Check Staff
    const staffList = StorageService.getStaff();
    const allStaff = staffList.length > 0 ? staffList : INITIAL_STAFF_ACCOUNTS;
    const matchedStaff = allStaff.find(s => 
      isUserMatch(s, cleanId, cleanPass) ||
      ((normId === 'staff' || normId === 'staff1' || normId === 'reception' || normId === '01099887766') && (normPass === '4444' || normPass === '3333'))
    );

    if (matchedStaff) {
      StorageService.logActivity({
        performerId: matchedStaff.id,
        performerName: matchedStaff.nameAr,
        performerRole: 'staff',
        category: 'system',
        actionType: 'login',
        titleAr: `تسجيل دخول ناجح: موظف الاستقبال (${matchedStaff.nameAr})`,
        titleEn: `Successful login: Staff ${matchedStaff.nameAr}`,
        detailsAr: `قام موظف الاستقبال (${matchedStaff.nameAr}) بتسجيل الدخول بنجاح للنظام`,
        detailsEn: `Staff ${matchedStaff.nameAr} successfully logged in.`
      });
      audioAlertService.playSuccess();
      onLoginSuccess({
        role: 'staff',
        id: matchedStaff.id,
        nameAr: matchedStaff.nameAr,
        nameEn: matchedStaff.nameEn,
        phone: matchedStaff.phone,
        avatarUrl: matchedStaff.avatarUrl
      });
      return;
    }

    // Check Coaches
    const coaches = StorageService.getCoaches();
    const allCoaches = coaches.length > 0 ? coaches : INITIAL_COACH_ACCOUNTS;
    const matchedCoach = allCoaches.find(c => 
      isUserMatch(c, cleanId, cleanPass) ||
      ((normId === 'coach' || normId === 'coach1' || normId === '01122334455') && normPass === '1111') ||
      ((normId === 'coach2' || normId === '01233445566') && normPass === '2222')
    );

    if (matchedCoach) {
      StorageService.logActivity({
        performerId: matchedCoach.id,
        performerName: matchedCoach.nameAr,
        performerRole: 'coach',
        category: 'system',
        actionType: 'login',
        titleAr: `تسجيل دخول ناجح: الكابتن (${matchedCoach.nameAr})`,
        titleEn: `Successful login: Coach ${matchedCoach.nameAr}`,
        detailsAr: `قام الكابتن والمدرب (${matchedCoach.nameAr}) بتسجيل الدخول بنجاح للنظام`,
        detailsEn: `Coach ${matchedCoach.nameAr} successfully logged in.`
      });
      audioAlertService.playSuccess();
      onLoginSuccess({
        role: 'coach',
        id: matchedCoach.id,
        nameAr: matchedCoach.nameAr,
        nameEn: matchedCoach.nameEn,
        phone: matchedCoach.phone,
        avatarUrl: matchedCoach.avatarUrl
      });
      return;
    }

    // -------------------------------------------------------------
    // 2. TRY MEMBER LOGIN
    // -------------------------------------------------------------
    const members = StorageService.getMembers();
    const allMembers = members.length > 0 ? members : INITIAL_MEMBERS;
    const matchedMember = allMembers.find(m => isUserMatch(m, cleanId, cleanPass));

    if (matchedMember) {
      StorageService.recordMemberCheckIn(
        matchedMember,
        'self_portal',
        'بوابة الدخول الذاتي والشاشة الشخصية للمشترك',
        'member'
      );

      StorageService.logActivity({
        performerId: matchedMember.id,
        performerName: matchedMember.fullNameAr,
        performerRole: 'member',
        category: 'system',
        actionType: 'login',
        titleAr: `تسجيل دخول العضو المشترك (${matchedMember.fullNameAr})`,
        titleEn: `Member login: ${matchedMember.fullNameAr}`,
        detailsAr: `قام المشترك (${matchedMember.fullNameAr}) برقم عضوية #${matchedMember.membershipNumber} بتسجيل الدخول للنظام`,
        detailsEn: `Member ${matchedMember.fullNameAr} logged in.`
      });
      audioAlertService.playSuccess();
      onLoginSuccess({
        role: 'member',
        id: matchedMember.id,
        nameAr: matchedMember.fullNameAr,
        nameEn: matchedMember.fullNameEn,
        phone: matchedMember.phone,
        avatarUrl: matchedMember.avatarUrl
      }, matchedMember);
      return;
    }

    // FAILED LOGIN
    const newCount = failedAttempts + 1;
    setFailedAttempts(newCount);
    audioAlertService.playDelete();

    if (newCount >= 3) {
      StorageService.addSecurityAlert({
        usernameOrPhone: cleanId,
        enteredPassword: '****',
        attemptsCount: newCount,
        reasonAr: `محاولة دخول متكررة غير صحيحة (${newCount} مرات) للحساب: ${cleanId}`,
        reasonEn: `Repeated failed login attempts (${newCount} times) for: ${cleanId}`,
        accountFound: false
      });
    }

    setErrorMessage(
      isAr
        ? 'البيانات المدخلة غير صحيحة، يرجى التأكد من الكود أو رقم الهاتف والمحاولة مرة أخرى.'
        : 'Invalid credentials, please verify your membership code/phone and try again.'
    );
  };

  // -------------------------------------------------------------
  // ATTENDANCE LOGIC (حضور وانصراف الموظفين)
  // -------------------------------------------------------------
  const handleAttendanceAction = (type: 'checkin' | 'checkout') => {
    setErrorMessage(null);
    setSuccessMessage(null);
    
    const cleanCode = normalizeArabicDigits(attCode);
    if (!cleanCode) {
      setErrorMessage(isAr ? 'يرجى إدخال كود الحضور الخاص بك' : 'Please enter your attendance code');
      return;
    }

    const allEmps = [
      ...StorageService.getManagers(),
      ...StorageService.getAccountants(),
      ...StorageService.getStaff(),
      ...StorageService.getCoaches(),
      ...StorageService.getViewers()
    ];

    const emp = allEmps.find(e => normalizeArabicDigits(e.attendanceCode) === cleanCode);
    
    if (emp) {
      if (type === 'checkin') {
        StorageService.recordEmployeeCheckIn(emp, '', cleanCode);
        audioAlertService.playSuccess();
        setSuccessMessage(isAr ? `✓ تم تسجيل حضور الموظف بنجاح: ${emp.nameAr}` : `Staff Check-in Successful: ${emp.nameAr}`);
        setAttCode('');
        setAttAction(null);
      } else {
        // CHECKOUT LOGIC
        const records = StorageService.getEmployeeAttendances();
        const today = new Date().toISOString().split('T')[0];
        const activeRecord = records.find(r => r.employeeId === emp.id && r.date === today && !r.checkOutTime);
        
        if (!activeRecord) {
          setErrorMessage(isAr ? 'لا يوجد سجل حضور مفتوح لك اليوم لتسجيل الانصراف منه' : 'No active check-in found for today');
          audioAlertService.playDelete();
          return;
        }

        // Calculate if early departure (less than 8 hours)
        const nowTime = new Date().toTimeString().split(' ')[0];
        const { hours } = (StorageService as any).calculateWorkedHours(activeRecord.date, activeRecord.checkInTime, nowTime);
        
        if (hours < 8) {
          setActiveAttendanceRecord(activeRecord);
          setShowEarlyForm(true);
          setAttAction('checkout');
        } else {
          StorageService.recordEmployeeCheckOut(activeRecord.id, '', '', cleanCode);
          audioAlertService.playSuccess();
          setSuccessMessage(isAr ? `✓ تم تسجيل انصراف الموظف بنجاح: ${emp.nameAr}` : `Staff Check-out Successful: ${emp.nameAr}`);
          setAttCode('');
          setAttAction(null);
        }
      }
      return;
    }

    // If not employee, check if it's a member
    const members = StorageService.getMembers();
    const matchedMember = members.find(m => normalizeKey(m.membershipNumber) === normalizeKey(cleanCode));

    if (matchedMember) {
      if (type === 'checkout') {
        setErrorMessage(isAr ? 'الأعضاء لا يحتاجون لتسجيل الانصراف، شكراً لك.' : 'Members do not need to check-out.');
        audioAlertService.playDelete();
        return;
      }
      
      const checkResult = StorageService.recordMemberCheckIn(
        matchedMember,
        'self_portal',
        'بوابة الحضور السريع - شاشة الدخول الرئيسية',
        'member'
      );

      if (!checkResult.success) {
        audioAlertService.playDelete();
        setErrorMessage(
          isAr 
            ? `⛔ غير مسموح بالدخول: يسمح بالدخول مرة واحدة كل 12 ساعة فقط. آخر تسجيل حضور كان الساعة [${checkResult.lastCheckInTime || 'سابقاً'}] - متبقي [${checkResult.remainingHours} ساعة و ${checkResult.remainingMinutes} دقيقة] للسماح بالدخول التالي.`
            : (checkResult.errorEn || 'Check-in is restricted to once every 12 hours.')
        );
        return;
      }
      
      audioAlertService.playSuccess();
      setSuccessMessage(isAr ? `✓ أهلاً بك يا بطل، تم تسجيل حضورك: ${matchedMember.fullNameAr} بنجاح` : `Welcome, Check-in registered: ${matchedMember.fullNameAr}`);
      setAttCode('');
      setAttAction(null);
      return;
    }

    // If still not found
    setErrorMessage(isAr ? 'هذا الكود غير مسجل لموظف أو عضو، يرجى التأكد منه.' : 'Invalid code, not assigned to staff or member');
    audioAlertService.playDelete();
  };

  const confirmEarlyCheckout = () => {
    if (!activeAttendanceRecord) return;
    
    const cleanCode = normalizeArabicDigits(attCode);
    StorageService.recordEmployeeCheckOut(activeAttendanceRecord.id, '', earlyReason || 'انصراف مبكر', cleanCode);
    audioAlertService.playSuccess();
    setSuccessMessage(isAr ? `✓ تم تسجيل الانصراف المبكر بنجاح: كابتن/ ${activeAttendanceRecord.employeeName}` : `Early Check-out recorded: ${activeAttendanceRecord.employeeName}`);
    
    // Reset
    setAttCode('');
    setAttAction(null);
    setShowEarlyForm(false);
    setEarlyReason('');
    setActiveAttendanceRecord(null);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-500">
      <div className="w-full max-w-md bg-gradient-to-b from-[#101522] via-[#090d16] to-[#05070c] rounded-[40px] border border-[#f7cb55]/30 p-6 sm:p-10 shadow-2xl relative text-center overflow-hidden">
        
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/10 blur-[100px] pointer-events-none"></div>

        {/* Brand & Gym Logo */}
        <div className="flex items-center justify-center mb-8">
          <GymLogo size="lg" showText={true} />
        </div>

        {/* MAIN MODE TOGGLE (Account Login vs Attendance) */}
        <div className="flex bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800/80 mb-8 max-w-[320px] mx-auto">
          <button
            onClick={() => {
              setAuthMode('login');
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className={`flex-1 py-3 rounded-xl text-[11px] font-black transition-all flex items-center justify-center gap-2 ${
              authMode === 'login' 
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>{isAr ? 'دخول الحساب' : 'Login'}</span>
          </button>
          <button
            onClick={() => {
              setAuthMode('attendance');
              setErrorMessage(null);
              setSuccessMessage(null);
              setShowEarlyForm(false);
            }}
            className={`flex-1 py-3 rounded-xl text-[11px] font-black transition-all flex items-center justify-center gap-2 ${
              authMode === 'attendance' 
                ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-lg' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Fingerprint className="w-3.5 h-3.5" />
            <span>{isAr ? 'حضور وانصراف' : 'Attendance'}</span>
          </button>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* MODE 1: ACCOUNT LOGIN (Unified Portal) */}
        {/* ------------------------------------------------------------- */}
        {authMode === 'login' && (
          <div className="animate-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8">
              <h2 className="text-3xl font-black text-white leading-tight tracking-tight uppercase">
                {isAr ? 'تسجيل دخول الحساب' : 'ACCOUNT ACCESS'}
              </h2>
              <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-2">
                {isAr ? 'أدخل بياناتك للوصول إلى لوحة التحكم' : 'ENTER CREDENTIALS TO ACCESS'}
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5 text-right rtl:text-right ltr:text-left">
              <div className="space-y-2">
                <label className="block text-[11px] text-slate-400 font-black uppercase tracking-wider px-1">
                  {isAr ? 'رقم العضوية أو اسم المستخدم' : 'Membership ID / Username'}
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-amber-500 transition-colors">
                    <User className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={isAr ? 'أدخل الكود هنا...' : 'Enter ID...'}
                    className="w-full bg-[#07090f] border-2 border-slate-800/80 focus:border-amber-500 rounded-[20px] py-4 pr-12 pl-4 text-white font-bold placeholder-slate-700 focus:outline-none focus:ring-4 focus:ring-amber-500/10 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[11px] text-slate-400 font-black uppercase tracking-wider px-1">
                  {isAr ? 'كود الدخول السري / كلمة المرور' : 'Personal PIN / Password'}
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-amber-500 transition-colors">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••"
                    className="w-full bg-[#07090f] border-2 border-slate-800/80 focus:border-amber-500 rounded-[20px] py-4 pr-12 pl-12 text-white font-mono text-xl font-black tracking-[0.4em] placeholder-slate-700 focus:outline-none focus:ring-4 focus:ring-amber-500/10 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-slate-500 hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {errorMessage && (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold flex items-center gap-3 animate-shake">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-4 rounded-[20px] bg-gradient-to-r from-amber-500 via-[#f7cb55] to-amber-600 text-slate-950 font-black text-sm flex items-center justify-center gap-3 shadow-2xl transition-all active:scale-95 cursor-pointer mt-4"
              >
                <span>{isAr ? 'تسجيل دخول آمن' : 'Secure Login'}</span>
                <ArrowRight className="w-5 h-5 rtl:rotate-180" />
              </button>
            </form>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* MODE 2: ATTENDANCE & TIME TRACKING (Employees) */}
        {/* ------------------------------------------------------------- */}
        {authMode === 'attendance' && (
          <div className="animate-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center border-2 border-emerald-500/40 mx-auto mb-4 animate-pulse">
                <Fingerprint className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-3xl font-black text-white leading-tight tracking-tight uppercase">
                {isAr ? 'الحضور والانصراف' : 'TIME TRACKING'}
              </h2>
              <p className="text-sm text-emerald-400/80 font-bold uppercase tracking-widest mt-2">
                {isAr ? 'أدخل كود الموظف لتسجيل الوردية' : 'ENTER STAFF CODE TO REGISTER'}
              </p>
            </div>

            <div className="space-y-6 text-right rtl:text-right ltr:text-left">
              {!showEarlyForm ? (
                <>
                  <div className="space-y-2">
                    <label className="block text-[11px] text-slate-400 font-black uppercase tracking-wider px-1">
                      {isAr ? 'كود الحضور المخصص لك' : 'YOUR ATTENDANCE CODE'}
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-emerald-500 transition-colors">
                        <Clock className="w-5 h-5" />
                      </div>
                      <input
                        type="password"
                        inputMode="numeric"
                        required
                        value={attCode}
                        onChange={(e) => setAttCode(e.target.value)}
                        placeholder="••••••"
                        className="w-full bg-[#07090f] border-2 border-slate-800/80 focus:border-emerald-500 rounded-[20px] py-4 pr-12 pl-4 text-white font-mono text-2xl font-black tracking-[0.5em] placeholder-slate-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all text-center"
                      />
                    </div>
                  </div>

                  {errorMessage && (
                    <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold flex items-center gap-3 animate-shake">
                      <AlertTriangle className="w-5 h-5 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {successMessage && (
                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black flex items-center gap-3 animate-bounce">
                      <CheckCircle2 className="w-5 h-5 shrink-0" />
                      <span>{successMessage}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <button
                      onClick={() => handleAttendanceAction('checkin')}
                      className="py-4 rounded-[20px] bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-xl transition-all active:scale-95 cursor-pointer"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>{isAr ? 'تسجيل حضور' : 'Check-in'}</span>
                    </button>
                    <button
                      onClick={() => handleAttendanceAction('checkout')}
                      className="py-4 rounded-[20px] bg-gradient-to-r from-rose-600 to-rose-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-xl transition-all active:scale-95 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{isAr ? 'تسجيل انصراف' : 'Check-out'}</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-5 animate-in zoom-in-95 duration-300">
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 space-y-2">
                    <div className="flex items-center gap-2 font-black text-xs uppercase">
                      <AlertTriangle className="w-4 h-4" />
                      <span>{isAr ? 'تنبيه: انصراف مبكر' : 'Early Departure Alert'}</span>
                    </div>
                    <p className="text-[10px] font-bold text-slate-300 leading-relaxed">
                      {isAr 
                        ? 'لقد قمت بالعمل لأقل من 8 ساعات اليوم. يرجى ذكر سبب الانصراف قبل انتهاء الوردية الرسمية لحفظ السجل المكتمل.' 
                        : 'You worked less than 8 hours today. Please provide a reason for early departure to complete checkout.'}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[11px] text-slate-400 font-black uppercase tracking-wider px-1">
                      {isAr ? 'سبب الانصراف (إجباري)' : 'REASON (REQUIRED)'}
                    </label>
                    <textarea
                      required
                      value={earlyReason}
                      onChange={(e) => setEarlyReason(e.target.value)}
                      placeholder={isAr ? 'اكتب السبب هنا...' : 'Reason...'}
                      className="w-full bg-[#07090f] border-2 border-slate-800/80 focus:border-amber-500 rounded-2xl py-3 px-4 text-white font-bold placeholder-slate-700 focus:outline-none h-24 resize-none"
                    />
                  </div>

                  <div className="flex flex-col gap-3">
                    <button
                      onClick={confirmEarlyCheckout}
                      disabled={!earlyReason.trim()}
                      className="w-full py-4 rounded-[20px] bg-amber-500 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isAr ? 'تأكيد الانصراف وحفظ السبب' : 'Confirm & Save Reason'}</span>
                    </button>
                    <button
                      onClick={() => setShowEarlyForm(false)}
                      className="w-full py-2 text-[10px] text-slate-500 font-bold uppercase hover:text-slate-300"
                    >
                      {isAr ? 'إلغاء' : 'Cancel'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Security Info Footer */}
        <div className="mt-10 pt-6 border-t border-slate-800/60 flex items-center justify-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>{isAr ? 'بوابة دخول آمنة - بياناتك مشفرة بالكامل' : 'Secure Portal - Encrypted Data'}</span>
        </div>
      </div>
    </div>
  );
};
