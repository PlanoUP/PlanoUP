import { Benefits } from '@/components/home/Benefits'
import { DocumentationSection } from '@/components/home/DocumentationSection'
import { Experience3D } from '@/components/home/Experience3D'
import { FinalCTA } from '@/components/home/FinalCTA'
import { Hero } from '@/components/home/Hero'
import { FeaturedProperties } from '@/components/properties/FeaturedProperties'
import { usePageTitle } from '@/hooks/usePageTitle'

export default function Home() {
  usePageTitle()
  return (
    <>
      <Hero />
      <Benefits />
      <FeaturedProperties />
      <Experience3D />
      <DocumentationSection />
      <FinalCTA />
    </>
  )
}
