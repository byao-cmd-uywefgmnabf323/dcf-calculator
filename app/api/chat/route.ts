import { NextRequest, NextResponse } from 'next/server';

const mistralApiKey = process.env.MISTRAL_API_KEY;

if (!mistralApiKey) {
  console.error('MISTRAL_API_KEY is not set');
}

const educationalContent = `
  What is a DCF?
A Discounted Cash Flow (DCF) analysis is a method used to estimate the value of an investment based on its expected future cash flows. It's a way to figure out what a business is worth today, based on all the cash it's predicted to make in the future. It’s like valuing a tree by the fruit it will grow over its lifetime, not just the fruit it has today.

  The Big Picture: From Cash to Share Price
The process flows from projecting Free Cash Flow, to Discounting it to today's value to get the Enterprise Value. From the Enterprise Value, you subtract Net Debt to get the Equity Value, which you then divide by shares outstanding to get the Price per Share.

  Key Concepts in the Calculator
  - Free Cash Flow (FCF): The cash a company generates after covering all its operating expenses and investments. It’s the money left over that could be returned to investors.
  - Forecast Years: How far into the future we predict the FCF. Typically 5 or 10 years.
  - Growth Rate: The percentage by which we expect the FCF to grow each year during the forecast period.
  - WACC (Discount Rate): The “interest rate” we use to convert future cash into today's value. Future money is worth less than money today, and the WACC accounts for that risk and time value.
  - Terminal Growth Rate: A small, stable growth rate we assume for the company's cash flows forever after the forecast period ends.
  - Enterprise Value, Equity Value, Price per Share: These are the final outputs. Enterprise Value is the total value of the company. Equity Value is what's left for shareholders after paying off debt. Price per Share is the Equity Value divided by the number of shares.

  Why DCF is Useful
  - It helps investors decide if a stock is undervalued or overvalued based on its fundamentals.
  - It provides a structured way to test your own assumptions about a company's future.
  - It forces you to think about the long-term health and cash-generating ability of a business, not just short-term market hype.

  Limitations to Keep in Mind
  - Sensitive to Assumptions: Small changes in the growth rate or WACC can lead to very different valuation results.
  - Garbage In, Garbage Out: The valuation is only as good as the assumptions you put in.
  - Best for Mature Companies: DCF works best for stable, predictable businesses with a history of generating cash. It's less reliable for early-stage startups with uncertain futures.

  Tips for Beginners
  - Start with conservative assumptions. It's better to be cautiously optimistic than wildly bullish.
  - Always look at the sensitivity table. This shows you a range of possible values and highlights how much your assumptions matter.
  - Compare your result with the current market price, but also do your own research on the business itself. A DCF is a tool, not a crystal ball.
`;

export async function POST(req: NextRequest) {
  if (!mistralApiKey) {
    return NextResponse.json({ error: 'MISTRAL_API_KEY is not configured' }, { status: 500 });
  }

  try {
    const { messages } = await req.json();

    const systemPrompt = `You are an expert, friendly, and helpful educational chatbot for a financial modeling website. Your purpose is to answer questions about Discounted Cash Flow (DCF) analysis. Your knowledge is strictly limited to the following text. Do not answer any questions that go beyond this context. If a question is outside of this context, politely state that you can only answer questions about the provided material.

    --- CONTEXT ---
    ${educationalContent}
    --- END CONTEXT ---`;

    const latestUserMessage = messages[messages.length - 1].content;

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
                { role: 'user', content: latestUserMessage }
            ],
        }),
    });

    if (!mistralResponse.ok) {
        const errorText = await mistralResponse.text();
        throw new Error(`Mistral API error: ${mistralResponse.status} ${mistralResponse.statusText}. Details: ${errorText}`);
    }

    const responseData = await mistralResponse.json();
    const botResponse = responseData.choices[0].message.content;

    return NextResponse.json({ response: botResponse });

  } catch (error: any) {
    console.error('Error in chat API:', error);
    return NextResponse.json({ error: error.message || 'An error occurred during the chat.' }, { status: 500 });
  }
}
