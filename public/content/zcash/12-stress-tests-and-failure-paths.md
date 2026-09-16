# 12 — Stress Tests and Failure Paths

**All numerical shocks below are invented stress scenarios.** They are not forecasts, observed ZEC returns, or estimates of failure probability. The purpose is to test whether the system in [10](/zcash/10-hypothesis-a-world-ready-for-zec/) and [11](/zcash/11-hypothesis-adoption-roadmap-and-worked-example/) can keep its promises.

## 1. ZEC loses half its external value

**Scenario:** a firm earns 100 ZEC a month but owes 5,000 dollars in imported inputs. At $100/ZEC those inputs cost 50 ZEC. At $50/ZEC they cost 100 ZEC, leaving nothing from the same revenue for wages or other expenses.

**Response:** currency matching, lower unhedged exposure, forward contracts with credible counterparties, reserves, changed prices, or renegotiation. If the whole local economy uses ZEC, foreign inputs can still transmit the shock.

**Failure signal:** firms can stay solvent only by automatically restoring dollar-denominated prices and wages. This would weaken the claim that native ZEC denomination is durable.

## 2. ZEC appreciates sharply during adoption

**Scenario:** rapid new demand doubles ZEC's purchasing power before wages and debts adjust. Existing holders gain purchasing power; new entrants need to acquire balances at higher prices. Fixed ZEC debt becomes harder for borrowers whose revenues do not rise correspondingly.

**Response:** phased acquisition, voluntary short contracts, explicit indexation where desired, distributional transfers financed from real resources, and avoidance of heavily leveraged conversion.

**Failure signal:** the transition depends on perpetual price appreciation or systematically transfers losses to residents who did not choose the exposure.

## 3. A fractional-reserve institution faces a run

**Illustrative balance sheet:** assets are 100 ZEC of reserves and 300 ZEC of loans; liabilities are 300 ZEC of demand deposits, 80 ZEC of term claims, and 20 ZEC of equity.

If demand depositors request 150 ZEC immediately, reserves fall short by 50 ZEC. The institution may be solvent if loans are sound, but it needs a loan, asset sale, or negotiated delay. If its loan book instead loses 30 ZEC of value, the 20 ZEC equity cushion is insufficient even before considering liquidity.

**Response:** finite emergency facilities can address some liquidity shortages; resolution and loss allocation address insolvency. A proof-of-reserves snapshot cannot remove the maturity mismatch.

**Failure signal:** supervisors conceal shortfalls, merge investment losses into payment balances, or promise native coins they cannot obtain.

## 4. A fully reserved payment provider fails

**Scenario:** the provider becomes insolvent because its business expenses exceed fee revenue. Properly segregated client ZEC still exists, but users cannot access the app or keys promptly.

**Response:** tested transfer of control to a successor, operational redundancy, independently verified client ownership, and a funded administration process.

**Limit:** full reserves can reduce asset-shortfall risk; they do not eliminate outages, theft, fraud, legal delay, or bad key management.

**Failure signal:** “100% backed” was only a marketing claim, or client funds were legally available to ordinary creditors.

## 5. Recession increases demand for liquid ZEC

**Scenario:** households and firms delay spending and seek liquidity. Receipts fall while nominal debts and wages adjust slowly. Asset sales depress collateral values and lenders shorten maturities.

**Response:** pre-funded income support, term restructuring, equity loss absorption, reserve lending, and regional transfers. These redistribute available liquidity and risk; they do not create unlimited base money.

**Failure signal:** protecting nominal claims requires unemployment or defaults that the society finds intolerable, causing emergency IOUs to become the actual circulating money.

## 6. Energy or food supply collapses

**Scenario:** a port closure or crop failure reduces available goods. Their ZEC prices rise despite unchanged issuance.

**Response:** imports, production changes, inventories, targeted support, and rationing if chosen. A monetary reform cannot create the missing goods.

**Failure signal:** officials treat the supply cap as proof inflation cannot occur and fail to address the real shortage.

## 7. A critical proof-circuit flaw is discovered

**Scenario:** parts of the shielded system must be paused, patched, or migrated while payroll and business payments are due. The historical 2026 response shows why this category deserves explicit planning; the scenario does not assert a new flaw. See [09](/zcash/09-zcash-specific-risks-and-governance/).

**Response:** rehearsed incident governance, alternate contractual payment arrangements, time extensions, independently reviewed fixes, and clear disclosure of what supply checks do and do not establish.

**Failure signal:** the economy needs constant unplanned intervention, cannot identify authoritative contract treatment, or confuses reassuring statements with verified security properties.

## 8. Privacy is lost at the operational layer

**Scenario:** a payroll exporter, cloud backup, remote prover, or auditor leaks transaction information. The chain's proof system remains sound.

**Response:** minimal disclosure, scoped roles, local controls, secure backups, and accountability for processors. Once disclosed, information cannot reliably be recalled.

**Failure signal:** routine users obtain no material privacy advantage over the available alternative despite accepting greater monetary or custody risk.

## 9. Large holders, venues, or infrastructure providers withdraw

**Scenario:** a major liquidity provider exits, spreads widen, and treasury sales move prices sharply. Mining or wallet infrastructure also becomes concentrated in a few operators.

**Response:** diverse access, realistic execution limits, redundant infrastructure, and conservative treasury exposures. Holding a widely quoted asset does not guarantee the ability to sell a large position at the screen price.

**Failure signal:** the supposed issuer-independent system becomes economically dependent on one exchange, custodian, maintainer group, or subsidising benefactor.

## 10. A shared world unit meets unequal regional shocks

**Scenario:** one region loses export demand while others grow. The affected region cannot devalue its own ZEC. Debt remains fixed and workers cannot easily move.

**Response:** agreed transfers, investment relocation, debt restructuring, and changes in local costs. A global common unit needs credible institutions for these adjustments.

**Failure signal:** the region introduces a separate circulating claim at a discount or breaks the common accounting convention to restore flexibility.

## The combined shock matters most

A plausible severe test combines falling ZEC external value, declining tax receipts, a bank run, and a wallet outage. Testing each separately can overstate safety because the same emergency reserve cannot be counted as available in full for every simultaneous promise.

The evaluation should consolidate public, banking, insurance, and payment commitments. It should show who absorbs the final shortfall after all reserves and borrowing capacity are exhausted.

## Key takeaways

The hypothesis survives only if the institutions can withstand adverse conditions without hiding losses or silently changing the monetary promise. A system that offers useful private payments but repeatedly abandons native denomination has succeeded at the narrower payment goal, not the full unit-of-account goal.
