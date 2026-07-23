// Matches the backend group/settlement contract (see CLAUDE.md).

// Every id is a java.util.UUID on the backend, so it arrives as a JSON string.

/** A user as embedded in group, expense and balance payloads. */
export interface UserRef {
  id: string;
  username: string;
  email: string;
}

/** GET /api/groups — the list view. Note: no balance is returned here. */
export interface GroupSummary {
  id: string;
  name: string;
  memberCount: number;
}

/** GET /api/groups/{id} */
export interface GroupDetail {
  id: string;
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

/** GET /api/groups/invite/{token} — public join preview (no emails/ids). */
export interface GroupInvitePreview {
  name: string;
  memberCount: number;
  invitedBy: string;
  members: { username: string }[];
}
