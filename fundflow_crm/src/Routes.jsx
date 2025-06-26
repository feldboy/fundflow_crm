import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import Header from "components/ui/Header";
import Dashboard from "pages/dashboard";
import CaseManagement from "pages/case-management";
import ClientIntakeForm from "pages/client-intake-form";
import AIRiskAssessment from "pages/ai-risk-assessment";
import ClientCommunicationHub from "pages/client-communication-hub";
import FinancialCalculatorReporting from "pages/financial-calculator-reporting";
import ApiServiceExample from "components/ApiServiceExample";

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <div className="min-h-screen bg-background">
          <Header />
          <main className="pt-20">
            <RouterRoutes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/case-management" element={<CaseManagement />} />
              <Route path="/client-intake-form" element={<ClientIntakeForm />} />
              <Route path="/ai-risk-assessment" element={<AIRiskAssessment />} />
              <Route path="/client-communication-hub" element={<ClientCommunicationHub />} />
              <Route path="/financial-calculator-reporting" element={<FinancialCalculatorReporting />} />
              <Route path="/api-demo" element={<ApiServiceExample />} />
            </RouterRoutes>
          </main>
        </div>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;