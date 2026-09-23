import { createFileRoute, Link } from '@tanstack/react-router';
import { getPosts, type PostMeta } from '../lib/mdx';

export const Route = createFileRoute('/tags/$tag')({
  component: TagPage,
  loader: async ({ params }) => {
    const allPosts = await getPosts();
    const tagPosts = allPosts.filter(post => post.tags.includes(params.tag));
    return { posts: tagPosts, tag: params.tag };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.tag || 'Tag'} — Anurag Sharma` },
    ],
  }),
});

function TagPage() {
  const { posts, tag } = Route.useLoaderData();

  return (
    <div className="py-12 lg:py-20 animate-hero">
      <header className="mb-16">
        <Link 
          to="/" 
          className="inline-block text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 font-medium"
        >
          Index
        </Link>
        <h1 className="text-4xl md:text-5xl font-serif font-medium tracking-tight leading-[1.05] mb-6 text-foreground capitalize">
          {tag}
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground text-balance">
          {posts.length} {posts.length === 1 ? 'essay' : 'essays'} on {tag}.
        </p>
      </header>

      {posts.length === 0 ? (
        <div className="py-24 text-center text-muted-foreground border border-border rounded-sm bg-muted/10">
          No posts found for this tag.
        </div>
      ) : (
        <div className="flex flex-col border-l border-border pl-8 md:pl-12">
          {posts.map((post) => (
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
      )}
    </div>
  );
}
