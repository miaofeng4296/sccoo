import { View, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useState } from 'react';
import './index.scss';

export default function Mine() {
  const [isLogin, setIsLogin] = useState(false);

  function handleLogin() {
    Taro.showToast({ title: '跳转登录页', icon: 'none' });
  }

  const menuItems = [
    { icon: '📋', label: '我的发布', action: () => Taro.navigateTo({ url: '/pages/post/index' }) },
    { icon: '❤️', label: '我的收藏', action: () => Taro.showToast({ title: '请先登录', icon: 'none' }) },
    { icon: '🏪', label: '商家管理', action: () => Taro.showToast({ title: '请先登录', icon: 'none' }) },
    { icon: '🔔', label: '消息通知', action: () => Taro.switchTab({ url: '/pages/message/index' }) },
    { icon: '⚙️', label: '设置', action: () => Taro.showToast({ title: '请先登录', icon: 'none' }) },
  ];

  return (
    <View className="page mine-page">
      {/* User Info */}
      <View className="user-header" onClick={handleLogin}>
        {!isLogin ? (
          <View className="login-prompt">
            <View className="avatar-placeholder"><Text className="avatar-text">登</Text></View>
            <View className="login-info">
              <Text className="login-title">点击登录</Text>
              <Text className="login-sub">登录后享受更多服务</Text>
            </View>
          </View>
        ) : (
          <View className="user-info">
            <View className="avatar-placeholder"><Text className="avatar-text">用</Text></View>
            <View className="user-detail">
              <Text className="user-name">用户名</Text>
              <Text className="user-email">user@example.com</Text>
            </View>
          </View>
        )}
      </View>

      {/* Stats */}
      <View className="stats-row">
        <View className="stat-item"><Text className="stat-num">0</Text><Text className="stat-label">发布</Text></View>
        <View className="stat-item"><Text className="stat-num">0</Text><Text className="stat-label">收藏</Text></View>
        <View className="stat-item"><Text className="stat-num">0</Text><Text className="stat-label">消息</Text></View>
      </View>

      {/* Menu */}
      <View className="menu-list">
        {menuItems.map((item) => (
          <View key={item.label} className="menu-item" onClick={item.action}>
            <Text className="menu-icon">{item.icon}</Text>
            <Text className="menu-label">{item.label}</Text>
            <Text className="menu-arrow">›</Text>
          </View>
        ))}
      </View>

      <View className="mine-footer">
        <Text className="footer-text">秀酷纹身之家 小程序版 v1.0</Text>
      </View>
    </View>
  );
}
