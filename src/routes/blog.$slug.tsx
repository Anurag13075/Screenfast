import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import { getPostBySlug } from '../lib/mdx';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowRight, Check, Copy } from 'lucide-react';
import { useState, useEffect } from 'react';
import { HighlightShare } from '@/components/HighlightShare';

export const Route = createFileRoute('/blog/$slug')({
  component: BlogPost,
  loader: async ({ params }) => {
    const post = await getPostBySlug({ data: params.slug });
    if (!post) {
      throw notFound();
    }
    return { post };
  },
  head: ({ loaderData }) => {
    if (!loaderData?.post) return { meta: [] };
    const { post } = loaderData;
    const ogImageUrl = `https://og.tailgraph.com/og?fontFamily=Fraunces&title=${encodeURIComponent(post.meta.title)}&bgUrl=${encodeURIComponent("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2400&auto=format&fit=crop")}`;
    
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": post.meta.title,
      "datePublished": post.meta.date,
      "dateModified": post.meta.date,
      "image": ogImageUrl,
      "author": [{
          "@type": "Person",
          "name": "Anurag Sharma",
          "url": "https://screenfast.site/about"
        }],
      "description": post.meta.description
    };
    return {
      meta: [
        { title: `${post.meta.title} — Anurag Sharma` },
        { name: 'description', content: post.meta.description },
        { property: 'og:title', content: post.meta.title },
        { property: 'og:description', content: post.meta.description },
        { property: 'og:image', content: ogImageUrl },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:image', content: ogImageUrl },
      ],
      scripts: [
        {
          type: 'application/ld+json',
          children: JSON.stringify(jsonLd)
        }
      ]
    };
  },
});

function ProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight > 0) {
        const scrolled = (window.scrollY / scrollHeight) * 100;
        setProgress(Math.min(100, Math.max(0, scrolled)));
      }
    };
    window.addEventListener('scroll', updateProgress);
    updateProgress();
    return () => window.removeEventListener('scroll', updateProgress);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-[2px] z-50 bg-transparent">
      <div 
        className="h-full bg-accent transition-all duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

function CopyCodeButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="absolute top-3 right-3 p-1.5 rounded-sm bg-foreground/10 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
      aria-label="Copy code"
    >
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
    </button>
  );
}

function BlogPost() {
  const { post } = Route.useLoaderData();
  const [activeId, setActiveId] = useState<string>('');

  // Intersection observer for ToC highlighting
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '0px 0px -80% 0px' }
    );

    const headings = document.querySelectorAll('h2, h3');
    headings.forEach((heading) => observer.observe(heading));

    return () => headings.forEach((heading) => observer.unobserve(heading));
  }, [post.content]);

  return (
    <>
      <ProgressBar />
      <HighlightShare />
      
      <div className="mx-auto w-full max-w-7xl relative grid grid-cols-1 lg:grid-cols-[1fr_minmax(auto,65ch)_1fr] gap-12 py-8 lg:py-16 animate-hero">
        
        {/* Left padding / Back Link on Desktop */}
        <div className="hidden lg:flex flex-col items-end pt-2 text-sm">
          <Link 
            to="/" 
            className="text-muted-foreground hover:text-foreground transition-colors font-medium sticky top-24"
          >
            Index
          </Link>
        </div>

        {/* Main Content */}
        <article className="w-full">
          {/* Mobile Back Link */}
          <Link 
            to="/" 
            className="lg:hidden inline-block text-sm text-muted-foreground hover:text-foreground transition-colors mb-12 font-medium"
          >
            Index
          </Link>

          <header className="mb-16">
            <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-serif font-medium tracking-tight leading-[1.05] mb-8 text-balance text-foreground">
              {post.meta.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground font-mono">
              <div className="flex items-center gap-3">
                <div className="h-6 w-6 rounded-sm bg-muted overflow-hidden border border-border">
                  <img 
                    src="/avatar.jpg" 
                    alt="Anurag Sharma" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="font-medium text-foreground font-sans">Anurag Sharma</span>
              </div>
              <time dateTime={post.meta.date}>
                {new Date(post.meta.date).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </time>
              <span>{post.meta.readingTime}</span>
            </div>
          </header>

          <div className="prose-custom">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                h2: ({ node, children, ...props }) => {
                  const id = children?.toString().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                  return <h2 id={id} {...props}>{children}</h2>;
                },
                h3: ({ node, children, ...props }) => {
                  const id = children?.toString().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                  return <h3 id={id} {...props}>{children}</h3>;
                },
                code: ({ node, inline, className, children, ...props }: any) => {
                  const match = /language-(\w+)/.exec(className || '');
                  const codeString = String(children).replace(/\n$/, '');
                  if (!inline && match) {
                    return (
                      <div className="relative group">
                        <CopyCodeButton text={codeString} />
                        <code className={className} {...props}>
                          {children}
                        </code>
                      </div>
                    );
                  }
                  return <code className={className} {...props}>{children}</code>;
                }
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>

          <div className="mt-24 pt-12 border-t border-border">
            <div className="flex flex-col md:flex-row gap-8 items-start justify-between">
              <div className="max-w-md">
                <h3 className="font-serif text-2xl font-medium text-foreground mb-3">Newsletter</h3>
                <p className="text-muted-foreground text-sm mb-6">
                  Occasional essays on engineering, design, and building resilient systems. No spam.
                </p>
                <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
                  <input 
                    type="email" 
                    placeholder="anuragf863@gmail.com" 
                    className="flex-1 bg-background border border-border rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-accent transition-colors"
                  />
                  <button type="submit" className="bg-foreground text-background px-4 py-2 rounded-sm text-sm font-medium hover:opacity-90 transition-opacity">
                    Subscribe
                  </button>
                </form>
              </div>
            </div>
          </div>
          
          {/* Read Next */}
          {post.nextPost && (
            <div className="mt-16 pt-12 border-t border-border">
              <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground block mb-6">
                Read Next
              </span>
              <Link 
                to={`/blog/${post.nextPost.slug}`}
                className="group block border border-border bg-muted/30 hover:bg-muted p-8 rounded-sm transition-colors"
              >
                <h3 className="font-serif text-2xl text-foreground mb-3 group-hover:text-accent transition-colors">
                  {post.nextPost.title}
                </h3>
                <p className="text-muted-foreground">
                  {post.nextPost.description}
                </p>
                <div className="mt-6 flex items-center gap-2 text-sm font-medium text-accent">
                  Read article <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            </div>
          )}
        </article>

        {/* Right Sidebar / ToC on Desktop */}
        <div className="hidden lg:block relative text-sm">
          {post.headings.length > 0 && (
            <div className="sticky top-24 pl-6 border-l border-border/50">
              <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground block mb-6">
                On this page
              </span>
              <ul className="space-y-3">
                {post.headings.map((heading, i) => (
                  <li key={i} style={{ paddingLeft: `${(heading.depth - 2) * 1}rem` }}>
                    <a 
                      href={`#${heading.id}`}
                      className={`block transition-colors hover:text-foreground ${
                        activeId === heading.id 
                          ? 'text-accent font-medium' 
                          : 'text-muted-foreground'
                      }`}
                    >
                      {heading.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
