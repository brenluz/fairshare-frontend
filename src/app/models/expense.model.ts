// Matches the backend expense/settlement contract (see CLAUDE.md).

import { UserRef } from './group.model';

export type SplitType = 'EQUAL' | 'PERCENTAGE' | 'EXACT';

export interface ExpenseSplit {
  user: UserRef;
  owedAmount: number;
}

/** GET /api/groups/{id}/expenses */
export interface Expense {
  id: number;
  description: string;
  amount: number;
  splitType: SplitType;
  paidBy: UserRef;
  createdAt: string;
  splits: ExpenseSplit[];
}

/** GET /api/groups/{id}/simplify — the minimal set of transfers to settle up. */
export interface SimplifiedTransfer {
  from: UserRef;
  to: UserRef;
  amount: number;
}

/** POST /api/groups/{id}/settle */
export interface SettleRequest {
  payeeId: number;
  amount: number;
}
