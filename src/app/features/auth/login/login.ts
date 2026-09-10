import { LowerCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { SubmitButtonComponent } from '../../../shared/components/submit-button/submit-button';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { ThemeToggleComponent } from '../../../shared/components/theme-toggle/theme-toggle';

@Component({
  selector: 'app-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LowerCasePipe, ReactiveFormsModule, NgIcon, ThemeToggleComponent, SubmitButtonComponent],
  templateUrl: './login.html',
})
export class LoginComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);

  protected readonly errorMessage = signal('');
  protected readonly isSubmitting = signal(false);

  protected readonly form = this.formBuilder.nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  protected readonly demoCredentials = [
    { label: 'Admin', username: 'admin', password: 'admin123' },
  ];

  protected fillCredentials(credential: { username: string; password: string }): void {
    this.errorMessage.set('');
    this.form.patchValue({
      username: credential.username,
      password: credential.password,
    });
  }

  protected onSubmit(): void {
    if (this.isSubmitting()) {
      return;
    }

    this.errorMessage.set('');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { username, password } = this.form.getRawValue();

    if (this.authService.login(username, password)) {
      this.isSubmitting.set(true);
      this.toastService.success('Welcome back!');
      void this.router.navigate(['/dashboard']);
      return;
    }

    this.errorMessage.set('Invalid username or password');
    this.toastService.error('Invalid username or password');
  }
}
