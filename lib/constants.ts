import { DcfInputs } from './types';

export const initialInputs: DcfInputs = {
  ticker: 'AAPL',
  forecastYears: 5,
  inputMode: 'baseGrowth',
  baseFcf: 100000, // in millions
  fcfGrowthRate: 5,
  explicitFcfs: [105000, 110250, 115762, 121550, 127628],
  discountRate: 8.5,
  terminalGrowthRate: 2.5,
  sharesOutstanding: 15500, // in millions
  netDebt: 50000, // in millions
};

export const STORAGE_KEY = 'dcf_scenarios_v1';
