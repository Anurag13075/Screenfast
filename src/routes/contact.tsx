import { createFileRoute } from '@tanstack/react-router';
import { Mail } from 'lucide-react';

export const Route = createFileRoute('/contact')({
  component: Contact,
  head: () => ({
    meta: [{ title: 'Contact — Anurag' }],
  }),
});

function Contact() {
  return (
    <article className="mx-auto w-full max-w-[65ch] py-12 lg:py-20 animate-hero">
      <header className="mb-16">
        <h1 className="text-4xl md:text-5xl font-serif font-medium tracking-tight leading-[1.05] mb-6 text-foreground">
          Contact
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground text-balance">
          Have a question about a post or want to collaborate? I'd love to hear from you.
        </p>
      </header>

      <div className="prose-custom mb-16">
        <p>
          You can reach me directly via email. I read every message, though I may not be able to reply immediately depending on my current workload.
        </p>
        
        <div className="mt-8 p-6 md:p-8 bg-muted/50 border border-border rounded-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-background border border-border p-3 rounded-full">
              <Mail className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground m-0">Direct Email</p>
              <a href="mailto:anuragf863@gmail.com" className="text-lg font-serif font-medium text-foreground hover:text-accent !no-underline transition-colors block mt-1">
                anuragf863@gmail.com
              </a>
            </div>
          </div>
        </div>
      </div>
      
      <div className="prose-custom">
        <h2>For consulting inquiries</h2>
        <p>
          I occasionally take on consulting projects related to product design, frontend architecture, and building infinite canvas applications. If you have a specific project in mind, please include <strong>"Consulting:"</strong> in the subject line and provide as much detail as possible about your timeline and technical constraints.
        </p>
      </div>
    </article>
  );
}
