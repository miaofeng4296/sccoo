import { AboutLayout } from '../AboutLayout';

export default function GuanggaoPage() {
  return (
    <AboutLayout title="广告服务">
      <h2>广告位招租</h2>
      <p>秀酷纹身之家为纹身行业相关企业提供多种广告投放方案：</p>
      <h3>广告位类型</h3>
      <ul>
        <li><strong>首页轮播Banner</strong>：展示在首页最显眼位置，曝光量大</li>
        <li><strong>侧边栏广告</strong>：固定展示在信息列表页面侧边</li>
        <li><strong>商家置顶推荐</strong>：商家黄页首页置顶展示</li>
        <li><strong>信息大格置顶</strong>：信息列表中优先展示</li>
      </ul>
      <h3>广告价格</h3>
      <ul>
        <li>超大格置顶：¥3000（365天）</li>
        <li>大格置顶：¥1000（180天）</li>
        <li>小格置顶：¥200（30天）</li>
      </ul>
      <p>具体广告价格和排期请咨询客服。联系方式：QQ 4883699 / 微信 sccoocn</p>
    </AboutLayout>
  );
}
