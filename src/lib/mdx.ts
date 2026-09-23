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
// This ensures they are bundled correctly when deploying to Edge/Serverless environments (like Cloudflare or Vercel).
const postsModules = import.meta.glob('../../content/*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

export function getPosts(): PostMeta[] {
  const posts = Object.entries(postsModules).map(([filePath, source]) => {
    // filePath looks like '../../content/why-react-is-slow.md'
    const fileName = filePath.split('/').pop() || '';
    const slug = fileName.replace(/\.mdx?$/, '');
    
    // source is the raw string content of the file
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

  // Sort by date descending
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPostBySlug(slug: string): Post | null {
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
}
