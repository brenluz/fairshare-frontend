import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Groups } from './pages/groups/groups';
import { GroupDetail } from './pages/group-detail/group-detail';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'groups', component: Groups, canActivate: [authGuard] },
  { path: 'groups/:id', component: GroupDetail, canActivate: [authGuard] },
  { path: '', pathMatch: 'full', redirectTo: 'login' },
];
