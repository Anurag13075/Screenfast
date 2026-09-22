import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/terms')({
  component: Terms,
  head: () => ({
    meta: [{ title: 'Terms of Service — Screenfast' }],
  }),
});

function Terms() {
  return (
    <article className="mx-auto w-full max-w-[65ch] py-8 lg:py-12 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <header className="mb-12">
        <h1 className="text-4xl font-serif font-medium tracking-tight mb-4 text-balance">
          Terms of Service
        </h1>
        <p className="text-muted-foreground text-sm">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
      </header>

      <div className="prose-custom">
        <p>This is a standard terms of service template. Modify it to suit your actual business practices.</p>
        
        <h2>1. Terms</h2>
        <p>By accessing this website, you are agreeing to be bound by these website Terms and Conditions of Use, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.</p>
        
        <h2>2. Use License</h2>
        <p>Permission is granted to temporarily download one copy of the materials (information or software) on this website for personal, non-commercial transitory viewing only.</p>
      </div>
    </article>
  );
}
