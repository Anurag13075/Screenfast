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
          { title: `${loaderData.post.meta.title} — Screenfast` },
          { name: 'description', content: loaderData.post.meta.description },
        ]
      : [],
  }),
});

function BlogPost() {
  const { post } = Route.useLoaderData();

  return (
    <article className="mx-auto w-full max-w-[65ch] py-8 lg:py-12 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <Link 
        to="/" 
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 md:mb-12 group"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        Back to writing
      </Link>

      <header className="mb-12 md:mb-16">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium tracking-tight leading-[1.1] mb-6 text-balance">
          {post.meta.title}
        </h1>
        
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-border/50 overflow-hidden">
              {/* Optional avatar could go here */}
              <div className="h-full w-full bg-foreground/10" />
            </div>
            <span className="font-medium text-foreground">Author Name</span>
          </div>
          <span>·</span>
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            <time dateTime={post.meta.date}>
              {new Date(post.meta.date).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </time>
          </div>
          <span>·</span>
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            <span>{post.meta.readingTime}</span>
          </div>
        </div>
      </header>

      {post.meta.coverImage && (
        <figure className="mb-12 -mx-6 md:-mx-12 overflow-hidden rounded-xl border border-border/50 bg-muted/50">
          <img 
            src={post.meta.coverImage} 
            alt={`Cover image for ${post.meta.title}`}
            className="w-full aspect-[2/1] object-cover" 
          />
        </figure>
      )}

      <div className="prose-custom">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {post.content}
        </ReactMarkdown>
      </div>

      <footer className="mt-20 pt-8 border-t border-border/40">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Hash className="h-4 w-4" />
          <span className="font-medium">Tags:</span>
          <div className="flex gap-2">
            {post.meta.tags?.map((tag) => (
              <span key={tag} className="px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground text-xs font-medium">
                {tag}
              </span>
            ))}
          </div>
        </div>
        
        <div className="bg-secondary/50 rounded-xl p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between border border-border/40">
          <div>
            <h3 className="font-serif text-xl mb-1 text-foreground">Enjoyed this post?</h3>
            <p className="text-muted-foreground text-sm">Follow along for more thoughts on design and engineering.</p>
          </div>
          <button className="bg-foreground text-background px-4 py-2 rounded-lg text-sm font-medium hover:bg-foreground/90 transition-colors whitespace-nowrap">
            Copy link
          </button>
        </div>
      </footer>
    </article>
  );
}
