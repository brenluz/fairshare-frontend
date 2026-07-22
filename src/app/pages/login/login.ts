import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { serviceErrorMessage } from '../../shared/api-error';
import { Logo } from '../../shared/logo/logo';

/** 401 is the one failure the user can actually act on; the rest is service trouble. */
function loginErrorMessage(status: number): string {
  return status === 401 ? 'Invalid email or password.' : serviceErrorMessage(status);
}

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, Logo],
  templateUrl: './login.html',
})
export class Login {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  // UI state for showing a request error and disabling the button mid-flight.
  error = signal<string | null>(null);
  submitting = signal(false);

  // Toggles the password field between masked and plain text (the "Show" affordance).
  showPassword = signal(false);

  // The form. `nonNullable` means controls reset to '' instead of null.
  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched(); // surfaces the per-field validation messages
      return;
    }

    this.submitting.set(true);
    this.error.set(null);

    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => this.router.navigateByUrl('/groups'),
      error: (err) => {
        this.error.set(loginErrorMessage(err.status));
        this.submitting.set(false);
      },
    });
  }
}
