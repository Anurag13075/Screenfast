import { createFileRoute, Link } from '@tanstack/react-router';
import { getPosts, type PostMeta } from '../lib/mdx';

export const Route = createFileRoute('/')({
  component: Index,
  loader: async () => {
    // In TanStack Start loader runs on server, getPosts uses Node APIs
    const posts = getPosts();
    return { posts };
  },
});

function Index() {
  const { posts } = Route.useLoaderData();

  return (
    <div className="flex flex-col gap-12 pb-16 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <section className="space-y-6 pt-6 pb-12">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif tracking-tight text-balance font-normal leading-tight">
          Designing systems <br className="hidden md:block"/> that build themselves.
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-[50ch] text-balance">
          Thoughts on product design, frontend engineering, and building minimal, resilient software.
        </p>
      </section>

      <section>
        <div className="flex flex-col gap-8">
          {posts.map((post: PostMeta) => (
            <article 
              key={post.slug} 
              className="group relative flex flex-col items-start justify-between gap-4 py-8 border-t border-border/50 transition-colors hover:border-foreground/30 sm:flex-row sm:items-baseline"
            >
              <div className="flex-1 space-y-2">
                <Link
                  to="/blog/$slug"
                  params={{ slug: post.slug }}
                  className="block group-hover:underline decoration-border underline-offset-4"
                >
                  <h2 className="text-2xl font-serif font-medium tracking-tight text-foreground transition-colors group-hover:text-primary">
                    {post.title}
                  </h2>
                </Link>
                <p className="text-muted-foreground line-clamp-2 max-w-[60ch] leading-relaxed">
                  {post.description}
                </p>
              </div>
              
              <div className="flex shrink-0 items-center gap-4 text-sm text-muted-foreground sm:text-right">
                <time dateTime={post.date}>
                  {new Date(post.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </time>
                <span className="hidden sm:inline-block">·</span>
                <span className="hidden sm:inline-block">{post.readingTime}</span>
              </div>
            </article>
          ))}
          {posts.length === 0 && (
            <p className="text-muted-foreground py-12 border-t border-border/50">No posts found. Create some in the /content folder.</p>
          )}
        </div>
      </section>
    </div>
  );
}
