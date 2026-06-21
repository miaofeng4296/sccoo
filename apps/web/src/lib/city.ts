import { headers } from 'next/headers';
import { prisma } from '@sccoo/db';

/**
 * Parse the request hostname to extract city subdomain.
 * E.g., "jinan.sccoo.cn" → { cityId: 5, cityName: "济南" }
 */
export async function getCityFromHost(): Promise<{ cityId: number; cityName: string } | null> {
  try {
    const headersList = await headers();
    const host = headersList.get('host') || '';
    const hostname = host.split(':')[0] || '';

    // Extract subdomain (e.g., "jinan" from "jinan.sccoo.cn")
    const parts = hostname.split('.');
    if (parts.length >= 3 && parts[1] === 'sccoo') {
      const subdomain = parts[0] || '';

      // Skip www and main domain
      if (subdomain === 'www') return null;

      const city = await prisma.city.findUnique({
        where: { subdomain },
        select: { id: true, name: true },
      });

      if (city) return { cityId: city.id, cityName: city.name };
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Get all active cities for the subdomain system
 */
export async function getAllCities() {
  return prisma.city.findMany({
    where: { parentId: { not: null }, isActive: true },
    orderBy: { sortOrder: 'asc' },
    select: { id: true, name: true, subdomain: true },
  });
}
