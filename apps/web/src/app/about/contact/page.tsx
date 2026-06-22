import { AboutLayout } from '../AboutLayout';

export default function ContactPage() {
  return (
    <AboutLayout title="联系我们">
      <h2>欢迎联系我们</h2>
      <p>如果您有任何问题、建议或合作意向，欢迎通过以下方式联系我们：</p>
      <h3>联系方式</h3>
      <ul>
        <li><strong>QQ：</strong>4883699</li>
        <li><strong>微信：</strong>sccoocn</li>
        <li><strong>电话：</strong>0730-8280318</li>
        <li><strong>邮箱：</strong>admin@sccoo.cn</li>
      </ul>
      <h3>工作时间</h3>
      <p>周一至周五 9:00 - 18:00</p>
      <p>如需删除信息或有侵权投诉，请提供相关证明后联系我们处理。</p>
    </AboutLayout>
  );
}
