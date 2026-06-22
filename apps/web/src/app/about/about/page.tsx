import { AboutLayout } from '../AboutLayout';

export default function AboutPage() {
  return (
    <AboutLayout title="关于我们">
      <h2>秀酷纹身之家 — 纹身行业信息平台</h2>
      <p>
        秀酷纹身之家（sccoo.cn）创办于2018年，是专为纹身行业打造的分类信息门户网站。
        网站主要提供：纹身手稿、纹身店介绍、纹身师招聘、纹身设备转让、纹身店转让、纹身店推荐等纹身行业相关信息！
      </p>
      <h3>我们的服务</h3>
      <ul>
        <li><strong>分类信息发布</strong>：免费发布招聘、求职、转让、培训等各类信息</li>
        <li><strong>商家黄页</strong>：收录全国纹身店、纹身师信息，打造行业权威名录</li>
        <li><strong>纹身问答</strong>：行业内人士交流平台，解答纹身相关问题</li>
        <li><strong>新闻资讯</strong>：发布行业动态、纹身知识、技术交流等内容</li>
      </ul>
      <h3>联系方式</h3>
      <p>QQ：4883699 | 微信：sccoocn | 电话：0730-8280318</p>
      <p>地址：湖南省岳阳市岳阳楼区</p>
    </AboutLayout>
  );
}
