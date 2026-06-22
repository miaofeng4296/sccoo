import { View, Text, ScrollView, Input, Image } from '@tarojs/components';
import Taro, { usePullDownRefresh } from '@tarojs/taro';
import { useState, useEffect } from 'react';
import api from '../../utils/api';
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

const QUICK_NAV = [
  { label: '招聘', type: 'JOB' },
  { label: '求职', type: 'SEEK' },
  { label: '转让', type: 'SHOP_TRANSFER' },
  { label: '二手', type: 'SECONDHAND' },
  { label: '培训', type: 'TRAINING' },
  { label: '模特', type: 'MODEL' },
  { label: '问答', url: '/pages/wenda/index' },
  { label: '商家', url: '/pages/biz/index' },
];

export default function Index() {
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cities, setCities] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  usePullDownRefresh(() => {
    fetchData().then(() => Taro.stopPullDownRefresh());
  });

  async function fetchData() {
    setLoading(true);
    try {
      // Fetch cities for filter
      const citiesData = await api.getCities();
      setCities(citiesData || []);
    } catch { /* use defaults */ }

    // Mock posts since the web page returns HTML not JSON
    // In production, use a proper JSON API endpoint
    setPosts([
      { id: 1, title: '山西太原老牌纹身店高薪诚聘成熟纹身师', type: 'JOB', priceMin: 8000, priceMax: 20000, cityName: '济南', createdAt: '2026-06-21' },
      { id: 2, title: '成都招聘纹身师 可接受初级纹身师', type: 'JOB', priceMin: 8000, priceMax: 15000, cityName: '成都', createdAt: '2026-06-21' },
      { id: 3, title: '纹身店转让 北京朝阳区', type: 'SHOP_TRANSFER', priceMin: 50000, cityName: '北京', createdAt: '2026-06-20' },
      { id: 4, title: '专业纹身培训 包教包会', type: 'TRAINING', priceMin: 3000, priceMax: 8000, cityName: '长沙', createdAt: '2026-06-19' },
      { id: 5, title: '招聘驻店纹身师 广州佛山', type: 'JOB', priceMin: 8000, priceMax: 20000, cityName: '广州', createdAt: '2026-06-18' },
      { id: 6, title: '预约纹身 花臂满背', type: 'BOOKING', cityName: '上海', createdAt: '2026-06-17' },
    ]);
    setLoading(false);
  }

  return (
    <View className="page">
      {/* Search */}
      <View className="search-bar">
        <Input
          className="search-input"
          placeholder="搜索纹身信息..."
          onConfirm={(e) => {
            const q = (e.detail as { value: string }).value;
            if (q.trim()) {
              Taro.navigateTo({ url: `/pages/detail/index?search=${encodeURIComponent(q.trim())}` });
            }
          }}
        />
      </View>

      {/* Banner */}
      <View className="banner" onClick={() => Taro.switchTab({ url: '/pages/index/index' })}>
        <Text className="banner-title">秀酷纹身之家</Text>
        <Text className="banner-sub">纹身行业信息平台 — 招聘求职 · 店铺转让 · 培训学习</Text>
      </View>

      {/* Quick Nav */}
      <View className="quick-nav">
        {QUICK_NAV.map((item) => (
          <View
            key={item.label}
            className="nav-item"
            onClick={() => {
              if (item.url) {
                Taro.navigateTo({ url: item.url });
              } else {
                Taro.navigateTo({ url: `/pages/category/index?type=${item.type}` });
              }
            }}
          >
            <View className="nav-icon">
              <Text className="nav-icon-text">{item.label.charAt(0)}</Text>
            </View>
            <Text className="nav-label">{item.label}</Text>
          </View>
        ))}
      </View>

      {/* City Filter */}
      <ScrollView className="city-filter" scrollX>
        <View className="city-filter-inner">
          <View className="city-tag active"><Text>全部</Text></View>
          {cities.slice(0, 12).map(city => (
            <View key={city.id} className="city-tag">
              <Text>{city.name}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

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
            <View className="post-bottom">
              {post.priceMin ? (
                <Text className="post-price">
                  ¥{post.priceMin}{post.priceMax && post.priceMax !== post.priceMin ? `-${post.priceMax}` : ''}
                </Text>
              ) : <View />}
              <Text className="post-date">{post.createdAt}</Text>
            </View>
          </View>
        ))}
        {loading && <Text className="loading-text">加载中...</Text>}
        {!loading && posts.length === 0 && (
          <Text className="empty-text">暂无信息</Text>
        )}
      </ScrollView>
    </View>
  );
}
