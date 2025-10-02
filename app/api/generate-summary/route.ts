import { NextRequest, NextResponse } from 'next/server';

const mistralApiKey = process.env.MISTRAL_API_KEY;
const fmpApiKey = process.env.FMP_API_KEY;

if (!mistralApiKey) {
  console.error('MISTRAL_API_KEY is not set');
}
if (!fmpApiKey) {
    console.error('FMP_API_KEY is not set');
}

async function getCurrentPrice(ticker: string): Promise<{ price: number; error?: string }> {
    if (!fmpApiKey) return { price: 0, error: 'FMP API key not configured' };

    try {
        const response = await fetch(`https://financialmodelingprep.com/stable/quote-short?symbol=${ticker}&apikey=${fmpApiKey}`);
        if (!response.ok) {
            const errorText = await response.text();
            return { price: 0, error: `FMP Quote API Error: ${response.status} ${response.statusText}. Details: ${errorText}` };
        }
        const data = await response.json();
        if (data.length === 0 || !data[0].price) {
            return { price: 0, error: 'Invalid ticker or no price data available from FMP.' };
        }
        return { price: data[0].price };
    } catch (error) {
        console.error('Error fetching current price:', error);
        return { price: 0, error: 'An error occurred while fetching the current price.' };
    }
}

export async function POST(req: NextRequest) {
  if (!mistralApiKey) {
    return NextResponse.json({ error: 'MISTRAL_API_KEY is not configured' }, { status: 500 });
  }

  try {
    const { ticker, intrinsicValue } = await req.json();

    if (!ticker || typeof intrinsicValue !== 'number') {
      return NextResponse.json({ error: 'Ticker and intrinsicValue are required' }, { status: 400 });
    }

    const priceData = await getCurrentPrice(ticker.toUpperCase());
    if (priceData.error) {
        return NextResponse.json({ error: priceData.error }, { status: 500 });
    }

    const systemPrompt = `You are a concise financial analyst. Based on the provided DCF intrinsic value and the current stock price, generate a brief, one-paragraph summary. Conclude whether the stock is overvalued, undervalued, or fairly valued. The tone should be neutral and informative.

    - Ticker: ${ticker}
    - DCF Intrinsic Value: $${intrinsicValue.toFixed(2)}
    - Current Market Price: $${priceData.price.toFixed(2)}`;

    const userPrompt = `Generate a valuation summary for ${ticker}.`;

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
        }),
    });

    if (!mistralResponse.ok) {
        const errorText = await mistralResponse.text();
        throw new Error(`Mistral API error: ${mistralResponse.status} ${mistralResponse.statusText}. Details: ${errorText}`);
    }

    const responseData = await mistralResponse.json();
    const summary = responseData.choices[0].message.content;

    return NextResponse.json({ summary });

  } catch (error: any) {
    console.error('Error generating summary:', error);
    return NextResponse.json({ error: error.message || 'An error occurred while generating summary.' }, { status: 500 });
  }
}
