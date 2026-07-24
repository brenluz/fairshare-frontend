import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AddExpenseSheet } from './add-expense-sheet';
import { UserRef } from '../../../models/group.model';

const MEMBERS: UserRef[] = [
  { id: 'a', username: 'Ana', email: 'ana@x.com' },
  { id: 'b', username: 'Bob', email: 'bob@x.com' },
];
const EXPENSES_URL = 'http://localhost:8080/api/groups/g1/expenses';

describe('AddExpenseSheet split validation', () => {
  let fixture: ComponentFixture<AddExpenseSheet>;
  let c: AddExpenseSheet;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    fixture = TestBed.createComponent(AddExpenseSheet);
    fixture.componentRef.setInput('groupId', 'g1');
    fixture.componentRef.setInput('members', MEMBERS);
    c = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
  });

  // Simulate a user typing into a member's amount/percentage field.
  const setVal = (id: string, v: string) =>
    c.onValue(id, { target: { value: v } } as unknown as Event);

  it('EQUAL: even split is computed, always balanced, saveable with description + amount', () => {
    c.description.set('Hotel');
    c.amountText.set('100');
    expect(c.equalShare()).toBe(50);
    expect(c.balanced()).toBe(true);
    expect(c.canSave()).toBe(true);
  });

  it('EQUAL: not saveable without an amount', () => {
    c.description.set('Hotel');
    expect(c.canSave()).toBe(false);
  });

  it('EXACT: balances only when the member amounts sum to the total', () => {
    c.setSplitType('EXACT');
    c.description.set('Dinner');
    c.amountText.set('120');

    setVal('a', '70');
    setVal('b', '40');
    expect(c.assigned()).toBe(110);
    expect(c.remaining()).toBe(10);
    expect(c.balanced()).toBe(false);
    expect(c.canSave()).toBe(false); // guards against the backend 500 on mismatch

    setVal('b', '50');
    expect(c.assigned()).toBe(120);
    expect(c.balanced()).toBe(true);
    expect(c.canSave()).toBe(true);
  });

  it('PERCENTAGE: balances at exactly 100%', () => {
    c.setSplitType('PERCENTAGE');
    c.description.set('Boat');
    c.amountText.set('210');

    setVal('a', '50');
    setVal('b', '50');
    expect(c.assigned()).toBe(100);
    expect(c.balanced()).toBe(true);

    setVal('b', '40');
    expect(c.remaining()).toBe(10);
    expect(c.balanced()).toBe(false);
  });

  it('clears per-member values when the split type changes (units differ)', () => {
    c.setSplitType('EXACT');
    setVal('a', '70');
    expect(c.valueText('a')).toBe('70');

    c.setSplitType('PERCENTAGE');
    expect(c.valueText('a')).toBe('');
  });

  it('EQUAL sends null splits and posts to the group', () => {
    c.description.set('Hotel');
    c.amountText.set('100');
    let saved = false;
    c.saved.subscribe(() => (saved = true));

    c.save();
    const req = http.expectOne(EXPENSES_URL);
    expect(req.request.body).toEqual({
      description: 'Hotel',
      amount: 100,
      splitType: 'EQUAL',
      splits: null,
    });
    req.flush({});
    expect(saved).toBe(true);
    http.verify();
  });

  it('EXACT sends per-member splits', () => {
    c.setSplitType('EXACT');
    c.description.set('Dinner');
    c.amountText.set('120');
    setVal('a', '70');
    setVal('b', '50');

    c.save();
    const req = http.expectOne(EXPENSES_URL);
    expect(req.request.body.splits).toEqual([
      { userId: 'a', value: 70 },
      { userId: 'b', value: 50 },
    ]);
    req.flush({});
    http.verify();
  });
});
