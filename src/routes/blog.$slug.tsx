import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  BLOG_POSTS,
  getPostBySlug,
  formatDate,
  type ContentBlock,
} from "@/data/blog-posts";

export const Route = createFileRoute("/blog/$slug")({
  component: BlogPostPage,
  loader: ({ params }) => {
    const post = getPostBySlug(params.slug);
    if (!post) throw notFound();
    return post;
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.title} — Screenfast Blog` },
          { name: "description", content: loaderData.excerpt },
        ]
      : [],
  }),
});

function renderBlock(block: ContentBlock, i: number) {
  switch (block.type) {
    case "p":
      return (
        <p key={i} className="mb-4 text-base leading-relaxed text-foreground/90">
          {block.text}
        </p>
      );
    case "h2":
      return (
        <h2 key={i} className="mb-3 mt-10 text-2xl font-semibold">
          {block.text}
        </h2>
      );
    case "h3":
      return (
        <h3 key={i} className="mb-2 mt-8 text-xl font-semibold">
          {block.text}
        </h3>
      );
    case "list":
      return (
        <ul key={i} className="mb-4 list-disc space-y-2 pl-6">
          {block.items.map((item, j) => (
            <li key={j}>{item}</li>
          ))}
        </ul>
      );
    case "quote":
      return (
        <blockquote
          key={i}
          className="my-6 border-l-4 border-primary pl-4 italic text-foreground/80"
        >
          {block.text}
        </blockquote>
      );
    default:
      return null;
  }
}

function BlogPostPage() {
  const post = Route.useLoaderData();
  const related = BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <article className="mx-auto max-w-2xl px-4 py-16">
      <Link
        to="/blog"
        className="mb-8 inline-block text-sm text-muted-foreground hover:text-foreground"
      >
        ← Back to blog
      </Link>

      <div className="mb-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <span>{post.emoji}</span>
        <span>{post.category}</span>
        <span>•</span>
        <span>{formatDate(post.date)}</span>
        <span>•</span>
        <span>{post.readTime}</span>
      </div>

      <h1 className="mb-8 text-3xl font-bold md:text-4xl">{post.title}</h1>

      <div>{post.content.map(renderBlock)}</div>

      {related.length > 0 && (
        <div className="mt-16 border-t border-border pt-8">
          <h3 className="mb-4 text-lg font-semibold">Read next</h3>
          <div className="space-y-3">
            {related.map((p) => (
              <Link
                key={p.slug}
                to="/blog/$slug"
                params={{ slug: p.slug }}
                className="block hover:underline"
              >
                {p.emoji} {p.title}
              </Link>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
