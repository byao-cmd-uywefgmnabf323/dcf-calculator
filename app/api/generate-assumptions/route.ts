const MistralClient = require('@mistralai/mistralai');
import { NextRequest, NextResponse } from 'next/server';

const mistralApiKey = process.env.MISTRAL_API_KEY;
const fmpApiKey = process.env.FMP_API_KEY;

if (!mistralApiKey) {
  console.error('MISTRAL_API_KEY is not set');
}
if (!fmpApiKey) {
    console.error('FMP_API_KEY is not set');
}

const mistral = new MistralClient(mistralApiKey || '');

async function getFinancialData(ticker: string) {
    if (!fmpApiKey) return { error: 'FMP API key not configured' };

    try {
        const [incomeStatementRes, analystEstimatesRes] = await Promise.all([
            fetch(`https://financialmodelingprep.com/api/v3/income-statement/${ticker}?period=annual&apikey=${fmpApiKey}`),
            fetch(`https://financialmodelingprep.com/api/v3/analyst-estimates/${ticker}?apikey=${fmpApiKey}`)
        ]);

        if (!incomeStatementRes.ok || !analystEstimatesRes.ok) {
            return { error: 'Failed to fetch financial data.' };
        }

        const incomeStatements = await incomeStatementRes.json();
        const analystEstimates = await analystEstimatesRes.json();

        const historicalGrowth = incomeStatements.slice(0, 5).map((is: any) => ({ year: is.calendarYear, revenue: is.revenue, growth: is.revenueGrowth * 100 }));
        const futureEstimates = analystEstimates.slice(0, 2).map((est: any) => ({ year: est.date.substring(0,4), estimatedRevenueGrowth: est.estimatedRevenueAvg - est.revenue }));

        return { historicalGrowth, futureEstimates };

    } catch (error) {
        console.error('Error fetching financial data:', error);
        return { error: 'An error occurred while fetching financial data.' };
    }
}

export async function POST(req: NextRequest) {
  if (!mistralApiKey) {
    return NextResponse.json({ error: 'MISTRAL_API_KEY is not configured' }, { status: 500 });
  }

  try {
    const { ticker } = await req.json();

    if (!ticker) {
      return NextResponse.json({ error: 'Ticker symbol is required' }, { status: 400 });
    }

    const financialData = await getFinancialData(ticker.toUpperCase());

    if (financialData.error) {
        return NextResponse.json({ error: financialData.error }, { status: 500 });
    }

    const systemPrompt = `You are a sophisticated financial analyst providing assumptions for a Discounted Cash Flow (DCF) model. Your analysis should be neutral, data-driven, and concise. Based on the provided data, generate a base, bull, and bear case for the 5-year Free Cash Flow (FCF) growth rate. FCF growth is often correlated with revenue growth.

    **Historical Revenue Growth:**
    ${JSON.stringify(financialData.historicalGrowth, null, 2)}

    **Analyst Revenue Estimates (next 2 years):**
    ${JSON.stringify(financialData.futureEstimates, null, 2)}

    Provide your output in a structured JSON format with the keys: 'base', 'bull', 'bear'. Each case should have 'rate' (a number) and 'justification' (a brief string).`;

    const userPrompt = `Generate the FCF growth rate assumptions for ${ticker}.`;

    const response = await mistral.chat({
        model: 'mistral-large-latest',
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' }
    });

    const assumptions = JSON.parse(response.choices[0].message.content);

    return NextResponse.json({ assumptions });

  } catch (error) {
    console.error('Error generating assumptions:', error);
    return NextResponse.json({ error: 'An error occurred while generating assumptions.' }, { status: 500 });
  }
}
