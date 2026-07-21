import { getLatestNews } from '@/lib/news';
import NewsContent from './NewsContent';

export default function News() {
  const post = getLatestNews();
  return <NewsContent initialPost={post} />;
}
