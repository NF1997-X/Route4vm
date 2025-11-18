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
      {/* iOS Glass Backdrop */}
      <div
        className={`fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-md transition-opacity duration-300 z-40 ${
          showAnimation ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ pointerEvents: showAnimation ? 'auto' : 'none' }}
        onClick={handleDismiss}
      />

      {/* iOS Glass Card with Premium Design */}
      <div
        className={`fixed bottom-6 left-6 right-6 sm:left-auto sm:right-6 sm:max-w-md 
          glass-modal rounded-3xl overflow-hidden transition-all duration-300 z-50 ${
          showAnimation
            ? 'translate-y-0 opacity-100 scale-100'
            : 'translate-y-6 opacity-0 scale-95'
        }`}
      >
        {/* Premium gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-transparent dark:from-blue-500/10 dark:via-transparent dark:to-transparent pointer-events-none" />

        {/* iOS-style separators */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent dark:via-white/10" />
        <div className="absolute inset-0 rounded-3xl ring-1 ring-white/40 dark:ring-white/10 pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 p-6 sm:p-7">
          {/* Close Button - iOS style */}
          <button
            onClick={handleDismiss}
            className="absolute top-5 right-5 p-2 rounded-full 
              hover:bg-white/20 dark:hover:bg-white/10 transition-all duration-200
              active:scale-75"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>

          {/* Header with Icon - iOS style */}
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 
              shadow-lg shadow-blue-500/30 dark:shadow-blue-400/20">
              <Download className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-600 text-lg text-slate-900 dark:text-slate-100 leading-tight">
                Install App
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                FM Route System
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-slate-200 to-transparent dark:from-white/10 mb-4" />

          {/* Description - iOS body text */}
          <p className="text-base text-slate-700 dark:text-slate-300 mb-5 leading-relaxed font-400">
            Get instant access and work offline. Install on your home screen like a real app.
          </p>

          {/* Features - iOS style list */}
          <div className="space-y-3 mb-6 bg-white/50 dark:bg-white/5 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-sm text-slate-700 dark:text-slate-300 font-500">Add to home screen</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center">
                <span className="text-white text-xs font-bold">⚡</span>
              </div>
              <span className="text-sm text-slate-700 dark:text-slate-300 font-500">Works offline</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                <span className="text-white text-xs font-bold">🚀</span>
              </div>
              <span className="text-sm text-slate-700 dark:text-slate-300 font-500">Faster access</span>
            </div>
          </div>

          {/* iOS-style Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleDismiss}
              className="flex-1 px-4 py-3 rounded-xl font-500 text-sm
                bg-slate-200 dark:bg-white/10 text-slate-900 dark:text-slate-100
                hover:bg-slate-300 dark:hover:bg-white/15 transition-all duration-200
                active:scale-95"
            >
              Not Now
            </button>
            <button
              onClick={handleInstall}
              className="flex-1 px-4 py-3 rounded-xl font-600 text-sm
                bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-500 dark:to-blue-700
                text-white hover:shadow-lg hover:shadow-blue-500/30 dark:hover:shadow-blue-400/20
                transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Install
            </button>
          </div>

          {/* iOS-style footer hint */}
          <p className="text-xs text-slate-600 dark:text-slate-500 text-center mt-4 font-400">
            You can change your mind anytime
          </p>
        </div>
      </div>
    </>
  );
}
