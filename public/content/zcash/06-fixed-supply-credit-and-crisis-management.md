# 06 — Fixed Supply, Credit, and Crisis Management

## The monetary base is only one layer

Native ZEC is base settlement money in a ZEC-standard thought experiment. A bank balance promising delivery of ZEC is a claim on an institution. A loan promising repayment next year is another claim. They can all be expressed in ZEC without all being immediately spendable native coins.

Present banking illustrates the distinction: a new loan can create a matching deposit, while interbank payments require settlement assets. Banks are constrained by capital, liquidity, profitability, risk, regulation, and borrower demand. [M01](/sources/#sources-zcash-m01)

**Inference:** a cap on native ZEC does not automatically cap deposits, leverage, derivatives, or nominal debt. These depend on the financial institutions a society allows.

## Three possible ZEC financial systems

| Design | What transaction users hold | How investment is financed | Main risk |
|---|---|---|---|
| Direct bearer system | Native ZEC under their keys | Direct loans, bonds, equity, trade credit | Custody burden, scarce liquidity during a panic |
| Fully reserved payment services plus separate investment funds | A segregated claim backed by native ZEC; investment claims are separate | Term savings and equity fund loans | Fraud, operational failure, maturity mismatch if contracts are misrepresented |
| Fractional-reserve ZEC banks | Redeemable deposits exceeding immediately available ZEC | Lending can create new deposit liabilities | Runs, credit losses, interbank contagion, limited base-money backstop |

All three permit lending. The second design is used for the central hypothesis in [11](/zcash/11-hypothesis-a-world-ready-for-zec/), because it makes the difference between spendable money and risky investment especially explicit. It is a proposed institutional choice, not a description of today's Zcash ecosystem.

## Fully reserved payments do not eliminate credit

**Illustration:** a customer puts 100 ZEC into a payment custodian. The custodian holds 100 ZEC against that customer's immediately redeemable balance. Separately, an investor buys a one-year 50 ZEC lending-fund claim. The fund advances 50 ZEC to a business; the business spends those coins, and promises to repay principal plus agreed interest later.

Credit exists. What the investor cannot truthfully be promised is both unrestricted immediate cash redemption and that the same 50 ZEC remains available in reserve while the borrower uses it.

Interest does not require new coins to be created. Borrowers can acquire existing coins from revenues, and coins can circulate repeatedly. Economy-wide debt sustainability still depends on income, productive capacity, refinancing, distribution, and defaults. Not every borrower can succeed merely because the aggregate accounting is possible.

## What the cap does to prices

Use the identity `M × V = P × Y`, where `M` is a defined stock of money, `V` its expenditure velocity, `P` a price index, and `Y` real output. It is an accounting framework, not a complete causal model. The definition of `M` must be consistent with the transactions counted.

**Illustrations with unchanged M:**

- Real output rises 3%, velocity is unchanged: `P1/P0 = 1/1.03 = 0.9709`, a 2.91% price decline.
- Real output is unchanged, velocity falls 20%: the simplified identity gives a 20% lower price level if adjustment occurs entirely through prices.
- Output falls 10%, velocity is unchanged: `P1/P0 = 1/0.90 = 1.1111`, an 11.11% price rise.

In practice, nominal rigidity, changing deposits, trade, unemployment, inventories, and credit failures complicate these adjustments. The examples show why a supply cap is compatible with either rising or falling consumer prices. It is not a price-level target.

Weber's Bitcoin-standard working paper conjectures mild deflation under its assumptions and retains a limited lender-of-last-resort role. It is a conditional model, not a proof that all hard-money economies behave identically or an official Bank of Canada endorsement. [M02](/sources/#sources-zcash-m02)

## Productivity deflation versus debt deflation

If improved production lowers costs, consumers can benefit from lower prices while firms remain profitable. If instead people suddenly hoard liquid ZEC, spending may contract faster than wages or debts adjust. Falling revenue can then force asset sales and defaults.

**Illustration:** a household owes 100 ZEC. If the price of its consumption basket falls from 1 ZEC to 0.8 ZEC, that principal rises from 100 to 125 baskets of purchasing power. If the household's income falls proportionately, servicing the fixed debt becomes harder.

Borrowers and lenders can share this risk through shorter maturities, revenue-linked repayments, equity, or indexation. Such contracts transfer risk; they do not erase it. Widespread basket indexation also means the basket is performing some of the economic measuring work, even if final payment uses ZEC.

## A lender of last resort can exist, but cannot be unlimited

A ZEC emergency facility can lend reserves it already holds, borrow from willing holders, obtain fiscal transfers, arrange collateral swaps, or coordinate netting. It cannot create additional native ZEC beyond consensus rules. A guarantee becomes doubtful when eligible demands exceed its resources.

Creating emergency government IOUs is possible as an institutional action. Those IOUs would be claims on the state; if they circulate separately, the system has introduced another monetary instrument. Calling them ZEC does not give them the protocol properties of native coins.

Three different problems must be distinguished:

- **Liquidity:** good assets cannot be sold or paid out quickly enough. Temporary lending may help.
- **Solvency:** asset value is insufficient to cover liabilities. Someone must absorb losses.
- **System-wide demand for base money:** everybody wants immediate ZEC simultaneously. Transferring a limited reserve cannot satisfy unlimited demand at unchanged prices.

Even an unlimited fiat liquidity facility cannot create real resources or make every bad loan valuable. ZEC removes one instrument of response, not every existing limit on crisis management.

## Public finance under a ZEC standard

Governments can still levy taxes, sell assets, borrow ZEC, and spend ZEC. They can run deficits if lenders will finance them; annual balanced budgets are not a logical requirement. What they lose is unilateral authority to issue base ZEC to meet those deficits.

A serious fiscal design would therefore specify:

- Which revenues are assessed in ZEC and when they arrive.
- How debt maturity matches revenue and reserve holdings.
- How emergencies are funded before they occur.
- Which benefits adjust automatically and which are fixed promises.
- Who bears losses if revenues collapse.

Holding reserves does not make public spending costless: accumulating them has a current opportunity cost. A rising ZEC price cannot be assumed as the source of future fiscal solvency.

## The central design trade-off

Society may want all of the following: a hard base cap, unlimited immediate redemption of risky deposits, and an unlimited backstop that never imposes losses. A purely native-ZEC system cannot guarantee all three.

It must restrict the redemption promise, pre-fund a finite backstop, allow failures, or introduce additional liabilities and risks. This is the institutional decision hidden by the phrase “put the economy on Zcash.”

## Key takeaways

ZEC scarcity would constrain base-money response, not eliminate lending or all discretionary finance. A plausible system separates safe payment promises from risky investment and makes emergency limits explicit. Whether that arrangement performs well through severe shocks remains an open empirical question.
