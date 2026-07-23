import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { serviceErrorMessage } from '../../shared/api-error';
import { Logo } from '../../shared/logo/logo';

/**
 * The backend maps UserAlreadyExistsException to 409; @Valid failures come back
 * as 400. Everything else is service trouble.
 */
function registerErrorMessage(status: number): string {
  if (status === 409) return 'That email is already registered.';
  if (status === 400) return 'Please check your details and try again.';
  return serviceErrorMessage(status);
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
  private route = inject(ActivatedRoute);

  // An invite flow may pass ?redirect=… to return here after signup (default /groups).
  private redirect = this.route.snapshot.queryParamMap.get('redirect') ?? '/groups';

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
      next: () => this.router.navigateByUrl(this.redirect),
      error: (err) => {
        this.error.set(registerErrorMessage(err.status));
        this.submitting.set(false);
      },
    });
  }
}
