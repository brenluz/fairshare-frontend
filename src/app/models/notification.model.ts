// Matches the backend notification contract (GET /api/notifications).

export type NotificationType = 'EXPENSE_ADDED' | 'SETTLEMENT_RECORDED';

/** One entry in the current user's notification feed. */
export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  groupId: string;
  groupName: string;
  read: boolean;
  createdAt: string;
}
