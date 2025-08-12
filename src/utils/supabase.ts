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

    // 生成5个不重复的随机索引
    const randomIndexes = generateRandomIndexes(count, 5);
    
    // 根据随机索引获取文章
    const articlesPromises = randomIndexes.map(index => 
      supabase
        .from('articles')
        .select('id, title, created_at')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .range(index, index)
        .single()
    );

    // 并行获取所有文章
    const articlesResults = await Promise.allSettled(articlesPromises);
    
    // 过滤成功获取的文章
    const articles = articlesResults
      .filter((result): result is PromiseFulfilledResult<any> => 
        result.status === 'fulfilled' && result.value.data !== null
      )
      .map(result => result.value.data);

    return articles;
  } catch (error) {
    console.error('获取推荐文章时出错:', error);
    return [];
  }
}

// 生成不重复的随机索引数组
function generateRandomIndexes(total: number, count: number): number[] {
  const indexes: number[] = [];
  const maxCount = Math.min(count, total);
  
  while (indexes.length < maxCount) {
    const randomIndex = Math.floor(Math.random() * total);
    if (!indexes.includes(randomIndex)) {
      indexes.push(randomIndex);
    }
  }
  
  return indexes;
}