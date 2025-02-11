import { CallToAction } from "@/components/CallToAction";
import { Faqs } from "@/components/Faqs";
import { Hero } from "@/components/Hero";
import { Pricing } from "@/components/Pricing";
import { PrimaryFeatures } from "@/components/PrimaryFeatures";
import { Reviews } from "@/components/Reviews";
import { SecondaryFeatures } from "@/components/SecondaryFeatures";

export default function Home() {
  return (
    <>
      <Hero />
      <Pricing />
      <SecondaryFeatures />
      <CallToAction />
      <Reviews />
      <PrimaryFeatures />
      {/*<Faqs />*/}
    </>
  );
}
