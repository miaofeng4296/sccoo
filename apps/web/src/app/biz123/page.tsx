import Link from 'next/link';
import { prisma } from '@sccoo/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin } from 'lucide-react';

export const revalidate = 60;

export default async function ArtistListPage() {
  const artists = await prisma.artist.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      city: { select: { name: true } },
      business: { select: { id: true, name: true } },
    },
    take: 50,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">纹身师大全</h1>
        <p className="text-gray-500 mt-1">发现全国优秀的纹身师</p>
      </div>

      {artists.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg">暂无纹身师</p>
          <p className="mt-2">成为第一位入驻的纹身师吧！</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {artists.map((artist) => (
            <Card key={artist.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 text-center">
                <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto flex items-center justify-center text-2xl font-bold text-gray-500 mb-3">
                  {artist.name.charAt(0)}
                </div>
                <h3 className="font-bold">{artist.name}</h3>
                {artist.specialty && (
                  <p className="text-sm text-gray-600 mt-1">{artist.specialty}</p>
                )}
                {artist.experienceYears && (
                  <p className="text-xs text-gray-400">从业 {artist.experienceYears} 年</p>
                )}
                <p className="text-xs text-gray-400 mt-1 flex items-center justify-center gap-1">
                  <MapPin className="h-3 w-3" /> {artist.city.name}
                </p>
                {artist.business && (
                  <Link href={`/biz/${artist.business.id}`}>
                    <p className="text-sm text-red-600 mt-2 hover:underline">
                      @{artist.business.name}
                    </p>
                  </Link>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
