import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';

const Breadcrumb = () => {
  const location = useLocation();
  
  const routeMap = {
    '/dashboard': 'Dashboard',
    '/case-management': 'Case Management',
    '/client-intake-form': 'Client Intake Form',
    '/ai-risk-assessment': 'AI Risk Assessment',
    '/client-communication-hub': 'Client Communication Hub',
    '/financial-calculator-reporting': 'Financial Calculator & Reporting'
  };

  const generateBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(segment => segment);
    const breadcrumbs = [{ path: '/dashboard', label: 'Dashboard' }];

    if (location.pathname !== '/dashboard') {
      const currentRoute = location.pathname;
      const currentLabel = routeMap[currentRoute];
      
      if (currentLabel) {
        // Add Cases parent for case-related routes
        if (['/case-management', '/client-intake-form', '/ai-risk-assessment'].includes(currentRoute)) {
          breadcrumbs.push({ path: '/case-management', label: 'Cases' });
          if (currentRoute !== '/case-management') {
            breadcrumbs.push({ path: currentRoute, label: currentLabel });
          }
        } else {
          breadcrumbs.push({ path: currentRoute, label: currentLabel });
        }
      }
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav className="flex items-center space-x-2 text-sm text-text-secondary mb-6" aria-label="Breadcrumb">
      {breadcrumbs.map((crumb, index) => (
        <div key={crumb.path} className="flex items-center space-x-2">
          {index > 0 && (
            <Icon name="ChevronRight" size={16} className="text-text-secondary" />
          )}
          {index === breadcrumbs.length - 1 ? (
            <span className="text-text-primary font-medium" aria-current="page">
              {crumb.label}
            </span>
          ) : (
            <Link
              to={crumb.path}
              className="hover:text-text-primary transition-micro"
            >
              {crumb.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
};

export default Breadcrumb;