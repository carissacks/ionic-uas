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
  private isAuth = false;
  private currentUser: User;
  private uid: string;

  constructor(
    private data: AngularFirestore,
    private auth: AngularFireAuth,
    private router: Router,
    private userSrv: UsersService
  ) {}

  register(data) {
    const{password, ...otherData} = data;
    return this.auth
      .createUserWithEmailAndPassword(data.email, password)
      .then(({ user }) => {
        this.userSrv.createOrUpdate(user.uid, otherData);
      });
  }

  signIn({ email, password }) {
    return this.auth
      .signInWithEmailAndPassword(email, password)
      .then(({ user }) => {
        if (user) {
          this.isAuth = true;
          this.uid = user.uid;
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

  getUid(){
    return this.uid;
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    if (!this.isAuth) {
      this.router.navigate(['login']);
      return false;
    }
    return true;
  }
}
