/**
 * gym-m22 - Complete Sports Gym & Member Workout System
 * Multi-Role Portals (Member, Coach, Reception Staff, Accountant, General Manager)
 * Luxury Black & Gold Athletic Design + Real-time RBAC Governance System
 */

import React, { useState, useEffect } from 'react';
import { GymMember, CurrentUser, AppRole, EmployeeAccount } from './types/gym';
import { StorageService } from './services/storageService';
import { 
  INITIAL_MANAGER_ACCOUNTS, 
  INITIAL_COACH_ACCOUNTS, 
  INITIAL_STAFF_ACCOUNTS, 
  INITIAL_ACCOUNTANT_ACCOUNTS 
} from './data/initialData';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { MultiRoleAuthScreen } from './components/MultiRoleAuthScreen';
import { MemberPortalView } from './components/MemberPortalView';
import { QuickMemberSelector } from './components/QuickMemberSelector';
import { WorkoutTracker } from './components/WorkoutTracker';
import { WorkoutHistoryView } from './components/WorkoutHistoryView';
import { CoachTraineesPortal } from './components/CoachTraineesPortal';
import { AdminGymDashboard } from './components/AdminGymDashboard';
import { AccountantDashboard } from './components/AccountantDashboard';
import { GeneralManagerDashboard, MainDashboardView } from './components/GeneralManagerDashboard';
import { DigitalCardModal } from './components/DigitalCardModal';
import { RestTimerModal } from './components/RestTimerModal';
import { InstallAppModal } from './components/InstallAppModal';
import { MasterDropdownMenu } from './components/MasterDropdownMenu';
import { MemberCheckInLogView } from './components/MemberCheckInLogView';
import { audioAlertService } from './services/audioService';
import { cloudSyncService } from './services/cloudSyncService';
import { EmployeeContractModal } from './components/EmployeeContractModal';
import { Signature, Eye } from 'lucide-react';

