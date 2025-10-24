import { AvailabilityWidget } from "@/components/shared/availability-widget";
import { ExperienceOverview } from "@/components/shared/experience-overview";
import { Hero } from "@/components/shared/hero";

export default function Home() {
  return (
    <div className="space-y-16 pb-16">
      <Hero />
      <ExperienceOverview />
      <AvailabilityWidget />
    </div>
  );
}
