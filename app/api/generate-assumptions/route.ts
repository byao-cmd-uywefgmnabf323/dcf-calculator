import { NextRequest, NextResponse } from 'next/server';

const mistralApiKey = process.env.MISTRAL_API_KEY;

if (!mistralApiKey) {
  console.error('MISTRAL_API_KEY is not set');
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

    const systemPrompt = `You are a sophisticated financial analyst providing assumptions for a Discounted Cash Flow (DCF) model. Your analysis should be neutral and concise, based on your general knowledge of the company, its industry, and the economic climate.

    Based on your knowledge, generate a base, bull, and bear case for the 5-year Free Cash Flow (FCF) growth rate for the company with the ticker symbol provided by the user. FCF growth is often correlated with revenue growth.

    Provide your output in a structured JSON format with the keys: 'base', 'bull', 'bear'. Each case should have 'rate' (a number, e.g., 8.5) and 'justification' (a brief string, e.g., 'Based on industry trends and recent performance.').`;

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
        const errorText = await mistralResponse.text();
        throw new Error(`Mistral API error: ${mistralResponse.status} ${mistralResponse.statusText}. Details: ${errorText}`);
    }

    const responseData = await mistralResponse.json();
    const assumptions = JSON.parse(responseData.choices[0].message.content);

    return NextResponse.json({ assumptions });

  } catch (error: any) {
    console.error('Error generating assumptions:', error);
    return NextResponse.json({ error: error.message || 'An error occurred while generating assumptions.' }, { status: 500 });
  }
}
