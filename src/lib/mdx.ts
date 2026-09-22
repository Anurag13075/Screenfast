import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const contentDir = path.join(process.cwd(), 'content');

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

export function getPosts(): PostMeta[] {
  if (!fs.existsSync(contentDir)) {
    return [];
  }
  
  const files = fs.readdirSync(contentDir);
  const posts = files
    .filter(file => file.endsWith('.md') || file.endsWith('.mdx'))
    .map(file => {
      const filePath = path.join(contentDir, file);
      const source = fs.readFileSync(filePath, 'utf8');
      const { data } = matter(source);

      return {
        slug: file.replace(/\.mdx?$/, ''),
        title: data.title || 'Untitled',
        date: data.date || '',
        description: data.description || '',
        tags: data.tags || [],
        readingTime: data.readingTime || '',
        coverImage: data.coverImage,
      };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return posts;
}

export function getPostBySlug(slug: string): Post | null {
  try {
    const fullPath = path.join(contentDir, `${slug}.md`);
    const mdxPath = path.join(contentDir, `${slug}.mdx`);
    
    let source = '';
    if (fs.existsSync(fullPath)) {
      source = fs.readFileSync(fullPath, 'utf8');
    } else if (fs.existsSync(mdxPath)) {
      source = fs.readFileSync(mdxPath, 'utf8');
    } else {
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
  } catch (error) {
    console.error(`Error reading post ${slug}:`, error);
    return null;
  }
}
