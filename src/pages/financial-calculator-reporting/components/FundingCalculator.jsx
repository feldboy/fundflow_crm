import React, { useState, useEffect } from 'react';

import Icon from 'components/AppIcon';

const FundingCalculator = () => {
  const [calculatorData, setCalculatorData] = useState({
    caseValue: '',
    riskFactor: 'medium',
    termLength: '12',
    feeStructure: 'standard',
    advanceAmount: '',
    customFeeRate: ''
  });

  const [results, setResults] = useState({
    fundingAmount: 0,
    totalFees: 0,
    profitMargin: 0,
    roi: 0,
    totalReturn: 0
  });

  const [scenarios, setScenarios] = useState([]);

  const riskFactors = [
    { value: 'low', label: 'Low Risk', multiplier: 0.8, color: 'text-success' },
    { value: 'medium', label: 'Medium Risk', multiplier: 1.0, color: 'text-warning' },
    { value: 'high', label: 'High Risk', multiplier: 1.3, color: 'text-error' }
  ];

  const feeStructures = [
    { value: 'standard', label: 'Standard (3% monthly)', rate: 0.03 },
    { value: 'premium', label: 'Premium (2.5% monthly)', rate: 0.025 },
    { value: 'high-risk', label: 'High Risk (4% monthly)', rate: 0.04 },
    { value: 'custom', label: 'Custom Rate', rate: 0 }
  ];

  useEffect(() => {
    calculateFunding();
  }, [calculatorData]);

  const calculateFunding = () => {
    const caseValue = parseFloat(calculatorData.caseValue) || 0;
    const termLength = parseInt(calculatorData.termLength) || 12;
    const riskMultiplier = riskFactors.find(r => r.value === calculatorData.riskFactor)?.multiplier || 1;
    
    let monthlyRate = feeStructures.find(f => f.value === calculatorData.feeStructure)?.rate || 0.03;
    if (calculatorData.feeStructure === 'custom') {
      monthlyRate = parseFloat(calculatorData.customFeeRate) / 100 || 0.03;
    }

    const maxFundingPercentage = 0.15; // 15% of case value
    const baseFundingAmount = caseValue * maxFundingPercentage;
    const adjustedFundingAmount = baseFundingAmount / riskMultiplier;
    
    const fundingAmount = Math.min(adjustedFundingAmount, parseFloat(calculatorData.advanceAmount) || adjustedFundingAmount);
    const totalFees = fundingAmount * monthlyRate * termLength;
    const totalReturn = fundingAmount + totalFees;
    const profitMargin = (totalFees / fundingAmount) * 100;
    const roi = (totalFees / fundingAmount) * (12 / termLength) * 100;

    setResults({
      fundingAmount: Math.round(fundingAmount),
      totalFees: Math.round(totalFees),
      profitMargin: Math.round(profitMargin * 100) / 100,
      roi: Math.round(roi * 100) / 100,
      totalReturn: Math.round(totalReturn)
    });
  };

  const addScenario = () => {
    const newScenario = {
      id: Date.now(),
      name: `Scenario ${scenarios.length + 1}`,
      data: { ...calculatorData },
      results: { ...results }
    };
    setScenarios([...scenarios, newScenario]);
  };

  const removeScenario = (id) => {
    setScenarios(scenarios.filter(s => s.id !== id));
  };

  const handleInputChange = (field, value) => {
    setCalculatorData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Calculator Input */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-surface border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold text-text-primary mb-6 flex items-center">
            <Icon name="Calculator" size={20} className="mr-2" />
            Funding Calculator
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Case Value */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Expected Case Value ($)
              </label>
              <input
                type="number"
                value={calculatorData.caseValue}
                onChange={(e) => handleInputChange('caseValue', e.target.value)}
                placeholder="500000"
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Risk Factor */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Risk Assessment
              </label>
              <select
                value={calculatorData.riskFactor}
                onChange={(e) => handleInputChange('riskFactor', e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {riskFactors.map((risk) => (
                  <option key={risk.value} value={risk.value}>
                    {risk.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Term Length */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Expected Term (months)
              </label>
              <input
                type="number"
                value={calculatorData.termLength}
                onChange={(e) => handleInputChange('termLength', e.target.value)}
                min="1"
                max="60"
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Fee Structure */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Fee Structure
              </label>
              <select
                value={calculatorData.feeStructure}
                onChange={(e) => handleInputChange('feeStructure', e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {feeStructures.map((fee) => (
                  <option key={fee.value} value={fee.value}>
                    {fee.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Fee Rate */}
            {calculatorData.feeStructure === 'custom' && (
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Custom Monthly Rate (%)
                </label>
                <input
                  type="number"
                  value={calculatorData.customFeeRate}
                  onChange={(e) => handleInputChange('customFeeRate', e.target.value)}
                  placeholder="3.0"
                  step="0.1"
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            )}

            {/* Advance Amount */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Requested Advance ($)
              </label>
              <input
                type="number"
                value={calculatorData.advanceAmount}
                onChange={(e) => handleInputChange('advanceAmount', e.target.value)}
                placeholder="Auto-calculated"
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={addScenario}
              className="flex items-center space-x-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-micro"
            >
              <Icon name="Plus" size={16} />
              <span>Save Scenario</span>
            </button>
            <button
              onClick={() => setCalculatorData({
                caseValue: '',
                riskFactor: 'medium',
                termLength: '12',
                feeStructure: 'standard',
                advanceAmount: '',
                customFeeRate: ''
              })}
              className="flex items-center space-x-2 px-4 py-2 border border-border text-text-primary rounded-lg hover:bg-background transition-micro"
            >
              <Icon name="RotateCcw" size={16} />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Scenario Comparison */}
        {scenarios.length > 0 && (
          <div className="bg-surface border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
              <Icon name="GitCompare" size={18} className="mr-2" />
              Scenario Comparison
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium text-text-primary">Scenario</th>
                    <th className="text-right py-3 px-4 font-medium text-text-primary">Case Value</th>
                    <th className="text-right py-3 px-4 font-medium text-text-primary">Funding</th>
                    <th className="text-right py-3 px-4 font-medium text-text-primary">Total Fees</th>
                    <th className="text-right py-3 px-4 font-medium text-text-primary">ROI</th>
                    <th className="text-center py-3 px-4 font-medium text-text-primary">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {scenarios.map((scenario) => (
                    <tr key={scenario.id} className="border-b border-border">
                      <td className="py-3 px-4 text-text-primary">{scenario.name}</td>
                      <td className="py-3 px-4 text-right text-text-primary">
                        ${scenario.data.caseValue ? parseInt(scenario.data.caseValue).toLocaleString() : '0'}
                      </td>
                      <td className="py-3 px-4 text-right text-text-primary">
                        ${scenario.results.fundingAmount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right text-text-primary">
                        ${scenario.results.totalFees.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right text-success">
                        {scenario.results.roi}%
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => removeScenario(scenario.id)}
                          className="text-error hover:text-error/80 transition-micro"
                        >
                          <Icon name="Trash2" size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Results Panel */}
      <div className="space-y-6">
        <div className="bg-surface border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
            <Icon name="TrendingUp" size={18} className="mr-2" />
            Calculation Results
          </h3>

          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-primary/5 rounded-lg">
              <span className="text-text-secondary">Funding Amount</span>
              <span className="text-xl font-bold text-primary">
                ${results.fundingAmount.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between items-center p-4 bg-background rounded-lg">
              <span className="text-text-secondary">Total Fees</span>
              <span className="text-lg font-semibold text-text-primary">
                ${results.totalFees.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between items-center p-4 bg-background rounded-lg">
              <span className="text-text-secondary">Total Return</span>
              <span className="text-lg font-semibold text-success">
                ${results.totalReturn.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between items-center p-4 bg-background rounded-lg">
              <span className="text-text-secondary">Profit Margin</span>
              <span className="text-lg font-semibold text-accent">
                {results.profitMargin}%
              </span>
            </div>

            <div className="flex justify-between items-center p-4 bg-background rounded-lg">
              <span className="text-text-secondary">Annualized ROI</span>
              <span className="text-lg font-semibold text-success">
                {results.roi}%
              </span>
            </div>
          </div>

          {/* Risk Indicator */}
          <div className="mt-6 p-4 border border-border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-text-primary">Risk Level</span>
              <span className={`text-sm font-medium ${
                riskFactors.find(r => r.value === calculatorData.riskFactor)?.color || 'text-text-secondary'
              }`}>
                {riskFactors.find(r => r.value === calculatorData.riskFactor)?.label || 'Medium Risk'}
              </span>
            </div>
            <div className="w-full bg-background rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  calculatorData.riskFactor === 'low' ? 'bg-success w-1/3' :
                  calculatorData.riskFactor === 'medium'? 'bg-warning w-2/3' : 'bg-error w-full'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-surface border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-micro">
              <Icon name="FileText" size={16} />
              <span>Generate Quote</span>
            </button>
            <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 border border-border text-text-primary rounded-lg hover:bg-background transition-micro">
              <Icon name="Send" size={16} />
              <span>Send to Client</span>
            </button>
            <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 border border-border text-text-primary rounded-lg hover:bg-background transition-micro">
              <Icon name="Save" size={16} />
              <span>Save Template</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FundingCalculator;