import { createFileRoute, Link } from "@tanstack/react-router";
import { BLOG_POSTS, formatDate } from "@/data/blog-posts";

export const Route = createFileRoute("/blog")({
  component: BlogIndexPage,
  head: () => ({
    meta: [
      { title: "Blog — Screenfast" },
      {
        name: "description",
        content:
          "Guides on AI-powered UI design, design systems, and shipping app screens fast without a design team.",
      },
    ],
  }),
});

function BlogIndexPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-semibold mb-2">Blog</h1>
      <p className="text-muted-foreground mb-10">
        Notes on AI-powered UI design, design systems, and shipping products
        fast.
      </p>

      <div className="space-y-6">
        {BLOG_POSTS.map((post) => (
          <Link
            key={post.slug}
            to="/blog/$slug"
            params={{ slug: post.slug }}
            className="block rounded-lg border border-border p-5 transition-colors hover:border-primary"
          >
            <div className="mb-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span>{post.emoji}</span>
              <span>{post.category}</span>
              <span>•</span>
              <span>{formatDate(post.date)}</span>
              <span>•</span>
              <span>{post.readTime}</span>
            </div>
            <h2 className="mb-1 text-xl font-medium">{post.title}</h2>
            <p className="text-muted-foreground">{post.excerpt}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
