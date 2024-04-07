import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { UserComponent } from './user/user.component';
import { PlatComponent } from './plat/plat.component';
import { PrixComponent } from './prix/prix.component';
import { MenuComponent } from './menu/menu.component';
import { MapComponent } from './map/map.component';

const routes: Routes = [
  {path:'',component:HomeComponent},
  {path:'login',component:LoginComponent},
  {path:'register',component:RegisterComponent},
  {path:'user',component:UserComponent},
  {path:'plat',component:PlatComponent},
  {path:'prix',component:PrixComponent},
  {path:'menu',component:MenuComponent},
  {path:'map',component:MapComponent},
  // {path:'http://127.0.0.1:5000',component:MapComponent},
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
