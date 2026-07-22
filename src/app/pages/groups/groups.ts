import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { GroupsService } from '../../services/groups.service';
import { GroupListItem } from '../../models/group.model';
import { serviceErrorMessage } from '../../shared/api-error';

type Filter = 'all' | 'active' | 'settled';

@Component({
  selector: 'app-groups',
  templateUrl: './groups.html',
})
export class Groups {
  private auth = inject(AuthService);
  private groupsApi = inject(GroupsService);
  private router = inject(Router);

  user = this.auth.currentUser;

  groups = signal<GroupListItem[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  filter = signal<Filter>('all');

  /** A group is "settled" when the current user's net balance is zero. */
  private settled = (g: GroupListItem) => Math.abs(g.balance) < 0.005;

  settledCount = computed(() => this.groups().filter(this.settled).length);

  visibleGroups = computed(() => {
    const all = this.groups();
    switch (this.filter()) {
      case 'active':
        return all.filter((g) => !this.settled(g));
      case 'settled':
        return all.filter(this.settled);
      default:
        return all;
    }
  });

  subtitle = computed(() => {
    const total = this.groups().length;
    const settled = this.settledCount();
    const groupWord = total === 1 ? 'group' : 'groups';
    return settled > 0 ? `${total} ${groupWord} · ${settled} settled` : `${total} ${groupWord}`;
  });

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);

    this.groupsApi.listWithBalances().subscribe({
      next: (groups) => {
        this.groups.set(groups);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(serviceErrorMessage(err.status));
        this.loading.set(false);
      },
    });
  }

  isSettled(group: GroupListItem): boolean {
    return this.settled(group);
  }

  /** Signed euro amount, e.g. "+€240.00" / "−€85.50" (true minus sign). */
  formatBalance(value: number): string {
    const sign = value > 0 ? '+' : value < 0 ? '−' : '';
    return `${sign}€${Math.abs(value).toFixed(2)}`;
  }

  balanceLabel(value: number): string {
    return value > 0 ? 'owed' : 'you owe';
  }

  initial(name: string): string {
    return (name.trim()[0] ?? '?').toUpperCase();
  }

  avatarInitials(name: string | undefined): string {
    return (name ?? '?').slice(0, 2).toUpperCase();
  }

  /** Deterministic gradient per group, so a group looks the same everywhere. */
  gradientFor(name: string): string {
    const pairs = [
      ['#6D62E8', '#8E86F0'],
      ['#E0A25A', '#EDBE84'],
      ['#C77FA6', '#DAA1C0'],
      ['#5FA487', '#83C0A6'],
      ['#5A50E6', '#8079EE'],
    ];
    let hash = 0;
    for (const ch of name) hash = (hash + ch.charCodeAt(0)) % pairs.length;
    const [from, to] = pairs[hash];
    return `linear-gradient(135deg, ${from}, ${to})`;
  }

  open(group: GroupListItem): void {
    this.router.navigate(['/groups', group.id]);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
