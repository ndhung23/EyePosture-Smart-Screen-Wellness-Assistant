'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { AuthModal } from '@/components/auth-modal';
import { useAuth } from '@/lib/auth-context';
import { AffiliateHero } from '@/components/affiliate/AffiliateHero';
import { AffiliateCommissionTable } from '@/components/affiliate/AffiliateCommissionTable';
import { AffiliateCalculator } from '@/components/affiliate/AffiliateCalculator';
import { AffiliatePortal } from '@/components/affiliate/AffiliatePortal';
import { AffiliateFaq } from '@/components/affiliate/AffiliateFaq';

export default function AffiliatePage() {
  const { user } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const scrollToPortal = () => {
    const el = document.getElementById('affiliate-portal');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Navigation */}
      <Navbar onOpenAuth={() => setAuthModalOpen(true)} />

      {/* Main Content */}
      <main className="flex-1">
        <AffiliateHero
          onScrollToPortal={scrollToPortal}
          onOpenAuth={() => setAuthModalOpen(true)}
          isLoggedIn={Boolean(user)}
        />

        <AffiliateCommissionTable />

        <AffiliateCalculator />

        <AffiliatePortal onOpenAuth={() => setAuthModalOpen(true)} />

        <AffiliateFaq
          onOpenAuth={() => setAuthModalOpen(true)}
          isLoggedIn={Boolean(user)}
        />
      </main>

      {/* Footer */}
      <Footer />

      {/* Auth Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
}
