import { View, Text, Input, Textarea, Button, Picker } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useState, useEffect } from 'react';
import api from '../../utils/api';
import './index.scss';

const POST_TYPES = [
  { value: 'JOB', label: '我要招聘' },
  { value: 'SEEK', label: '我要求职' },
  { value: 'SHOP_TRANSFER', label: '纹身店转让' },
  { value: 'SECONDHAND', label: '二手设备转让' },
  { value: 'TRAINING', label: '纹身培训' },
  { value: 'MODEL', label: '纹身模特' },
  { value: 'BOOKING', label: '预约纹身' },
  { value: 'SERVICE', label: '周边服务' },
];

export default function Post() {
  const [cities, setCities] = useState<{ id: number; name: string }[]>([]);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [form, setForm] = useState({
    typeIndex: -1, type: '',
    cityIndex: -1, cityId: 0,
    catIndex: -1, categoryId: 0,
    title: '', content: '',
    priceMin: '', priceMax: '',
    contactName: '', contactPhone: '', contactWechat: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Mock cities - in production fetch from API
    setCities([
      { id: 2, name: '北京' }, { id: 3, name: '上海' }, { id: 5, name: '广州' },
      { id: 6, name: '深圳' }, { id: 7, name: '成都' }, { id: 8, name: '杭州' },
      { id: 9, name: '武汉' }, { id: 10, name: '南京' }, { id: 11, name: '长沙' },
    ]);
    setCategories([
      { id: 1, name: '我行我秀' }, { id: 2, name: '我要招聘' }, { id: 3, name: '我要求职' },
      { id: 4, name: '纹身店转让' }, { id: 5, name: '纹身模特' },
      { id: 6, name: '预约纹身' }, { id: 7, name: '纹身培训' },
    ]);
  }, []);

  async function handleSubmit() {
    if (!form.title.trim() || !form.content.trim() || !form.type || !form.cityId) {
      Taro.showToast({ title: '请填写标题、内容、类型和地区', icon: 'none' });
      return;
    }
    setSubmitting(true);
    try {
      await api.createPost({
        title: form.title.trim(),
        content: form.content.trim(),
        type: form.type,
        categoryId: form.categoryId || 2,
        cityId: form.cityId,
        priceMin: form.priceMin ? parseInt(form.priceMin) : undefined,
        priceMax: form.priceMax ? parseInt(form.priceMax) : undefined,
        contactName: form.contactName || undefined,
        contactPhone: form.contactPhone || undefined,
        contactWechat: form.contactWechat || undefined,
      });
      Taro.showToast({ title: '发布成功', icon: 'success' });
      setTimeout(() => Taro.switchTab({ url: '/pages/index/index' }), 1500);
    } catch {
      Taro.showToast({ title: '发布失败，请重试', icon: 'none' });
    }
    setSubmitting(false);
  }

  const typeLabels = POST_TYPES.map(t => t.label);
  const cityNames = cities.map(c => c.name);
  const catNames = categories.map(c => c.name);

  return (
    <View className="page post-page">
      <View className="post-header">
        <Text className="page-title">发布信息</Text>
        <Text className="post-subtitle">选择分类，填写详情</Text>
      </View>

      <View className="form-section">
        <Picker mode="selector" range={typeLabels} value={form.typeIndex} onChange={e => {
          const i = e.detail.value as number; const t = POST_TYPES[i]!;
          setForm({ ...form, typeIndex: i, type: t.value });
        }}>
          <View className="form-item"><Text className={form.type ? '' : 'placeholder'}>{form.type ? typeLabels[form.typeIndex] : '请选择信息类型 *'}</Text></View>
        </Picker>

        <Picker mode="selector" range={cityNames} value={form.cityIndex} onChange={e => {
          const i = e.detail.value as number; const c = cities[i]!;
          setForm({ ...form, cityIndex: i, cityId: c.id });
        }}>
          <View className="form-item"><Text className={form.cityId ? '' : 'placeholder'}>{form.cityId ? cityNames[form.cityIndex] : '请选择地区 *'}</Text></View>
        </Picker>

        <Picker mode="selector" range={catNames} value={form.catIndex} onChange={e => {
          const i = e.detail.value as number; const c = categories[i]!;
          setForm({ ...form, catIndex: i, categoryId: c.id });
        }}>
          <View className="form-item"><Text className={form.categoryId ? '' : 'placeholder'}>{form.categoryId ? catNames[form.catIndex] : '请选择分类 *'}</Text></View>
        </Picker>

        <Input className="form-item" placeholder="信息标题 *" value={form.title} onInput={e => setForm({ ...form, title: e.detail.value })} maxlength={200} />
        <Textarea className="form-textarea" placeholder="详细内容 *" value={form.content} onInput={e => setForm({ ...form, content: e.detail.value })} maxlength={5000} />

        <View className="form-row">
          <Input className="form-half" type="number" placeholder="最低薪资/价格" value={form.priceMin} onInput={e => setForm({ ...form, priceMin: e.detail.value })} />
          <Input className="form-half" type="number" placeholder="最高薪资/价格" value={form.priceMax} onInput={e => setForm({ ...form, priceMax: e.detail.value })} />
        </View>

        <View className="form-row three">
          <Input className="form-third" placeholder="联系人" value={form.contactName} onInput={e => setForm({ ...form, contactName: e.detail.value })} />
          <Input className="form-third" type="number" placeholder="联系电话" value={form.contactPhone} onInput={e => setForm({ ...form, contactPhone: e.detail.value })} />
          <Input className="form-third" placeholder="微信" value={form.contactWechat} onInput={e => setForm({ ...form, contactWechat: e.detail.value })} />
        </View>

        <Button className="submit-btn" disabled={submitting} onClick={handleSubmit}>
          {submitting ? '发布中...' : '发布信息'}
        </Button>
      </View>
    </View>
  );
}
