import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import './index.scss';

const categories = [
  { name: '我要招聘', type: 'JOB', icon: '📋' },
  { name: '我要求职', type: 'SEEK', icon: '🔍' },
  { name: '纹身店转让', type: 'SHOP_TRANSFER', icon: '🏪' },
  { name: '二手设备', type: 'SECONDHAND', icon: '🔧' },
  { name: '纹身培训', type: 'TRAINING', icon: '📚' },
  { name: '纹身模特', type: 'MODEL', icon: '🎨' },
  { name: '预约纹身', type: 'BOOKING', icon: '✏️' },
  { name: '周边服务', type: 'SERVICE', icon: '🛠️' },
];

const cities = ['北京', '上海', '广州', '深圳', '成都', '杭州', '武汉', '长沙', '济南', '青岛'];

export default function Category() {
  return (
    <View className="page">
      <Text className="section-title">信息分类</Text>
      <View className="cat-grid">
        {categories.map((cat) => (
          <View key={cat.type} className="cat-item" onClick={() => Taro.navigateTo({ url: `/pages/index/index?type=${cat.type}` })}>
            <Text className="cat-icon">{cat.icon}</Text>
            <Text className="cat-name">{cat.name}</Text>
          </View>
        ))}
      </View>

      <Text className="section-title">城市选择</Text>
      <View className="city-grid">
        {cities.map((city) => (
          <View key={city} className="city-item">
            <Text>{city}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
