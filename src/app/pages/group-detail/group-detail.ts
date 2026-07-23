import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { GroupsService } from '../../services/groups.service';
import { AuthService } from '../../services/auth.service';
import { Balance, GroupDetail as Group } from '../../models/group.model';
import { Expense, SimplifiedTransfer } from '../../models/expense.model';
import { serviceErrorMessage } from '../../shared/api-error';
import { avatarColor, initials } from '../../shared/avatar';
import { euro, isZero, signedEuro } from '../../shared/money';
import { AddExpenseSheet } from './add-expense-sheet/add-expense-sheet';
import { SettleSheet } from './settle-sheet/settle-sheet';

interface ExpenseGroup {
  label: string;
  items: Expense[];
}

/**
 * The backend distinguishes a missing group (404) from one the user isn't a
 * member of (403); both are worth saying plainly rather than "went wrong".
 */
function groupErrorMessage(status: number): string {
  if (status === 404) return 'This group no longer exists.';
  if (status === 403) return 'You don’t have access to this group.';
  return serviceErrorMessage(status);
}

@Component({
  selector: 'app-group-detail',
  imports: [AddExpenseSheet, SettleSheet],
  templateUrl: './group-detail.html',
})
export class GroupDetail {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private groupsApi = inject(GroupsService);
  private auth = inject(AuthService);

  // Group ids are UUIDs — keep them as strings (Number() would give NaN).
  private groupId = this.route.snapshot.paramMap.get('id') ?? '';

  group = signal<Group | null>(null);
  expenses = signal<Expense[]>([]);
  balances = signal<Balance[]>([]);
  transfers = signal<SimplifiedTransfer[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  showAddExpense = signal(false);

  // Settle sheet: closed when false; settleInitial pre-selects a debt to confirm.
  showSettle = signal(false);
  settleInitial = signal<SimplifiedTransfer | null>(null);

  myEmail = computed(() => this.auth.currentUser()?.email ?? '');

  /** Total the group has spent — the header hero figure. */
  totalSpend = computed(() => this.expenses().reduce((sum, e) => sum + e.amount, 0));

  /** The current user's net position in this group. */
  myBalance = computed(
    () => this.balances().find((b) => b.user.email === this.myEmail())?.balance ?? 0,
  );

  /** Expenses newest-first, bucketed into "This week" / "Earlier". */
  expenseGroups = computed<ExpenseGroup[]>(() => {
    const sorted = [...this.expenses()].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const thisWeek = sorted.filter((e) => new Date(e.createdAt).getTime() >= weekAgo);
    const earlier = sorted.filter((e) => new Date(e.createdAt).getTime() < weekAgo);

    return [
      { label: 'This week', items: thisWeek },
      { label: 'Earlier', items: earlier },
    ].filter((g) => g.items.length > 0);
  });

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      group: this.groupsApi.detail(this.groupId),
      expenses: this.groupsApi.expenses(this.groupId),
      balances: this.groupsApi.balances(this.groupId),
      transfers: this.groupsApi.simplify(this.groupId),
    }).subscribe({
      next: ({ group, expenses, balances, transfers }) => {
        this.group.set(group);
        this.expenses.set(expenses);
        this.balances.set(balances);
        this.transfers.set(transfers);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(groupErrorMessage(err.status));
        this.loading.set(false);
      },
    });
  }

  // --- per-row derivations ---

  isMe(email: string): boolean {
    return email === this.myEmail();
  }

  /** What this expense did to the current user's balance (not just its total). */
  impact(expense: Expense): number {
    const email = this.myEmail();
    const paid = expense.paidBy.email === email ? expense.amount : 0;
    const owed = expense.splits.find((s) => s.user.email === email)?.owedAmount ?? 0;
    return paid - owed;
  }

  transferLabel(t: SimplifiedTransfer): string {
    if (this.isMe(t.to.email)) return `${t.from.username} pays you`;
    if (this.isMe(t.from.email)) return `You pay ${t.to.username}`;
    return `${t.from.username} pays ${t.to.username}`;
  }

  involvesMe(t: SimplifiedTransfer): boolean {
    return this.isMe(t.from.email) || this.isMe(t.to.email);
  }

  balanceWord(value: number): string {
    return value > 0 ? 'gets back' : 'owes';
  }

  monthOf(iso: string): string {
    return new Date(iso).toLocaleDateString('en-GB', { month: 'short' });
  }

  dayOf(iso: string): number {
    return new Date(iso).getDate();
  }

  splitLabel(type: string): string {
    return type.charAt(0) + type.slice(1).toLowerCase();
  }

  // --- template helpers (re-exported so the template can call them) ---
  avatarColor = avatarColor;
  initials = initials;
  euro = euro;
  signedEuro = signedEuro;
  isZero = isZero;

  back(): void {
    this.router.navigateByUrl('/groups');
  }

  onExpenseSaved(): void {
    this.showAddExpense.set(false);
    this.load(); // refetch expenses + balances + simplified debts
  }

  /** Open the settle sheet: at the picker (null) or straight to confirm a debt. */
  openSettle(transfer: SimplifiedTransfer | null): void {
    this.settleInitial.set(transfer);
    this.showSettle.set(true);
  }

  onSettled(): void {
    this.showSettle.set(false);
    this.load();
  }
}
