import { Component, inject, OnInit, output, signal } from '@angular/core';
import { NotificationsService } from '../../../services/notifications.service';
import { Notification } from '../../../models/notification.model';
import { serviceErrorMessage } from '../../../shared/api-error';

@Component({
  selector: 'app-notifications-panel',
  templateUrl: './notifications-panel.html',
})
export class NotificationsPanel implements OnInit {
  private api = inject(NotificationsService);

  closed = output<void>();

  items = signal<Notification[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.api.list().subscribe({
      next: (items) => {
        this.items.set(items);
        this.loading.set(false);
        // Opening the feed counts as reading it — clear the badge.
        if (items.some((n) => !n.read)) this.api.markAllRead().subscribe();
      },
      error: (err) => {
        this.error.set(serviceErrorMessage(err.status));
        this.loading.set(false);
      },
    });
  }

  icon(type: Notification['type']): string {
    return type === 'SETTLEMENT_RECORDED' ? '✓' : '＋';
  }

  /** Compact relative time, e.g. "just now", "3h", "2d". */
  ago(iso: string): string {
    const secs = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
    if (secs < 60) return 'just now';
    const mins = Math.floor(secs / 60);
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  }

  close(): void {
    this.closed.emit();
  }
}
