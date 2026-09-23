import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Link } from '@tanstack/react-router';

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasConsented = localStorage.getItem('cookie-consent');
    if (!hasConsented) {
      // Small delay for smooth entry
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!isVisible) return null;

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'true');
    setIsVisible(false);
  };

  return (
    <div className="fixed bottom-6 right-6 md:left-6 md:right-auto z-50 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-background border border-border p-4 shadow-sm flex flex-col gap-3 max-w-sm rounded-sm">
        <div className="flex items-start justify-between gap-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            We use cookies to ensure you get the best experience and to serve relevant ads via Google AdSense. 
            <Link to="/privacy" className="text-foreground underline underline-offset-4 decoration-border ml-1 hover:decoration-accent transition-colors">
              Learn more
            </Link>
          </p>
          <button 
            onClick={() => setIsVisible(false)}
            className="text-muted-foreground hover:text-foreground shrink-0 mt-0.5"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleAccept}
            className="bg-foreground text-background text-sm font-medium px-4 py-1.5 hover:opacity-90 transition-opacity"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
