import type { Metadata } from "next";
import { LocationsMapClient } from "@/app/locations/map/ui";
import { indexableRobots } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Map",
  description: "Browse PlaasMark locations on a map.",
  robots: indexableRobots,
  alternates: { canonical: "/locations/map" },
};

export default function LocationsMapPage() {
  return <LocationsMapClient />;
}
