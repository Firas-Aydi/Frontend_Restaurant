import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  messageError: string = '';
  constructor(private sa: AuthService, private route: Router) {}

  ngOnInit(): void {}
  login(f: NgForm) {
    let data = f.value;
    this.sa
      .signIn(data.email, data.password)
      .then((user) => {
        console.log('login');
        this.route.navigate(['/']);
        if (user && user.user) {
          localStorage.setItem('userConnect', user.user.uid);
        }
      })
      .catch(() => {
        this.messageError = 'Incorrect email and password';
      });
  }
}
