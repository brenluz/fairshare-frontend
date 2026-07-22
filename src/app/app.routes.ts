import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Groups } from './pages/groups/groups';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'groups', component: Groups },
  { path: '', pathMatch: 'full', redirectTo: 'login' },
];
