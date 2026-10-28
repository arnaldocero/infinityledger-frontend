import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../@core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/pages/dashboard']);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        this.errorMessage = this.mensajeError(err);
      },
    });
  }

  private mensajeError(err: HttpErrorResponse): string {
    if (err.status === 0) return 'No se pudo conectar con el servidor.';
    if (err.status === 429) return 'Demasiados intentos. Espere un minuto e intente de nuevo.';
    return err.error?.message || 'Ocurrió un error inesperado. Intente de nuevo.';
  }
}
