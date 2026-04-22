import Navbar from "@/components/public/Navbar";
import React from "react";

const PublicLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>
    </main>
  );
};

export default PublicLayout;
