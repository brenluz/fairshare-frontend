// Matches the backend group/settlement contract (see CLAUDE.md).

/** A user as embedded in group, expense and balance payloads. */
export interface UserRef {
  id: number;
  username: string;
  email: string;
}

/** GET /api/groups — the list view. Note: no balance is returned here. */
export interface GroupSummary {
  id: number;
  name: string;
  memberCount: number;
}

/** GET /api/groups/{id} */
export interface GroupDetail {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  createdBy: UserRef;
  members: UserRef[];
}

/** GET /api/groups/{id}/balances — positive = owed money, negative = owes. */
export interface Balance {
  user: UserRef;
  balance: number;
}

/** A group row as the list screen renders it: the API summary plus the
 *  current user's net balance in that group, derived from /balances. */
export interface GroupListItem extends GroupSummary {
  balance: number;
}
