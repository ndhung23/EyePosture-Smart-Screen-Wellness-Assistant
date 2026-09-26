'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/navbar';
import { Hero } from '@/components/hero';
import { Features } from '@/components/features';
import { Pricing } from '@/components/pricing';
import { Footer } from '@/components/footer';
import { AuthModal } from '@/components/auth-modal';

export default function HomePage() {
  const [authModalOpen, setAuthModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Navbar onOpenAuth={() => setAuthModalOpen(true)} />
      <main className="flex-1">
        <Hero onOpenAuth={() => setAuthModalOpen(true)} />
        <Features />
        <Pricing onOpenAuth={() => setAuthModalOpen(true)} />
      </main>
      <Footer />
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
}
