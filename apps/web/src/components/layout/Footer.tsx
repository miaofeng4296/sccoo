import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 text-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* About */}
          <div>
            <h4 className="text-white font-bold mb-3">关于我们</h4>
            <ul className="space-y-1.5">
              <li><Link href="/about/about" className="hover:text-white transition-colors">关于我们</Link></li>
              <li><Link href="/about/contact" className="hover:text-white transition-colors">联系我们</Link></li>
              <li><Link href="/about/guanggao" className="hover:text-white transition-colors">广告服务</Link></li>
              <li><Link href="/about/links" className="hover:text-white transition-colors">友情链接</Link></li>
              <li><Link href="/about/join" className="hover:text-white transition-colors">合作加盟</Link></li>
            </ul>
          </div>

          {/* Business Services */}
          <div>
            <h4 className="text-white font-bold mb-3">商家服务</h4>
            <ul className="space-y-1.5">
              <li><Link href="/login/?jump=/user/biz" className="hover:text-white transition-colors">商家入驻</Link></li>
              <li><Link href="/login/?jump=/user/mywebsite" className="hover:text-white transition-colors">企业建站服务</Link></li>
            </ul>
          </div>

          {/* Info Services */}
          <div>
            <h4 className="text-white font-bold mb-3">信息服务</h4>
            <ul className="space-y-1.5">
              <li><Link href="/post/" className="hover:text-white transition-colors">发布信息</Link></li>
              <li><Link href="/about/infopay" className="hover:text-white transition-colors">信息置顶/加红</Link></li>
              <li><Link href="/about/infodel" className="hover:text-white transition-colors">删除信息</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-bold mb-3">联系方式</h4>
            <ul className="space-y-1.5">
              <li>QQ：4883699</li>
              <li>微信：sccoocn</li>
              <li>电话：0730-8280318</li>
            </ul>
          </div>

          {/* QR Codes */}
          <div>
            <h4 className="text-white font-bold mb-3">关注我们</h4>
            <div className="flex gap-3">
              <div className="w-24 h-24 bg-gray-700 rounded-lg flex items-center justify-center text-xs text-center p-1">
                公众号<br/>二维码
              </div>
              <div className="w-24 h-24 bg-gray-700 rounded-lg flex items-center justify-center text-xs text-center p-1">
                小程序<br/>二维码
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-10 pt-6 text-center text-xs space-y-2">
          <p>
            Copyright &copy; 2026{' '}
            <Link href="/" className="text-gray-300 hover:text-white transition-colors">秀酷纹身之家</Link>
            {' '}版权所有
          </p>
          <p>
            <Link href="https://beian.miit.gov.cn" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              湘ICP备18003118号-5
            </Link>
            {' | '}
            <span>湘公网安备 43060202000114号</span>
          </p>
          <p className="text-gray-600 mt-3">
            网页内的所有信息均为用户自由发布，交易时请注意识别信息的虚假，交易风险自负！
            <br />
            网站内容如有侵犯您权益请联系我们删除，举报信息、删除信息联系客服。
          </p>
        </div>
      </div>
    </footer>
  );
}
