import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ClientIntakeForm from '../../pages/client-intake-form';

// Mock the form components
vi.mock('../../pages/client-intake-form/components/FormProgress', () => ({
  default: ({ tabs, activeTab, onTabClick }) => (
    <div data-testid="form-progress">
      {tabs.map(tab => (
        <button 
          key={tab.id} 
          onClick={() => onTabClick(tab.id)}
          data-testid={`tab-${tab.id}`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  ),
}));

vi.mock('../../pages/client-intake-form/components/ClientInformationTab', () => ({
  default: ({ data, errors, onChange }) => (
    <div data-testid="client-info-tab">
      <input
        data-testid="first-name"
        value={data.firstName}
        onChange={(e) => onChange({ firstName: e.target.value })}
        placeholder="First Name"
      />
      <input
        data-testid="last-name"
        value={data.lastName}
        onChange={(e) => onChange({ lastName: e.target.value })}
        placeholder="Last Name"
      />
      <input
        data-testid="email"
        value={data.email}
        onChange={(e) => onChange({ email: e.target.value })}
        placeholder="Email"
      />
      <input
        data-testid="phone"
        value={data.phone}
        onChange={(e) => onChange({ phone: e.target.value })}
        placeholder="Phone"
      />
      {errors.firstName && <span data-testid="first-name-error">{errors.firstName}</span>}
      {errors.lastName && <span data-testid="last-name-error">{errors.lastName}</span>}
      {errors.email && <span data-testid="email-error">{errors.email}</span>}
      {errors.phone && <span data-testid="phone-error">{errors.phone}</span>}
    </div>
  ),
}));

vi.mock('../../pages/client-intake-form/components/CaseDetailsTab', () => ({
  default: ({ data, errors, onChange }) => (
    <div data-testid="case-details-tab">
      <select
        data-testid="case-type"
        value={data.caseType}
        onChange={(e) => onChange({ caseType: e.target.value })}
      >
        <option value="">Select Case Type</option>
        <option value="personal-injury">Personal Injury</option>
        <option value="employment">Employment</option>
      </select>
      <input
        data-testid="incident-date"
        type="date"
        value={data.incidentDate}
        onChange={(e) => onChange({ incidentDate: e.target.value })}
      />
      <textarea
        data-testid="description"
        value={data.description}
        onChange={(e) => onChange({ description: e.target.value })}
        placeholder="Case Description"
      />
      {errors.caseType && <span data-testid="case-type-error">{errors.caseType}</span>}
      {errors.incidentDate && <span data-testid="incident-date-error">{errors.incidentDate}</span>}
      {errors.description && <span data-testid="description-error">{errors.description}</span>}
    </div>
  ),
}));

vi.mock('../../pages/client-intake-form/components/AttorneyInformationTab', () => ({
  default: ({ data, errors, onChange }) => (
    <div data-testid="attorney-info-tab">
      <input
        data-testid="firm-name"
        value={data.firmName}
        onChange={(e) => onChange({ firmName: e.target.value })}
        placeholder="Firm Name"
      />
      <input
        data-testid="attorney-name"
        value={data.attorneyName}
        onChange={(e) => onChange({ attorneyName: e.target.value })}
        placeholder="Attorney Name"
      />
      <input
        data-testid="attorney-email"
        value={data.email}
        onChange={(e) => onChange({ email: e.target.value })}
        placeholder="Attorney Email"
      />
      {errors.firmName && <span data-testid="firm-name-error">{errors.firmName}</span>}
      {errors.attorneyName && <span data-testid="attorney-name-error">{errors.attorneyName}</span>}
      {errors.email && <span data-testid="attorney-email-error">{errors.email}</span>}
    </div>
  ),
}));

vi.mock('../../pages/client-intake-form/components/DocumentUploadTab', () => ({
  default: ({ documents, onChange }) => (
    <div data-testid="document-upload-tab">
      <input
        data-testid="file-upload"
        type="file"
        onChange={(e) => {
          const file = e.target.files[0];
          if (file) {
            onChange([...documents, { id: Date.now(), name: file.name, size: file.size }]);
          }
        }}
      />
      <div data-testid="document-count">{documents.length} documents</div>
    </div>
  ),
}));

vi.mock('../../pages/client-intake-form/components/AIRiskPanel', () => ({
  default: ({ assessment }) => (
    <div data-testid="ai-risk-panel">
      {assessment ? (
        <div>
          <div data-testid="risk-score">Risk Score: {assessment.riskScore}</div>
          <div data-testid="recommendation">{assessment.recommendation}</div>
        </div>
      ) : (
        <div data-testid="no-assessment">No assessment available</div>
      )}
    </div>
  ),
}));

vi.mock('../../components/ui/Breadcrumb', () => ({
  default: () => <div data-testid="breadcrumb">Breadcrumb</div>,
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderClientIntakeForm = () => {
  return render(
    <BrowserRouter>
      <ClientIntakeForm />
    </BrowserRouter>
  );
};

describe('ClientIntakeForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    renderClientIntakeForm();
    expect(screen.getByText('New Case Intake')).toBeInTheDocument();
  });

  it('displays correct page title and description', () => {
    renderClientIntakeForm();
    
    expect(screen.getByText('New Case Intake')).toBeInTheDocument();
    expect(screen.getByText('Complete all sections to submit case for review')).toBeInTheDocument();
  });

  it('renders form progress component', () => {
    renderClientIntakeForm();
    expect(screen.getByTestId('form-progress')).toBeInTheDocument();
  });

  it('renders AI risk panel', () => {
    renderClientIntakeForm();
    expect(screen.getByTestId('ai-risk-panel')).toBeInTheDocument();
  });

  it('starts with client information tab active', () => {
    renderClientIntakeForm();
    expect(screen.getByTestId('client-info-tab')).toBeInTheDocument();
  });

  it('can navigate between tabs', async () => {
    renderClientIntakeForm();
    
    // Click on case details tab
    fireEvent.click(screen.getByTestId('tab-case'));
    
    await waitFor(() => {
      expect(screen.getByTestId('case-details-tab')).toBeInTheDocument();
    });
  });

  it('validates required fields in client information tab', async () => {
    renderClientIntakeForm();
    
    // Try to go to next tab without filling required fields
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('first-name-error')).toBeInTheDocument();
      expect(screen.getByTestId('last-name-error')).toBeInTheDocument();
      expect(screen.getByTestId('email-error')).toBeInTheDocument();
      expect(screen.getByTestId('phone-error')).toBeInTheDocument();
    });
  });

  it('allows navigation to next tab when required fields are filled', async () => {
    renderClientIntakeForm();
    
    // Fill required fields
    fireEvent.change(screen.getByTestId('first-name'), { target: { value: 'John' } });
    fireEvent.change(screen.getByTestId('last-name'), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByTestId('email'), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByTestId('phone'), { target: { value: '555-1234' } });
    
    // Click next button
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('case-details-tab')).toBeInTheDocument();
    });
  });

  it('validates case details tab required fields', async () => {
    renderClientIntakeForm();
    
    // Navigate to case details tab
    fireEvent.click(screen.getByTestId('tab-case'));
    
    // Try to go to next tab without filling required fields
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('case-type-error')).toBeInTheDocument();
      expect(screen.getByTestId('incident-date-error')).toBeInTheDocument();
      expect(screen.getByTestId('description-error')).toBeInTheDocument();
    });
  });

  it('shows progress percentage', () => {
    renderClientIntakeForm();
    expect(screen.getByText(/Progress: \d+%/)).toBeInTheDocument();
  });

  it('displays save functionality when form data is entered', async () => {
    renderClientIntakeForm();
    
    // Fill a field to check save functionality
    fireEvent.change(screen.getByTestId('first-name'), { target: { value: 'John' } });
    
    // Save Draft button should be available
    expect(screen.getByText('Save Draft')).toBeInTheDocument();
  });

  it('handles cancel with confirmation dialog', async () => {
    renderClientIntakeForm();
    
    // Fill some data
    fireEvent.change(screen.getByTestId('first-name'), { target: { value: 'John' } });
    
    // Click cancel
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    await waitFor(() => {
      expect(screen.getByText('Confirm Cancel')).toBeInTheDocument();
    });
  });

  it('updates AI assessment when case details are filled', async () => {
    renderClientIntakeForm();
    
    // Navigate to case details
    fireEvent.click(screen.getByTestId('tab-case'));
    
    // Fill case details
    fireEvent.change(screen.getByTestId('case-type'), { target: { value: 'personal-injury' } });
    fireEvent.change(screen.getByTestId('incident-date'), { target: { value: '2024-01-01' } });
    fireEvent.change(screen.getByTestId('description'), { target: { value: 'Car accident case' } });
    
    // Wait for AI assessment to update
    await waitFor(() => {
      expect(screen.getByTestId('ai-risk-panel')).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it('shows submit button on final tab', async () => {
    renderClientIntakeForm();
    
    // Navigate to documents tab
    fireEvent.click(screen.getByTestId('tab-documents'));
    
    await waitFor(() => {
      expect(screen.getByText('Submit for Review')).toBeInTheDocument();
    });
  });
});
