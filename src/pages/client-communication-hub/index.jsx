import React from 'react';
import Icon from 'components/AppIcon';
import Breadcrumb from 'components/ui/Breadcrumb';

const ClientCommunicationHub = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <Breadcrumb />
          
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Icon name="MessageSquare" size={48} className="text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-text-primary mb-4">Client Communication Hub</h1>
            <p className="text-text-secondary max-w-md mx-auto">
              This page is under development. Client communication functionality will be available soon.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientCommunicationHub;