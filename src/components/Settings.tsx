import React from 'react';
import { motion } from 'motion/react';
import { Menu, Moon, Sun, Bell, Shield, LogOut } from 'lucide-react';
import { cn } from '../lib/utils';
import { useSettings, Language } from '../context/SettingsContext';

interface SettingsProps {
  onLogout: () => void;
  onMenuClick: () => void;
}

// ── Proper Toggle Component ──────────────────────────────────────────────────

const Toggle: React.FC<{ enabled: boolean; onToggle: () => void }> = ({ enabled, onToggle }) => (
  <button
    type="button"
    role="switch"
    aria-checked={enabled}
    onClick={onToggle}
    className={cn(
      "relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
      enabled ? "bg-[#006644]" : "bg-slate-200 dark:bg-slate-600"
    )}
  >
    <span
      className={cn(
        "pointer-events-none inline-block h-6 w-6 rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 ease-in-out",
        enabled ? "translate-x-5" : "translate-x-0"
      )}
    />
  </button>
);

// ── Settings Component ───────────────────────────────────────────────────────

export const Settings: React.FC<SettingsProps> = ({ onLogout, onMenuClick }) => {
  const {
    darkMode, setDarkMode,
    language, setLanguage,
    pushNotifications, setPushNotifications,
    emailAlerts, setEmailAlerts,
    t,
  } = useSettings();

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-slate-400 hover:text-slate-900 dark:hover:text-white shadow-sm transition-all active:scale-95"
        >
          <Menu size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{t('settings.title')}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">{t('settings.subtitle')}</p>
        </div>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Appearance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800 rounded-[32px] p-8 border border-slate-100 dark:border-slate-700 shadow-sm space-y-6"
        >
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            {darkMode ? <Moon size={20} /> : <Sun size={20} />}
            {t('settings.appearance')}
          </h3>
          <div className="flex items-center justify-between py-3 border-b border-slate-50 dark:border-slate-700">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{t('settings.darkMode')}</p>
              <p className="text-xs text-slate-400 mt-0.5">{t('settings.darkModeDesc')}</p>
            </div>
            <Toggle enabled={darkMode} onToggle={() => setDarkMode(!darkMode)} />
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{t('settings.language')}</p>
              <p className="text-xs text-slate-400 mt-0.5">{t('settings.languageDesc')}</p>
            </div>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            >
              <option value="English">English</option>
              <option value="Spanish">Español</option>
              <option value="French">Français</option>
              <option value="German">Deutsch</option>
            </select>
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white dark:bg-slate-800 rounded-[32px] p-8 border border-slate-100 dark:border-slate-700 shadow-sm space-y-6"
        >
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Bell size={20} />
            {t('settings.notifications')}
          </h3>
          <div className="flex items-center justify-between py-3 border-b border-slate-50 dark:border-slate-700">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{t('settings.pushNotif')}</p>
              <p className="text-xs text-slate-400 mt-0.5">{t('settings.pushNotifDesc')}</p>
            </div>
            <Toggle enabled={pushNotifications} onToggle={() => setPushNotifications(!pushNotifications)} />
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{t('settings.emailAlerts')}</p>
              <p className="text-xs text-slate-400 mt-0.5">{t('settings.emailAlertsDesc')}</p>
            </div>
            <Toggle enabled={emailAlerts} onToggle={() => setEmailAlerts(!emailAlerts)} />
          </div>
        </motion.div>

        {/* Privacy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-800 rounded-[32px] p-8 border border-slate-100 dark:border-slate-700 shadow-sm space-y-6"
        >
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Shield size={20} />
            {t('settings.privacy')}
          </h3>
          <div className="flex items-center justify-between py-3 border-b border-slate-50 dark:border-slate-700">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{t('settings.profileVis')}</p>
              <p className="text-xs text-slate-400 mt-0.5">{t('settings.profileVisDesc')}</p>
            </div>
            <select className="px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all">
              <option>Private</option>
              <option>Public</option>
            </select>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{t('settings.dataExport')}</p>
              <p className="text-xs text-slate-400 mt-0.5">{t('settings.dataExportDesc')}</p>
            </div>
            <button className="px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-semibold text-slate-600 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">
              {t('btn.export')}
            </button>
          </div>
        </motion.div>

        {/* Sign Out */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white dark:bg-slate-800 rounded-[32px] p-8 shadow-sm border border-slate-100 dark:border-slate-700"
        >
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">{t('settings.accountActions')}</h3>
          <button
            onClick={onLogout}
            className="w-full md:w-auto px-8 py-3.5 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 font-semibold rounded-xl hover:bg-rose-100 dark:hover:bg-rose-900/50 hover:text-rose-700 transition-colors flex items-center gap-2"
          >
            <LogOut size={18} />
            {t('btn.signOut')}
          </button>
        </motion.div>
      </div>
    </div>
  );
};
