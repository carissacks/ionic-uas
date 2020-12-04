import { Component, OnInit } from '@angular/core';
import { UsersService } from '../services/users.service';
import { map } from 'rxjs/operators';
import { User } from '../models/user';
import { FriendsService } from '../services/friends.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.page.html',
  styleUrls: ['./users.page.scss'],
})
export class UsersPage implements OnInit {
  users: Array<User>;
  currUid: string;
  constructor(
    private usersSrv: UsersService,
    private friendsSrv: FriendsService,
    private authSrv: AuthService
  ) {}

  ngOnInit() {
    this.currUid = this.authSrv.getCurrentUserDetail().uid;
    this.usersSrv
      .getAll()
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
        this.users = data;
      });
  }

  async addFriend(user: User) {
    const { uid, firstName, lastName, avatar = '' } = user;
    const name = firstName + ' ' + lastName;
    const res = await this.friendsSrv.add(this.currUid, user.uid, { uid, name });
    if (res.success){
      console.log('buat toast');
      return;
    }
    console.log('yah');
    console.log(res.error);
  }
}
