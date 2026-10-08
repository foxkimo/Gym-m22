import React from 'react';
import { CurrentUser } from '../types/gym';
import { Menu, Globe, Sun, Moon } from 'lucide-react';
import { GymLogo } from './GymLogo';

interface HeaderProps {
  currentUser: CurrentUser;
  currentView: string;
  onNavigate: (view: any) => void;
  onOpenMasterMenu: () => void;
  onToggleLang: () => void;
  lang: 'ar' | 'en';
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  currentView,
  onNavigate,
  onOpenMasterMenu,
  onToggleLang,
  lang,
  theme = 'dark',
  onToggleTheme
}) => {
  const isAr = lang === 'ar';
  const role = currentUser.role;

  const handleLogoClick = () => {
    if (currentUser.id === 'guest') {
      onNavigate('login');
      return;
    }
    if (role === 'member') onNavigate('member');
    else if (role === 'staff') onNavigate('lookup');
    else if (role === 'accountant') onNavigate('accountant');
    else if (role === 'coach') onNavigate('coach');
    else onNavigate('manager');
  };

  return (
    <header className="sticky top-0 z-40 bg-[#07090e]/95 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-8 py-3 shadow-xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left Side: Drawer Menu Button & Brand Gym Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenMasterMenu}
            className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-[#e5a91b]/40 text-[#f7cb55] hover:bg-amber-500/30 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-amber-500/10 group cursor-pointer"
            aria-label="Open Navigation Menu"
            title={isAr ? 'القائمة الجانبية الشاملة ☰' : 'Master Menu'}
          >
            <Menu className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300" />
          </button>

          <div 
            onClick={handleLogoClick}
            className="cursor-pointer inline-flex items-center justify-center whitespace-nowrap transform hover:scale-105 transition-transform"
          >
            <GymLogo size="md" showText={true} />
          </div>
        </div>

        {/* Right Side: Desktop Navigation & Language / Theme Switches */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Desktop Role-Based Nav Links (Hidden on Login screen) */}
          {currentView !== 'login' && currentUser.id !== 'guest' && (
            <nav className="hidden lg:flex items-center gap-1 bg-[#0c101a] p-1 rounded-2xl border border-slate-800">
              {/* 1. MEMBER ROLE: Only sees their own subscription & personal accounts & workouts */}
              {role === 'member' && (
              <>
                <button
                  onClick={() => onNavigate('member')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    currentView === 'member' ? 'bg-[#f7cb55] text-slate-950 shadow' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {isAr ? 'اشتراكي وحساباتي' : 'My Accounts & Subscription'}
                </button>

                <button
                  onClick={() => onNavigate('workout')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    currentView === 'workout' ? 'bg-[#f7cb55] text-slate-950 shadow' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {isAr ? 'جدول التمارين' : 'Workout Routine'}
                </button>

                <button
                  onClick={() => onNavigate('history')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    currentView === 'history' ? 'bg-[#f7cb55] text-slate-950 shadow' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {isAr ? 'سجل تماريني' : 'Workout Log'}
                </button>
              </>
            )}

            {/* 2. RECEPTION STAFF ROLE: Only sees member lookup/accounts & shifts/registers */}
            {role === 'staff' && (
              <>
                <button
                  onClick={() => onNavigate('lookup')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    currentView === 'lookup' ? 'bg-[#f7cb55] text-slate-950 shadow' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {isAr ? 'استعلام وحسابات العملاء' : 'Customer Accounts & Lookup'}
                </button>

                <button
                  onClick={() => onNavigate('admin')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    currentView === 'admin' ? 'bg-[#f7cb55] text-slate-950 shadow' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {isAr ? 'المناوبات والورديات' : 'Shifts & Registers'}
                </button>
              </>
            )}

            {/* 3. ACCOUNTANT ROLE: Staff payroll, coach commissions, financial vouchers only */}
            {role === 'accountant' && (
              <>
                <button
                  onClick={() => onNavigate('accountant')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    currentView === 'accountant' ? 'bg-emerald-500 text-slate-950 font-black shadow' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {isAr ? 'الإدارة المالية والحسابات' : 'Finance & Accounting'}
                </button>
              </>
            )}

            {/* 4. COACH ROLE: Trainees, workout programs & member profiles */}
            {role === 'coach' && (
              <>
                <button
                  onClick={() => onNavigate('coach')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    currentView === 'coach' ? 'bg-[#f7cb55] text-slate-950 font-black shadow' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {isAr ? 'بوابة الكابتن والمتدربين' : 'Coach Portal'}
                </button>

                <button
                  onClick={() => onNavigate('workout')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    currentView === 'workout' ? 'bg-[#f7cb55] text-slate-950 font-black shadow' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {isAr ? 'جداول التمارين' : 'Workout Routines'}
                </button>

                <button
                  onClick={() => onNavigate('lookup')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    currentView === 'lookup' ? 'bg-[#f7cb55] text-slate-950 font-black shadow' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {isAr ? 'سجلات وبيانات اللاعبين' : 'Trainee Records'}
                </button>
              </>
            )}

            {/* 5. GENERAL MANAGER ROLE: Full Access to everything */}
            {role === 'manager' && (
              <>
                <button
                  onClick={() => onNavigate('manager')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    currentView === 'manager' ? 'bg-[#f7cb55] text-slate-950 shadow font-black' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {isAr ? 'الإدارة والحسابات والصلاحيات' : 'Management & Accounts'}
                </button>

                <button
                  onClick={() => onNavigate('accountant')}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    currentView === 'accountant' ? 'bg-emerald-500 text-slate-950 font-black shadow' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {isAr ? 'المالية والأجور' : 'Finance'}
                </button>

                <button
                  onClick={() => onNavigate('admin')}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    currentView === 'admin' ? 'bg-[#f7cb55] text-slate-950 shadow' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {isAr ? 'الاستقبال' : 'Desk'}
                </button>

                <button
                  onClick={() => onNavigate('coach')}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    currentView === 'coach' ? 'bg-[#f7cb55] text-slate-950 shadow' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {isAr ? 'الكباتن' : 'Coaches'}
                </button>

                <button
                  onClick={() => onNavigate('lookup')}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    currentView === 'lookup' ? 'bg-[#f7cb55] text-slate-950 shadow' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {isAr ? 'الأعضاء' : 'Members'}
                </button>
              </>
            )}
          </nav>
          )}

          {/* Theme Switcher (داكن / فاتح) */}
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0e121a] hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-200 transition-colors shadow-sm cursor-pointer whitespace-nowrap"
              title={theme === 'dark' ? (isAr ? 'التبديل إلى النمط الفاتح ☀️' : 'Switch to Light Mode') : (isAr ? 'التبديل إلى النمط الداكن 🌙' : 'Switch to Dark Mode')}
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">{isAr ? 'فاتح' : 'Light'}</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="hidden sm:inline">{isAr ? 'داكن' : 'Dark'}</span>
                </>
              )}
            </button>
          )}

          {/* Language Switch */}
          <button
            onClick={onToggleLang}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0e121a] hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-200 transition-colors shadow-sm cursor-pointer whitespace-nowrap"
          >
            <Globe className="w-3.5 h-3.5 text-[#f7cb55]" />
            <span>{isAr ? 'EN' : 'عربي'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
