import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import {ToastController} from '@ionic/angular';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  form: FormGroup;
  loading = false;
  errorMessage;
  match = true;
  constructor(
    private formBuilder: FormBuilder,
    private authSrv: AuthService,
    private toastCtrl: ToastController,
    private router: Router
  ) {}

  ngOnInit() {
    this.form = this.formBuilder.group({
      firstName: new FormControl(null, Validators.required),
      lastName: new FormControl(null, Validators.required),
      email: new FormControl(
        null,
        Validators.compose([
          Validators.required,
          Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$'),
        ])
      ),
      password: new FormControl(null,         Validators.compose([
        Validators.required,
        Validators.minLength(6)
      ])),
      confirmPassword: new FormControl(null, Validators.required),
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

  onSubmit() {
    this.errorMessage = null;
    this.match = true;
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
    } = this.form.value;
    if (confirmPassword !== password) {
      this.match = false;
      return;
    }
    this.loading = true;
    this.authSrv
        .register({
          firstName,
          lastName,
          email,
          password,
        })
        .then(() => {
          this.router.navigate(['login']);
          this.form.reset();
          this.loading = false;
          this.presentToast(`You are registered! Let's start!`, 'success');
          return;
        })
        .catch((error) => {
          this.loading = false;
          console.log(error);
          switch (error.code) {
            case 'auth/email-already-in-use': {
              this.errorMessage = 'Email is already registered. PLease use another email';
              break;
            }
            case 'auth/argument-error': {
              this.errorMessage = 'Please try again';
              break;
            }
          }
        });
  }
}
