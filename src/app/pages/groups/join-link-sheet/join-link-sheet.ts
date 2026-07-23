import { Component, computed, output, signal } from '@angular/core';

const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

@Component({
  selector: 'app-join-link-sheet',
  templateUrl: './join-link-sheet.html',
})
export class JoinLinkSheet {
  /** Emits the invite token parsed from the pasted link. */
  submitted = output<string>();
  closed = output<void>();

  linkText = signal('');
  error = signal<string | null>(null);

  // Accept a full invite URL or a bare token — we just need the UUID in it.
  private token = computed(() => this.linkText().match(UUID_RE)?.[0] ?? null);

  canContinue = computed(() => this.token() !== null);

  continue(): void {
    const token = this.token();
    if (!token) {
      this.error.set("That doesn't look like a valid invite link.");
      return;
    }
    this.submitted.emit(token);
  }

  close(): void {
    this.closed.emit();
  }
}
