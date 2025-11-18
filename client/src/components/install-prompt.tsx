import React, { useState, useEffect } from 'react';
import { X, Download, Home } from 'lucide-react';
import { useInstallPrompt } from '@/hooks/use-install-prompt';
import { Button } from '@/components/ui/button';

export function InstallPrompt() {
  const { isInstallable, promptInstall, hidePrompt } = useInstallPrompt();
  const [isVisible, setIsVisible] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    if (isInstallable) {
      setIsVisible(true);
      // Trigger animation
      setTimeout(() => setShowAnimation(true), 100);
    }
  }, [isInstallable]);

  const handleInstall = async () => {
    await promptInstall();
    handleDismiss();
  };

  const handleDismiss = () => {
    setShowAnimation(false);
    setTimeout(() => {
      setIsVisible(false);
      hidePrompt();
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 dark:bg-black/60 transition-opacity duration-300 z-40 pointer-events-none ${
          showAnimation ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ pointerEvents: showAnimation ? 'auto' : 'none' }}
        onClick={handleDismiss}
      />

      {/* Install Prompt Card */}
      <div
        className={`fixed bottom-6 left-6 right-6 sm:left-auto sm:right-6 sm:max-w-md bg-white dark:bg-slate-900 rounded-xl shadow-2xl transition-all duration-300 z-50 border border-white/20 dark:border-white/10 overflow-hidden ${
          showAnimation
            ? 'translate-y-0 opacity-100 scale-100'
            : 'translate-y-6 opacity-0 scale-95'
        }`}
      >
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-transparent dark:from-blue-950/20 dark:via-transparent dark:to-transparent pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 p-5 sm:p-6">
          {/* Close Button */}
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>

          {/* Header with Icon */}
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-lg bg-blue-100 dark:bg-blue-950/50">
              <Download className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                Install App
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                FM Route System
              </p>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">
            Get faster access and work offline. Install on your home screen just like an app from the App Store.
          </p>

          {/* Features */}
          <div className="space-y-2 mb-5">
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
              <Home className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Add to your home screen</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
              <span className="text-lg">⚡</span>
              <span>Works offline</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
              <span className="text-lg">🚀</span>
              <span>Instant access</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDismiss}
              className="flex-1 rounded-lg"
            >
              Not Now
            </Button>
            <Button
              onClick={handleInstall}
              size="sm"
              className="flex-1 rounded-lg bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white"
            >
              <Download className="w-4 h-4 mr-1" />
              Install
            </Button>
          </div>
        </div>

        {/* Pulse Animation for attention */}
        <style>{`
          @keyframes pulse-subtle {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.8; }
          }
          .animate-pulse-subtle {
            animation: pulse-subtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }
        `}</style>
      </div>
    </>
  );
}
