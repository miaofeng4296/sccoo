import { View, Text, Input, Textarea, Button, Picker } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useState } from 'react';
import './index.scss';

const types = ['我要招聘', '我要求职', '纹身店转让', '二手设备', '纹身培训', '纹身模特', '预约纹身', '周边服务'];
const cities = ['北京', '上海', '广州', '深圳', '成都', '杭州', '武汉'];

export default function Post() {
  const [form, setForm] = useState({ title: '', content: '', type: 0, city: 0, priceMin: '', priceMax: '', phone: '' });

  function submit() {
    if (!form.title || !form.content) {
      Taro.showToast({ title: '请填写标题和内容', icon: 'none' });
      return;
    }
    Taro.showToast({ title: '发布成功！', icon: 'success' });
  }

  return (
    <View className="page">
      <Text className="page-title">发布信息</Text>
      <View className="form">
        <Picker mode="selector" range={types} value={form.type} onChange={(e) => setForm({ ...form, type: Number(e.detail.value) })}>
          <View className="form-item"><Text>{types[form.type] || '选择类型'}</Text></View>
        </Picker>
        <Picker mode="selector" range={cities} value={form.city} onChange={(e) => setForm({ ...form, city: Number(e.detail.value) })}>
          <View className="form-item"><Text>{cities[form.city] || '选择城市'}</Text></View>
        </Picker>
        <Input className="form-item" placeholder="标题 *" value={form.title} onInput={(e) => setForm({ ...form, title: e.detail.value })} />
        <Textarea className="form-textarea" placeholder="详细内容 *" value={form.content} onInput={(e) => setForm({ ...form, content: e.detail.value })} rows={5} />
        <View className="form-row">
          <Input className="form-half" placeholder="最低价格" value={form.priceMin} onInput={(e) => setForm({ ...form, priceMin: e.detail.value })} />
          <Input className="form-half" placeholder="最高价格" value={form.priceMax} onInput={(e) => setForm({ ...form, priceMax: e.detail.value })} />
        </View>
        <Input className="form-item" placeholder="联系电话" value={form.phone} onInput={(e) => setForm({ ...form, phone: e.detail.value })} />
        <Button className="submit-btn" onClick={submit}>发布信息</Button>
      </View>
    </View>
  );
}
