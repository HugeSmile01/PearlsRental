const test = require('node:test');
const assert = require('node:assert/strict');

function canTransition(from, to) {
  const transitions = {
    RESERVED_UNPAID: ['PICKED_UP_PAID', 'CANCELLED', 'EXPIRED'],
    PICKED_UP_PAID: ['RETURNED', 'OVERDUE'],
    OVERDUE: ['RETURNED'],
    RETURNED: [],
    CANCELLED: [],
    EXPIRED: [],
  };

  return from === to || transitions[from].includes(to);
}

test('allows valid rental status transitions', () => {
  assert.equal(canTransition('RESERVED_UNPAID', 'PICKED_UP_PAID'), true);
  assert.equal(canTransition('PICKED_UP_PAID', 'OVERDUE'), true);
  assert.equal(canTransition('OVERDUE', 'RETURNED'), true);
});

test('rejects invalid rental status transitions', () => {
  assert.equal(canTransition('RETURNED', 'PICKED_UP_PAID'), false);
  assert.equal(canTransition('CANCELLED', 'RETURNED'), false);
});
