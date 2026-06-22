import { AboutLayout } from '../AboutLayout';
import Link from 'next/link';

export default function InfoPayPage() {
  return (
    <AboutLayout title="信息置顶/加红服务">
      <h2>让您的信息获得更多曝光</h2>
      <p>通过付费置顶服务，让您发布的信息在列表中优先展示，大幅提升招聘/转让/推广效果。</p>
      <h3>置顶方案</h3>
      <ul>
        <li><strong>超大格置顶</strong>：¥3000/年 — 排在所有信息最前面，365天有效</li>
        <li><strong>大格置顶</strong>：¥1000/半年 — 仅次于超大格，180天有效</li>
        <li><strong>小格置顶</strong>：¥200/月 — 性价比推荐，30天有效</li>
      </ul>
      <h3>支付方式</h3>
      <ul>
        <li>微信支付</li>
        <li>支付宝</li>
        <li>银行转账</li>
      </ul>
      <p>支付后请联系客服确认，我们会尽快为您处理。</p>
      <p>客服QQ：4883699 | 微信：sccoocn</p>
      <p className="mt-4">
        <Link href="/post/" className="text-red-600 hover:underline">立即发布信息 →</Link>
      </p>
    </AboutLayout>
  );
}
