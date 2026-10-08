import React, { useState, useEffect } from 'react';
import { 
  X, 
  Smartphone, 
  Download, 
  Share, 
  PlusSquare, 
  ExternalLink, 
  CheckCircle2, 
  Sparkles,
  Monitor,
  Apple,
  Copy
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { audioAlertService } from '../services/audioService';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'ar' | 'en';
  defaultTab?: 'android' | 'ios' | 'desktop';
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({ 
  isOpen, 
  onClose, 
  lang,
  defaultTab 
}) => {
  const isAr = lang === 'ar';
  const { isInstallable, isInstalled, install } = usePWAInstall();
  
  const [activeTab, setActiveTab] = useState<'android' | 'ios' | 'desktop'>('android');
  const [installSuccess, setInstallSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState<'play' | 'app' | null>(null);

  const playStoreUrl = 'https://play.google.com/store/apps/details?id=com.gymm22.app';
  const appStoreUrl = 'https://apps.apple.com/app/gym-m22/id6446820234';

  const handleCopyLink = (url: string, type: 'play' | 'app') => {
    try {
      navigator.clipboard.writeText(url);
      setCopiedLink(type);
      audioAlertService.playSuccess();
      setTimeout(() => setCopiedLink(null), 3000);
    } catch (e) {
      console.warn('Failed to copy store url:', e);
    }
  };

  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    } else {
      const userAgent = navigator.userAgent.toLowerCase();
      if (/iphone|ipad|ipod/.test(userAgent)) {
        setActiveTab('ios');
      } else if (/android/.test(userAgent)) {
        setActiveTab('android');
      } else {
        setActiveTab('android');
      }
    }
  }, [defaultTab, isOpen]);

  if (!isOpen) return null;

  const playStoreMarketUrl = 'market://details?id=com.gymm22.app';

  const handlePlayStoreRedirect = () => {
    audioAlertService.playSetComplete();
    const isAndroid = /android/i.test(navigator.userAgent);
    if (isAndroid) {
      window.location.href = playStoreMarketUrl;
      setTimeout(() => {
        window.open(playStoreUrl, '_blank', 'noopener,noreferrer');
      }, 500);
    } else {
      window.open(playStoreUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleDirectPwaInstall = async () => {
    audioAlertService.playSetComplete();
    if (isInstallable) {
      const installed = await install();
      if (installed) {
        setInstallSuccess(true);
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } else {
      handlePlayStoreRedirect();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md rounded-3xl bg-[#0d111a] border border-[#e5a91b]/50 p-6 text-slate-100 shadow-2xl relative overflow-hidden"
        dir={isAr ? 'rtl' : 'ltr'}
      >
        <button
          onClick={onClose}
          className="absolute top-4 left-4 rtl:left-4 rtl:right-auto ltr:right-4 ltr:left-auto p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/60"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5 pr-8 rtl:pr-0 rtl:pl-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#f7cb55] via-[#e5a91b] to-[#b37a10] text-slate-950 flex items-center justify-center font-black shadow-lg shadow-[#e5a91b]/25 shrink-0">
            <Download className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-white leading-tight">
              {isAr ? 'تثبيت وتحميل تطبيق نادي GYM-M22' : 'Install GYM-M22 App'}
            </h3>
            <span className="text-xs text-[#f7cb55] font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>{isAr ? 'تشغيل فوري، بدون إنترنت وتنبيهات مباشرة' : 'Instant offline app & push notifications'}</span>
            </span>
          </div>
        </div>

        {/* Platform Selector Tabs */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950/80 rounded-2xl border border-slate-800 mb-5">
          <button
            onClick={() => setActiveTab('android')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'android'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>{isAr ? 'أندرويد' : 'Android'}</span>
          </button>

          <button
            onClick={() => setActiveTab('ios')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'ios'
                ? 'bg-gradient-to-r from-[#2c3444] to-[#1a202c] text-white border border-slate-600 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Apple className="w-3.5 h-3.5" />
            <span>{isAr ? 'آيفون' : 'iPhone'}</span>
          </button>

          <button
            onClick={() => setActiveTab('desktop')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'desktop'
                ? 'bg-gradient-to-r from-amber-600 to-yellow-700 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>{isAr ? 'كمبيوتر' : 'PC'}</span>
          </button>
        </div>

        {/* TAB: ANDROID */}
        {activeTab === 'android' && (
          <div className="space-y-4 animate-in fade-in">
            <button
              onClick={handlePlayStoreRedirect}
              className="w-full p-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm shadow-xl shadow-emerald-600/30 flex items-center justify-between transition-all transform active:scale-[0.98] group"
            >
              <div className="flex items-center gap-3 text-right rtl:text-right ltr:text-left">
                <div className="w-10 h-10 rounded-xl bg-slate-950/40 border border-white/20 flex items-center justify-center">
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M3.609 1.814L13.793 12 3.61 22.186c-.368-.31-.61-.784-.61-1.341V3.155c0-.557.242-1.03.61-1.341zM15.207 13.414l2.766 2.766-12.871 7.37c-.339.194-.712.274-1.077.243l11.182-10.379zM19.387 11.23l2.846 1.63c.756.433.756 1.137 0 1.57l-2.846 1.63-3.111-3.111 3.111-3.119zM4.025.207l12.871 7.37-2.766 2.766L2.948.45c.365-.031.738.049 1.077.243z" fill="#ffffff" />
                  </svg>
                </div>
                <div>
                  <span className="text-[11px] text-emerald-100 font-semibold uppercase tracking-wider block">
                    {isAr ? 'التحميل المباشر من المتجر الرسمي' : 'Download from Official Store'}
                  </span>
                  <strong className="text-sm font-black text-white block">
                    {isAr ? 'تثبيت البرنامج من متجر Google Play' : 'GET IT ON Google Play'}
                  </strong>
                </div>
              </div>
              <ExternalLink className="w-5 h-5 text-emerald-200 group-hover:scale-110 transition-transform" />
            </button>

            <button
              onClick={handleDirectPwaInstall}
              className="w-full p-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-[#e5a91b]/40 text-[#f7cb55] hover:text-white font-bold text-xs flex items-center justify-between transition-all"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#e5a91b]/20 flex items-center justify-center text-[#f7cb55]">
                  <Download className="w-4 h-4" />
                </div>
                <div className="text-right rtl:text-right ltr:text-left">
                  <span className="text-white block font-bold text-xs">
                    {isAr ? 'تثبيت فوري مباشر على الهاتف (بنقرة واحدة)' : 'Instant 1-Click Direct Install'}
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    {isAr ? 'يضيف أيقونة التطبيق لشاشتك فوراً بدون تحميل ملفات' : 'Adds app directly to phone home screen'}
                  </span>
                </div>
              </div>
              <CheckCircle2 className="w-4 h-4 text-[#f7cb55]" />
            </button>
          </div>
        )}

        {/* TAB: IOS */}
        {activeTab === 'ios' && (
          <div className="space-y-3 animate-in fade-in">
            {/* Apple App Store Direct Download button */}
            <button
              onClick={() => {
                audioAlertService.playSetComplete();
                window.open(appStoreUrl, '_blank', 'noopener,noreferrer');
              }}
              className="w-full p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 hover:from-slate-800 hover:to-slate-800 text-white font-black text-sm shadow-xl border border-slate-800 flex items-center justify-between transition-all transform active:scale-[0.98] group cursor-pointer"
            >
              <div className="flex items-center gap-3 text-right rtl:text-right ltr:text-left">
                <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center border border-white/10 text-white">
                  <Apple className="w-6 h-6 fill-current" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-300 font-semibold uppercase tracking-wider block">
                    {isAr ? 'التحميل المباشر من المتجر الرسمي' : 'Download from Official Store'}
                  </span>
                  <strong className="text-sm font-black text-white block">
                    {isAr ? 'تنزيل التطبيق من متجر App Store' : 'Download on the App Store'}
                  </strong>
                </div>
              </div>
              <ExternalLink className="w-5 h-5 text-slate-300 group-hover:scale-110 transition-transform" />
            </button>

            <div className="text-[10px] text-amber-400 font-black px-1.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center uppercase tracking-wide">
              {isAr ? '💡 أو يمكنك تثبيته مباشرة كـ تطبيق ويب سحابي (PWA) كالتالي:' : '💡 Or install directly as a web app (PWA) below:'}
            </div>

            <div className="flex items-start gap-3 bg-slate-950/70 p-3 rounded-2xl border border-slate-800">
              <span className="flex-shrink-0 w-6 h-6 rounded-xl bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center font-mono">1</span>
              <p className="text-xs text-slate-300 leading-relaxed">
                {isAr ? (
                  <span>اضغط على زر <strong className="text-white">المشاركة</strong> <Share className="w-3.5 h-3.5 inline mx-1 text-sky-400" /> في أسفل متصفح Safari.</span>
                ) : (
                  <span>Tap <strong className="text-white">Share</strong> <Share className="w-3.5 h-3.5 inline mx-1 text-sky-400" /> at the bottom of Safari.</span>
                )}
              </p>
            </div>
            <div className="flex items-start gap-3 bg-slate-950/70 p-3 rounded-2xl border border-slate-800">
              <span className="flex-shrink-0 w-6 h-6 rounded-xl bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center font-mono">2</span>
              <p className="text-xs text-slate-300 leading-relaxed">
                {isAr ? (
                  <span>مرر للأسفل واضغط على <strong className="text-white">إضافة إلى الصفحة الرئيسية</strong> <PlusSquare className="w-3.5 h-3.5 inline mx-1 text-emerald-400" />.</span>
                ) : (
                  <span>Scroll down and tap <strong className="text-white">Add to Home Screen</strong> <PlusSquare className="w-3.5 h-3.5 inline mx-1 text-emerald-400" />.</span>
                )}
              </p>
            </div>
          </div>
        )}

        {/* TAB: DESKTOP */}
        {activeTab === 'desktop' && (
          <div className="space-y-3 animate-in fade-in text-xs text-slate-300">
            <button
              onClick={handleDirectPwaInstall}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 hover:from-amber-400 hover:to-yellow-500 font-black text-sm transition-all shadow-lg shadow-amber-500/10 cursor-pointer"
            >
              {isAr ? 'تثبيت نسخة سطح المكتب للكمبيوتر' : 'Install Desktop App'}
            </button>
          </div>
        )}

        {/* Universal Store Links Card with Single-tap Copy */}
        <div className="mt-5 p-4 rounded-2xl bg-slate-950/95 border border-slate-850 space-y-3">
          <span className="text-[10px] text-[#f7cb55] font-black uppercase tracking-wider block">
            {isAr ? '📋 روابط متاجر التطبيقات للمشاركة السريعة:' : '📋 Copy App Store Links to Share:'}
          </span>
          
          <div className="space-y-2">
            {/* Play Store Link */}
            <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-[#060912] border border-slate-850 text-xs">
              <span className="text-slate-300 font-semibold truncate flex items-center gap-1.5 min-w-0">
                <span className="text-emerald-400 font-bold shrink-0 font-mono">Play Store:</span>
                <span className="truncate font-mono text-[9px] text-slate-400">{playStoreUrl}</span>
              </span>
              <button
                onClick={() => handleCopyLink(playStoreUrl, 'play')}
                className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 font-bold text-[9px] transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
              >
                {copiedLink === 'play' ? (
                  <span>{isAr ? 'تم ✓' : 'Copied'}</span>
                ) : (
                  <>
                    <Copy className="w-2.5 h-2.5" />
                    <span>{isAr ? 'نسخ' : 'Copy'}</span>
                  </>
                )}
              </button>
            </div>

            {/* App Store Link */}
            <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-[#060912] border border-slate-850 text-xs">
              <span className="text-slate-300 font-semibold truncate flex items-center gap-1.5 min-w-0">
                <span className="text-sky-400 font-bold shrink-0 font-mono">App Store:</span>
                <span className="truncate font-mono text-[9px] text-slate-400">{appStoreUrl}</span>
              </span>
              <button
                onClick={() => handleCopyLink(appStoreUrl, 'app')}
                className="px-2.5 py-1 rounded-lg bg-sky-500/10 text-sky-400 hover:bg-sky-500 hover:text-slate-950 font-bold text-[9px] transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
              >
                {copiedLink === 'app' ? (
                  <span>{isAr ? 'تم ✓' : 'Copied'}</span>
                ) : (
                  <>
                    <Copy className="w-2.5 h-2.5" />
                    <span>{isAr ? 'نسخ' : 'Copy'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-slate-800/80">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs transition-colors cursor-pointer"
          >
            {isAr ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
