import { Component, inject, input, OnInit, output, signal } from '@angular/core';
import { GroupsService } from '../../../services/groups.service';
import { serviceErrorMessage } from '../../../shared/api-error';

const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

@Component({
  selector: 'app-share-invite-sheet',
  templateUrl: './share-invite-sheet.html',
})
export class ShareInviteSheet implements OnInit {
  private groupsApi = inject(GroupsService);

  groupId = input.required<string>();
  groupName = input.required<string>();

  closed = output<void>();

  /** A frontend link that opens the in-app join screen (6a/6c). */
  inviteUrl = signal<string | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  copied = signal(false);

  ngOnInit(): void {
    // The backend returns a join URL; we only need its token, then rebuild a
    // link pointing at this app's join route so it opens the join screen.
    this.groupsApi.invite(this.groupId()).subscribe({
      next: (link) => {
        const token = link.match(UUID_RE)?.[0];
        this.inviteUrl.set(token ? `${location.origin}/groups/join/${token}` : link.trim());
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(serviceErrorMessage(err.status));
        this.loading.set(false);
      },
    });
  }

  async copy(): Promise<void> {
    const url = this.inviteUrl();
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    } catch {
      // Clipboard can be blocked (permissions/insecure context); the field is
      // selectable, so the user can still copy manually.
      this.error.set('Couldn’t copy automatically — select the link to copy it.');
    }
  }

  close(): void {
    this.closed.emit();
  }
}
