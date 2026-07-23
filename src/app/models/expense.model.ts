// Matches the backend expense/settlement contract (see CLAUDE.md).

import { UserRef } from './group.model';

export type SplitType = 'EQUAL' | 'PERCENTAGE' | 'EXACT';

export interface ExpenseSplit {
  user: UserRef;
  owedAmount: number;
}

/** GET /api/groups/{id}/expenses */
export interface Expense {
  id: string;
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

/** POST /api/groups/{id}/settle — records that payer paid payee. */
export interface SettleRequest {
  payerId: string;
  payeeId: string;
  amount: number;
}

/** The recorded payment returned by POST /api/groups/{id}/settle. */
export interface Settlement {
  id: string;
  payer: UserRef;
  payee: UserRef;
  amount: number;
  settledAt: string;
}

/** POST /api/groups/{id}/expenses — splits is null for EQUAL. */
export interface AddExpenseRequest {
  description: string;
  amount: number;
  splitType: SplitType;
  splits: { userId: string; value: number }[] | null;
}
