import { Injectable } from '@angular/core';
import {
  AngularFireDatabase,
  AngularFireList,
  AngularFireObject,
} from '@angular/fire/database';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private dbPath = '/users';
  userRef: AngularFireList<User> = null;

  constructor(private db: AngularFireDatabase) {
    this.userRef = db.list(this.dbPath);
  }

  getAll(): AngularFireList<User> {
    return this.userRef;
  }

  getDetail(uid: string): AngularFireObject<User> {
    return this.db.object(this.dbPath + '/' + uid);
  }

  async create(uid: string, user: User) {
    try {
      await this.userRef.update(uid, user);
      return { success: true };
    } catch ({ message }) {
      return { success: false, error: message };
    }
  }
}
