import type { Metadata } from "next";
import { HomeClient } from "@/components/HomeClient";

export const metadata: Metadata = {
  title: "Welkom",
  description: "PlaasMark — plaasvars produkte van plaaslike verkopers.",
};

export default function HomePage() {
  return <HomeClient />;
}
