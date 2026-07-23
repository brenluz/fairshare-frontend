import { Component, computed, inject, input, output, signal } from '@angular/core';
import { GroupsService } from '../../../services/groups.service';
import { SimplifiedTransfer } from '../../../models/expense.model';
import { serviceErrorMessage } from '../../../shared/api-error';
import { avatarColor, initials } from '../../../shared/avatar';
import { euro, isZero } from '../../../shared/money';

@Component({
  selector: 'app-settle-sheet',
  templateUrl: './settle-sheet.html',
})
export class SettleSheet {
  private groupsApi = inject(GroupsService);

  groupId = input.required<string>();
  transfers = input.required<SimplifiedTransfer[]>();
  myEmail = input.required<string>();
  /** When set, the sheet opens straight on the confirm step for this transfer. */
  initial = input<SimplifiedTransfer | null>(null);

  saved = output<void>();
  closed = output<void>();

  step = signal<'pick' | 'confirm'>('pick');
  selected = signal<SimplifiedTransfer | null>(null);
  amountText = signal('');
  submitting = signal(false);
  error = signal<string | null>(null);

  // Only debts the current user is part of can be settled by them.
  settleable = computed(() => this.transfers().filter((t) => this.involvesMe(t)));

  amount = computed(() => {
    const n = parseFloat(this.amountText().replace(',', '.'));
    return Number.isFinite(n) && n > 0 ? n : 0;
  });

  canRecord = computed(() => this.amount() > 0 && !this.submitting());

  // --- template helpers ---
  avatarColor = avatarColor;
  initials = initials;
  euro = euro;

  constructor() {
    // Preselect: the passed-in transfer, else the first debt involving the user.
    const preset = this.initial();
    if (preset) {
      this.selected.set(preset);
      this.amountText.set(preset.amount.toFixed(2));
      this.step.set('confirm');
    } else {
      const first = this.settleable()[0] ?? null;
      this.selected.set(first);
    }
  }

  involvesMe(t: SimplifiedTransfer): boolean {
    return t.from.email === this.myEmail() || t.to.email === this.myEmail();
  }

  isSelected(t: SimplifiedTransfer): boolean {
    const s = this.selected();
    return !!s && s.from.email === t.from.email && s.to.email === t.to.email;
  }

  label(t: SimplifiedTransfer): string {
    if (t.to.email === this.myEmail()) return `${t.from.username} pays you`;
    if (t.from.email === this.myEmail()) return `You pay ${t.to.username}`;
    return `${t.from.username} pays ${t.to.username}`;
  }

  pick(t: SimplifiedTransfer): void {
    if (this.involvesMe(t)) this.selected.set(t);
  }

  toConfirm(): void {
    const t = this.selected();
    if (!t) return;
    this.amountText.set(t.amount.toFixed(2));
    this.error.set(null);
    this.step.set('confirm');
  }

  backToPick(): void {
    // If we opened straight on confirm, there's no pick step to go back to.
    if (this.initial()) {
      this.close();
      return;
    }
    this.step.set('pick');
  }

  /** The other party in the selected transfer (for confirm-screen copy). */
  other = computed(() => {
    const t = this.selected();
    if (!t) return null;
    return t.to.email === this.myEmail() ? t.from : t.to;
  });

  amountLabel = computed(() =>
    this.selected()?.to.email === this.myEmail() ? 'Amount received' : 'Amount paid',
  );

  settlesInFull = computed(() => {
    const t = this.selected();
    return !!t && isZero(this.amount() - t.amount);
  });

  markPaid(): void {
    const t = this.selected();
    if (!t || !this.canRecord()) return;

    this.submitting.set(true);
    this.error.set(null);

    // A simplified transfer means `from` pays `to`.
    this.groupsApi
      .settle(this.groupId(), { payerId: t.from.id, payeeId: t.to.id, amount: this.amount() })
      .subscribe({
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
