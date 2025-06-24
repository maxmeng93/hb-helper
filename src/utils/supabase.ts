import { createClient } from '@supabase/supabase-js';

// 从环境变量获取Supabase配置
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('缺少Supabase配置，请检查 .env 文件中的 REACT_APP_SUPABASE_URL 和 REACT_APP_SUPABASE_ANON_KEY');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 文章接口定义
export interface Article {
  id: string;
  title: string;
  created_at: string;
}

// 获取最新的5篇文章
export async function getLatestArticles(): Promise<Article[]> {
  const { data, error } = await supabase
    .from('articles')
    .select('id, title, created_at')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('获取最新文章失败:', error);
    return [];
  }

  return data || [];
}

// 获取随机5篇推荐文章
export async function getRecommendedArticles(): Promise<Article[]> {
  try {
    // 先获取文章总数
    const { count, error: countError } = await supabase
      .from('articles')
      .select('*', { count: 'exact', head: true })
      .eq('is_published', true);

    if (countError || !count) {
      console.error('获取文章总数失败:', countError);
      return [];
    }

    if (count <= 5) {
      // 如果总数少于等于5篇，直接返回所有文章
      const { data, error: allArticlesError } = await supabase
        .from('articles')
        .select('id, title, created_at')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (allArticlesError) {
        console.error('获取所有文章失败:', allArticlesError);
        return [];
      }

      return data || [];
    }

    // 随机选择起始位置
    const randomStart = Math.floor(Math.random() * Math.max(1, count - 20));
    
    // 获取连续的20篇文章
    const { data: articles, error: articlesError } = await supabase
      .from('articles')
      .select('id, title, created_at')
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .range(randomStart, randomStart + 19);

    if (articlesError) {
      console.error('获取推荐文章失败:', articlesError);
      return [];
    }

    if (!articles || articles.length === 0) {
      return [];
    }

    // 从20篇中随机选择5篇
    const shuffled = [...articles].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 5);
  } catch (error) {
    console.error('获取推荐文章时出错:', error);
    return [];
  }
}