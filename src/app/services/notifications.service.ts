import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { API_BASE } from '../shared/api';
import { Notification } from '../models/notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE}/notifications`;

  /** Unread count for the bell badge. Kept here so any view can read it. */
  readonly unread = signal(0);

  list(): Observable<Notification[]> {
    return this.http.get<Notification[]>(this.baseUrl);
  }

  /** Refresh the unread badge (cheap; used on page load). */
  refreshUnread(): void {
    this.http
      .get<{ count: number }>(`${this.baseUrl}/unread-count`)
      .subscribe({
        next: ({ count }) => this.unread.set(count),
        // A failing badge should never break the page; just leave it as-is.
        error: () => {},
      });
  }

  /** Mark everything read (called when the feed is opened); clears the badge. */
  markAllRead(): Observable<void> {
    return this.http
      .post<void>(`${this.baseUrl}/read`, {})
      .pipe(tap(() => this.unread.set(0)));
  }
}
