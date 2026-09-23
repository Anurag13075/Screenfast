import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/privacy')({
  component: Privacy,
  head: () => ({
    meta: [{ title: 'Privacy Policy — Anurag' }],
  }),
});

function Privacy() {
  return (
    <article className="mx-auto w-full max-w-[65ch] py-12 lg:py-20 animate-hero">
      <header className="mb-16 border-b border-border pb-8">
        <h1 className="text-4xl md:text-5xl font-serif font-medium tracking-tight leading-[1.05] mb-6 text-foreground">
          Privacy Policy
        </h1>
        <p className="text-muted-foreground font-mono text-sm">Last Updated: September 23, 2026</p>
      </header>

      <div className="prose-custom max-w-none">
        <h2>Introduction</h2>
        <p>
          This privacy policy explains how information is collected, used, and disclosed by this website. By visiting this site, you agree to the collection and use of information in relation to this policy.
        </p>

        <h2>Information Collection and Use</h2>
        <p>
          When you use this website, certain information is collected automatically. This includes your IP address, browser type, operating system, and data regarding your interaction with the site (such as pages visited and time spent on those pages).
        </p>

        <h2>Cookies and Analytics</h2>
        <p>
          This website uses cookies—small data files stored on your device—to improve user experience, analyze site traffic, and understand where our audience is coming from.
        </p>
        <p>
          We use third-party analytics services (such as Google Analytics) to monitor and analyze the use of our service. These third parties have access to your personal data only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.
        </p>

        <h2>Advertising and Third-Party Vendors</h2>
        <p>
          Third-party vendors, including Google, use cookies to serve ads based on a user's prior visits to this website or other websites. Google's use of advertising cookies enables it and its partners to serve ads to users based on their visit to this site and/or other sites on the Internet.
        </p>
        <p>
          Users may opt out of personalized advertising by visiting <a href="https://myadcenter.google.com/" target="_blank" rel="noopener noreferrer">Ads Settings</a>.
        </p>

        <h2>Links to Other Sites</h2>
        <p>
          This site may contain links to other sites. If you click on a third-party link, you will be directed to that site. We strongly advise you to review the Privacy Policy of every site you visit, as we have no control over and assume no responsibility for the content or privacy practices of any third-party sites or services.
        </p>

        <h2>Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please contact us via the <a href="/contact">Contact page</a>.
        </p>
      </div>
    </article>
  );
}
