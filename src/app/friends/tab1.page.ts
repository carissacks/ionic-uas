import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { FriendsService } from '../services/friends.service';
import { Friend } from '../models/friend';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
})
export class Tab1Page implements OnInit {
  form: FormGroup;
  friends: Array<Friend>;
  allFriends: Array<Friend>;
  currUid: string;
  constructor(
    private formBuilder: FormBuilder,
    private authSrv: AuthService,
    private friendSrv: FriendsService
  ) {}

  ngOnInit() {
    this.currUid = this.currUid = this.authSrv.getUid();
    this.friendSrv
      .getAll(this.currUid)
      .snapshotChanges()
      .pipe(
        map((changes) =>
          changes.map((item) => ({
            uid: item.payload.key,
            ...item.payload.val(),
          }))
        )
      )
      .subscribe((data) => {
        this.friends = data;
        this.allFriends = data;
      });

    this.form = this.formBuilder.group({
      search: new FormControl(),
    });
    this.form.get('search').valueChanges.subscribe((val) => {
      this.friends = this.allFriends.filter(({ name }) => name.toLowerCase().includes(val.toLowerCase()));
    });
  }

  removeFriend(uid: string){
    this.friendSrv.delete(this.currUid, uid);
  }
}
