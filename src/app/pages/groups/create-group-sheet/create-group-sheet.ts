import { Component, computed, inject, output, signal } from '@angular/core';
import { GroupsService } from '../../../services/groups.service';
import { serviceErrorMessage } from '../../../shared/api-error';

@Component({
  selector: 'app-create-group-sheet',
  templateUrl: './create-group-sheet.html',
})
export class CreateGroupSheet {
  private groupsApi = inject(GroupsService);

  /** Emits the new group's id so the parent can open it. */
  created = output<string>();
  closed = output<void>();

  name = signal('');
  description = signal('');
  submitting = signal(false);
  error = signal<string | null>(null);

  canSave = computed(() => this.name().trim().length > 0 && !this.submitting());

  save(): void {
    if (!this.canSave()) return;

    this.submitting.set(true);
    this.error.set(null);

    this.groupsApi
      .create({ name: this.name().trim(), description: this.description().trim() })
      .subscribe({
        next: (group) => {
          this.submitting.set(false);
          this.created.emit(group.id);
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
