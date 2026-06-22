import { AboutLayout } from '../AboutLayout';
import Link from 'next/link';

export default function InfoDelPage() {
  return (
    <AboutLayout title="删除信息">
      <h2>信息删除说明</h2>
      <p>如需删除您在秀酷纹身之家发布的信息，请按照以下流程操作：</p>
      <h3>自助删除</h3>
      <ol>
        <li>登录您的账号</li>
        <li>进入「个人中心」→「我的发布」</li>
        <li>找到需要删除的信息</li>
        <li>点击删除按钮（如有）</li>
      </ol>
      <h3>联系客服删除</h3>
      <p>如无法自助删除，请提供以下信息联系客服：</p>
      <ul>
        <li>信息ID或链接地址</li>
        <li>注册时使用的邮箱或手机号</li>
        <li>删除原因</li>
      </ul>
      <p>我们将在1-2个工作日内处理您的请求。</p>
      <h3>侵权投诉</h3>
      <p>如发现网站上有侵犯您权益的内容，请联系客服并提供相关证明材料，我们会在核实后第一时间处理。</p>
      <p>客服QQ：4883699 | 微信：sccoocn | 电话：0730-8280318</p>
      <p className="mt-4">
        <Link href="/user/" className="text-red-600 hover:underline">进入个人中心 →</Link>
      </p>
    </AboutLayout>
  );
}
