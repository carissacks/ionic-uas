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
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  form: FormGroup;
  loading = false;
  errorMessage;
  constructor(
    private formBuilder: FormBuilder,
    private authSrv: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.form = this.formBuilder.group({
      email: new FormControl(
        null,
        Validators.compose([
          Validators.required,
          Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$'),
        ])
      ),
      password: new FormControl(null, Validators.required),
    });
  }

  async onSubmit() {
    this.loading = true;
    this.authSrv
      .signIn(this.form.value)
      .then(() => {
        this.router.navigate(['home']);
        return;
      })
      .catch((error) => {
        this.loading = false;
        console.log(error);
        switch (error.code) {
          case 'auth/user-not-found': {
            this.errorMessage = 'This email is not registered';
            break;
          }
          case 'auth/wrong-password': {
            this.errorMessage = 'Wrong password';
            break;
          }
        }
      });
  }
}
