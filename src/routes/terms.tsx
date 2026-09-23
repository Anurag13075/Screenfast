import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/terms')({
  component: Terms,
  head: () => ({
    meta: [{ title: 'Terms of Service — Anurag' }],
  }),
});

function Terms() {
  return (
    <article className="mx-auto w-full max-w-[65ch] py-12 lg:py-20 animate-hero">
      <header className="mb-16 border-b border-border pb-8">
        <h1 className="text-4xl md:text-5xl font-serif font-medium tracking-tight leading-[1.05] mb-6 text-foreground">
          Terms of Service
        </h1>
        <p className="text-muted-foreground font-mono text-sm">Last Updated: September 23, 2026</p>
      </header>

      <div className="prose-custom max-w-none">
        <h2>Acceptance of Terms</h2>
        <p>
          By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by these terms, please do not use this website.
        </p>

        <h2>Intellectual Property Rights</h2>
        <p>
          Unless otherwise stated, all written content, original images, and design elements on this website are the intellectual property of the author. You may not republish, reproduce, or distribute the content without explicit written permission. Code snippets provided within articles are free to use in your own projects unless explicitly stated otherwise.
        </p>

        <h2>Disclaimer of Warranties</h2>
        <p>
          The information and code snippets on this website are provided on an "as is" basis. While we strive to provide accurate and up-to-date information, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, or suitability of the information, products, or services contained on the website for any purpose.
        </p>
        <p>
          Any reliance you place on such information is strictly at your own risk.
        </p>

        <h2>Limitation of Liability</h2>
        <p>
          In no event will we be liable for any loss or damage including without limitation, indirect or consequential loss or damage, or any loss or damage whatsoever arising from loss of data or profits arising out of, or in connection with, the use of this website.
        </p>

        <h2>External Links</h2>
        <p>
          Through this website, you are able to link to other websites which are not under the control of the author. We have no control over the nature, content, and availability of those sites. The inclusion of any links does not necessarily imply a recommendation or endorse the views expressed within them.
        </p>

        <h2>Changes to Terms</h2>
        <p>
          We reserve the right to modify these terms from time to time at our sole discretion. Therefore, you should review these pages periodically. Your continued use of the Website or our service after any such change constitutes your acceptance of the new Terms.
        </p>
      </div>
    </article>
  );
}
