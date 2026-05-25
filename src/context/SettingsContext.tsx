import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// ─── Types ─────────────────────────────────────────────────────────────────────

export type Language = 'English' | 'Spanish' | 'French' | 'German';

interface SettingsState {
  darkMode: boolean;
  language: Language;
  pushNotifications: boolean;
  emailAlerts: boolean;
}

interface SettingsContextType extends SettingsState {
  setDarkMode: (v: boolean) => void;
  setLanguage: (v: Language) => void;
  setPushNotifications: (v: boolean) => void;
  setEmailAlerts: (v: boolean) => void;
  t: (key: string) => string;
}

// ─── Translations ──────────────────────────────────────────────────────────────

const translations: Record<Language, Record<string, string>> = {
  English: {
    'nav.dashboard': 'Dashboard',
    'nav.tasks': 'Tasks',
    'nav.analytics': 'Analytics',
    'nav.settings': 'Settings',
    'nav.profile': 'Profile',
    'nav.help': 'Help',
    'nav.logout': 'Logout',
    'nav.menu': 'Menu',
    'nav.general': 'General',
    'btn.createTask': 'Create Task',
    'btn.editProfile': 'Edit Profile',
    'btn.saveChanges': 'Save Changes',
    'btn.signOut': 'Sign Out',
    'btn.export': 'Export',
    'btn.sendEmail': 'Send Email',
    'settings.title': 'Settings',
    'settings.subtitle': 'Configure your application preferences.',
    'settings.appearance': 'Appearance',
    'settings.darkMode': 'Dark Mode',
    'settings.darkModeDesc': 'Use dark theme across the application',
    'settings.language': 'Language',
    'settings.languageDesc': 'Select your preferred language',
    'settings.notifications': 'Notifications',
    'settings.pushNotif': 'Push Notifications',
    'settings.pushNotifDesc': 'Receive task reminders and updates',
    'settings.emailAlerts': 'Email Alerts',
    'settings.emailAlertsDesc': 'Get email notifications for overdue tasks',
    'settings.privacy': 'Privacy & Security',
    'settings.profileVis': 'Profile Visibility',
    'settings.profileVisDesc': 'Control who can see your profile',
    'settings.dataExport': 'Data Export',
    'settings.dataExportDesc': 'Download all your data in JSON format',
    'settings.accountActions': 'Account Actions',
    'help.title': 'Help & Feedback',
    'help.subtitle': 'Have a question or suggestion? Let us know.',
    'profile.title': 'My Profile',
    'profile.subtitle': 'Manage your professional identity and activity.',
    'analytics.title': 'Analytics Intelligence',
    'analytics.subtitle': 'Real-time performance metrics from your tasks.',
    'dashboard.title': 'Dashboard',
  },
  Spanish: {
    'nav.dashboard': 'Panel',
    'nav.tasks': 'Tareas',
    'nav.analytics': 'Analítica',
    'nav.settings': 'Configuración',
    'nav.profile': 'Perfil',
    'nav.help': 'Ayuda',
    'nav.logout': 'Cerrar sesión',
    'nav.menu': 'Menú',
    'nav.general': 'General',
    'btn.createTask': 'Crear Tarea',
    'btn.editProfile': 'Editar Perfil',
    'btn.saveChanges': 'Guardar Cambios',
    'btn.signOut': 'Cerrar Sesión',
    'btn.export': 'Exportar',
    'btn.sendEmail': 'Enviar Email',
    'settings.title': 'Configuración',
    'settings.subtitle': 'Configura las preferencias de tu aplicación.',
    'settings.appearance': 'Apariencia',
    'settings.darkMode': 'Modo Oscuro',
    'settings.darkModeDesc': 'Usar tema oscuro en toda la aplicación',
    'settings.language': 'Idioma',
    'settings.languageDesc': 'Selecciona tu idioma preferido',
    'settings.notifications': 'Notificaciones',
    'settings.pushNotif': 'Notificaciones Push',
    'settings.pushNotifDesc': 'Recibir recordatorios de tareas',
    'settings.emailAlerts': 'Alertas por Email',
    'settings.emailAlertsDesc': 'Recibir notificaciones por email para tareas vencidas',
    'settings.privacy': 'Privacidad y Seguridad',
    'settings.profileVis': 'Visibilidad del Perfil',
    'settings.profileVisDesc': 'Controla quién puede ver tu perfil',
    'settings.dataExport': 'Exportar Datos',
    'settings.dataExportDesc': 'Descargar todos tus datos en formato JSON',
    'settings.accountActions': 'Acciones de Cuenta',
    'help.title': 'Ayuda y Comentarios',
    'help.subtitle': '¿Tienes una pregunta o sugerencia? Cuéntanos.',
    'profile.title': 'Mi Perfil',
    'profile.subtitle': 'Administra tu identidad profesional y actividad.',
    'analytics.title': 'Inteligencia Analítica',
    'analytics.subtitle': 'Métricas de rendimiento en tiempo real de tus tareas.',
    'dashboard.title': 'Panel',
  },
  French: {
    'nav.dashboard': 'Tableau de bord',
    'nav.tasks': 'Tâches',
    'nav.analytics': 'Analytique',
    'nav.settings': 'Paramètres',
    'nav.profile': 'Profil',
    'nav.help': 'Aide',
    'nav.logout': 'Déconnexion',
    'nav.menu': 'Menu',
    'nav.general': 'Général',
    'btn.createTask': 'Créer une Tâche',
    'btn.editProfile': 'Modifier le Profil',
    'btn.saveChanges': 'Enregistrer',
    'btn.signOut': 'Se Déconnecter',
    'btn.export': 'Exporter',
    'btn.sendEmail': 'Envoyer',
    'settings.title': 'Paramètres',
    'settings.subtitle': 'Configurez vos préférences d\'application.',
    'settings.appearance': 'Apparence',
    'settings.darkMode': 'Mode Sombre',
    'settings.darkModeDesc': 'Utiliser le thème sombre dans toute l\'application',
    'settings.language': 'Langue',
    'settings.languageDesc': 'Sélectionnez votre langue préférée',
    'settings.notifications': 'Notifications',
    'settings.pushNotif': 'Notifications Push',
    'settings.pushNotifDesc': 'Recevoir des rappels de tâches',
    'settings.emailAlerts': 'Alertes Email',
    'settings.emailAlertsDesc': 'Recevoir des notifications par email pour les tâches en retard',
    'settings.privacy': 'Confidentialité et Sécurité',
    'settings.profileVis': 'Visibilité du Profil',
    'settings.profileVisDesc': 'Contrôlez qui peut voir votre profil',
    'settings.dataExport': 'Exporter les Données',
    'settings.dataExportDesc': 'Téléchargez toutes vos données au format JSON',
    'settings.accountActions': 'Actions du Compte',
    'help.title': 'Aide et Commentaires',
    'help.subtitle': 'Une question ou une suggestion? Dites-le nous.',
    'profile.title': 'Mon Profil',
    'profile.subtitle': 'Gérez votre identité professionnelle et votre activité.',
    'analytics.title': 'Intelligence Analytique',
    'analytics.subtitle': 'Métriques de performance en temps réel de vos tâches.',
    'dashboard.title': 'Tableau de bord',
  },
  German: {
    'nav.dashboard': 'Dashboard',
    'nav.tasks': 'Aufgaben',
    'nav.analytics': 'Analytik',
    'nav.settings': 'Einstellungen',
    'nav.profile': 'Profil',
    'nav.help': 'Hilfe',
    'nav.logout': 'Abmelden',
    'nav.menu': 'Menü',
    'nav.general': 'Allgemein',
    'btn.createTask': 'Aufgabe erstellen',
    'btn.editProfile': 'Profil bearbeiten',
    'btn.saveChanges': 'Änderungen speichern',
    'btn.signOut': 'Abmelden',
    'btn.export': 'Exportieren',
    'btn.sendEmail': 'Email senden',
    'settings.title': 'Einstellungen',
    'settings.subtitle': 'Konfigurieren Sie Ihre Anwendungseinstellungen.',
    'settings.appearance': 'Erscheinungsbild',
    'settings.darkMode': 'Dunkelmodus',
    'settings.darkModeDesc': 'Dunkles Thema in der gesamten Anwendung verwenden',
    'settings.language': 'Sprache',
    'settings.languageDesc': 'Wählen Sie Ihre bevorzugte Sprache',
    'settings.notifications': 'Benachrichtigungen',
    'settings.pushNotif': 'Push-Benachrichtigungen',
    'settings.pushNotifDesc': 'Aufgabenerinnerungen erhalten',
    'settings.emailAlerts': 'E-Mail-Benachrichtigungen',
    'settings.emailAlertsDesc': 'E-Mail-Benachrichtigungen für überfällige Aufgaben',
    'settings.privacy': 'Datenschutz & Sicherheit',
    'settings.profileVis': 'Profil-Sichtbarkeit',
    'settings.profileVisDesc': 'Steuern Sie, wer Ihr Profil sehen kann',
    'settings.dataExport': 'Datenexport',
    'settings.dataExportDesc': 'Alle Daten im JSON-Format herunterladen',
    'settings.accountActions': 'Kontoaktionen',
    'help.title': 'Hilfe & Feedback',
    'help.subtitle': 'Haben Sie eine Frage oder einen Vorschlag? Lassen Sie es uns wissen.',
    'profile.title': 'Mein Profil',
    'profile.subtitle': 'Verwalten Sie Ihre berufliche Identität und Aktivität.',
    'analytics.title': 'Analytische Intelligenz',
    'analytics.subtitle': 'Echtzeit-Leistungskennzahlen Ihrer Aufgaben.',
    'dashboard.title': 'Dashboard',
  },
};

// ─── Default values ────────────────────────────────────────────────────────────

const STORAGE_KEY = 'app_settings';

const defaults: SettingsState = {
  darkMode: false,
  language: 'English',
  pushNotifications: true,
  emailAlerts: false,
};

// ─── Context ───────────────────────────────────────────────────────────────────

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = (): SettingsContextType => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
};

// ─── Provider ──────────────────────────────────────────────────────────────────

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<SettingsState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? { ...defaults, ...JSON.parse(stored) } : defaults;
    } catch {
      return defaults;
    }
  });

  // Persist to localStorage on every change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Apply dark mode class to <html>
  useEffect(() => {
    if (state.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.darkMode]);

  const t = (key: string): string => {
    return translations[state.language]?.[key] || translations['English'][key] || key;
  };

  const value: SettingsContextType = {
    ...state,
    setDarkMode: (v) => setState(prev => ({ ...prev, darkMode: v })),
    setLanguage: (v) => setState(prev => ({ ...prev, language: v as Language })),
    setPushNotifications: (v) => setState(prev => ({ ...prev, pushNotifications: v })),
    setEmailAlerts: (v) => setState(prev => ({ ...prev, emailAlerts: v })),
    t,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};
