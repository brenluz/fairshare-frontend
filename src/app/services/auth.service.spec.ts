import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from './auth.service';

const LOGIN_URL = 'http://localhost:8080/api/auth/login';

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  function login() {
    service.login({ email: 'maya@x.com', password: 'pw' }).subscribe();
    http.expectOne(LOGIN_URL).flush({ token: 'jwt-123', email: 'maya@x.com', username: 'maya' });
  }

  it('starts unauthenticated with no stored user', () => {
    expect(service.isAuthenticated()).toBe(false);
    expect(service.currentUser()).toBeNull();
  });

  it('persists the token and populates user state on login', () => {
    login();
    expect(localStorage.getItem('token')).toBe('jwt-123');
    expect(service.currentUser()).toEqual({ email: 'maya@x.com', username: 'maya' });
    expect(service.isAuthenticated()).toBe(true);
  });

  it('never stores the token inside the user object', () => {
    login();
    expect(JSON.parse(localStorage.getItem('user')!)).toEqual({
      email: 'maya@x.com',
      username: 'maya',
    });
  });

  it('clears storage and resets state on logout', () => {
    login();
    service.logout();
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
    expect(service.currentUser()).toBeNull();
  });
});

describe('AuthService rehydration', () => {
  it('loads a stored user on construction, so a refresh stays logged in', () => {
    localStorage.clear();
    localStorage.setItem('user', JSON.stringify({ email: 'theo@x.com', username: 'theo' }));

    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    const service = TestBed.inject(AuthService);

    expect(service.isAuthenticated()).toBe(true);
    expect(service.currentUser()).toEqual({ email: 'theo@x.com', username: 'theo' });
  });
});
