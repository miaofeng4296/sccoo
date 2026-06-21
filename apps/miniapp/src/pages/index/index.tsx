import { View, Text, ScrollView, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useState, useEffect } from 'react';
import './index.scss';

interface PostItem {
  id: number;
  title: string;
  type: string;
  priceMin?: number;
  priceMax?: number;
  cityName: string;
  createdAt: string;
}

const TYPE_LABELS: Record<string, string> = {
  JOB: '招聘', SEEK: '求职', SHOP_TRANSFER: '转让',
  SECONDHAND: '二手', TRAINING: '培训', MODEL: '模特',
  BOOKING: '预约', SERVICE: '服务',
};

export default function Index() {
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    try {
      // In production, use the actual API URL
      const res = await Taro.request({
        url: 'https://www.sccoo.cn/api/posts/list',
        method: 'GET',
        data: { page: 1, pageSize: 20 },
      });
      if (res.data?.posts) setPosts(res.data.posts);
    } catch {
      // Use mock data for development
      setPosts([
        { id: 1, title: '山西太原老牌纹身店高薪诚聘成熟纹身师', type: 'JOB', priceMin: 8000, priceMax: 20000, cityName: '济南', createdAt: '2026-06-21' },
        { id: 2, title: '成都招聘纹身师 可接受初级纹身师', type: 'JOB', priceMin: 8000, priceMax: 15000, cityName: '成都', createdAt: '2026-06-21' },
        { id: 3, title: '纹身店转让 北京朝阳区', type: 'SHOP_TRANSFER', priceMin: 50000, cityName: '北京', createdAt: '2026-06-20' },
      ]);
    }
    setLoading(false);
  }

  return (
    <View className="page">
      {/* Search */}
      <View className="search-bar">
        <Input className="search-input" placeholder="搜索纹身信息..." />
      </View>

      {/* Banner */}
      <View className="banner">
        <Text className="banner-title">秀酷纹身之家</Text>
        <Text className="banner-sub">纹身行业信息平台</Text>
      </View>

      {/* Quick Nav */}
      <View className="quick-nav">
        {['招聘', '求职', '转让', '二手', '培训', '问答', '商家', '更多'].map((item) => (
          <View key={item} className="nav-item">
            <View className="nav-icon" />
            <Text>{item}</Text>
          </View>
        ))}
      </View>

      {/* Post List */}
      <ScrollView className="post-list" scrollY>
        {posts.map((post) => (
          <View
            key={post.id}
            className="post-card"
            onClick={() => Taro.navigateTo({ url: `/pages/detail/index?id=${post.id}` })}
          >
            <View className="post-tags">
              <Text className="tag type-tag">{TYPE_LABELS[post.type] || post.type}</Text>
              <Text className="tag city-tag">{post.cityName}</Text>
            </View>
            <Text className="post-title">{post.title}</Text>
            {post.priceMin && (
              <Text className="post-price">
                ¥{post.priceMin}{post.priceMax && post.priceMax !== post.priceMin ? `-${post.priceMax}` : ''}
              </Text>
            )}
            <Text className="post-date">{post.createdAt}</Text>
          </View>
        ))}
        {loading && <Text className="loading-text">加载中...</Text>}
      </ScrollView>
    </View>
  );
}
