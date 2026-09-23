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

export type Post = {
  meta: PostMeta;
  content: string;
};

// Use Vite's import.meta.glob to eagerly load all markdown files in the content directory as strings
const postsModules = import.meta.glob('../../content/*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

export const getPosts = createServerFn({ method: "GET" }).handler(async () => {
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

    return {
      meta: {
        slug,
        title: data.title || 'Untitled',
        date: data.date || '',
        description: data.description || '',
        tags: data.tags || [],
        readingTime: data.readingTime || '',
        coverImage: data.coverImage,
      },
      content,
    };
  });
