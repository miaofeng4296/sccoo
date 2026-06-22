import { AboutLayout } from '../AboutLayout';
import Link from 'next/link';

export default function LinksPage() {
  return (
    <AboutLayout title="友情链接">
      <h2>合作伙伴</h2>
      <p>欢迎纹身行业相关网站交换友情链接。请联系QQ：4883699</p>
      <h3>申请条件</h3>
      <ul>
        <li>网站内容与纹身行业相关</li>
        <li>网站已备案且正常运行</li>
        <li>内容健康，无违法信息</li>
        <li>PR值≥2，百度收录正常</li>
      </ul>
      <p>如有意向，请通过联系方式与我们沟通。</p>
      <p className="mt-4">
        <Link href="/about/contact" className="text-red-600 hover:underline">联系我们 →</Link>
      </p>
    </AboutLayout>
  );
}
