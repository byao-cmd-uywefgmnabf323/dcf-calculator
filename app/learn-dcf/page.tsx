'use client';

import Link from 'next/link';
import { ArrowLeft, ChevronsRight } from 'lucide-react';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="mb-12">
    <h2 className="text-2xl font-bold text-indigo-400 mb-4 pb-2 border-b border-gray-700">{title}</h2>
    <div className="prose prose-invert prose-lg max-w-none text-gray-300">
      {children}
    </div>
  </section>
);

const DiagramBox: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`bg-gray-800 border border-gray-600 rounded-lg p-4 text-center ${className}`}>
    {children}
  </div>
);

export default function LearnDcfPage() {
  return (
    <div className="bg-gray-900 text-white min-h-screen font-sans">
      <header className="bg-gray-800/50 backdrop-blur-lg border-b border-gray-700 sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-bold text-white">How a DCF Works</h1>
            <Link href="/" passHref>
              <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-indigo-600 text-white hover:bg-indigo-700 h-9 px-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Calculator
              </button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-4xl">
        <Section title="What is a DCF?">
          <p>
            A Discounted Cash Flow (DCF) analysis is a method used to estimate the value of an investment based on its expected future cash flows. Think of it as a way to figure out what a business is worth <strong>today</strong>, based on all the cash it’s predicted to make in the <strong>future</strong>.
          </p>
          <blockquote>
            It’s like valuing a tree by the fruit it will grow over its lifetime, not just the fruit it has today.
          </blockquote>
        </Section>

        <Section title="The Big Picture: From Cash to Share Price">
          <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-4 my-8">
            <DiagramBox><strong>Free Cash Flow</strong><br/><span className='text-xs'>(Future Earnings)</span></DiagramBox>
            <ChevronsRight className="w-8 h-8 text-gray-500 transform md:-rotate-0 rotate-90" />
            <DiagramBox><strong>Discounting</strong><br/><span className='text-xs'>(Bring to Today's Value)</span></DiagramBox>
            <ChevronsRight className="w-8 h-8 text-gray-500 transform md:-rotate-0 rotate-90" />
            <DiagramBox><strong>Enterprise Value</strong><br/><span className='text-xs'>(Total Company Value)</span></DiagramBox>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-4 my-8">
            <DiagramBox><strong>Enterprise Value</strong></DiagramBox>
            <ChevronsRight className="w-8 h-8 text-gray-500 transform md:-rotate-0 rotate-90" />
            <DiagramBox><strong>- Net Debt</strong><br/><span className='text-xs'>(Adjust for Debt/Cash)</span></DiagramBox>
            <ChevronsRight className="w-8 h-8 text-gray-500 transform md:-rotate-0 rotate-90" />
            <DiagramBox><strong>Equity Value</strong><br/><span className='text-xs'>(Value for Shareholders)</span></DiagramBox>
            <ChevronsRight className="w-8 h-8 text-gray-500 transform md:-rotate-0 rotate-90" />
            <DiagramBox><strong>Price / Share</strong><br/><span className='text-xs'>(Final Valuation)</span></DiagramBox>
          </div>
        </Section>

        <Section title="Key Concepts in the Calculator">
          <ul>
            <li><strong>Free Cash Flow (FCF):</strong> This is the cash a company generates after covering all its operating expenses and investments. It's the money left over that could be returned to investors.</li>
            <li><strong>Forecast Years:</strong> How far into the future we predict the FCF. Typically 5 or 10 years.</li>
            <li><strong>Growth Rate:</strong> The percentage by which we expect the FCF to grow each year during the forecast period.</li>
            <li><strong>WACC (Discount Rate):</strong> The “interest rate” we use to convert future cash into today's value. Future money is worth less than money today, and the WACC accounts for that risk and time value.</li>
            <li><strong>Terminal Growth Rate:</strong> A small, stable growth rate we assume for the company's cash flows forever after the forecast period ends.</li>
            <li><strong>Enterprise Value, Equity Value, Price per Share:</strong> These are the final outputs. Enterprise Value is the total value of the company. Equity Value is what's left for shareholders after paying off debt. Price per Share is the Equity Value divided by the number of shares.</li>
          </ul>
        </Section>

        <Section title="Why DCF is Useful">
          <ul>
            <li>It helps investors decide if a stock is <strong>undervalued</strong> or <strong>overvalued</strong> based on its fundamentals.</li>
            <li>It provides a structured way to test your own assumptions about a company's future.</li>
            <li>It forces you to think about the <strong>long-term health</strong> and cash-generating ability of a business, not just short-term market hype.</li>
          </ul>
        </Section>

        <Section title="Limitations to Keep in Mind">
          <ul>
            <li><strong>Sensitive to Assumptions:</strong> Small changes in the growth rate or WACC can lead to very different valuation results.</li>
            <li><strong>Garbage In, Garbage Out:</strong> The valuation is only as good as the assumptions you put in.</li>
            <li><strong>Best for Mature Companies:</strong> DCF works best for stable, predictable businesses with a history of generating cash. It's less reliable for early-stage startups with uncertain futures.</li>
          </ul>
        </Section>

        <Section title="Tips for Beginners">
          <ul>
            <li><strong>Start with conservative assumptions.</strong> It's better to be cautiously optimistic than wildly bullish.</li>
            <li><strong>Always look at the sensitivity table.</strong> This shows you a range of possible values and highlights how much your assumptions matter.</li>
            <li><strong>Compare your result with the current market price,</strong> but also do your own research on the business itself. A DCF is a tool, not a crystal ball.</li>
          </ul>
        </Section>

        <div className="text-center mt-16 p-6 bg-gray-800 rounded-lg border border-indigo-600">
          <p className="text-lg text-gray-200">
            Once you’re comfortable, go back and play with the calculator to see these ideas in action!
          </p>
          <Link href="/" passHref>
            <button className="mt-4 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-indigo-600 text-white hover:bg-indigo-700 h-10 px-6">
              Go to Calculator
            </button>
          </Link>
        </div>
      </main>
    </div>
  );
}
