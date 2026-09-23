import { createFileRoute, Link } from '@tanstack/react-router';
import { getPosts, type PostMeta } from '../lib/mdx';

export const Route = createFileRoute('/')({
  component: Index,
  loader: async () => {
    const posts = await getPosts();
    return { posts };
  },
});

function Index() {
  const { posts } = Route.useLoaderData();
  
  if (!posts || posts.length === 0) {
    return <div className="py-24 text-center">No posts found. Add some to /content.</div>;
  }

  // Segment posts for the layout
  const featuredPosts = posts.slice(0, 4);
  const engineeringPosts = posts.filter(p => p.tags?.includes('engineering')).slice(0, 6);
  const designPosts = posts.filter(p => p.tags?.includes('design') || p.tags?.includes('ux')).slice(0, 6);
  
  // Create a Set of featured slugs so we don't repeat them in the archive list below if we wanted to (omitted for now).
  
  return (
    <div className="flex flex-col gap-32 pb-24">
      {/* 1. HERO SECTION */}
      <section className="pt-16 md:pt-32 pb-8 animate-hero">
        <div className="max-w-4xl">
          <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-serif font-medium tracking-tight text-foreground leading-[1.02] text-balance mb-8">
            Building resilient software, one deliberate constraint at a time.
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground text-balance max-w-[45ch] leading-relaxed mb-12">
            I'm Anurag Sharma. I engineer local-first web applications, infinite canvases, and automated systems. This is my notebook on architecture, interface design, and scaling solo products.
          </p>
          
          <form className="flex flex-col sm:flex-row gap-4 max-w-lg items-start sm:items-center p-2 rounded-sm border border-border bg-background shadow-sm hover:border-accent/40 focus-within:border-accent focus-within:ring-1 focus-within:ring-accent transition-all duration-300" onSubmit={(e) => e.preventDefault()}>
            <input 
              type="email" 
              placeholder="anuragf863@gmail.com"
              className="flex-1 bg-transparent py-3 px-4 focus:outline-none text-foreground placeholder:text-muted-foreground w-full sm:w-auto"
              required
            />
            <button 
              type="submit" 
              className="font-medium text-sm bg-foreground text-background hover:bg-accent transition-colors py-3 px-6 rounded-sm w-full sm:w-auto shrink-0"
            >
              Join Newsletter
            </button>
          </form>
        </div>
      </section>

      {/* 2. THE BENTO GRID (Featured) */}
      <section className="animate-hero" style={{ animationDelay: '100ms' }}>
        <div className="flex items-baseline justify-between mb-8 border-b border-border pb-4">
          <h2 className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Featured Writing</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border border border-border">
          {/* Main Featured */}
          {featuredPosts[0] && (
            <Link to="/blog/$slug" params={{ slug: featuredPosts[0].slug }} className="group block md:col-span-2 bg-background p-8 md:p-16 hover:bg-muted/10 transition-colors relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-accent scale-y-0 origin-top group-hover:scale-y-100 transition-transform duration-500"></div>
              <div className="max-w-3xl">
                <time className="text-sm text-muted-foreground font-mono mb-4 block">{featuredPosts[0].date} — {featuredPosts[0].readingTime}</time>
                <h3 className="text-4xl md:text-5xl font-serif font-medium text-foreground leading-tight mb-6 group-hover:text-accent transition-colors text-balance">
                  {featuredPosts[0].title}
                </h3>
                <p className="text-lg text-muted-foreground leading-relaxed text-balance max-w-2xl">
                  {featuredPosts[0].description}
                </p>
              </div>
            </Link>
          )}

          {/* Secondary Featured 1 */}
          {featuredPosts[1] && (
            <Link to="/blog/$slug" params={{ slug: featuredPosts[1].slug }} className="group block bg-background p-8 md:p-12 hover:bg-muted/10 transition-colors relative">
              <time className="text-sm text-muted-foreground font-mono mb-4 block">{featuredPosts[1].date}</time>
              <h3 className="text-2xl md:text-3xl font-serif font-medium text-foreground leading-tight mb-4 group-hover:text-accent transition-colors">
                {featuredPosts[1].title}
              </h3>
              <p className="text-muted-foreground leading-relaxed line-clamp-3">
                {featuredPosts[1].description}
              </p>
            </Link>
          )}

          {/* Secondary Featured 2 */}
          {featuredPosts[2] && (
            <Link to="/blog/$slug" params={{ slug: featuredPosts[2].slug }} className="group block bg-background p-8 md:p-12 hover:bg-muted/10 transition-colors relative">
              <time className="text-sm text-muted-foreground font-mono mb-4 block">{featuredPosts[2].date}</time>
              <h3 className="text-2xl md:text-3xl font-serif font-medium text-foreground leading-tight mb-4 group-hover:text-accent transition-colors">
                {featuredPosts[2].title}
              </h3>
              <p className="text-muted-foreground leading-relaxed line-clamp-3">
                {featuredPosts[2].description}
              </p>
            </Link>
          )}
        </div>
      </section>

      {/* 3. ENGINEERING & SYSTEMS (Sticky Sidebar Layout) */}
      {engineeringPosts.length > 0 && (
        <section className="animate-hero border-t border-border pt-16" style={{ animationDelay: '150ms' }}>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-24">
            <div className="md:col-span-4 lg:col-span-3">
              <div className="sticky top-24">
                <h2 className="text-3xl font-serif font-medium text-foreground mb-4">Engineering</h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Deep dives into systems architecture, frontend performance, local-first syncing, and building resilient SaaS infrastructure.
                </p>
              </div>
            </div>
            
            <div className="md:col-span-8 lg:col-span-9 flex flex-col border-l border-border pl-8 md:pl-12">
              {engineeringPosts.map((post, idx) => (
                <article key={post.slug} className="group py-10 first:pt-0 border-b border-border last:border-0 relative">
                  <span className="absolute -left-[33px] md:-left-[49px] top-[44px] first:top-[4px] w-2 h-px bg-border group-hover:bg-accent group-hover:scale-x-150 transition-all origin-left"></span>
                  <Link to="/blog/$slug" params={{ slug: post.slug }} className="block">
                    <time className="text-xs text-muted-foreground font-mono mb-3 block">
                      {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                    </time>
                    <h3 className="text-2xl font-medium text-foreground group-hover:text-accent transition-colors leading-snug mb-3 max-w-2xl text-balance">
                      {post.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed max-w-2xl line-clamp-2">
                      {post.description}
                    </p>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. DESIGN & EXPERIENCE (Sticky Sidebar Layout) */}
      {designPosts.length > 0 && (
        <section className="animate-hero border-t border-border pt-16" style={{ animationDelay: '200ms' }}>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-24">
            <div className="md:col-span-4 lg:col-span-3">
              <div className="sticky top-24">
                <h2 className="text-3xl font-serif font-medium text-foreground mb-4">Experience</h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Thoughts on user experience, micro-interactions, typography, and building software that feels expensive.
                </p>
              </div>
            </div>
            
            <div className="md:col-span-8 lg:col-span-9 flex flex-col border-l border-border pl-8 md:pl-12">
              {designPosts.map((post) => (
                <article key={post.slug} className="group py-10 first:pt-0 border-b border-border last:border-0 relative">
                  <span className="absolute -left-[33px] md:-left-[49px] top-[44px] first:top-[4px] w-2 h-px bg-border group-hover:bg-accent group-hover:scale-x-150 transition-all origin-left"></span>
                  <Link to="/blog/$slug" params={{ slug: post.slug }} className="block">
                    <time className="text-xs text-muted-foreground font-mono mb-3 block">
                      {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                    </time>
                    <h3 className="text-2xl font-medium text-foreground group-hover:text-accent transition-colors leading-snug mb-3 max-w-2xl text-balance">
                      {post.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed max-w-2xl line-clamp-2">
                      {post.description}
                    </p>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5. FULL ARCHIVE / INDEX (Minimal Row Format) */}
      <section className="animate-hero border-t border-border pt-16" style={{ animationDelay: '250ms' }}>
        <div className="flex items-baseline justify-between mb-8 pb-4">
          <h2 className="text-xl font-serif font-medium text-foreground">Complete Archive</h2>
          <span className="text-sm text-muted-foreground font-mono">{posts.length} entries</span>
        </div>
        
        <div className="flex flex-col border-t border-border">
          {posts.map((post) => (
            <Link
              key={post.slug}
              to="/blog/$slug"
              params={{ slug: post.slug }}
              className="group border-b border-border py-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 hover:bg-muted/30 transition-colors -mx-4 px-4 rounded-sm"
            >
              <time dateTime={post.date} className="text-sm text-muted-foreground font-mono w-28 shrink-0">
                {new Date(post.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: '2-digit',
                  year: 'numeric',
                })}
              </time>
              <h3 className="text-base font-medium text-foreground group-hover:text-accent transition-colors truncate flex-1">
                {post.title}
              </h3>
              <span className="text-sm text-muted-foreground font-mono hidden md:block shrink-0">{post.readingTime}</span>
            </Link>
          ))}
        </div>
      </section>

    </div>
  );
}
