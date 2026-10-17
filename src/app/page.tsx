export const dynamic = "force-dynamic";

import { Hero } from "@/components/sections/Hero";
import {
  ActArenas,
  ActAtmosphere,
  ActFinale,
  ActJourney,
  ActOldNew,
  ActPeople,
  ActShow,
  ActTickets,
  ActTrust,
} from "@/components/sections/HomeActs";

export default function Home() {
  return (
    <>
      <Hero />
      <ActOldNew />
      <ActArenas />
      <ActJourney />
      <ActAtmosphere />
      <ActPeople />
      <ActTickets />
      <ActShow />
      <ActTrust />
      <ActFinale />
    </>
  );
}
