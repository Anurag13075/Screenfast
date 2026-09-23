import { useState } from 'react';
import { Check, X, Loader2 } from 'lucide-react';

interface NewsletterFormProps {
  buttonText?: string;
  className?: string;
  expandedClassName?: string;
}

export function NewsletterForm({ 
  buttonText = "Join Newsletter", 
  className = "",
  expandedClassName = "flex flex-col sm:flex-row gap-4 w-full max-w-lg items-start sm:items-center"
}: NewsletterFormProps) {
  const [state, setState] = useState<'idle' | 'expanded' | 'submitting' | 'success' | 'error'>('idle');
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setState('submitting');
    
    try {
      // POST to buttondown
      const response = await fetch('https://buttondown.email/api/emails/embed-subscribe/Anurag13075', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ email }),
      });

      if (response.ok) {
        setState('success');
      } else {
        setState('error');
      }
    } catch (err) {
      setState('error');
    }
  };

  if (state === 'success') {
    return (
      <div className={`flex items-center gap-2 text-accent text-sm font-medium ${className}`}>
        <Check className="h-4 w-4" />
        You're in — thanks!
      </div>
    );
  }

  if (state === 'idle') {
    return (
      <button 
        onClick={() => setState('expanded')}
        className={`bg-foreground text-background hover:bg-accent transition-colors py-3 px-6 rounded-sm text-sm font-medium ${className}`}
      >
        {buttonText}
      </button>
    );
  }

  return (
    <form 
      onSubmit={handleSubmit}
      className={`${expandedClassName} transition-all duration-300 relative`}
    >
      <input 
        type="email" 
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="anuragf863@gmail.com"
        className="flex-1 bg-background border border-border rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-foreground placeholder:text-muted-foreground w-full"
        required
        disabled={state === 'submitting'}
        autoFocus
      />
      <button 
        type="submit" 
        disabled={state === 'submitting'}
        className="bg-foreground text-background px-6 py-3 rounded-sm text-sm font-medium hover:bg-accent transition-colors shrink-0 flex items-center justify-center min-w-[100px] w-full sm:w-auto"
      >
        {state === 'submitting' ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          "Subscribe"
        )}
      </button>
      {state === 'error' && (
        <div className="absolute -bottom-6 left-0 flex items-center gap-1 text-xs text-destructive">
          <X className="h-3 w-3" />
          Something went wrong. Try again.
        </div>
      )}
    </form>
  );
}
