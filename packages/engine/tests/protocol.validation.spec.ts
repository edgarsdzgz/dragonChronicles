/**
 * @file Protocol validation tests for message security
 * @description Phase 1 Story 1: Unit tests for message validation and security guards
 */

import { strict as assert } from 'assert';
import { test, run } from '../../tests/_tiny-runner.mjs';
import {
  isUiToSim,
  isSimToUi,
  validateBuildVersion,
  validateAbilityCooldown,
  sanitizeSeed,
  validateOfflineTime,
  AbilityRateLimiter,
  ValidationContext,
} from '../src/shared/validation.js';
import { BUILD_VERSION, MAX_OFFLINE_MS, ABILITY_COOLDOWN_MS } from '../src/shared/constants.js';
import { MessageType, LogLvl } from '../src/shared/enums.js';
import { AbilityId } from '../src/shared/enums.js';
import { Lands, Wards } from '../src/shared/ids.js';

test('isUiToSim validates boot messages correctly', () => {
  // Valid boot message
  const validBoot = { t: MessageType.Boot, seed: 12345, build: 'test-build' };
  assert.equal(isUiToSim(validBoot), true, 'Valid boot message should pass validation');

  // Invalid boot messages
  assert.equal(
    isUiToSim({ t: MessageType.Boot, seed: 'invalid', build: 'test' }),
    false,
    'Invalid seed should fail',
  );
  assert.equal(
    isUiToSim({ t: MessageType.Boot, seed: 12345, build: '' }),
    false,
    'Empty build should fail',
  );
  assert.equal(isUiToSim({ t: MessageType.Boot, seed: 12345 }), false, 'Missing build should fail');
});

test('isUiToSim validates start messages correctly', () => {
  // Valid start message
  const validStart = { t: MessageType.Start, land: Lands.HorizonSteppe, ward: Wards.W1 };
  assert.equal(isUiToSim(validStart), true, 'Valid start message should pass validation');

  // Invalid start messages
  assert.equal(
    isUiToSim({ t: MessageType.Start, land: 999, ward: Wards.W1 }),
    false,
    'Invalid land should fail',
  );
  assert.equal(
    isUiToSim({ t: MessageType.Start, land: Lands.HorizonSteppe, ward: 999 }),
    false,
    'Invalid ward should fail',
  );
  assert.equal(
    isUiToSim({ t: MessageType.Start, land: Lands.HorizonSteppe }),
    false,
    'Missing ward should fail',
  );
});

test('isUiToSim validates stop messages correctly', () => {
  const validStop = { t: MessageType.Stop };
  assert.equal(isUiToSim(validStop), true, 'Valid stop message should pass validation');
});

test('isUiToSim validates ability messages correctly', () => {
  // Valid ability message
  const validAbility = { t: MessageType.Ability, id: AbilityId.Roar };
  assert.equal(isUiToSim(validAbility), true, 'Valid ability message should pass validation');

  // Invalid ability messages
  assert.equal(
    isUiToSim({ t: MessageType.Ability, id: 999 }),
    false,
    'Invalid ability ID should fail',
  );
  assert.equal(
    isUiToSim({ t: MessageType.Ability, id: 'invalid' }),
    false,
    'Non-numeric ability ID should fail',
  );
  assert.equal(isUiToSim({ t: MessageType.Ability }), false, 'Missing ability ID should fail');
});

test('isUiToSim validates offline messages correctly', () => {
  // Valid offline message
  const validOffline = { t: MessageType.Offline, elapsedMs: 1000 };
  assert.equal(isUiToSim(validOffline), true, 'Valid offline message should pass validation');

  // Invalid offline messages
  assert.equal(
    isUiToSim({ t: MessageType.Offline, elapsedMs: -1 }),
    false,
    'Negative elapsed time should fail',
  );
  assert.equal(
    isUiToSim({ t: MessageType.Offline, elapsedMs: MAX_OFFLINE_MS + 1 }),
    false,
    'Excessive elapsed time should fail',
  );
  assert.equal(
    isUiToSim({ t: MessageType.Offline, elapsedMs: 'invalid' }),
    false,
    'Non-numeric elapsed time should fail',
  );
});

