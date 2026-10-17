import { Hero } from "@/components/sections/Hero";
import {
  ActCompanies,
  ActDisciplines,
  ActInside,
  ActManifesto,
  ActPhilosophy,
  ActPlace,
  ActPodcast,
  ActProcess,
  ActRoom,
  ActSeason,
  ActShow,
} from "@/components/sections/Acts";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <>
      <Hero />
      <ActPhilosophy />
      <ActRoom />
      <ActProcess />
      <ActDisciplines />
      <ActInside />
      <ActPlace />
      <ActSeason />
      <ActCompanies />
      <ActShow />
      <ActPodcast />
      <ActManifesto />
    </>
  );
}
