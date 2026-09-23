import { createFileRoute, Link } from '@tanstack/react-router';
import { getPosts, type PostMeta } from '../lib/mdx';

export const Route = createFileRoute('/')({
  component: Index,
  loader: async () => {
    const posts = getPosts();
    return { posts };
  },
});

function Index() {
  const { posts } = Route.useLoaderData();
  const featuredPost = posts[0];
  const regularPosts = posts.slice(1);

  return (
    <div className="flex flex-col gap-24 pb-16">
      <section className="pt-8 md:pt-16 pb-4 animate-hero">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-serif font-medium tracking-tight text-foreground leading-[1.05] text-balance mb-6">
            Building resilient software, one deliberate constraint at a time.
          </h1>
          <p className="text-lg text-muted-foreground text-balance max-w-[55ch] leading-relaxed mb-10">
            I'm Anurag. I engineer local-first web applications, infinite canvases, and automated systems. This is my notebook on architecture, interface design, and scaling solo products.
          </p>
          
          <form className="flex flex-col sm:flex-row gap-3 max-w-md items-start sm:items-center" onSubmit={(e) => e.preventDefault()}>
            <input 
              type="email" 
              placeholder="Join the newsletter"
              className="flex-1 bg-transparent border-b border-border py-2 px-1 focus:outline-none focus:border-foreground transition-colors placeholder:text-muted-foreground/60 w-full sm:w-auto"
              required
            />
            <button 
              type="submit" 
              className="font-medium text-sm text-accent hover:text-foreground transition-colors py-2 px-1"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>

      {featuredPost && (
        <section className="animate-hero" style={{ animationDelay: '100ms' }}>
          <h2 className="text-xs uppercase tracking-widest text-muted-foreground mb-6 font-medium">Latest Entry</h2>
          <Link to="/blog/$slug" params={{ slug: featuredPost.slug }} className="group block">
            <article className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              {featuredPost.coverImage ? (
                <div className="md:col-span-7 overflow-hidden bg-muted aspect-[4/3] w-full">
                  <img 
                    src={featuredPost.coverImage} 
                    alt="" 
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                </div>
              ) : (
                <div className="md:col-span-7 overflow-hidden bg-muted aspect-[4/3] w-full border border-border flex items-center justify-center relative">
                  <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiNmZmYiPjwvcmVjdD48Y2lyY2xlIGN4PSI0IiBjeT0iNCIgcj0iMSIgZmlsbD0iIzAwMCI+PC9jaXJjbGU+PC9zdmc+')] mix-blend-overlay"></div>
                  <span className="font-serif text-3xl text-muted-foreground/30">{featuredPost.title.substring(0,1)}</span>
                </div>
              )}
              <div className="md:col-span-5 flex flex-col justify-center h-full space-y-4">
                <time className="text-sm text-muted-foreground font-mono">{featuredPost.date}</time>
                <h3 className="text-3xl font-serif font-medium text-foreground leading-tight group-hover:text-accent transition-colors">
                  {featuredPost.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed text-balance">
                  {featuredPost.description}
                </p>
                <span className="text-sm font-medium text-accent pt-4 block group-hover:translate-x-1 transition-transform">
                  Read article
                </span>
              </div>
            </article>
          </Link>
        </section>
      )}

      <section className="animate-hero" style={{ animationDelay: '200ms' }}>
        <div className="flex items-baseline justify-between mb-8 border-b border-border pb-4">
          <h2 className="text-xl font-serif font-medium text-foreground">Archive</h2>
          <span className="text-sm text-muted-foreground font-mono">{posts.length} posts</span>
        </div>
        
        <div className="flex flex-col">
          {regularPosts.map((post: PostMeta) => (
            <article 
              key={post.slug} 
              className="group border-b border-border py-6 first:pt-0 last:border-0"
            >
              <Link
                to="/blog/$slug"
                params={{ slug: post.slug }}
                className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 items-baseline"
              >
                <div className="md:col-span-2">
                  <time dateTime={post.date} className="text-sm text-muted-foreground font-mono">
                    {new Date(post.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: '2-digit',
                      year: 'numeric',
                    })}
                  </time>
                </div>
                
                <div className="md:col-span-10 flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-6">
                  <h3 className="text-lg font-medium text-foreground group-hover:text-accent transition-colors sm:w-[45%] shrink-0 text-balance leading-snug">
                    {post.title}
                  </h3>
                  <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">
                    {post.description}
                  </p>
                </div>
              </Link>
            </article>
          ))}
          {posts.length === 0 && (
            <p className="text-muted-foreground py-8">No posts found. Create some in the /content folder.</p>
          )}
        </div>
      </section>
    </div>
  );
}
