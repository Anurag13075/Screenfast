import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITE_URL = 'https://screenfast.site';
const contentDir = path.join(__dirname, '../content');
const publicDir = path.join(__dirname, '../public');

function generateSitemap() {
  const files = fs.readdirSync(contentDir).filter(file => file.endsWith('.md') || file.endsWith('.mdx'));
  
  const posts = files.map(file => {
    const raw = fs.readFileSync(path.join(contentDir, file), 'utf-8');
    const { data } = matter(raw);
    const slug = file.replace(/\.mdx?$/, '');
    return {
      slug,
      date: data.date || new Date().toISOString().split('T')[0]
    };
  });

  const tags = Array.from(new Set(posts.flatMap(p => p.tags)));

  // Sort by date desc
  posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${SITE_URL}/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${SITE_URL}/contact</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
${tags.map(tag => `  <url>
    <loc>${SITE_URL}/tags/${tag}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}
${posts.map(post => `  <url>
    <loc>${SITE_URL}/blog/${post.slug}</loc>
    <lastmod>${post.date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`).join('\n')}
</urlset>`;

  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemap);
  console.log(`✅ Generated sitemap.xml with ${posts.length + 3} pages.`);
}

generateSitemap();
