import React, { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';
import { useInstallPrompt } from '@/hooks/use-install-prompt';

export function InstallPrompt() {
  const { isInstallable, promptInstall, hidePrompt } = useInstallPrompt();
  const [isVisible, setIsVisible] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    if (isInstallable) {
      setIsVisible(true);
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
      {/* iOS Backdrop Blur */}
      <div
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-300 z-40 ${
          showAnimation ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ pointerEvents: showAnimation ? 'auto' : 'none' }}
        onClick={handleDismiss}
      />

      {/* iOS Card - Install Prompt */}
      <div
        className={`fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-sm 
          ios-card rounded-2xl overflow-hidden z-50 transition-all duration-300 ${
          showAnimation
            ? 'translate-y-0 opacity-100 scale-100'
            : 'translate-y-4 opacity-0 scale-95'
        }`}
      >
        {/* Close Button - iOS Style */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-2 rounded-full 
            hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </button>

        {/* Content */}
        <div className="pr-12">
          {/* Header */}
          <div className="flex items-start gap-3 mb-3">
            <div className="p-2.5 rounded-full bg-blue-100 dark:bg-blue-950/50 flex-shrink-0">
              <Download className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="ios-subheading text-base">Install App</h3>
              <p className="ios-caption text-gray-600 dark:text-gray-400 mt-0.5">
                FM Route System
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-200 dark:bg-white/10 my-3" />

          {/* Description */}
          <p className="ios-body text-sm mb-4">
            Get instant access and work offline. Install on your home screen just like a native app.
          </p>

          {/* Features */}
          <div className="space-y-2 mb-5">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-4 h-4 rounded-full bg-green-500" />
              <span className="text-gray-700 dark:text-gray-300">Add to home screen</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-4 h-4 rounded-full bg-orange-500" />
              <span className="text-gray-700 dark:text-gray-300">Works offline</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-4 h-4 rounded-full bg-blue-500" />
              <span className="text-gray-700 dark:text-gray-300">Faster access</span>
            </div>
          </div>

          {/* iOS Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleDismiss}
              className="flex-1 btn-ios-secondary text-sm"
            >
              Not Now
            </button>
            <button
              onClick={handleInstall}
              className="flex-1 btn-ios text-sm flex items-center justify-center gap-1"
            >
              <Download className="w-4 h-4" />
              Install
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
