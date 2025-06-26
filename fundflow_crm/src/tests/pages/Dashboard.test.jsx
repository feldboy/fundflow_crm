import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '../../pages/dashboard';

// Mock all the dashboard components and services
vi.mock('../../components/ui/Breadcrumb', () => ({
  default: () => <div data-testid="breadcrumb">Breadcrumb</div>,
}));

vi.mock('../../pages/dashboard/components/KPICards', () => ({
  default: ({ data }) => <div data-testid="kpi-cards">KPI Cards: {data ? 'loaded' : 'loading'}</div>,
}));

vi.mock('../../pages/dashboard/components/FundingPipelineChart', () => ({
  default: ({ dateRange }) => <div data-testid="funding-pipeline">Pipeline Chart: {dateRange}</div>,
}));

vi.mock('../../pages/dashboard/components/CaseStatusChart', () => ({
  default: ({ dateRange }) => <div data-testid="case-status-chart">Status Chart: {dateRange}</div>,
}));

vi.mock('../../pages/dashboard/components/MonthlyPerformanceChart', () => ({
  default: ({ dateRange }) => <div data-testid="monthly-performance">Performance Chart: {dateRange}</div>,
}));

vi.mock('../../pages/dashboard/components/RecentActivity', () => ({
  default: ({ data }) => <div data-testid="recent-activity">Recent Activity: {data ? data.length : 0} items</div>,
}));

vi.mock('../../pages/dashboard/components/UrgentTasks', () => ({
  default: () => <div data-testid="urgent-tasks">Urgent Tasks</div>,
}));

vi.mock('../../pages/dashboard/components/QuickActions', () => ({
  default: () => <div data-testid="quick-actions">Quick Actions</div>,
}));

vi.mock('../../pages/dashboard/components/CaseStatusSummary', () => ({
  default: () => <div data-testid="case-status-summary">Case Status Summary</div>,
}));

// Mock services
vi.mock('../../services', () => ({
  plaintiffService: {
    getStats: vi.fn(),
  },
  communicationService: {
    getAll: vi.fn(),
  },
}));

// Mock custom hooks
vi.mock('../../hooks/useApi', () => ({
  useApiOnMount: vi.fn((callback) => ({
    data: null,
    loading: false,
    error: null,
    refetch: vi.fn(),
  })),
}));

const renderDashboard = () => {
  return render(
    <BrowserRouter>
      <Dashboard />
    </BrowserRouter>
  );
};

describe('Dashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    renderDashboard();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('displays correct page title and description', () => {
    renderDashboard();
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Comprehensive overview of your pre-settlement funding operations')).toBeInTheDocument();
  });

  it('renders all dashboard components', () => {
    renderDashboard();
    
    expect(screen.getByTestId('breadcrumb')).toBeInTheDocument();
    expect(screen.getByTestId('kpi-cards')).toBeInTheDocument();
    expect(screen.getByTestId('funding-pipeline')).toBeInTheDocument();
    expect(screen.getByTestId('case-status-chart')).toBeInTheDocument();
    expect(screen.getByTestId('monthly-performance')).toBeInTheDocument();
    expect(screen.getByTestId('recent-activity')).toBeInTheDocument();
    expect(screen.getByTestId('urgent-tasks')).toBeInTheDocument();
    expect(screen.getByTestId('quick-actions')).toBeInTheDocument();
    expect(screen.getByTestId('case-status-summary')).toBeInTheDocument();
  });

  it('renders date range selector with default value', () => {
    renderDashboard();
    
    const dateSelector = screen.getByDisplayValue('Last 30 days');
    expect(dateSelector).toBeInTheDocument();
  });

  it('changes date range when selector is updated', async () => {
    renderDashboard();
    
    const dateSelector = screen.getByDisplayValue('Last 30 days');
    fireEvent.change(dateSelector, { target: { value: '7' } });
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('Last 7 days')).toBeInTheDocument();
    });
  });

  it('has proper responsive layout classes', () => {
    const { container } = renderDashboard();
    const mainContainer = container.querySelector('.max-w-7xl');
    
    expect(mainContainer).toBeInTheDocument();
    expect(mainContainer).toHaveClass('mx-auto');
  });

  it('displays grid layout for charts', () => {
    renderDashboard();
    
    const chartsGrid = screen.getByTestId('funding-pipeline').parentElement;
    expect(chartsGrid).toHaveClass('grid', 'grid-cols-1', 'lg:grid-cols-2', 'gap-6');
  });
});
