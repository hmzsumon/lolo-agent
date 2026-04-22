/* ── Security Section ───────────────────────────────────────────────────────── */

import adriana from "@/public/images/adriana.jpg";
import Image from "next/image";
import React from "react";
import Card from "./Card";
import Container from "./Container";
import SectionTitle from "./SectionTitle";

const SecuritySection: React.FC = () => (
  <section id="security" className="bg-neutral-950 py-14">
    <Container className="grid grid-cols-1 items-center gap-8 md:grid-cols-2">
      <div>
        <SectionTitle
          align="left"
          eyebrow=" Marketing"
          title="Adriana Amato"
          subtitle="Hi there, I am the Head of Marketing at Capitalise & CapitaliseGFX"
        />
      </div>

      <Card className="p-0">
        <Image
          src={adriana}
          alt="Security engineer"
          className="h-72 w-full rounded-2xl object-cover md:h-96"
        />
      </Card>
    </Container>
  </section>
);

export default SecuritySection;
