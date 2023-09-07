import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})

export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    //console.log('WIndow--->', document.title)

    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/pages/login']);
    }
    return this.authService.isAuthenticated();
  }
}
