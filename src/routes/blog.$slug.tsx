import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import { getPostBySlug } from '../lib/mdx';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowLeft, Clock, Calendar, Hash } from 'lucide-react';

export const Route = createFileRoute('/blog/$slug')({
  component: BlogPost,
  loader: async ({ params }) => {
    const post = getPostBySlug(params.slug);
    if (!post) {
      throw notFound();
    }
    return { post };
  },
  head: ({ loaderData }) => ({
    meta: loaderData?.post
      ? [
          { title: `${loaderData.post.meta.title} — Anurag Sharma` },
          { name: 'description', content: loaderData.post.meta.description },
        ]
      : [],
  }),
});

function BlogPost() {
  const { post } = Route.useLoaderData();

  return (
    <article className="mx-auto w-full max-w-[65ch] py-8 lg:py-16 animate-hero">
      <Link 
        to="/" 
        className="inline-block text-sm text-muted-foreground hover:text-foreground transition-colors mb-12 font-medium"
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
                src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNGQkZBRjgiLz48Y2lyY2xlIGN4PSI1MCUiIGN5PSI0NSUiIHI9IjI1JSIgZmlsbD0iI0U0RTJERCIvPjxjaXJjbGUgY3g9IjUwJSIgY3k9IjExMCUiIHI9IjQ1JSIgZmlsbD0iI0U0RTJERCIvPjwvc3ZnPg==" 
                alt="Anurag Sharma" 
                className="w-full h-full object-cover grayscale"
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

      {post.meta.coverImage && (
        <figure className="mb-16 overflow-hidden bg-muted border border-border aspect-[2/1] w-full">
          <img 
            src={post.meta.coverImage} 
            alt={`Cover image for ${post.meta.title}`}
            className="w-full h-full object-cover" 
          />
        </figure>
      )}

      <div className="prose-custom">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {post.content}
        </ReactMarkdown>
      </div>

      <footer className="mt-24 pt-8 border-t border-border">
        <div className="flex items-center gap-4 text-sm text-muted-foreground font-mono mb-12">
          <span>Tags:</span>
          <div className="flex gap-2">
            {post.meta.tags?.map((tag) => (
              <span key={tag} className="px-2 py-0.5 bg-muted text-foreground border border-border">
                {tag}
              </span>
            ))}
          </div>
        </div>
        
        <div className="p-8 border border-border bg-background flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
          <div>
            <h3 className="font-serif text-2xl font-medium mb-2 text-foreground tracking-tight">Stay updated</h3>
            <p className="text-muted-foreground text-sm max-w-[35ch]">Join the newsletter for occasional thoughts on engineering and design.</p>
          </div>
          <form className="flex w-full sm:w-auto" onSubmit={(e) => e.preventDefault()}>
            <input 
              type="email" 
              placeholder="anuragf863@gmail.com"
              className="bg-transparent border-b border-border py-2 px-1 focus:outline-none focus:border-foreground transition-colors placeholder:text-muted-foreground/50 w-full sm:w-48 text-sm"
              required
            />
            <button 
              type="submit" 
              className="font-medium text-sm text-accent hover:text-foreground transition-colors py-2 px-4 shrink-0"
            >
              Subscribe
            </button>
          </form>
        </div>
      </footer>
    </article>
  );
}
