import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { LicenciaService } from '../services/licencia.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const licenciaService = inject(LicenciaService);
  const token = auth.getToken();

  let cloned = req;
  if (token) {
    cloned = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(cloned).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 403 && error.error?.codigo === 'LICENCIA_VENCIDA') {
        licenciaService.checkStatus().subscribe();
      }
      return throwError(() => error);
    })
  );
};
