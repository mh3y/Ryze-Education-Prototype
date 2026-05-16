/**
 * PlaceholderPage — a generic "under construction" page used for
 * routes that haven't been built yet.
 */

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Settings } from 'lucide-react';

const PlaceholderPage: React.FC<{ title?: string }> = ({ title }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const segment = location.pathname.split('/').filter(Boolean).pop() ?? 'page';
  const displayTitle = title ?? segment.replace(/-/g, ' ');

  return (
    <div className="h-full flex flex-col items-center justify-center text-center min-h-[60vh]">
      <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center ryze-text-muted mb-6 border border-white/5">
        <Settings size={40} />
      </div>
      <h2 className="text-3xl font-bold ryze-text-inverse mb-3 capitalize">{displayTitle}</h2>
      <p className="ryze-text-muted max-w-md mb-8 leading-relaxed">
        This module is defined in the architecture but not yet implemented.
      </p>
      <button
        onClick={() => navigate('/dashboard/overview')}
        className="px-8 py-3 bg-white/10 hover:bg-white/20 ryze-text-inverse font-bold rounded-xl transition-all border border-white/5"
      >
        Return to Dashboard
      </button>
    </div>
  );
};

export default PlaceholderPage;
