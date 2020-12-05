import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { AngularFirestore } from '@angular/fire/firestore';
import { User } from '../models/user';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { UsersService } from './users.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService implements CanActivate {
  private isAuth = true;
  private currentUser: User = {
    uid: '76Qa99oM6pg4jtQbdyYVRs0FVAm2',
    firstName: 'Carissa',
    lastName: 's',
    email: 's',
  };

  constructor(
    private data: AngularFirestore,
    private auth: AngularFireAuth,
    private router: Router,
    private userSrv: UsersService
  ) {}

  register(data) {
    return this.auth
      .createUserWithEmailAndPassword(data.email, data.password)
      .then(({ user }) => {
        this.userSrv.create(user.uid, data);
      });
  }

  signIn({ email, password }) {
    return this.auth
      .signInWithEmailAndPassword(email, password)
      .then(({ user }) => {
        if (user) {
          this.isAuth = true;
          this.userDetails(user.uid);
        }
      });
  }

  signOut() {
    if (this.auth.currentUser) {
      return this.auth.signOut().then(() => {
        this.isAuth = false;
        this.currentUser = null;
        this.router.navigate(['login']);
      });
    }
    return null;
  }

  userDetails(uid: string) {
    this.userSrv
      .getDetail(uid)
      .valueChanges()
      .subscribe((detail) => (this.currentUser = { ...detail, uid }));
  }

  getCurrentUserDetail() {
    return this.currentUser;
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    console.log(this.isAuth);
    if (!this.isAuth) {
      this.router.navigate(['login']);
      return false;
    }
    return true;
  }
}