test('isUiToSim rejects unknown message types', () => {
  assert.equal(isUiToSim({ t: 'unknown' }), false, 'Unknown message type should fail');
  assert.equal(isUiToSim({ t: MessageType.Ready }), false, 'SimToUi message type should fail');
  assert.equal(isUiToSim(null), false, 'Null message should fail');
  assert.equal(isUiToSim(undefined), false, 'Undefined message should fail');
  assert.equal(isUiToSim('not an object'), false, 'Non-object message should fail');
});

test('isSimToUi validates ready messages correctly', () => {
  const validReady = { t: MessageType.Ready };
  assert.equal(isSimToUi(validReady), true, 'Valid ready message should pass validation');
});

test('isSimToUi validates tick messages correctly', () => {
  // Valid tick message
  const validTick = {
    t: MessageType.Tick,
    now: 1000,
    stats: { fps: 60, enemies: 5, proj: 10, dps: 100 },
  };
  assert.equal(isSimToUi(validTick), true, 'Valid tick message should pass validation');

  // Invalid tick messages
  assert.equal(
    isSimToUi({ t: MessageType.Tick, now: 'invalid', stats: {} }),
    false,
    'Invalid now time should fail',
  );
  assert.equal(
    isSimToUi({ t: MessageType.Tick, now: 1000, stats: 'invalid' }),
    false,
    'Invalid stats should fail',
  );
  assert.equal(
    isSimToUi({
      t: MessageType.Tick,
      now: 1000,
      stats: { fps: 'invalid', enemies: 5, proj: 10, dps: 100 },
    }),
    false,
    'Invalid fps should fail',
  );
});

test('isSimToUi validates log messages correctly', () => {
  // Valid log messages
  const validInfo = { t: MessageType.Log, lvl: LogLvl.Info, msg: 'test message' };
  const validWarn = { t: MessageType.Log, lvl: LogLvl.Warn, msg: 'warning message' };
  const validError = { t: MessageType.Log, lvl: LogLvl.Error, msg: 'error message' };

  assert.equal(isSimToUi(validInfo), true, 'Valid info log should pass validation');
  assert.equal(isSimToUi(validWarn), true, 'Valid warn log should pass validation');
  assert.equal(isSimToUi(validError), true, 'Valid error log should pass validation');

  // Invalid log messages
  assert.equal(
    isSimToUi({ t: MessageType.Log, lvl: 'invalid', msg: 'test' }),
    false,
    'Invalid log level should fail',
  );
  assert.equal(
    isSimToUi({ t: MessageType.Log, lvl: LogLvl.Info, msg: 123 }),
    false,
    'Non-string message should fail',
  );
  assert.equal(
    isSimToUi({ t: MessageType.Log, lvl: LogLvl.Info }),
    false,
    'Missing message should fail',
  );
});

test('isSimToUi validates fatal messages correctly', () => {
  // Valid fatal message
  const validFatal = { t: MessageType.Fatal, reason: 'test error' };
  assert.equal(isSimToUi(validFatal), true, 'Valid fatal message should pass validation');

  // Invalid fatal messages
  assert.equal(
    isSimToUi({ t: MessageType.Fatal, reason: 123 }),
    false,
    'Non-string reason should fail',
  );
  assert.equal(isSimToUi({ t: MessageType.Fatal }), false, 'Missing reason should fail');
});

test('validateBuildVersion works correctly', () => {
  assert.equal(validateBuildVersion(BUILD_VERSION), true, 'Correct build version should pass');
  assert.equal(validateBuildVersion('wrong-version'), false, 'Wrong build version should fail');
  assert.equal(validateBuildVersion(''), false, 'Empty build version should fail');
});

test('validateAbilityCooldown works correctly', () => {
  const currentTime = 1000;

  // Should pass if enough time has passed
  assert.equal(
    validateAbilityCooldown(0, currentTime),
    true,
    'Should pass if enough time has passed',
  );
  assert.equal(
    validateAbilityCooldown(currentTime - ABILITY_COOLDOWN_MS, currentTime),
    true,
    'Should pass if exactly cooldown time has passed',
  );

  // Should fail if not enough time has passed
  assert.equal(
    validateAbilityCooldown(currentTime - ABILITY_COOLDOWN_MS + 1, currentTime),
    false,
    'Should fail if not enough time has passed',
  );
  assert.equal(
    validateAbilityCooldown(currentTime, currentTime),
    false,
    'Should fail if no time has passed',
  );
});

