import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

export type NewsPost = {
  title: string;
  date: string;
  body: string;
};

const NEWS_DIR = path.join(process.cwd(), 'content', 'news');

export function getLatestNews(): NewsPost | null {
  const files = fs.readdirSync(NEWS_DIR).filter((f) => f.endsWith('.md'));
  if (files.length === 0) return null;

  const posts = files.map((file) => {
    const raw = fs.readFileSync(path.join(NEWS_DIR, file), 'utf8');
    const { data, content } = matter(raw);
    return { title: data.title, date: data.date, body: content.trim() } satisfies NewsPost;
  });

  posts.sort((a, b) => (a.date < b.date ? 1 : -1));
  return posts[0];
}
