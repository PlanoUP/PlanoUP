import Header from "@/components/Header";
import Hero from "@/components/Hero";
import TrustBar from "@/components/TrustBar";
import Problems from "@/components/Problems";
import Solution from "@/components/Solution";
import EquipmentGrid from "@/components/EquipmentGrid";
import ValueStack from "@/components/ValueStack";
import Applications from "@/components/Applications";
import CourseBonus from "@/components/CourseBonus";
import Comparison from "@/components/Comparison";
import Audience from "@/components/Audience";
import Offer from "@/components/Offer";
import Guarantee from "@/components/Guarantee";
import FAQ from "@/components/FAQ";
import FinalCTA from "@/components/FinalCTA";
import StickyMobileCTA from "@/components/StickyMobileCTA";
import Footer from "@/components/Footer";
import SocialProof from "@/components/SocialProof";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <TrustBar />
        <Problems />
        <Solution />
        <EquipmentGrid />
        <ValueStack />
        <Applications />
        <CourseBonus />
        <Comparison />
        <Audience />
        <SocialProof />
        <Offer />
        <Guarantee />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
      <StickyMobileCTA />
    </>
  );
}
