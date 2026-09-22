import { createFileRoute } from '@tanstack/react-router';
import { Mail, Github, Twitter } from 'lucide-react';

export const Route = createFileRoute('/about')({
  component: About,
  head: () => ({
    meta: [{ title: 'About — Screenfast' }],
  }),
});

function About() {
  return (
    <article className="mx-auto w-full max-w-[65ch] py-8 lg:py-12 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <header className="mb-12 md:mb-16">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium tracking-tight leading-[1.1] mb-6 text-balance">
          About
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground text-balance">
          I build products that feel good to use. This is where I write about the process.
        </p>
      </header>

      <div className="prose-custom">
        <p>
          I'm a product designer and engineer. I've spent the last decade working on tools that help teams build software faster. Currently, I'm focusing on the intersection of artificial intelligence and interface design.
        </p>
        
        <h2>Why this site exists</h2>
        
        <p>
          Most technical blogs are either too dry or too focused on SEO hacking. I wanted a place to share genuine thoughts on design, engineering, and the subtle details that make software great. No growth hacks, no popups, just good typography and careful thought.
        </p>
        
        <p>
          The design system here is intentionally minimal. It relies almost entirely on the typographic scale to establish hierarchy. If you notice a detail you like, feel free to inspect the source.
        </p>
      </div>

      <div className="mt-16 pt-8 border-t border-border/40 flex flex-col gap-4">
        <h3 className="font-medium text-foreground">Connect</h3>
        <div className="flex items-center gap-6">
          <a href="#" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <Twitter className="h-4 w-4" />
            Twitter
          </a>
          <a href="#" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <Github className="h-4 w-4" />
            GitHub
          </a>
          <a href="#" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <Mail className="h-4 w-4" />
            Email
          </a>
        </div>
      </div>
    </article>
  );
}
