import { Component, computed, inject, input, output, signal } from '@angular/core';
import { GroupsService } from '../../../services/groups.service';
import { UserRef } from '../../../models/group.model';
import { AddExpenseRequest, SplitType } from '../../../models/expense.model';
import { serviceErrorMessage } from '../../../shared/api-error';
import { avatarColor, initials } from '../../../shared/avatar';
import { euro } from '../../../shared/money';

@Component({
  selector: 'app-add-expense-sheet',
  templateUrl: './add-expense-sheet.html',
})
export class AddExpenseSheet {
  private groupsApi = inject(GroupsService);

  groupId = input.required<string>();
  members = input.required<UserRef[]>();

  /** Emitted after a successful save, so the parent can refresh and close. */
  saved = output<void>();
  closed = output<void>();

  description = signal('');
  amountText = signal('');
  splitType = signal<SplitType>('EQUAL');

  /** Per-member raw input text, keyed by user id (percentages or exact euros). */
  private values = signal<Record<string, string>>({});

  submitting = signal(false);
  error = signal<string | null>(null);

  amount = computed(() => {
    const n = parseFloat(this.amountText().replace(',', '.'));
    return Number.isFinite(n) && n > 0 ? n : 0;
  });

  /** EQUAL split is computed and read-only; the design shows it per member. */
  equalShare = computed(() => {
    const n = this.members().length;
    return n > 0 ? this.amount() / n : 0;
  });

  /** Sum of what's been assigned so far, in the unit of the active split type. */
  assigned = computed(() =>
    this.members().reduce((sum, m) => sum + this.valueOf(m.id), 0),
  );

  /** In EXACT this is euros left; in PERCENTAGE it's percent left. */
  remaining = computed(() =>
    this.splitType() === 'PERCENTAGE' ? 100 - this.assigned() : this.amount() - this.assigned(),
  );

  balanced = computed(() => {
    if (this.splitType() === 'EQUAL') return true;
    if (this.splitType() === 'PERCENTAGE') return Math.abs(this.remaining()) < 0.005;
    // EXACT needs a real amount to balance against.
    return this.amount() > 0 && Math.abs(this.remaining()) < 0.005;
  });

  canSave = computed(
    () =>
      this.description().trim().length > 0 &&
      this.amount() > 0 &&
      this.balanced() &&
      !this.submitting(),
  );

  // --- template helpers ---
  avatarColor = avatarColor;
  initials = initials;
  euro = euro;

  isPercentage = computed(() => this.splitType() === 'PERCENTAGE');
  isExact = computed(() => this.splitType() === 'EXACT');
  isEqual = computed(() => this.splitType() === 'EQUAL');

  valueText(id: string): string {
    return this.values()[id] ?? '';
  }

  onValue(id: string, event: Event): void {
    const raw = (event.target as HTMLInputElement).value;
    this.values.update((m) => ({ ...m, [id]: raw }));
  }

  setSplitType(type: SplitType): void {
    this.splitType.set(type);
    // Switching units makes old per-member numbers meaningless — clear them.
    this.values.set({});
  }

  private valueOf(id: string): number {
    const n = parseFloat((this.values()[id] ?? '').replace(',', '.'));
    return Number.isFinite(n) ? n : 0;
  }

  save(): void {
    if (!this.canSave()) return;

    this.submitting.set(true);
    this.error.set(null);

    const type = this.splitType();
    const body: AddExpenseRequest = {
      description: this.description().trim(),
      amount: this.amount(),
      splitType: type,
      splits:
        type === 'EQUAL'
          ? null
          : this.members().map((m) => ({ userId: m.id, value: this.valueOf(m.id) })),
    };

    this.groupsApi.addExpense(this.groupId(), body).subscribe({
      next: () => {
        this.submitting.set(false);
        this.saved.emit();
      },
      error: (err) => {
        this.error.set(serviceErrorMessage(err.status));
        this.submitting.set(false);
      },
    });
  }

  close(): void {
    this.closed.emit();
  }
}
