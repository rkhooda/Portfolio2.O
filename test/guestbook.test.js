import test from 'node:test';import assert from 'node:assert/strict';import api from '../api/guestbook.js';
test('guestbook clean flattens controls and caps content',()=>{assert.equal(api.clean('a\n\tb',24),'a b');assert.equal(api.clean('x'.repeat(30),24).length,24)});
