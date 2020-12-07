import { Injectable } from '@angular/core';
import {AngularFireDatabase, AngularFireList} from '@angular/fire/database';
import {Place} from '../models/place';

@Injectable({
  providedIn: 'root'
})
export class PlacesService {

  private dbPath = '/places';
  constructor(private db: AngularFireDatabase) {
  }

  getAll(uid: string): AngularFireList<Place> {
    return this.db.list(this.dbPath + '/' + uid, (ref) => ref.orderByChild('time'));
  }

  getLatest(uid: string): AngularFireList<Place> {
    return this.db.list(this.dbPath + '/' + uid, (ref) => ref.orderByChild('time').limitToLast(1));
  }

  async checkIn(currUid: string, location: Omit<Place, 'time'>) {
    const path = this.dbPath + '/' + currUid;
    const time = new Date().toISOString();
    try {
      await this.db.list(path).push({...location, time});
      return { success: true };
    } catch ({ message }) {
      return { success: false, error: message };
    }
  }

  async delete(currUid: string, key: string){
    try{
      await this.db.list(this.dbPath + '/' + currUid).remove(key);
      return { success: true };
    } catch ({ message }) {
      return { success: false, error: message };
    }
  }
}
