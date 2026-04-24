import type { Metadata } from "next";
import { ComingSoon } from "@/components/ComingSoon";

export const metadata: Metadata = {
  title: "Kom binnekort",
  description:
    "PlaasMark kom binnekort — vars plaasprodukte en jou gemeenskap, op een plek.",
};

export default function HomePage() {
  return <ComingSoon />;
}
