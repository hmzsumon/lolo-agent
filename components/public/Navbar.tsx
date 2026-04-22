/* ── Navbar ─────────────────────────────────────────────────────────────────── */

import Link from "next/link";
import React from "react";
import Container from "./Container";

import LogoImg from "@/public/logo/orbit_logo.png";
import Logo from "../branding/Logo";

const Navbar: React.FC = () => (
  <header className="sticky top-0 z-50 border-b border-neutral-900/60 bg-neutral-950/80 backdrop-blur">
    <Container className="flex h-16 items-center justify-between">
      <Link href="/" className="flex items-center gap-3">
        <Logo src={LogoImg} text="Orbit Play" size="lg" />
        <span>Agent Penal</span>
      </Link>
    </Container>
  </header>
);

export default Navbar;
