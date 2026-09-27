'use client';

import React from 'react';
import { AffiliatePortal } from '../affiliate/AffiliatePortal';

export function AffiliateSection({ onOpenAuth }: { onOpenAuth: () => void }) {
  return (
    <div className="animate-in fade-in duration-300">
      <AffiliatePortal onOpenAuth={onOpenAuth} />
    </div>
  );
}
