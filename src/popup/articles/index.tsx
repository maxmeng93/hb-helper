import React, { useEffect, useState } from 'react';
import { Spin, Typography, Divider, Button } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { getLatestArticles, getRecommendedArticles, Article } from '../../utils/supabase';
import './index.scss';

const { Title, Text } = Typography;

const Articles: React.FC = () => {
  const [latestArticles, setLatestArticles] = useState<Article[]>([]);
  const [recommendedArticles, setRecommendedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshingRecommended, setRefreshingRecommended] = useState(false);

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      setLoading(true);
      const [latest, recommended] = await Promise.all([
        getLatestArticles(),
        getRecommendedArticles()
      ]);
      
      setLatestArticles(latest);
      setRecommendedArticles(recommended);
    } catch (error) {
      console.error('加载文章失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshRecommended = async () => {
    try {
      setRefreshingRecommended(true);
      const recommended = await getRecommendedArticles();
      setRecommendedArticles(recommended);
    } catch (error) {
      console.error('刷新推荐文章失败:', error);
    } finally {
      setRefreshingRecommended(false);
    }
  };

  const openArticle = (id: string) => {
    const url = `https://etf.maxmeng.top/article/${id}`;
    chrome.tabs.create({ url });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      month: 'numeric',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="articles-loading">
        <Spin />
        <Text style={{ marginLeft: 8 }}>加载中...</Text>
      </div>
    );
  }

  return (
    <div className="articles">
      <div className="section">
        <Title level={5} className="section-title">最新文章</Title>
        {latestArticles.length > 0 ? (
          <ul className="article-list">
            {latestArticles.map((article) => (
              <li key={article.id} className="article-item">
                <span 
                  className="article-title"
                  onClick={() => openArticle(article.id)}
                  title={article.title}
                >
                  {article.title}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <Text type="secondary">暂无文章</Text>
        )}
      </div>

      <div className="section">
        <div className="section-header">
          <Title level={5} className="section-title">推荐阅读</Title>
          <Button
            type="text"
            size="small"
            icon={<ReloadOutlined />}
            loading={refreshingRecommended}
            onClick={refreshRecommended}
            className="refresh-btn"
          />
        </div>
        {recommendedArticles.length > 0 ? (
          <ul className="article-list">
            {recommendedArticles.map((article) => (
              <li key={article.id} className="article-item">
                <span 
                  className="article-title"
                  onClick={() => openArticle(article.id)}
                  title={article.title}
                >
                  {article.title}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <Text type="secondary">暂无推荐</Text>
        )}
      </div>
    </div>
  );
};

export default Articles;