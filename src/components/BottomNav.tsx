import React from 'react';
import { CurrentUser } from '../types/gym';
import { 
  Search, 
  Dumbbell, 
  History, 
  Users, 
  DollarSign, 
  Crown,
  QrCode,
  CreditCard,
  Wallet,
  LogIn
} from 'lucide-react';

interface BottomNavProps {
  currentView: string;
  onNavigate: (view: any) => void;
  currentUser: CurrentUser;
  onOpenCardModal: () => void;
  lang: 'ar' | 'en';
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentView,
  onNavigate,
  currentUser,
  onOpenCardModal,
  lang
}) => {
  const isAr = lang === 'ar';
  const role = currentUser.role;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-[#07090e]/95 backdrop-blur-xl border-t border-slate-800/80 px-2 py-1.5">
      <div className="max-w-md mx-auto flex items-center justify-around text-center">
        {/* ================= 1. MEMBER BOTTOM NAV ================= */}
        {role === 'member' && (
          <>
            <button
              onClick={() => onNavigate('member')}
              className={`flex flex-col items-center py-1.5 px-2 rounded-xl transition-all ${
                currentView === 'member' ? 'text-[#f7cb55] bg-amber-500/10 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span className="text-[10px] mt-1">{isAr ? 'اشتراكي' : 'My Subscription'}</span>
            </button>

            <button
              onClick={() => onNavigate('workout')}
              className={`flex flex-col items-center py-1.5 px-2 rounded-xl transition-all ${
                currentView === 'workout' ? 'text-[#f7cb55] bg-amber-500/10 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Dumbbell className="w-4 h-4" />
              <span className="text-[10px] mt-1">{isAr ? 'التمارين' : 'Workout'}</span>
            </button>

            <button
              onClick={onOpenCardModal}
              className="flex flex-col items-center py-1.5 px-2 rounded-xl text-sky-400 hover:text-white transition-all group"
            >
              <div className="w-7 h-7 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                <QrCode className="w-4 h-4" />
              </div>
              <span className="text-[10px] mt-0.5">{isAr ? 'بطاقتي QR' : 'Smart Pass'}</span>
            </button>

            <button
              onClick={() => onNavigate('history')}
              className={`flex flex-col items-center py-1.5 px-2 rounded-xl transition-all ${
                currentView === 'history' ? 'text-[#f7cb55] bg-amber-500/10 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <History className="w-4 h-4" />
              <span className="text-[10px] mt-1">{isAr ? 'سجل تماريني' : 'Log'}</span>
            </button>

            <button
              onClick={() => onNavigate('login')}
              className="flex flex-col items-center py-1.5 px-2 rounded-xl text-slate-400 hover:text-white transition-all"
            >
              <LogIn className="w-4 h-4 text-amber-400" />
              <span className="text-[10px] mt-1">{isAr ? 'تسجيل الدخول' : 'Sign In'}</span>
            </button>
          </>
        )}

        {/* ================= 2. RECEPTION STAFF BOTTOM NAV ================= */}
        {role === 'staff' && (
          <>
            <button
              onClick={() => onNavigate('lookup')}
              className={`flex flex-col items-center py-1.5 px-2 rounded-xl transition-all ${
                currentView === 'lookup' ? 'text-[#f7cb55] bg-amber-500/10 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Search className="w-4 h-4" />
              <span className="text-[10px] mt-1">{isAr ? 'حسابات العملاء' : 'Customer Accounts'}</span>
            </button>

            <button
              onClick={() => onNavigate('admin')}
              className={`flex flex-col items-center py-1.5 px-2 rounded-xl transition-all ${
                currentView === 'admin' ? 'text-[#f7cb55] bg-amber-500/10 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span className="text-[10px] mt-1">{isAr ? 'الورديات والمناوبات' : 'Shifts'}</span>
            </button>

            <button
              onClick={onOpenCardModal}
              className="flex flex-col items-center py-1.5 px-2 rounded-xl text-sky-400 hover:text-white transition-all"
            >
              <QrCode className="w-4 h-4" />
              <span className="text-[10px] mt-1">{isAr ? 'بطاقة عضو' : 'Pass'}</span>
            </button>

            <button
              onClick={() => onNavigate('login')}
              className="flex flex-col items-center py-1.5 px-2 rounded-xl text-slate-400 hover:text-white transition-all"
            >
              <LogIn className="w-4 h-4 text-amber-400" />
              <span className="text-[10px] mt-1">{isAr ? 'تبديل الحساب' : 'Switch'}</span>
            </button>
          </>
        )}

        {/* ================= 3. ACCOUNTANT BOTTOM NAV ================= */}
        {role === 'accountant' && (
          <>
            <button
              onClick={() => onNavigate('accountant')}
              className={`flex flex-col items-center py-1.5 px-2 rounded-xl transition-all ${
                currentView === 'accountant' ? 'text-emerald-400 bg-emerald-500/10 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Wallet className="w-4 h-4" />
              <span className="text-[10px] mt-1">{isAr ? 'الرواتب والأجور' : 'Payroll'}</span>
            </button>

            <button
              onClick={() => onNavigate('accountant')}
              className="flex flex-col items-center py-1.5 px-2 rounded-xl text-slate-400 hover:text-white transition-all"
            >
              <DollarSign className="w-4 h-4 text-[#f7cb55]" />
              <span className="text-[10px] mt-1">{isAr ? 'نسب الكباتن' : 'Commissions'}</span>
            </button>

            <button
              onClick={() => onNavigate('accountant')}
              className="flex flex-col items-center py-1.5 px-2 rounded-xl text-slate-400 hover:text-white transition-all"
            >
              <CreditCard className="w-4 h-4 text-emerald-400" />
              <span className="text-[10px] mt-1">{isAr ? 'القيود والسندات' : 'Vouchers'}</span>
            </button>

            <button
              onClick={() => onNavigate('login')}
              className="flex flex-col items-center py-1.5 px-2 rounded-xl text-slate-400 hover:text-white transition-all"
            >
              <LogIn className="w-4 h-4 text-amber-400" />
              <span className="text-[10px] mt-1">{isAr ? 'تسجيل الدخول' : 'Sign In'}</span>
            </button>
          </>
        )}

        {/* ================= 4. COACH BOTTOM NAV ================= */}
        {role === 'coach' && (
          <>
            <button
              onClick={() => onNavigate('coach')}
              className={`flex flex-col items-center py-1.5 px-2 rounded-xl transition-all ${
                currentView === 'coach' ? 'text-[#f7cb55] bg-amber-500/10 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-4 h-4" />
              <span className="text-[10px] mt-1">{isAr ? 'المتدربين' : 'Trainees'}</span>
            </button>

            <button
              onClick={() => onNavigate('workout')}
              className={`flex flex-col items-center py-1.5 px-2 rounded-xl transition-all ${
                currentView === 'workout' ? 'text-[#f7cb55] bg-amber-500/10 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Dumbbell className="w-4 h-4" />
              <span className="text-[10px] mt-1">{isAr ? 'التمارين' : 'Workouts'}</span>
            </button>

            <button
              onClick={() => onNavigate('login')}
              className="flex flex-col items-center py-1.5 px-2 rounded-xl text-slate-400 hover:text-white transition-all"
            >
              <LogIn className="w-4 h-4 text-amber-400" />
              <span className="text-[10px] mt-1">{isAr ? 'تسجيل الدخول' : 'Sign In'}</span>
            </button>
          </>
        )}

        {/* ================= 5. GENERAL MANAGER BOTTOM NAV ================= */}
        {role === 'manager' && (
          <>
            <button
              onClick={() => onNavigate('manager')}
              className={`flex flex-col items-center py-1.5 px-2 rounded-xl transition-all ${
                currentView === 'manager' ? 'text-[#f7cb55] bg-amber-500/10 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Crown className="w-4 h-4 text-[#f7cb55]" />
              <span className="text-[10px] mt-1">{isAr ? 'الحسابات والصلاحيات' : 'Accounts'}</span>
            </button>

            <button
              onClick={() => onNavigate('accountant')}
              className={`flex flex-col items-center py-1.5 px-2 rounded-xl transition-all ${
                currentView === 'accountant' ? 'text-emerald-400 bg-emerald-500/10 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Wallet className="w-4 h-4" />
              <span className="text-[10px] mt-1">{isAr ? 'الحسابات' : 'Finance'}</span>
            </button>

            <button
              onClick={() => onNavigate('admin')}
              className={`flex flex-col items-center py-1.5 px-2 rounded-xl transition-all ${
                currentView === 'admin' ? 'text-sky-400 bg-sky-500/10 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span className="text-[10px] mt-1">{isAr ? 'الاستقبال' : 'Desk'}</span>
            </button>

            <button
              onClick={() => onNavigate('coach')}
              className={`flex flex-col items-center py-1.5 px-2 rounded-xl transition-all ${
                currentView === 'coach' ? 'text-amber-400 bg-amber-500/10 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-4 h-4" />
              <span className="text-[10px] mt-1">{isAr ? 'الكباتن' : 'Coaches'}</span>
            </button>

            <button
              onClick={() => onNavigate('lookup')}
              className={`flex flex-col items-center py-1.5 px-2 rounded-xl transition-all ${
                currentView === 'lookup' ? 'text-amber-400 bg-amber-500/10 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Search className="w-4 h-4" />
              <span className="text-[10px] mt-1">{isAr ? 'الأعضاء' : 'Members'}</span>
            </button>
          </>
        )}
      </div>
    </nav>
  );
};
