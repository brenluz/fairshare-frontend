import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { serviceErrorMessage } from '../../shared/api-error';
import { Logo } from '../../shared/logo/logo';

/** A taken email/username is the one failure the user can act on. */
function registerErrorMessage(status: number): string {
  return status === 409 || status === 400
    ? 'That email or username is already taken.'
    : serviceErrorMessage(status);
}

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink, Logo],
  templateUrl: './register.html',
})
export class Register {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  error = signal<string | null>(null);
  submitting = signal(false);
  showPassword = signal(false);

  form = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.error.set(null);

    this.auth.register(this.form.getRawValue()).subscribe({
      next: () => this.router.navigateByUrl('/groups'),
      error: (err) => {
        this.error.set(registerErrorMessage(err.status));
        this.submitting.set(false);
      },
    });
  }
}
