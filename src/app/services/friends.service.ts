import { Injectable } from '@angular/core';
import {AngularFireDatabase, AngularFireList} from '@angular/fire/database';
import {Friend} from '../models/friend';
import {User} from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class FriendsService {

  private dbPath = '/friends';
  constructor(private db: AngularFireDatabase) {
  }

  getAll(uid: string): AngularFireList<Friend> {
    return this.db.list(this.dbPath + '/' + uid);
  }

  async add(currUid: string, uid: string, user: Friend) {
    const path = this.dbPath + '/' + currUid + '/' + uid;
    console.log(path);
    console.log(user);
    try {
      await this.db.object(path).set(user);
      return { success: true };
    } catch ({ message }) {
      return { success: false, error: message };
    }
  }

  delete(currUid: string, uid: string){
    return this.db.list(this.dbPath + '/' + currUid).remove(uid);
  }
}
