import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, CheckCircle, Info, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NotificationBannerProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  isVisible: boolean;
  onDismiss: () => void;
  autoHide?: boolean;
  duration?: number;
}

const NotificationBanner: React.FC<NotificationBannerProps> = ({ 
  message, 
  type, 
  isVisible, 
  onDismiss,
  autoHide = true,
  duration = 5000
}) => {
  useEffect(() => {
    if (isVisible && autoHide) {
      const timer = setTimeout(() => {
        onDismiss();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, autoHide, duration, onDismiss]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'error':
        return <AlertCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      case 'info':
        return <Info className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-300';
      case 'error':
        return 'bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-300';
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500/20 text-yellow-700 dark:text-yellow-300';
      case 'info':
        return 'bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-300';
      default:
        return 'bg-muted border-border text-foreground';
    }
  };

  if (!isVisible) return null;

  return (
    <div className={`
      fixed top-6 left-1/2 transform -translate-x-1/2 z-50 
      max-w-lg w-full mx-4 transition-all duration-500 ease-out
      ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}
    `}>
      <div className={`
        luxury-card rounded-2xl border-2 backdrop-blur-2xl p-6 shadow-luxury hover-lift
        ${getColors()}
        animate-slide-up-elegant
      `}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="animate-pulse-glow">
              {getIcon()}
            </div>
            <p className="text-sm font-semibold leading-relaxed">{message}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="h-8 w-8 p-0 hover:bg-white/15 hover-breathe rounded-xl"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotificationBanner;