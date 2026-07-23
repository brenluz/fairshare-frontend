import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Groups } from './pages/groups/groups';
import { GroupDetail } from './pages/group-detail/group-detail';
import { JoinGroup } from './pages/join-group/join-group';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  // Public: a signed-out invitee must be able to see the group first (6c).
  { path: 'groups/join/:token', component: JoinGroup },
  { path: 'groups', component: Groups, canActivate: [authGuard] },
  { path: 'groups/:id', component: GroupDetail, canActivate: [authGuard] },
  { path: '', pathMatch: 'full', redirectTo: 'login' },
];
