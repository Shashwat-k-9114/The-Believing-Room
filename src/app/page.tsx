import { Hero } from "@/components/sections/Hero";
import { ActDisciplines, ActEcosystem, ActHow, ActManifesto, ActMedia, ActSponsor, ActWays } from "@/components/sections/Acts";

export default function Home() {
  return (
    <>
      <Hero />
      <ActHow />
      <ActWays />
      <ActDisciplines />
      <ActEcosystem />
      <ActMedia />
      <ActSponsor />
      <ActManifesto />
    </>
  );
}
