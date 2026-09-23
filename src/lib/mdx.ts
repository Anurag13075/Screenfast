import { createServerFn } from "@tanstack/react-start";
import matter from 'gray-matter';

export type PostMeta = {
  slug: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
  readingTime: string;
  coverImage?: string;
};

export type TocItem = {
  depth: number;
  text: string;
  id: string;
};

export type Post = {
  meta: PostMeta;
  content: string;
  headings: TocItem[];
  nextPost: PostMeta | null;
};

const postsModules = import.meta.glob('../../content/*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

function getAllPostsSync(): PostMeta[] {
  const posts = Object.entries(postsModules).map(([filePath, source]) => {
    const fileName = filePath.split('/').pop() || '';
    const slug = fileName.replace(/\.mdx?$/, '');
    const { data } = matter(source);
    return {
      slug,
      title: data.title || 'Untitled',
      date: data.date || '',
      description: data.description || '',
      tags: data.tags || [],
      readingTime: data.readingTime || '',
      coverImage: data.coverImage,
    };
  });
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export const getPosts = createServerFn({ method: "GET" }).handler(async () => {
  return getAllPostsSync();
});

export const getPostBySlug = createServerFn({ method: "GET" })
  .validator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    const targetFilePath = `../../content/${slug}.md`;
    const source = postsModules[targetFilePath];

    if (!source) {
      return null;
    }

    const { data, content } = matter(source);
    
    // Extract Headings for TOC
    const headings: TocItem[] = [];
    const headingRegex = /(?:^|\n)(#{2,3})\s+(.*)/g;
    let match;
    while ((match = headingRegex.exec(content)) !== null) {
      const depth = match[1].length;
      const text = match[2].replace(/\[|\]|\(.*?\)/g, '').replace(/`/g, '').trim();
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      headings.push({ depth, text, id });
    }

    // Find Next Post
    const allPosts = getAllPostsSync();
    const currentIndex = allPosts.findIndex(p => p.slug === slug);
    const nextPost = currentIndex > 0 ? allPosts[currentIndex - 1] : (allPosts.length > currentIndex + 1 ? allPosts[currentIndex + 1] : null);

    // Calculate true reading time dynamically (200 words per minute)
    const wordCount = content.split(/\s+/).length;
    const dynamicReadingTime = `${Math.ceil(wordCount / 200)} min read`;

    return {
      meta: {
        slug,
        title: data.title || 'Untitled',
        date: data.date || '',
        description: data.description || '',
        tags: data.tags || [],
        readingTime: dynamicReadingTime,
        coverImage: data.coverImage,
      },
      content,
      headings,
      nextPost
    };
  });
