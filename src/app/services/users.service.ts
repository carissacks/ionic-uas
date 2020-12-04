import { Injectable } from '@angular/core';
import {AngularFireDatabase, AngularFireList, AngularFireObject} from '@angular/fire/database';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private dbPath = '/users';
  contactRef: AngularFireList<User> = null;

  constructor(private db: AngularFireDatabase) {
    this.contactRef = db.list(this.dbPath);
  }

  getAll(): AngularFireList<User> {
    return this.contactRef;
  }

  getDetail(uid: string): AngularFireObject<User> {
    return this.db.object(this.dbPath + '/' + uid);
  }

  create(uid: string, user: User): any {
    return this.contactRef.update(uid, user);
  }
}
