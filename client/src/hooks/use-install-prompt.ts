import { useEffect, useState, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface UseInstallPromptReturn {
  isInstallable: boolean;
  isInstalled: boolean;
  promptInstall: () => Promise<void>;
  hidePrompt: () => void;
  deferredPrompt: BeforeInstallPromptEvent | null;
}

export function useInstallPrompt(): UseInstallPromptReturn {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  // Check if app is already installed
  useEffect(() => {
    // Check if running in standalone mode (app installed)
    const isInStandaloneMode =
      (window.navigator as any).standalone === true ||
      window.matchMedia('(display-mode: standalone)').matches;
    
    setIsInstalled(isInStandaloneMode);
    
    // Check localStorage for dismissed prompt
    const promptDismissed = localStorage.getItem('pwa-prompt-dismissed');
    const dismissedTime = promptDismissed ? parseInt(promptDismissed, 10) : 0;
    const currentTime = Date.now();
    
    // Show prompt again after 7 days if dismissed
    if (dismissedTime && currentTime - dismissedTime < 7 * 24 * 60 * 60 * 1000) {
      setIsInstallable(false);
    }
  }, []);

  // Handle beforeinstallprompt event
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Check if dismissed recently
      const promptDismissed = localStorage.getItem('pwa-prompt-dismissed');
      if (!promptDismissed) {
        setIsInstallable(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Handle app installed
  useEffect(() => {
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      localStorage.removeItem('pwa-prompt-dismissed');
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Handle display mode change (opened/closed as app)
  useEffect(() => {
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    
    const handleStandaloneChange = (e: MediaQueryListEvent) => {
      setIsInstalled(e.matches);
    };

    mediaQuery.addEventListener('change', handleStandaloneChange);

    return () => {
      mediaQuery.removeEventListener('change', handleStandaloneChange);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) {
      console.warn('Install prompt not available');
      return;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setIsInstallable(false);
        setDeferredPrompt(null);
        localStorage.removeItem('pwa-prompt-dismissed');
      } else {
        // Mark as dismissed for 7 days
        localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
        setIsInstallable(false);
      }
    } catch (error) {
      console.error('Installation failed:', error);
    }
  }, [deferredPrompt]);

  const hidePrompt = useCallback(() => {
    // Mark as dismissed for 7 days
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
    setIsInstallable(false);
  }, []);

  return {
    isInstallable: isInstallable && !isInstalled,
    isInstalled,
    promptInstall,
    hidePrompt,
    deferredPrompt,
  };
}
