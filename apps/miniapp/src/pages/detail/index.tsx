import { View, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useState, useEffect } from 'react';
import './index.scss';

export default function Detail() {
  const [post, setPost] = useState<any>(null);
  const id = Taro.getCurrentInstance().router?.params?.id;

  useEffect(() => {
    // Mock data
    setPost({
      id: Number(id) || 1,
      title: '山西太原老牌纹身店高薪诚聘成熟纹身师',
      content: '要求3年以上经验，擅长新老传统风格，月薪8000-20000，提供住宿，店内氛围好，欢迎加入！',
      type: 'JOB',
      priceMin: 8000,
      priceMax: 20000,
      cityName: '济南',
      contactPhone: '13355313500',
      contactName: '王店长',
      createdAt: '2026-06-21',
      viewCount: 128,
    });
  }, [id]);

  if (!post) return <View className="page"><Text>加载中...</Text></View>;

  return (
    <View className="page">
      <View className="header">
        <Text className="type-tag">招聘</Text>
        <Text className="price">¥{post.priceMin}-{post.priceMax}</Text>
      </View>

      <Text className="title">{post.title}</Text>

      <View className="meta">
        <Text className="meta-item">📍 {post.cityName}</Text>
        <Text className="meta-item">👁 {post.viewCount}浏览</Text>
        <Text className="meta-item">📅 {post.createdAt}</Text>
      </View>

      <View className="content-card">
        <Text className="section-label">详细信息</Text>
        <Text className="content-text">{post.content}</Text>
      </View>

      <View className="contact-card">
        <Text className="section-label">联系方式</Text>
        <Text className="contact-item">👤 {post.contactName}</Text>
        <Text className="contact-item">📞 {post.contactPhone}</Text>
      </View>

      <View className="actions">
        <Button className="btn-fav">收藏</Button>
        <Button className="btn-contact" openType="contact">联系TA</Button>
      </View>
    </View>
  );
}
