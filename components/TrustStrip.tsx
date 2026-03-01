import React from 'react';
import { LucideIcon } from 'lucide-react';

export type TrustStripItem = {
  icon: LucideIcon;
  label: string;
};

type TrustStripProps = {
  items: TrustStripItem[];
};

const TrustStrip: React.FC<TrustStripProps> = ({ items }) => (
  <div className="mx-auto grid max-w-6xl grid-cols-1 gap-3 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-5 lg:px-8">
    {items.map((item) => (
      <div
        key={item.label}
        className="ryze-card inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800"
      >
        <item.icon size={16} className="text-ryze" aria-hidden="true" />
        <span>{item.label}</span>
      </div>
    ))}
  </div>
);

export default TrustStrip;
