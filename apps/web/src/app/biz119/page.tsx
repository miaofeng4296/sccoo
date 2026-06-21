import Link from 'next/link';
import { prisma } from '@sccoo/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Phone, MapPin, Verified } from 'lucide-react';

export const revalidate = 60;

export default async function BusinessListPage() {
  const businesses = await prisma.business.findMany({
    where: { isVerified: true },
    include: { city: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">纹身店大全</h1>
        <p className="text-gray-500 mt-1">查找全国各地的纹身店，找到最适合你的纹身师</p>
      </div>

      {businesses.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg">暂无商家</p>
          <p className="mt-2"><Link href="/login/?jump=/user/biz" className="text-red-600 hover:underline">立即入驻</Link></p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {businesses.map((biz) => (
            <Link key={biz.id} href={`/biz/${biz.id}`}>
              <Card className="h-full hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <div className="w-20 h-20 bg-red-100 rounded-full mx-auto flex items-center justify-center text-2xl font-bold text-red-600 mb-3">
                    {biz.name.charAt(0)}
                  </div>
                  <h3 className="font-bold flex items-center justify-center gap-1">
                    {biz.name}
                    <Verified className="h-4 w-4 text-blue-500" />
                  </h3>
                  {biz.phone && (
                    <p className="text-sm text-gray-600 mt-1 flex items-center justify-center gap-1">
                      <Phone className="h-3 w-3" /> {biz.phone}
                    </p>
                  )}
                  {biz.address && (
                    <p className="text-xs text-gray-400 mt-1 flex items-center justify-center gap-1">
                      <MapPin className="h-3 w-3" /> {biz.city.name} {biz.address}
                    </p>
                  )}
                  {biz.description && (
                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">{biz.description}</p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