export default function App() {
  const [lang, setLang] = useState<'ar' | 'en'>('ar');

  // Current logged in user - only restore if gym_m22_logged_in flag is true, otherwise guest
  const [currentUser, setCurrentUser] = useState<CurrentUser>(() => {
    try {
      const isLoggedIn = sessionStorage.getItem('gym_m22_logged_in') === 'true';
      const saved = sessionStorage.getItem('gym_m22_current_user');
      if (isLoggedIn && saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      // ignore
    }
    return {
      role: 'member',
      id: 'guest',
      nameAr: 'زائر',
      nameEn: 'Guest',
      phone: '',
      avatarUrl: ''
    };
  });

  // Current active view - only restore if gym_m22_logged_in flag is true, otherwise 'login'
  const [currentView, setCurrentView] = useState<'login' | 'member' | 'lookup' | 'workout' | 'history' | 'admin' | 'coach' | 'accountant' | 'manager' | 'checkins'>(() => {
    try {
      const isLoggedIn = sessionStorage.getItem('gym_m22_logged_in') === 'true';
      const savedView = sessionStorage.getItem('gym_m22_current_view');
      const savedUser = sessionStorage.getItem('gym_m22_current_user');
      if (isLoggedIn) {
        if (savedView) return savedView as any;
        if (savedUser) {
          const u = JSON.parse(savedUser) as CurrentUser;
          if (u.role === 'manager' || u.role === 'viewer') return 'manager';
          if (u.role === 'accountant') return 'accountant';
          if (u.role === 'coach') return 'coach';
          if (u.role === 'staff') return 'lookup';
          if (u.role === 'member') return 'member';
        }
      }
    } catch (e) {
      // ignore
    }
    return 'login';
  });

  // Sync state changes to sessionStorage when logged in
  useEffect(() => {
    if (currentUser.id !== 'guest' && currentView !== 'login') {
      sessionStorage.setItem('gym_m22_logged_in', 'true');
      sessionStorage.setItem('gym_m22_current_user', JSON.stringify(currentUser));
      sessionStorage.setItem('gym_m22_current_view', currentView);
    }
  }, [currentUser, currentView]);

  // Record user ping periodically for active users panel
  useEffect(() => {
    if (currentUser.id !== 'guest') {
      StorageService.recordUserPing(currentUser.id, currentUser.nameAr, currentUser.role, currentUser.avatarUrl);
      const interval = setInterval(() => {
        StorageService.recordUserPing(currentUser.id, currentUser.nameAr, currentUser.role, currentUser.avatarUrl);
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [currentUser.id, currentUser.nameAr, currentUser.role, currentUser.avatarUrl]);

  const [gmSubView, setGmSubView] = useState<MainDashboardView>('accounts');

  // Currently selected gym member for workouts and profiles
  const [activeMember, setActiveMember] = useState<GymMember | null>(() => {
    const members = StorageService.getMembers();
    return members[0] || null;
  });

  // Modal controls
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isMasterMenuOpen, setIsMasterMenuOpen] = useState(false);
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);

  // Forced Contract Onboarding States for new employees
  const isEmployee = currentUser && ['coach', 'accountant', 'staff'].includes(currentUser.role) && currentUser.id !== 'guest';
  const [isContractSigned, setIsContractSigned] = useState(true);

  useEffect(() => {
    if (isEmployee) {
      const contracts = StorageService.getEmploymentContracts();
      const myContract = contracts.find(c => c.employeeId === currentUser.id && c.status === 'active');
      setIsContractSigned(myContract ? !!myContract.isEmployeeAgreed : false);
    } else {
      setIsContractSigned(true);
    }
  }, [currentUser, isEmployee]);

  // Theme mode
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('gym_m22_theme') as 'dark' | 'light') || 'dark';
  });

  // Sync document theme classes and storage
  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    }
    localStorage.setItem('gym_m22_theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    audioAlertService.playBeep(theme === 'dark' ? 880 : 440, 0.08);
    setTheme(t => (t === 'dark' ? 'light' : 'dark'));
  };

  // Sync document direction and title
  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  // Global Cloud Sync listener & Realtime Multi-Device Engine
  const [, setSyncTick] = useState(0);

  useEffect(() => {
    cloudSyncService.init();
    const unsub = cloudSyncService.subscribe(() => {
      setSyncTick(t => t + 1);
      const mems = StorageService.getMembers();
      setActiveMember(prev => {
        if (!prev) return mems[0] || null;
        return mems.find(m => m.id === prev.id) || mems[0] || null;
      });
    });
    return () => unsub();
  }, []);

  // Real-time permission & account sync listener across the whole app
  useEffect(() => {
    const handlePermissionsSync = () => {
      const mgrs = StorageService.getManagers();
      const accs = StorageService.getAccountants();
      const stff = StorageService.getStaff();
      const chs = StorageService.getCoaches();
      const mems = StorageService.getMembers();

      const updatedUser = mgrs.find(m => m.id === currentUser.id) ||
                          accs.find(a => a.id === currentUser.id) ||
                          stff.find(s => s.id === currentUser.id) ||
                          chs.find(c => c.id === currentUser.id) ||
                          mems.find(m => m.id === currentUser.id);

      if (updatedUser) {
        const newRole = (updatedUser as any).role || currentUser.role;
        const newNameAr = (updatedUser as GymMember).fullNameAr || (updatedUser as EmployeeAccount).nameAr || currentUser.nameAr;
        const newPerms = updatedUser.customPermissions;

        const hasRoleChanged = newRole !== currentUser.role;
        const hasNameChanged = newNameAr !== currentUser.nameAr;
        const hasPermsChanged = JSON.stringify(newPerms) !== JSON.stringify(currentUser.customPermissions);

        if (hasRoleChanged || hasNameChanged || hasPermsChanged) {
          if (hasRoleChanged) {
            const targetView = 
              newRole === 'manager' ? 'manager' :
              newRole === 'accountant' ? 'accountant' :
              newRole === 'coach' ? 'coach' :
              newRole === 'staff' ? 'admin' : 'member';
            setCurrentView(targetView as any);
          }
          setCurrentUser(prev => ({
            ...prev,
            role: newRole,
            nameAr: newNameAr,
            customPermissions: newPerms
          }));
        }
      }
    };

    window.addEventListener('gym_permissions_updated', handlePermissionsSync);
    window.addEventListener('storage', handlePermissionsSync);
    window.addEventListener('gym_storage_updated', handlePermissionsSync);

    return () => {
      window.removeEventListener('gym_permissions_updated', handlePermissionsSync);
      window.removeEventListener('storage', handlePermissionsSync);
      window.removeEventListener('gym_storage_updated', handlePermissionsSync);
    };
  }, [currentUser]);

  const handleSwitchRole = (role: AppRole) => {
    audioAlertService.playBeep(659.25, 0.1);
    if (role === 'manager') {
      const mgr = StorageService.getManagers()[0] || INITIAL_MANAGER_ACCOUNTS[0];
      const userObj: CurrentUser = {
        role: 'manager',
        id: mgr.id,
        nameAr: mgr.nameAr,
        nameEn: mgr.nameEn,
        phone: mgr.phone,
        avatarUrl: mgr.avatarUrl,
      };
      sessionStorage.setItem('gym_m22_current_user', JSON.stringify(userObj));
      setCurrentUser(userObj);
      setCurrentView('manager');
    } else if (role === 'accountant') {
      const acc = StorageService.getAccountants()[0] || INITIAL_ACCOUNTANT_ACCOUNTS[0];
      const userObj: CurrentUser = {
        role: 'accountant',
        id: acc.id,
        nameAr: acc.nameAr,
        nameEn: acc.nameEn,
        phone: acc.phone,
        avatarUrl: acc.avatarUrl,
      };
      sessionStorage.setItem('gym_m22_current_user', JSON.stringify(userObj));
      setCurrentUser(userObj);
      setCurrentView('accountant');
    } else if (role === 'coach') {
      const coach = StorageService.getCoaches()[0] || INITIAL_COACH_ACCOUNTS[0];
      const userObj: CurrentUser = {
        role: 'coach',
        id: coach.id,
        nameAr: coach.nameAr,
        nameEn: coach.nameEn,
        phone: coach.phone,
        avatarUrl: coach.avatarUrl,
      };
      sessionStorage.setItem('gym_m22_current_user', JSON.stringify(userObj));
      setCurrentUser(userObj);
      setCurrentView('coach');
    } else if (role === 'staff') {
      const stf = StorageService.getStaff()[0] || INITIAL_STAFF_ACCOUNTS[0];
      const userObj: CurrentUser = {
        role: 'staff',
        id: stf.id,
        nameAr: stf.nameAr,
        nameEn: stf.nameEn,
        phone: stf.phone,
        avatarUrl: stf.avatarUrl,
      };
      sessionStorage.setItem('gym_m22_current_user', JSON.stringify(userObj));
      setCurrentUser(userObj);
      setCurrentView('lookup');
    } else {
      const mem = StorageService.getMembers()[0];
      if (mem) {
        setActiveMember(mem);
        const userObj: CurrentUser = {
          role: 'member',
          id: mem.id,
          nameAr: mem.fullNameAr,
          nameEn: mem.fullNameEn,
          phone: mem.phone,
          avatarUrl: mem.avatarUrl,
        };
        sessionStorage.setItem('gym_m22_current_user', JSON.stringify(userObj));
        setCurrentUser(userObj);
      }
      setCurrentView('member');
    }
  };

  const handleResetData = () => {
    if (confirm(lang === 'ar' ? 'هل تريد استعادة البيانات الافتراضية للجيم وسجلات النظام بالكامل؟' : 'Reset all data to default sample data?')) {
      StorageService.recordSensitiveMod({
        category: 'database_reset',
        titleAr: 'استعادة بيانات النظام الافتراضية',
        titleEn: 'System Factory Reset',
        detailsAr: `قام المدير العام (${currentUser.nameAr}) بإعادة ضبط واستعادة البيانات الافتراضية للنظام بالكامل`,
        detailsEn: `GM ${currentUser.nameAr} performed factory reset of system data`,
        performerId: currentUser.id,
        performerName: currentUser.nameAr,
        performerRole: currentUser.role,
        targetId: 'system',
        targetName: 'GYM-M22 Database',
        oldValue: 'Custom Data',
        newValue: 'Factory Defaults',
        reason: 'إعادة ضبط المصنع واستعادة الافتراضيات'
      });

      StorageService.resetToFactory();
      sessionStorage.removeItem('gym_m22_logged_in');
      sessionStorage.removeItem('gym_m22_current_user');
      sessionStorage.removeItem('gym_m22_current_view');
      localStorage.removeItem('gym_m22_current_user');
      const members = StorageService.getMembers();
      setActiveMember(members[0] || null);
      audioAlertService.playSuccess();
      window.location.reload();
    }
  };

  // Strict Role-Based View Guard & Navigation Enforcer
  const handleNavigate = (view: 'login' | 'member' | 'lookup' | 'workout' | 'history' | 'admin' | 'coach' | 'accountant' | 'manager' | 'checkins') => {
    if (view === 'login') {
      sessionStorage.removeItem('gym_m22_logged_in');
      sessionStorage.removeItem('gym_m22_current_user');
      sessionStorage.removeItem('gym_m22_current_view');
      localStorage.removeItem('gym_m22_current_user');
      setCurrentUser({
        role: 'member',
        id: 'guest',
        nameAr: 'زائر',
        nameEn: 'Guest',
        phone: '',
        avatarUrl: ''
      });
      setCurrentView('login');
      audioAlertService.playBeep(440, 0.08);
      return;
    }

    // 1. ACCOUNTANT
    if (currentUser.role === 'accountant') {
      setCurrentView('accountant');
      return;
    }

    // 2. RECEPTION STAFF
    if (currentUser.role === 'staff') {
      if (view === 'lookup' || view === 'admin' || view === 'member' || view === 'checkins') {
        setCurrentView(view);
      } else {
        setCurrentView('lookup');
      }
      return;
    }

    // 3. GYM MEMBER
    if (currentUser.role === 'member') {
      if (view === 'member' || view === 'workout' || view === 'history') {
        setCurrentView(view);
      } else {
        setCurrentView('member');
      }
      return;
    }

    // 4. COACH
    if (currentUser.role === 'coach') {
      if (view === 'coach' || view === 'workout' || view === 'history') {
        setCurrentView(view);
      } else {
        setCurrentView('coach');
      }
      return;
    }

    // 5. GENERAL MANAGER (Full Access)
    setCurrentView(view);
  };

  useEffect(() => {
    const handleCustomNavigate = (e: any) => {
      if (e.detail) {
        handleNavigate(e.detail);
      }
    };
    window.addEventListener('gym_navigate_to', handleCustomNavigate);
    return () => {
      window.removeEventListener('gym_navigate_to', handleCustomNavigate);
    };
  }, [currentUser]);

  const toggleLanguage = () => {
    audioAlertService.playBeep(523.25, 0.08);
    setLang(l => (l === 'ar' ? 'en' : 'ar'));
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-['Cairo',sans-serif] selection:bg-[#e5a91b]/30 selection:text-[#f7cb55]">
      {/* Top Universal Athletic Header */}
      <Header
        currentUser={currentUser}
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenMasterMenu={() => setIsMasterMenuOpen(true)}
        onToggleLang={toggleLanguage}
        lang={lang}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Read-Only Viewer Top Notice Banner */}
      {currentUser.role === 'viewer' && (
        <div className="bg-slate-900 border-b-2 border-amber-500/60 p-3 text-center text-xs font-bold text-amber-300 flex items-center justify-center gap-2 shadow-lg sticky top-0 z-50">
          <Eye className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
          <span>{lang === 'ar' ? '👁️ أنت مسجل الآن بـ "حساب للعرض فقط" - تصفح واستعراض كافة المزايا والتقارير متوفر، بدون إمكانية التعديل أو الحفظ.' : '👁️ Logged in with Read-Only Viewer Account - Viewing enabled, editing disabled.'}</span>
        </div>
      )}

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 pb-24 lg:pb-12">
        {isEmployee && !isContractSigned ? (
          <EmployeeContractModal
            currentUser={currentUser}
            lang={lang}
            isForcedOnboarding={true}
            onClose={() => setIsContractSigned(true)}
            onReject={() => handleNavigate('login')}
          />
        ) : (
          <>
            {/* VIEW: LOGIN SCREEN (Default for any shared link or new tab) */}
            {currentView === 'login' && (
              <MultiRoleAuthScreen
                lang={lang}
                onLoginSuccess={(user, member) => {
                  sessionStorage.setItem('gym_m22_logged_in', 'true');
                  sessionStorage.setItem('gym_m22_current_user', JSON.stringify(user));
                  setCurrentUser(user);
                  let targetView: any = 'member';
                  if (member) {
                    setActiveMember(member);
                    targetView = 'member';
                  } else if (user.role === 'manager' || user.role === 'viewer') {
                    targetView = 'manager';
                  } else if (user.role === 'accountant') {
                    targetView = 'accountant';
                  } else if (user.role === 'coach') {
                    targetView = 'coach';
                  } else if (user.role === 'staff') {
                    targetView = 'lookup';
                  } else {
                    targetView = 'member';
                  }
                  sessionStorage.setItem('gym_m22_current_view', targetView);
                  setCurrentView(targetView);
                }}
              />
            )}

        {/* VIEW: MEMBER PERSONAL PORTAL (Subscriptions & Personal Workouts Only) */}
        {currentView === 'member' && activeMember && (
          <MemberPortalView
            member={activeMember}
            lang={lang}
            onOpenCardModal={() => setIsCardModalOpen(true)}
            onOpenTimer={() => setIsTimerOpen(true)}
            defaultSubTab="subscription"
          />
        )}

        {/* VIEW: WORKOUT TRACKER */}
        {currentView === 'workout' && (
          <WorkoutTracker
            member={activeMember || StorageService.getMembers()[0]}
            allMembers={StorageService.getMembers()}
            onSelectMember={(m) => setActiveMember(m)}
            currentUser={currentUser}
            onOpenTimer={() => setIsTimerOpen(true)}
            lang={lang}
          />
        )}

        {/* VIEW: WORKOUT HISTORY LOG */}
        {currentView === 'history' && (
          <WorkoutHistoryView
            member={activeMember || StorageService.getMembers()[0]}
            lang={lang}
          />
        )}

        {/* VIEW: LIVE MEMBER CHECK-IN LOGS */}
        {currentView === 'checkins' && (
          <MemberCheckInLogView
            currentUser={currentUser}
            lang={lang}
          />
        )}

        {/* VIEW: RECEPTION MEMBER LOOKUP & REGISTRATION */}
        {currentView === 'lookup' && (
          <QuickMemberSelector
            activeMember={activeMember}
            onSelectMember={(m) => {
              setActiveMember(m);
              if (currentUser.role === 'member') setCurrentView('member');
              else if (currentUser.role === 'coach') setCurrentView('workout');
            }}
            onOpenCard={() => setIsCardModalOpen(true)}
            lang={lang}
            currentUser={currentUser}
          />
        )}

        {/* VIEW: RECEPTION DESK & SHIFTS */}
        {currentView === 'admin' && (
          <AdminGymDashboard
            currentUser={currentUser}
            lang={lang}
          />
        )}

        {/* VIEW: ACCOUNTANT DASHBOARD (Payroll, Coach Commissions, Vouchers & Reports) */}
        {currentView === 'accountant' && (
          <AccountantDashboard
            currentUser={currentUser}
            lang={lang}
          />
        )}

        {/* VIEW: COACH PORTAL */}
        {currentView === 'coach' && (
          <CoachTraineesPortal
            currentUser={currentUser}
            lang={lang}
          />
        )}

        {/* VIEW: GENERAL MANAGER CENTRAL & AUDIT */}
        {currentView === 'manager' && (
          <GeneralManagerDashboard
            currentUser={currentUser}
            lang={lang}
            defaultSubView={gmSubView}
            onUpdateCurrentUser={(updated) => setCurrentUser(updated)}
          />
        )}
          </>
        )}
      </main>

      {/* Mobile Bottom Navigation - Hidden on Login & Forced Onboarding */}
      {currentView !== 'login' && (!isEmployee || isContractSigned) && (
        <BottomNav
          currentView={currentView}
          onNavigate={handleNavigate}
          currentUser={currentUser}
          onOpenCardModal={() => {
            if (activeMember) setIsCardModalOpen(true);
            else handleNavigate('lookup');
          }}
          lang={lang}
        />
      )}

      {/* MASTER DROPDOWN DRAWER MENU - Hidden on Login & Forced Onboarding */}
      {currentView !== 'login' && (!isEmployee || isContractSigned) && (
        <MasterDropdownMenu
          isOpen={isMasterMenuOpen}
          onClose={() => setIsMasterMenuOpen(false)}
          currentUser={currentUser}
          onSwitchRole={handleSwitchRole}
          onNavigate={handleNavigate}
          onNavigateToGMSection={(sec) => {
            if (currentUser.role === 'manager') {
              if (sec === ('member_checkins' as any)) {
                setCurrentView('checkins');
              } else {
                setGmSubView(sec);
                setCurrentView('manager');
              }
            }
          }}
          onOpenCard={() => setIsCardModalOpen(true)}
          onOpenTimer={() => setIsTimerOpen(true)}
          onOpenInstallModal={() => setIsInstallModalOpen(true)}
          onResetData={handleResetData}
          onToggleLang={toggleLanguage}
          lang={lang}
          activeMember={activeMember}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          onOpenContract={() => setIsContractModalOpen(true)}
        />
      )}

      {/* MODALS */}
      {activeMember && (
        <DigitalCardModal
          member={activeMember}
          isOpen={isCardModalOpen}
          onClose={() => setIsCardModalOpen(false)}
          lang={lang}
        />
      )}

      <RestTimerModal
        isOpen={isTimerOpen}
        onClose={() => setIsTimerOpen(false)}
        lang={lang}
      />

      <InstallAppModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        lang={lang}
      />

      {/* EMPLOYEE CONTRACT MODAL */}
      {currentUser.role !== 'member' && isContractModalOpen && (
        <EmployeeContractModal
          onClose={() => setIsContractModalOpen(false)}
          currentUser={currentUser}
          lang={lang}
        />
      )}
    </div>
  );
}
