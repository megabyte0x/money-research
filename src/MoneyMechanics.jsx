import React from 'react';

const BOE_MONEY = 'https://www.bankofengland.co.uk/-/media/boe/files/quarterly-bulletin/2014/money-creation-in-the-modern-economy.pdf';
const BOE_QE = 'https://www.bankofengland.co.uk/monetary-policy/quantitative-easing';
const DMO_GILTS = 'https://www.dmo.gov.uk/investor-information/';

function Changes({ caption, rows }) {
  return <div className="mechanics-table-wrap" role="region" aria-label={caption} tabIndex={0}><table className="mechanics-table">
    <caption>{caption}</caption>
    <thead><tr><th scope="col">Who</th><th scope="col">Assets change</th><th scope="col">Liabilities change</th></tr></thead>
    <tbody>{rows.map(([who, assets, liabilities]) => <tr key={who}>
      <th scope="row">{who}</th><td>{assets}</td><td>{liabilities}</td>
    </tr>)}</tbody>
  </table></div>;
}

export default function MoneyMechanics() {
  return <article className="intro-page mechanics-page">
    <p className="eyebrow">Explainer · stylised £100 examples · UK institutional frame</p>
    <h1>How money is created and moved</h1>
    <p className="lead">A loan, a payment, a government bond and a central-bank asset purchase are four different transactions. Following who gains an asset and who owes a liability prevents “money printing” from standing in for all of them.</p>
    <p className="small-note">These examples omit interest, fees, taxes and later transactions. A “+£100” is a change, not an account's total balance. They explain mechanics, not the net effect of a policy on inflation or welfare.</p>
    <nav className="mechanics-jump" aria-label="Explainer contents"><a href="/#/mechanics/mechanics-loan">Bank loan</a><a href="/#/mechanics/mechanics-payment">Payment</a><a href="/#/mechanics/mechanics-bond">Bond issue</a><a href="/#/mechanics/mechanics-qe">QE purchase</a></nav>

    <section id="mechanics-loan">
      <h2>1. A bank makes a £100 loan</h2>
      <p>The bank records a £100 claim on the borrower and credits the borrower's deposit account by £100. The customer gains a spendable bank deposit and owes the loan. No other saver had to hand over an existing deposit first; no central-bank reserves are transferred at this instant.</p>
      <Changes caption="At loan origination; changes relative to immediately before" rows={[
        ['Lending bank', '+£100 loan claim', '+£100 customer deposit owed'],
        ['Borrower', '+£100 bank deposit', '+£100 loan owed'],
        ['Central bank', 'No change from this loan alone', 'No change from this loan alone']
      ]} />
      <p>Repaying the loan principal later reduces the bank's loan asset and a deposit liability. Lending is not unlimited: borrower demand, expected losses, capital, liquidity, funding costs, profitability, regulation and monetary policy all matter. <a href={BOE_MONEY}>Source: Bank of England, 2014, pp. 16–20 →</a></p>
    </section>

    <section id="mechanics-payment">
      <h2>2. The borrower pays someone at another bank</h2>
      <p>Suppose that borrower sends the £100 deposit to a seller at a different bank. The first bank reduces the borrower's deposit and transfers £100 of reserves to the second bank. The second bank credits the seller's deposit. The deposit has moved between people and banks; the banking system has not created another £100 of customer deposits merely by making this payment.</p>
      <Changes caption="Interbank payment after the loan; changes caused by this payment" rows={[
        ['Borrower at bank A', '−£100 deposit', 'No change to the loan owed'],
        ['Bank A', '−£100 reserves', '−£100 borrower deposit owed'],
        ['Bank B', '+£100 reserves', '+£100 seller deposit owed'],
        ['Seller at bank B', '+£100 deposit', 'No change']
      ]} />
      <p>Reserves are balances that eligible institutions hold at the central bank to settle with one another; ordinary households cannot spend reserves directly. Bank A must manage the reserves or other funding it needs when deposits leave. <a href={BOE_MONEY}>Source: Bank of England, 2014, Figure 2 and pp. 18–19 →</a></p>
    </section>

    <section id="mechanics-bond">
      <h2>3. A government issues a new bond</h2>
      <p>A new bond is the government's promise to pay its holder under specified terms. If a non-bank investor buys a newly issued £100 bond, the investor exchanges a deposit for that bond; the government receives the proceeds and takes on a £100 bond liability. That is borrowing, not a commercial-bank loan to the investor and not a central-bank QE purchase.</p>
      <Changes caption="New £100 bond bought by a non-bank investor; simplified positions at issuance" rows={[
        ['Investor', '−£100 bank deposit; +£100 new bond', 'No new loan obligation'],
        ['Government', '+£100 proceeds in its account', '+£100 new bond owed']
      ]} />
      <p>The payment passes through banks and government accounts, so deposit and reserve balances change as it settles. When the government later spends the proceeds, those balances move again. Issuance and spending must be followed separately to say what happened to private deposits overall. <a href={DMO_GILTS}>Source: UK Debt Management Office, gilt financing →</a> <a href={BOE_QE}>Bank of England, QE as a separate purchase →</a></p>
    </section>

    <section id="mechanics-qe">
      <h2>4. The central bank buys an existing bond</h2>
      <p>In the Bank of England's stylised QE example, a pension fund sells a £100 government bond that it already owns. The pension fund receives a £100 deposit at its commercial bank. The central bank acquires the bond and credits that bank with £100 of new reserves. The bank's new reserve asset is matched by a new deposit liability to the pension fund—not a free £100 windfall.</p>
      <Changes caption="QE purchase of an existing bond from a non-bank seller" rows={[
        ['Pension fund', '−£100 bond; +£100 bank deposit', 'No change'],
        ['Commercial bank', '+£100 reserves', '+£100 pension-fund deposit owed'],
        ['Central bank', '+£100 bond', '+£100 reserves owed to bank']
      ]} />
      <p>If the seller were a bank instead, it would exchange a bond asset for a reserve asset without a new customer deposit in that first step. QE may influence yields, asset prices and spending; it does not mechanically force banks to make new loans, nor is buying an existing bond the same transaction as the government issuing one. <a href={BOE_MONEY}>Source: Bank of England, 2014, Figure 3 and pp. 24–25 →</a> <a href={BOE_QE}>Plain-language QE guide →</a></p>
    </section>

    <section id="mechanics-takeaway">
      <h2>What to keep distinct</h2>
      <p><strong>Deposits</strong> are commercial banks' promises to customers. <strong>Reserves</strong> are central-bank promises to eligible institutions. <strong>Government bonds</strong> are borrowing obligations. <strong>QE</strong> swaps an existing asset for newly created reserves and, when the seller is a non-bank, a matching customer deposit. These balance-sheet mechanics are a starting point; the macroeconomic effects still depend on behavior and policy.</p>
      <div className="actions"><a href="/after/07-financial-crisis-and-the-age-of-qe-2007-2019/">The crisis and QE chapter →</a><a href="/#/compare">Compare monetary arrangements →</a></div>
    </section>
  </article>;
}
