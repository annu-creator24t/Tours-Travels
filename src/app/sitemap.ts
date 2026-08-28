import { MetadataRoute } from 'next';
import prisma from '@/lib/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  ).replace(/\/+$/, '');

  // 1. Static public website routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/vehicles`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/book`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/reviews`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  // 2. Dynamic vehicle pages from database
  let dynamicVehicleRoutes: MetadataRoute.Sitemap = [];
  try {
    const vehicles = await prisma.vehicle.findMany({
      where: {
        status: {
          not: 'INACTIVE',
        },
      },
      select: {
        slug: true,
        updatedAt: true,
      },
    });

    dynamicVehicleRoutes = vehicles.map((vehicle) => ({
      url: `${baseUrl}/vehicles/${encodeURIComponent(vehicle.slug)}`,
      lastModified: vehicle.updatedAt || new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));
  } catch (error) {
    console.error('[Sitemap] Notice: Could not fetch dynamic vehicles for sitemap:', error);
  }

  return [...staticRoutes, ...dynamicVehicleRoutes];
}
