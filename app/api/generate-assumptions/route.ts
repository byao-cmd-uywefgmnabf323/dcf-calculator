import { NextRequest, NextResponse } from 'next/server';

const mistralApiKey = process.env.MISTRAL_API_KEY;
const fmpApiKey = process.env.FMP_API_KEY;

if (!mistralApiKey) {
  console.error('MISTRAL_API_KEY is not set');
}
if (!fmpApiKey) {
    console.error('FMP_API_KEY is not set');
}

async function getFinancialData(ticker: string) {
    if (!fmpApiKey) return { error: 'FMP API key not configured' };

    try {
        const [incomeStatementRes, analystEstimatesRes] = await Promise.all([
            fetch(`https://financialmodelingprep.com/api/v3/income-statement-growth/${ticker}?limit=5&apikey=${fmpApiKey}`),
            fetch(`https://financialmodelingprep.com/api/v3/analyst-estimates/${ticker}?limit=1&apikey=${fmpApiKey}`)
        ]);

        if (!incomeStatementRes.ok) {
            const errorText = await incomeStatementRes.text();
            return { error: `FMP Income Statement API Error: ${incomeStatementRes.status} ${incomeStatementRes.statusText}. Details: ${errorText}` };
        }
        if (!analystEstimatesRes.ok) {
            const errorText = await analystEstimatesRes.text();
            return { error: `FMP Analyst Estimates API Error: ${analystEstimatesRes.status} ${analystEstimatesRes.statusText}. Details: ${errorText}` };
        }

        const incomeStatements = await incomeStatementRes.json();
        const analystEstimates = await analystEstimatesRes.json();

        const historicalGrowth = incomeStatements.map((is: { date: string; growthRevenue: number }) => ({
            year: is.date.substring(0, 4),
            growth: (is.growthRevenue * 100).toFixed(2)
        }));

        const futureEstimates = analystEstimates.length > 0 ? {
            consensus: analystEstimates[0].consensus,
            estimatedRevenueAvg: analystEstimates[0].estimatedRevenueAvg,
            estimatedEpsAvg: analystEstimates[0].estimatedEpsAvg
        } : { consensus: 'N/A' };

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

    const systemPrompt = `You are a sophisticated financial analyst providing assumptions for a Discounted Cash Flow (DCF) model. Your analysis should be neutral, data-driven, and concise. Based on the provided data, generate a base, bull, and bear case for the 5-year Free Cash Flow (FCF) growth rate. FCF growth is often correlated with revenue growth.\n\n    **Historical Revenue Growth (5 years):**\n    ${JSON.stringify(financialData.historicalGrowth, null, 2)}\n\n    **Analyst Estimates (next year):**\n    ${JSON.stringify(financialData.futureEstimates, null, 2)}\n\n    Provide your output in a structured JSON format with the keys: 'base', 'bull', 'bear'. Each case should have 'rate' (a number) and 'justification' (a brief string).`;

    const userPrompt = `Generate the FCF growth rate assumptions for ${ticker}.`;

    const mistralResponse = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mistralApiKey}`,
        },
        body: JSON.stringify({
            model: 'mistral-large-latest',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            response_format: { type: 'json_object' }
        }),
    });

    if (!mistralResponse.ok) {
        throw new Error(`Mistral API error: ${mistralResponse.statusText}`);
    }

    const responseData = await mistralResponse.json();
    const assumptions = JSON.parse(responseData.choices[0].message.content);

    return NextResponse.json({ assumptions });

  } catch (error) {
    console.error('Error generating assumptions:', error);
    return NextResponse.json({ error: 'An error occurred while generating assumptions.' }, { status: 500 });
  }
}
