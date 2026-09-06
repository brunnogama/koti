import { useState, useEffect } from 'react';

export type DeviceCategory = 'mobile' | 'tablet' | 'tv';

export function useDeviceType() {
  const [device, setDevice] = useState<DeviceCategory>('mobile');
  const [isTVModeForced, setIsTVModeForced] = useState<boolean>(false);

  useEffect(() => {
    const checkDevice = () => {
      if (isTVModeForced) {
        setDevice('tv');
        return;
      }

      const ua = navigator.userAgent.toLowerCase();
      const isAndroidTV = ua.includes('googletv') || ua.includes('android tv') || ua.includes('smarttv') || ua.includes('crkey');
      
      if (isAndroidTV) {
        setDevice('tv');
        return;
      }

      const width = window.innerWidth;
      if (width < 768) {
        setDevice('mobile');
      } else if (width < 1280) {
        setDevice('tablet');
      } else {
        setDevice('tablet'); // Default large screens to comfortable tablet/desktop mode
      }
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, [isTVModeForced]);

  const toggleForceTVMode = () => {
    setIsTVModeForced(prev => !prev);
  };

  return {
    device: isTVModeForced ? 'tv' : device,
    isMobile: !isTVModeForced && device === 'mobile',
    isTablet: !isTVModeForced && device === 'tablet',
    isTV: isTVModeForced || device === 'tv',
    isTVModeForced,
    toggleForceTVMode,
  };
}
