export interface DcfInputs {
  ticker: string;
  forecastYears: number;
  inputMode: 'baseGrowth' | 'explicit';
  baseFcf: number;
  fcfGrowthRate: number;
  explicitFcfs: number[];
  discountRate: number;
  terminalGrowthRate: number;
  sharesOutstanding: number;
  netDebt: number;
}

export interface DcfResult {
  enterpriseValue: number;
  equityValue: number;
  intrinsicValuePerShare: number;
  projectedFcf: number[];
  sensitivityGrid: SensitivityData[];
  warnings: string[];
}

export interface SensitivityData {
  wacc: number;
  g: number;
  value: number;
}

export interface SavedScenario {
  id: string;
  name: string;
  inputs: DcfInputs;
}
