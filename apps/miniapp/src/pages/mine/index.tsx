import { View, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import './index.scss';

export default function Mine() {
  return (
    <View className="page">
      {/* Profile */}
      <View className="profile">
        <View className="avatar" />
        <Text className="name">点击登录</Text>
        <Text className="desc">登录后可管理信息和收藏</Text>
      </View>

      {/* Menu */}
      <View className="menu">
        <View className="menu-item" onClick={() => Taro.navigateTo({ url: '/pages/post/index' })}>
          <Text>📝 我的发布</Text>
          <Text className="arrow">›</Text>
        </View>
        <View className="menu-item">
          <Text>⭐ 我的收藏</Text>
          <Text className="arrow">›</Text>
        </View>
        <View className="menu-item">
          <Text>🏪 商家管理</Text>
          <Text className="arrow">›</Text>
        </View>
        <View className="menu-item">
          <Text>🔔 消息通知</Text>
          <Text className="arrow">›</Text>
        </View>
        <View className="menu-item">
          <Text>⚙️ 设置</Text>
          <Text className="arrow">›</Text>
        </View>
      </View>
    </View>
  );
}
