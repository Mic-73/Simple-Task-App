// Simple Node tests for dateUtils.js
const assert = require('assert');
const dateUtils = require('../dateUtils');

function testParseDateParts() {
  assert.deepStrictEqual(dateUtils.parseDateParts('1/2/2025'), { month: 1, day: 2, year: 2025 });
  assert.deepStrictEqual(dateUtils.parseDateParts('01/02/2025'), { month: 1, day: 2, year: 2025 });
  assert.strictEqual(dateUtils.parseDateParts('13/2/2025'), null);
  assert.deepStrictEqual(dateUtils.parseDateParts('2/30/2025'), { month: 2, day: 30, year: 2025 }); // Only regex, not calendar
}

function testIsValidCalendarDate() {
  assert.strictEqual(dateUtils.isValidCalendarDate(2025, 2, 28), true);
  assert.strictEqual(dateUtils.isValidCalendarDate(2024, 2, 29), true); // Leap year
  assert.strictEqual(dateUtils.isValidCalendarDate(2025, 2, 29), false); // Not leap year
  assert.strictEqual(dateUtils.isValidCalendarDate(2025, 2, 30), false);
  assert.strictEqual(dateUtils.isValidCalendarDate(2025, 4, 31), false);
}

function testParseTimeParts() {
  assert.deepStrictEqual(dateUtils.parseTimeParts('1', '0', 'am'), { hour: 1, minute: 0, hour24: 1 });
  assert.deepStrictEqual(dateUtils.parseTimeParts('12', '59', 'pm'), { hour: 12, minute: 59, hour24: 12 });
  assert.deepStrictEqual(dateUtils.parseTimeParts('3', '', 'pm'), { hour: 3, minute: 0, hour24: 15 });
  assert.strictEqual(dateUtils.parseTimeParts('0', '0', 'am'), null);
  assert.strictEqual(dateUtils.parseTimeParts('13', '0', 'am'), null);
  assert.strictEqual(dateUtils.parseTimeParts('10', '60', 'am'), null);
}

function testValidateAndBuildDue() {
  let r = dateUtils.validateAndBuildDue('2/28/2025', '10', '15', 'am');
  assert.strictEqual(r.ok, true);
  assert.strictEqual(r.normalizedDate, '2/28/2025');
  assert.strictEqual(new Date(r.dueTimestamp).getFullYear(), 2025);
  assert.strictEqual(new Date(r.dueTimestamp).getMonth(), 1); // Feb
  assert.strictEqual(new Date(r.dueTimestamp).getDate(), 28);
  assert.strictEqual(new Date(r.dueTimestamp).getHours(), 10);
  assert.strictEqual(new Date(r.dueTimestamp).getMinutes(), 15);

  r = dateUtils.validateAndBuildDue('2/29/2025', '10', '15', 'am');
  assert.strictEqual(r.ok, false); // Not a leap year

  r = dateUtils.validateAndBuildDue('2/29/2024', '10', '15', 'am');
  assert.strictEqual(r.ok, true); // Leap year

  r = dateUtils.validateAndBuildDue('4/31/2025', '10', '15', 'am');
  assert.strictEqual(r.ok, false); // April 31 does not exist

  r = dateUtils.validateAndBuildDue('2/28/2025', '13', '15', 'am');
  assert.strictEqual(r.ok, false); // Invalid hour

  r = dateUtils.validateAndBuildDue('2/28/2025', '10', '60', 'am');
  assert.strictEqual(r.ok, false); // Invalid minute
}

function runAll() {
  testParseDateParts();
  testIsValidCalendarDate();
  testParseTimeParts();
  testValidateAndBuildDue();
  console.log('All dateUtils tests passed.');
}

runAll();
