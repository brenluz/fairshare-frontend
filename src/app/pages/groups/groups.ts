import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { GroupsService } from '../../services/groups.service';
import { NotificationsService } from '../../services/notifications.service';
import { GroupListItem } from '../../models/group.model';
import { serviceErrorMessage } from '../../shared/api-error';
import { avatarGradient, initial, initials } from '../../shared/avatar';
import { isZero, signedEuro } from '../../shared/money';
import { CreateGroupSheet } from './create-group-sheet/create-group-sheet';
import { JoinLinkSheet } from './join-link-sheet/join-link-sheet';
import { NotificationsPanel } from './notifications-panel/notifications-panel';

type Filter = 'all' | 'active' | 'settled';

@Component({
  selector: 'app-groups',
  imports: [CreateGroupSheet, JoinLinkSheet, NotificationsPanel],
  templateUrl: './groups.html',
})
export class Groups {
  private auth = inject(AuthService);
  private groupsApi = inject(GroupsService);
  private notifications = inject(NotificationsService);
  private router = inject(Router);

  user = this.auth.currentUser;

  /** Unread notification count for the header bell badge. */
  unread = this.notifications.unread;
  showNotifications = signal(false);

  groups = signal<GroupListItem[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  filter = signal<Filter>('all');
  showCreate = signal(false);
  showJoinLink = signal(false);

  /** A group is "settled" when the current user's net balance is zero. */
  private settled = (g: GroupListItem) => isZero(g.balance);

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
    this.notifications.refreshUnread();
  }

  /** Reopen closes the panel and refreshes the badge (it was marked read). */
  closeNotifications(): void {
    this.showNotifications.set(false);
    this.notifications.refreshUnread();
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

  balanceLabel(value: number): string {
    return value > 0 ? 'owed' : 'you owe';
  }

  // Shared visual/format helpers, re-exported for the template.
  formatBalance = signedEuro;
  gradientFor = avatarGradient;
  initial = initial;
  avatarInitials = initials;

  open(group: GroupListItem): void {
    this.router.navigate(['/groups', group.id]);
  }

  onGroupCreated(id: string): void {
    this.showCreate.set(false);
    this.router.navigate(['/groups', id]); // land in the new (empty) group
  }

  onJoinToken(token: string): void {
    this.showJoinLink.set(false);
    this.router.navigate(['/groups/join', token]);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
