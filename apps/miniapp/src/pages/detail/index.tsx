import { View, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useState, useEffect } from 'react';
import './index.scss';

const TYPE_LABELS: Record<string, string> = {
  JOB: '招聘', SEEK: '求职', SHOP_TRANSFER: '转让',
  SECONDHAND: '二手', TRAINING: '培训', MODEL: '模特',
  BOOKING: '预约', SERVICE: '服务',
};

interface PostDetail {
  id: number;
  title: string;
  content: string;
  type: string;
  priceMin?: number;
  priceMax?: number;
  viewCount: number;
  contactName?: string;
  contactPhone?: string;
  contactWechat?: string;
  cityName: string;
  categoryName: string;
  userName: string;
  createdAt: string;
  expiresAt: string;
}

export default function Detail() {
  const [post, setPost] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const id = Taro.getCurrentInstance().router?.params?.id;

  useEffect(() => {
    // Mock data - in production, fetch from API
    const baseId = Number(id) || 1;
    const mockPosts: Record<number, PostDetail> = {
      1: { id: 1, title: '山西太原老牌纹身店高薪诚聘成熟纹身师', content: '要求3年以上经验，擅长新老传统风格，月薪8000-20000，提供住宿，店内氛围好，客源稳定，欢迎有实力的纹身师加入！', type: 'JOB', priceMin: 8000, priceMax: 20000, viewCount: 256, contactName: '王店长', contactPhone: '13355313500', contactWechat: 'tattoo_wang', cityName: '济南', categoryName: '我要招聘', userName: '烈火堂纹身', createdAt: '2026-06-21', expiresAt: '2026-07-21' },
      2: { id: 2, title: '成都招聘纹身师 可接受初级纹身师', content: '成都市区纹身店招师傅，可接受初级纹身师，包天走量，活多事少，月薪8000-15000，提供住宿和餐补。', type: 'JOB', priceMin: 8000, priceMax: 15000, viewCount: 189, contactName: '李老板', contactPhone: '13800001111', cityName: '成都', categoryName: '我要招聘', userName: '成都刺青工作室', createdAt: '2026-06-21', expiresAt: '2026-07-21' },
      3: { id: 3, title: '纹身店转让 北京朝阳区', content: '朝阳区成熟纹身店转让，面积80平，设备齐全，客源稳定，转让费面议。店铺位置好，周边人流量大。', type: 'SHOP_TRANSFER', priceMin: 50000, viewCount: 312, contactName: '张先生', contactPhone: '13900002222', cityName: '北京', categoryName: '纹身店转让', userName: '朝阳刺青', createdAt: '2026-06-20', expiresAt: '2026-07-20' },
    };
    setPost(mockPosts[baseId] || mockPosts[1]!);
    setLoading(false);
  }, [id]);

  if (loading) return <View className="page"><Text className="loading-text">加载中...</Text></View>;
  if (!post) return <View className="page"><Text className="empty-text">信息不存在</Text></View>;

  return (
    <View className="page detail-page">
      <View className="detail-header">
        <View className="detail-tags">
          <Text className="tag type-tag">{TYPE_LABELS[post.type] || post.type}</Text>
          <Text className="tag city-tag">{post.cityName}</Text>
        </View>
        <Text className="detail-title">{post.title}</Text>
        {post.priceMin ? (
          <Text className="detail-price">
            ¥{post.priceMin}{post.priceMax && post.priceMax !== post.priceMin ? ` - ¥${post.priceMax}` : ''}
          </Text>
        ) : null}
      </View>

      <View className="detail-section">
        <View className="detail-row"><Text className="detail-label">浏览</Text><Text>{post.viewCount} 次</Text></View>
        <View className="detail-row"><Text className="detail-label">发布</Text><Text>{post.createdAt}</Text></View>
        <View className="detail-row"><Text className="detail-label">有效期</Text><Text>至 {post.expiresAt}</Text></View>
      </View>

      <View className="detail-section">
        <Text className="section-title">详细内容</Text>
        <Text className="detail-content">{post.content}</Text>
      </View>

      <View className="detail-section">
        <Text className="section-title">联系方式</Text>
        {post.contactName && <Text className="contact-item">联系人：{post.contactName}</Text>}
        {post.contactPhone && (
          <View className="contact-row">
            <Text className="contact-item">电话：{post.contactPhone}</Text>
            <Button size="mini" className="call-btn" onClick={() => Taro.makePhoneCall({ phoneNumber: post.contactPhone! })}>拨打</Button>
          </View>
        )}
        {post.contactWechat && <Text className="contact-item">微信：{post.contactWechat}</Text>}
      </View>

      <View className="detail-section">
        <Text className="section-title">发布者</Text>
        <Text>{post.userName}</Text>
        <Text className="detail-category">分类：{post.categoryName}</Text>
      </View>

      <View className="detail-footer">
        <Button className="action-btn favorite-btn" size="mini">收藏</Button>
        <Button className="action-btn share-btn" size="mini" openType="share">分享</Button>
        <Button className="action-btn report-btn" size="mini">举报</Button>
      </View>
    </View>
  );
}
