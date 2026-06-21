import { View, Text } from '@tarojs/components';
import './index.scss';

const messages = [
  { id: 1, title: '系统通知', content: '欢迎使用秀酷纹身之家小程序！', time: '2026-06-22' },
  { id: 2, title: '审核通知', content: '您发布的信息已通过审核', time: '2026-06-21' },
];

export default function Message() {
  return (
    <View className="page">
      <Text className="page-title">消息</Text>
      {messages.length === 0 ? (
        <View className="empty"><Text>暂无消息</Text></View>
      ) : (
        messages.map((msg) => (
          <View key={msg.id} className="msg-card">
            <Text className="msg-title">{msg.title}</Text>
            <Text className="msg-content">{msg.content}</Text>
            <Text className="msg-time">{msg.time}</Text>
          </View>
        ))
      )}
    </View>
  );
}