test('sanitizeSeed works correctly', () => {
  // Valid seeds
  assert.equal(sanitizeSeed(12345), 12345, 'Valid seed should be preserved');
  assert.equal(sanitizeSeed(0), 0, 'Zero seed should be preserved');
  assert.equal(sanitizeSeed(0xffffffff), 0xffffffff, 'Max uint32 seed should be preserved');

  // Invalid seeds should throw
  assert.throws(() => sanitizeSeed('invalid'), 'Non-numeric seed should throw');
  assert.throws(() => sanitizeSeed(NaN), 'NaN seed should throw');
  assert.throws(() => sanitizeSeed(Infinity), 'Infinity seed should throw');
});

test('validateOfflineTime works correctly', () => {
  // Valid offline times
  assert.equal(validateOfflineTime(0), true, 'Zero offline time should be valid');
  assert.equal(validateOfflineTime(1000), true, 'Small offline time should be valid');
  assert.equal(validateOfflineTime(MAX_OFFLINE_MS), true, 'Max offline time should be valid');

  // Invalid offline times
  assert.equal(validateOfflineTime(-1), false, 'Negative offline time should be invalid');
  assert.equal(
    validateOfflineTime(MAX_OFFLINE_MS + 1),
    false,
    'Excessive offline time should be invalid',
  );
  assert.equal(validateOfflineTime(NaN), false, 'NaN offline time should be invalid');
  assert.equal(validateOfflineTime(Infinity), false, 'Infinity offline time should be invalid');
});

test('AbilityRateLimiter works correctly', () => {
  const limiter = new AbilityRateLimiter();

  // First ability should always work
  assert.equal(limiter.canUseAbility(1000), true, 'First ability should always work');

  // Second ability should fail if within cooldown
  assert.equal(
    limiter.canUseAbility(1000 + ABILITY_COOLDOWN_MS - 1),
    false,
    'Second ability should fail within cooldown',
  );

  // Second ability should work if cooldown has passed
  assert.equal(
    limiter.canUseAbility(1000 + ABILITY_COOLDOWN_MS),
    true,
    'Second ability should work after cooldown',
  );

  // Reset should work
  limiter.reset();
  assert.equal(limiter.canUseAbility(1000), true, 'Ability should work after reset');
});

test('ValidationContext works correctly', () => {
  const context = new ValidationContext();

  // Valid message should pass
  const validMessage = { t: MessageType.Stop };
  const result1 = context.validateMessage(validMessage);
  assert.equal(result1.valid, true, 'Valid message should pass validation');

  // Invalid message should fail
  const invalidMessage = { t: 'invalid' };
  const result2 = context.validateMessage(invalidMessage);
  assert.equal(result2.valid, false, 'Invalid message should fail validation');
  assert.ok(result2.error, 'Invalid message should have error message');

  // Get stats
  const stats = context.getStats();
  assert.equal(stats.messageCount, 2, 'Should have processed 2 messages');
  assert.equal(stats.errorCount, 1, 'Should have 1 error');
  assert.equal(stats.errorRate, 0.5, 'Should have 50% error rate');
  assert.ok(stats.uptime > 0, 'Should have positive uptime');
});

test('ValidationContext handles ability cooldown', () => {
  const context = new ValidationContext();

  // First ability should work
  const ability1 = { t: MessageType.Ability, id: AbilityId.Roar };
  const result1 = context.validateMessage(ability1);
  assert.equal(result1.valid, true, 'First ability should work');

  // Second ability should fail due to cooldown
  const ability2 = { t: MessageType.Ability, id: AbilityId.Roar };
  const result2 = context.validateMessage(ability2);
  assert.equal(result2.valid, false, 'Second ability should fail due to cooldown');
  assert.ok(result2.error?.includes('cooldown'), 'Error should mention cooldown');
});

test('ValidationContext handles build version validation', () => {
  const context = new ValidationContext();

  // Valid boot message should work
  const validBoot = { t: MessageType.Boot, seed: 12345, build: BUILD_VERSION };
  const result1 = context.validateMessage(validBoot);
  assert.equal(result1.valid, true, 'Valid boot message should work');

  // Invalid boot message should fail
  const invalidBoot = { t: MessageType.Boot, seed: 12345, build: 'wrong-version' };
  const result2 = context.validateMessage(invalidBoot);
  assert.equal(result2.valid, false, 'Invalid boot message should fail');
  assert.ok(result2.error?.includes('version'), 'Error should mention version');
});

await run();
