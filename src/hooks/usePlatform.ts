import { useState, useEffect } from 'react';

export type PlatformType = 'gnome' | 'oneui';
export type PlatformMode = 'auto' | 'gnome' | 'oneui';

const STORAGE_KEY = 'koti_platform_preference';

export function usePlatform() {
  const [mode, setMode] = useState<PlatformMode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as PlatformMode | null;
      if (saved && (saved === 'auto' || saved === 'gnome' || saved === 'oneui')) {
        return saved;
      }
    } catch (_) {}
    return 'auto';
  });

  const [activePlatform, setActivePlatform] = useState<PlatformType>('gnome');

  useEffect(() => {
    const resolvePlatform = (): PlatformType => {
      if (mode === 'gnome') return 'gnome';
      if (mode === 'oneui') return 'oneui';

      // Auto mode detection:
      if (typeof window === 'undefined') return 'gnome';

      const ua = (navigator.userAgent || '').toLowerCase();
      const isElectron = ua.includes('electron');
      const isLinux = ua.includes('linux') || navigator.platform?.toLowerCase().includes('linux');
      const isAndroid = ua.includes('android');

      // Android or mobile devices prefer One UI
      if (isAndroid) {
        return 'oneui';
      }

      // If running inside Electron or running on Linux desktop -> GNOME 50
      if (isElectron || isLinux) {
        return 'gnome';
      }

      // Fallback for general desktop: GNOME 50
      return window.innerWidth >= 768 ? 'gnome' : 'oneui';
    };

    const resolved = resolvePlatform();
    setActivePlatform(resolved);

    // Update body/root classes
    if (resolved === 'gnome') {
      document.documentElement.classList.add('theme-gnome');
      document.body.style.backgroundColor = '#242424';
    } else {
      document.documentElement.classList.remove('theme-gnome');
      document.body.style.backgroundColor = '#0d0f12';
    }
  }, [mode]);

  const setPlatformMode = (newMode: PlatformMode) => {
    setMode(newMode);
    try {
      localStorage.setItem(STORAGE_KEY, newMode);
    } catch (_) {}
  };

  return {
    platform: activePlatform,
    isGnome: activePlatform === 'gnome',
    isOneUI: activePlatform === 'oneui',
    platformMode: mode,
    setPlatformMode,
  };
}
