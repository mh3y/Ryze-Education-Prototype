import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface FeatureGateProps {
  enabled: boolean;
  children: React.ReactElement;
  fallbackPath?: string;
}

const FeatureGate: React.FC<FeatureGateProps> = ({
  enabled,
  children,
  fallbackPath = '/',
}) => {
  const location = useLocation();

  if (!enabled) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  return children;
};

export default FeatureGate;