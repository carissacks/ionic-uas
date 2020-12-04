import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

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

  onSubmit() {
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
        })
        .then(() => {
          this.router.navigate(['login']);
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
              this.errorMessage = 'Wrong password';
              break;
            }
          }
        });
  }
}
