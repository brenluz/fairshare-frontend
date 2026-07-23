import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, of, switchMap } from 'rxjs';
import { API_BASE } from '../shared/api';
import { Balance, GroupDetail, GroupListItem, GroupSummary } from '../models/group.model';
import {
  AddExpenseRequest,
  Expense,
  SettleRequest,
  Settlement,
  SimplifiedTransfer,
} from '../models/expense.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class GroupsService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private readonly baseUrl = `${API_BASE}/groups`;

  list(): Observable<GroupSummary[]> {
    return this.http.get<GroupSummary[]>(this.baseUrl);
  }

  detail(id: string): Observable<GroupDetail> {
    return this.http.get<GroupDetail>(`${this.baseUrl}/${id}`);
  }

  balances(id: string): Observable<Balance[]> {
    return this.http.get<Balance[]>(`${this.baseUrl}/${id}/balances`);
  }

  create(body: { name: string; description: string }): Observable<GroupDetail> {
    return this.http.post<GroupDetail>(this.baseUrl, body);
  }

  expenses(id: string): Observable<Expense[]> {
    return this.http.get<Expense[]>(`${this.baseUrl}/${id}/expenses`);
  }

  addExpense(id: string, body: AddExpenseRequest): Observable<Expense> {
    return this.http.post<Expense>(`${this.baseUrl}/${id}/expenses`, body);
  }

  /** The minimal set of transfers that clears every debt in the group. */
  simplify(id: string): Observable<SimplifiedTransfer[]> {
    return this.http.get<SimplifiedTransfer[]>(`${this.baseUrl}/${id}/simplify`);
  }

  settle(id: string, body: SettleRequest): Observable<Settlement> {
    return this.http.post<Settlement>(`${this.baseUrl}/${id}/settle`, body);
  }

  /**
   * The list screen shows each group's net balance for the current user, but
   * GET /api/groups returns only { id, name, memberCount } — no balance. So we
   * fan out to /balances per group and pick out the current user's entry.
   *
   * This is one request per group. If the backend ever includes a balance on
   * the summary payload, delete this and use list() directly.
   */
  listWithBalances(): Observable<GroupListItem[]> {
    return this.list().pipe(
      switchMap((groups) => {
        if (groups.length === 0) return of<GroupListItem[]>([]);

        return forkJoin(
          groups.map((group) =>
            this.balances(group.id).pipe(
              map((balances) => ({ ...group, balance: this.myBalance(balances) })),
            ),
          ),
        );
      }),
    );
  }

  /** The backend identifies the current user by the JWT subject (their email). */
  private myBalance(balances: Balance[]): number {
    const email = this.auth.currentUser()?.email;
    return balances.find((b) => b.user.email === email)?.balance ?? 0;
  }
}
