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
            fetch(`https://financialmodelingprep.com/api/v3/income-statement/${ticker}?period=annual&apikey=${fmpApiKey}`),
            fetch(`https://financialmodelingprep.com/api/v3/analyst-estimates/${ticker}?apikey=${fmpApiKey}`)
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

        const historicalGrowth = incomeStatements.slice(0, 5).map((is: { calendarYear: string; revenue: number; revenueGrowth: number }) => ({ year: is.calendarYear, revenue: is.revenue, growth: is.revenueGrowth * 100 }));
        const futureEstimates = analystEstimates.slice(0, 2).map((est: { date: string; estimatedRevenueAvg: number; revenue: number }) => ({ year: est.date.substring(0,4), estimatedRevenueGrowth: est.estimatedRevenueAvg - est.revenue }));

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

    const systemPrompt = `You are a sophisticated financial analyst...`; // (Content is the same)

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
