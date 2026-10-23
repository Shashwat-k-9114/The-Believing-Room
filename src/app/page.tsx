import { Hero } from "@/components/sections/Hero";
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
