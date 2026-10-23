import { Hero } from "@/components/sections/Hero";
import { StageBanner } from "@/components/sections/StageBanner";
import {
  ActDisciplines,
  ActEcosystem,
  ActEducation,
  ActInside,
  ActManifesto,
  ActPhilosophy,
  ActPlace,
  ActPodcast,
  ActProcess,
  ActShow,
  ActSponsor,
} from "@/components/sections/Acts";


export default function Home() {
  return (
    <>
      <Hero />
      <StageBanner />
      <ActPhilosophy />
      <ActEcosystem />
      <ActProcess />
      <ActDisciplines />
      <ActInside />
      <ActEducation />
      <ActPlace />
      <ActShow />
      <ActPodcast />
      <ActSponsor />
      <ActManifesto />
    </>
  );
}
