import { DcfInputs, DcfResult, SensitivityData } from './types';

export const calculateDcf = (inputs: DcfInputs): DcfResult => {
  const warnings: string[] = [];
  if (inputs.discountRate <= inputs.terminalGrowthRate) {
    warnings.push('Discount rate must be greater than terminal growth rate.');
  }
  if (inputs.sharesOutstanding <= 0) {
    warnings.push('Shares outstanding must be positive.');
  }

  const projectedFcf: number[] = [];
  if (inputs.inputMode === 'baseGrowth') {
    for (let i = 0; i < inputs.forecastYears; i++) {
      projectedFcf.push(inputs.baseFcf * Math.pow(1 + inputs.fcfGrowthRate / 100, i + 1));
    }
  } else {
    if (inputs.explicitFcfs.length !== inputs.forecastYears) {
        warnings.push(`Explicit FCF entries (${inputs.explicitFcfs.length}) must match forecast years (${inputs.forecastYears}).`);
        for (let i = 0; i < inputs.forecastYears; i++) projectedFcf.push(0); // Fill with zeros to prevent crash
    } else {
        projectedFcf.push(...inputs.explicitFcfs);
    }
  }

  const pvFcf = projectedFcf.reduce((acc, fcf, i) => acc + fcf / Math.pow(1 + inputs.discountRate / 100, i + 1), 0);

  const lastProjectedFcf = projectedFcf[projectedFcf.length - 1] || 0;
  const terminalValue = warnings.length === 0 ? (lastProjectedFcf * (1 + inputs.terminalGrowthRate / 100)) / (inputs.discountRate / 100 - inputs.terminalGrowthRate / 100) : 0;
  const pvTerminalValue = warnings.length === 0 ? terminalValue / Math.pow(1 + inputs.discountRate / 100, inputs.forecastYears) : 0;

  const enterpriseValue = pvFcf + pvTerminalValue;
  const equityValue = enterpriseValue - inputs.netDebt;
  const intrinsicValuePerShare = warnings.length > 0 || inputs.sharesOutstanding <= 0 ? 0 : equityValue / inputs.sharesOutstanding;

  // Sensitivity Analysis
  const sensitivityGrid: SensitivityData[] = [];
  const waccRange = [-1, -0.5, 0, 0.5, 1].map(d => inputs.discountRate + d);
  const gRange = [-0.5, -0.25, 0, 0.25, 0.5].map(d => inputs.terminalGrowthRate + d);

  for (const wacc of waccRange) {
    for (const g of gRange) {
      if (wacc > g && inputs.sharesOutstanding > 0) {
        const tempTerminalValue = (lastProjectedFcf * (1 + g / 100)) / (wacc / 100 - g / 100);
        const tempPvTerminalValue = tempTerminalValue / Math.pow(1 + wacc / 100, inputs.forecastYears);
        const tempEnterpriseValue = pvFcf + tempPvTerminalValue;
        const tempEquityValue = tempEnterpriseValue - inputs.netDebt;
        sensitivityGrid.push({ wacc, g, value: tempEquityValue / inputs.sharesOutstanding });
      } else {
        sensitivityGrid.push({ wacc, g, value: 0 });
      }
    }
  }

  return { enterpriseValue, equityValue, intrinsicValuePerShare, projectedFcf, sensitivityGrid, warnings };
};
