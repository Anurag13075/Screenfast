import { createFileRoute, Link } from '@tanstack/react-router';
import { Mail, Github, Twitter } from 'lucide-react';

export const Route = createFileRoute('/about')({
  component: About,
  head: () => ({
    meta: [{ title: 'About — Anurag' }],
  }),
});

function About() {
  return (
    <article className="mx-auto w-full max-w-[65ch] py-12 lg:py-20 animate-hero">
      <header className="mb-16">
        <h1 className="text-4xl md:text-5xl font-serif font-medium tracking-tight leading-[1.05] mb-6 text-foreground">
          About
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground text-balance">
          I build products that feel good to use. This is where I write about the process.
        </p>
      </header>

      <div className="flex flex-col md:flex-row gap-8 mb-16">
        <div className="shrink-0">
          <div className="w-32 h-32 md:w-48 md:h-48 rounded-sm bg-muted border border-border overflow-hidden">
            {/* Real avatar */}
            <img 
              src="/avatar.jpg" 
              alt="Anurag" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <div className="prose-custom max-w-none mt-0">
          <p>
            Hi, I'm Anurag Sharma — a third-year CS student and solo product designer/engineer. Over the past few years I've been building and shipping AI-powered tools, mostly by myself, mostly in public. Currently, I'm focusing on the intersection of artificial intelligence and interface design.
          </p>
          <p>
            I've built and shipped several solo SaaS products—<a href="https://breeze-ochre.vercel.app" target="_blank" rel="noopener noreferrer">Breeze</a>, an AI-powered document editor; <a href="https://pencil-sketchpad.vercel.app" target="_blank" rel="noopener noreferrer">Pencil</a>, an infinite canvas for technical diagrams; and <a href="https://unfold-zeta-one.vercel.app" target="_blank" rel="noopener noreferrer">Undrop</a>, an AI recovery tool for Razorpay merchants. I know what it takes to take a product from zero to one, and from one to a hundred.
          </p>
        </div>
      </div>

      <div className="prose-custom">
        <h2>Why this site exists</h2>
        
        <p>
          Most technical blogs are either too dry or too focused on SEO hacking. I wanted a place to share genuine thoughts on design, engineering, and the subtle details that make software great. Just good typography, clear performance, and careful thought.
        </p>
        
        <p>
          The design system here is intentionally minimal. It relies almost entirely on the typographic scale to establish hierarchy, utilizing Fraunces for display and IBM Plex Sans for technical details. If you notice a detail you like, feel free to inspect the source.
        </p>
      </div>

      <div className="mt-16 pt-8 border-t border-border flex flex-col gap-4">
        <h3 className="font-serif text-xl font-medium text-foreground">Connect</h3>
        <div className="flex items-center gap-6">
          <a href="https://twitter.com/AnuragShar74342" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-accent transition-colors">
            <Twitter className="h-4 w-4" />
            Twitter
          </a>
          <a href="https://github.com/Anurag13075" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-accent transition-colors">
            <Github className="h-4 w-4" />
            GitHub
          </a>
          <Link to="/contact" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-accent transition-colors">
            <Mail className="h-4 w-4" />
            Email
          </Link>
        </div>
      </div>
    </article>
  );
}
