import { MetadataRoute } from 'next';
import { fetchAPI } from '@/lib/api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://sparkbluediamond.com';

  // Base routes
  const routes = [
    '',
    '/shop',
    '/about',
    '/contact',
    '/faq',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  try {
    // Dynamic Categories
    const categories = await fetchAPI('/categories');
    const categoryRoutes = Array.isArray(categories) ? categories.map((cat: any) => ({
      url: `${baseUrl}/shop?category=${cat.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })) : [];

    // Dynamic Products (Limit to 100 for sitemap performance)
    const products = await fetchAPI('/products');
    const productRoutes = Array.isArray(products) ? products.slice(0, 100).map((prod: any) => ({
      url: `${baseUrl}/product/${prod.slug || prod.id}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })) : [];

    return [...routes, ...categoryRoutes, ...productRoutes];
  } catch (error) {
    console.error('Sitemap Error:', error);
    return routes;
  }
}
