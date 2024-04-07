import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
// import {
//   FormGroup,
//   FormControl,
//   FormBuilder,
//   Validators,
// } from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
  // registerForm!: FormGroup;
  constructor(
    private sa: AuthService,
    private fs: AngularFirestore,
    private route: Router,
    // private fb: FormBuilder
  ) {
    // this.registerForm = this.fb.group({
    //   flName: ['', [Validators.required, Validators.minLength(3)]],
    //   email: ['', [Validators.required, Validators.email]],
    //   password: ['', [Validators.required, Validators.minLength(8)]],
    //   confirmPassword: ['', Validators.required],
    // });
    // let formControl = {
    //   firstname: new FormControl('', [
    //     Validators.required,
    //     Validators.pattern('[A-Za-z]'),
    //     Validators.minLength(3),
    //   ]),
    // };
  }
  // get flname() {
  //   return this.registerForm.get('flname')
  // }
  ngOnInit(): void {}
  register(f: { value: any }) {
    // console.log(f.value)
    let data = f.value;
    this.sa
      .signUp(data.email, data.password)
      .then((user) => {
        if (user && user.user) {
          localStorage.setItem('userConnect', user.user.uid);
          this.fs
            .collection('users')
            .doc(user.user.uid)
            .set({
              flName: data.flName,
              email: data.email,
              uid: user.user.uid,
              role: 'admin',
            })
            .then(() => {
              this.route.navigate(['/']);
            });
        } else {
          console.log('User or user.user is null.');
        }
      })
      .catch(() => {
        console.log('error !');
      });
  }

  // register() {
  //   if (this.registerForm.valid) { // Vérifiez la validité du formulaire avant de procéder à l'enregistrement
  //     const { flName, email, password } = this.registerForm.value;
  //     this.sa.signUp(email, password).then((user) => {
  //       if (user && user.user) {
  //         localStorage.setItem('userConnect', user.user.uid);
  //         this.fs.collection('users').doc(user.user.uid).set({
  //           flName,
  //           email,
  //           uid: user.user.uid,
  //           role: 'admin',
  //         }).then(() => {
  //           this.route.navigate(['/']);
  //         });
  //       } else {
  //         console.log('User or user.user is null.');
  //       }
  //     }).catch(() => {
  //       console.log('Error !');
  //     });
  //   }
  // }
}
