import Navbar from "./components/Navbar";
import MultiPanelHero from "./components/MultiPanelHero";
import FeaturedDeals from "./components/FeaturedDeals";
import TrustedPartners from "./components/TrustedPartners";
import TrendingStores from "./components/TrendingStores";
import PopularCoupons from "./components/PopularCoupons";
import HomeAccordions from "./components/HomeAccordions";
import HowItWorks from "./components/HowItWorks";
import FAQSection from "./components/FAQSection";
import Footer from "./components/Footer";
import { getBannersWithLayout } from "@/lib/services/bannerService";

export const revalidate = 0;

export default async function Home() {
  const banners = await getBannersWithLayout();

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <MultiPanelHero initialBanners={banners} />
      <FeaturedDeals />
      <TrustedPartners />
      <TrendingStores />
      <PopularCoupons />
      <HomeAccordions />
      <HowItWorks />
      <FAQSection />
      <Footer />
    </div>
  );
}
