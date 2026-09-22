import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/privacy')({
  component: Privacy,
  head: () => ({
    meta: [{ title: 'Privacy Policy — Screenfast' }],
  }),
});

function Privacy() {
  return (
    <article className="mx-auto w-full max-w-[65ch] py-8 lg:py-12 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <header className="mb-12">
        <h1 className="text-4xl font-serif font-medium tracking-tight mb-4 text-balance">
          Privacy Policy
        </h1>
        <p className="text-muted-foreground text-sm">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
      </header>

      <div className="prose-custom">
        <p>This is a standard privacy policy template. Modify it to suit your actual data collection practices.</p>
        
        <h2>Information we collect</h2>
        <p>We only collect the information you choose to give us, and we process it with your consent, or on another legal basis; we only require the minimum amount of personal information that is necessary to fulfill the purpose of your interaction with us.</p>
        
        <h2>How we use your information</h2>
        <p>We may use the information we collect from you when you register, make a purchase, sign up for our newsletter, respond to a survey or marketing communication, surf the website, or use certain other site features.</p>
      </div>
    </article>
  );
}
