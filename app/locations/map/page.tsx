import type { Metadata } from "next";
import { LocationsMapClient } from "@/app/locations/map/ui";

export const metadata: Metadata = {
  title: "Map",
  description: "Browse PlaasMark locations on a map.",
};

export default function LocationsMapPage() {
  return <LocationsMapClient />;
}
