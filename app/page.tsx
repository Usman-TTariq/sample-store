import BlogHomeTop from "./components/BlogHomeTop";
import CategoryArticleColumns from "./components/CategoryArticleColumns";
import LatestPostsGrid from "./components/LatestPostsGrid";
import MostPopularArticles from "./components/MostPopularArticles";
import HomePromoBanner from "./components/HomePromoBanner";
import FAQSection from "./components/FAQSection";
import Footer from "./components/Footer";
import { getBannerByLayoutPosition } from "@/lib/services/bannerService";
import Link from "next/link";

export const revalidate = 0;

async function resolvePromoBanner() {
  const primary = await getBannerByLayoutPosition(5);
  if (primary) return primary;

  for (const position of [1, 2, 3, 4, 6, 7, 8, 9, 10, 11]) {
    const banner = await getBannerByLayoutPosition(position);
    if (banner) return banner;
  }

  return null;
}

export default async function Home() {
  const promoBanner = await resolvePromoBanner();

  return (
    <div className="min-h-screen bg-white">
      <BlogHomeTop />
      <CategoryArticleColumns />

      <section className="w-full py-6 sm:py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {promoBanner ? (
            <Link
              href="/stores"
              className="block rounded-xl sm:rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow ring-1 ring-gray-200/80"
            >
              <div className="relative w-full min-h-[200px] sm:min-h-[260px] aspect-[4/3] sm:aspect-[1728/547]">
                <img
                  src={promoBanner.imageUrl}
                  alt={promoBanner.title || "Promotional banner"}
                  className="absolute inset-0 w-full h-full object-cover object-center"
                />
              </div>
            </Link>
          ) : (
            <HomePromoBanner />
          )}
        </div>
      </section>

      <LatestPostsGrid />
      <MostPopularArticles />
      <FAQSection />
      <Footer />
    </div>
  );
}
