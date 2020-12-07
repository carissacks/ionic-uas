import { Component, OnInit } from '@angular/core';
import { UsersService } from '../services/users.service';
import { map } from 'rxjs/operators';
import { User } from '../models/user';
import { FriendsService } from '../services/friends.service';
import { AuthService } from '../services/auth.service';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import {ToastController} from '@ionic/angular';

@Component({
  selector: 'app-users',
  templateUrl: './users.page.html',
  styleUrls: ['./users.page.scss'],
})
export class UsersPage implements OnInit {
  users: Array<User>;
  user: User;
  form: FormGroup;
  currUid: string;
  loading = false;
  found = true;

  constructor(
    private formBuilder: FormBuilder,
    private usersSrv: UsersService,
    private friendsSrv: FriendsService,
    private authSrv: AuthService,
    private router: Router,
    private toastCtrl: ToastController,
  ) {}

  ngOnInit() {
    this.currUid = this.authSrv.getUid();
    this.form = this.formBuilder.group({
      search: new FormControl(
        '',
        Validators.compose([
          Validators.required,
          Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$'),
        ])
      ),
    });
  }

  async presentToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message,
      color,
      duration: 1000,
    });
    toast.present();
  }

  async addFriend() {
    const { uid, firstName, lastName, avatar = '' } = this.user;
    if (uid === this.currUid) {
      this.presentToast(`You know your own location. Add someone else.`, 'warning');
      return;
    }
    const name = firstName + ' ' + lastName;
    const res = await this.friendsSrv.add(this.currUid, uid, {
      name,
      avatar,
    });
    if (res.success) {
      this.presentToast('You have a new friend!', 'success');
      this.router.navigate(['home']);
      return;
    }
    this.presentToast('Hmm you friend is missing. Try again', 'danger');
    console.log(res.error);
  }

  onSubmit() {
    this.loading = true;
    this.found = true;
    const { search } = this.form.value;
    this.usersSrv
      .getDetailByEmail(search)
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
        this.loading = false;
        this.user = data[0];
        if (!data[0]) {
          this.found = false;
        }
      });
  }
}
