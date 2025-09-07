/**
 * @file Clock accumulator tests for timing verification
 * @description Phase 1 Story 1: Unit tests for fixed timestep clock and accumulator
 */
import { strict as assert } from 'assert';
import { test, run } from '../../tests/_tiny-runner.mjs';
import { FixedClock, createFixedClock } from '../src/sim/clock/accumulator.js';
import { BackgroundTickDriver, createBackgroundTickDriver } from '../src/sim/clock/bgTick.js';
import { DT_MS, MAX_FRAME_TIME_MS, MAX_STEPS_PER_FRAME } from '../src/shared/constants.js';
test('FixedClock executes steps at correct intervals', () => {
    let stepCount = 0;
    let lastStepTime = 0;
    const clock = new FixedClock((_dtMs) => {
        stepCount++;
        const now = performance.now();
        if (lastStepTime > 0) {
            const actualDt = now - lastStepTime;
            assert.ok(Math.abs(actualDt - DT_MS) < 1, `Step interval should be close to ${DT_MS}ms, got ${actualDt}ms`);
        }
        lastStepTime = now;
    });
    // Start clock and let it run for a short time
    clock.start();
    // Wait for a few steps
    return new Promise((resolve) => {
        setTimeout(() => {
            clock.stop();
            assert.ok(stepCount > 0, 'Should have executed at least one step');
            resolve();
        }, 100);
    });
});
test('FixedClock accumulator handles variable frame times', () => {
    let stepCount = 0;
    let totalTime = 0;
    const clock = new FixedClock((_dtMs) => {
        stepCount++;
        totalTime += _dtMs;
    });
    // Simulate variable frame times
    let currentTime = 1000;
    const getNowMs = () => currentTime;
    const clockWithTime = new FixedClock((_dtMs) => {
        stepCount++;
        totalTime += _dtMs;
    }, getNowMs);
    // Simulate frames with different durations
    clockWithTime.start();
    // First frame: 50ms (should produce 3 steps)
    currentTime += 50;
    clockWithTime.tick();
    // Second frame: 10ms (should produce 0 steps)
    currentTime += 10;
    clockWithTime.tick();
    // Third frame: 100ms (should produce 6 steps)
    currentTime += 100;
    clockWithTime.tick();
    clockWithTime.stop();
    assert.ok(stepCount > 0, 'Should have executed steps');
    assert.equal(totalTime, stepCount * DT_MS, 'Total time should match step count * DT_MS');
});
test('FixedClock clamps excessive frame times', () => {
    let stepCount = 0;
    const _clock = new FixedClock((_dtMs) => {
        stepCount++;
    });
    // Simulate a very long frame time
    let currentTime = 1000;
    const getNowMs = () => currentTime;
    const _clockWithTime = new FixedClock((_dtMs) => {
        stepCount++;
    }, getNowMs);
    _clockWithTime.start();
    // Simulate a frame that's longer than MAX_FRAME_TIME_MS
    currentTime += MAX_FRAME_TIME_MS + 1000;
    _clockWithTime.tick();
    _clockWithTime.stop();
    // Should not have executed more than MAX_STEPS_PER_FRAME steps
    assert.ok(stepCount <= MAX_STEPS_PER_FRAME, `Should not exceed ${MAX_STEPS_PER_FRAME} steps per frame`);
});
test('FixedClock manual step works correctly', () => {
    let stepCount = 0;
    let lastDt = 0;
    const clock = new FixedClock((_dtMs) => {
        stepCount++;
        lastDt = dtMs;
    });
    // Manual step should work
    clock.step(25);
    assert.equal(stepCount, 1, 'Manual step should increment count');
    assert.equal(lastDt, 25, 'Manual step should use provided dt');
    // Multiple manual steps
    clock.advance(5, 30);
    assert.equal(stepCount, 6, 'Advance should execute multiple steps');
    assert.equal(lastDt, 30, 'Advance should use provided dt');
});
test('FixedClock state management works correctly', () => {
    const clock = new FixedClock(() => { });
    // Initial state
    assert.equal(clock.isRunning(), false, 'Should not be running initially');
    assert.equal(clock.getStepCount(), 0, 'Should have zero steps initially');
    assert.equal(clock.getFrameCount(), 0, 'Should have zero frames initially');
    // Start clock
    clock.start();
    assert.equal(clock.isRunning(), true, 'Should be running after start');
    // Stop clock
    clock.stop();
    assert.equal(clock.isRunning(), false, 'Should not be running after stop');
    // Reset clock
    clock.reset();
    assert.equal(clock.getStepCount(), 0, 'Should have zero steps after reset');
    assert.equal(clock.getFrameCount(), 0, 'Should have zero frames after reset');
});
test('BackgroundTickDriver runs at 2Hz', () => {
    let tickCount = 0;
    let lastTickTime = 0;
    const driver = new BackgroundTickDriver((_dtMs) => {
        // Step callback
    }, (_stats) => {
        tickCount++;
        const now = performance.now();
        if (lastTickTime > 0) {
            const interval = now - lastTickTime;
            assert.ok(interval >= 450 && interval <= 550, `Tick interval should be ~500ms, got ${interval}ms`);
        }
        lastTickTime = now;
    });
    // Start driver
    driver.start();
    assert.equal(driver.isActive(), true, 'Driver should be active after start');
    // Wait for a few ticks
    return new Promise((resolve) => {
        setTimeout(() => {
            driver.stop();
            assert.ok(tickCount > 0, 'Should have executed at least one tick');
            resolve();
        }, 1500);
    });
});
test('BackgroundTickDriver statistics are correct', () => {
    const driver = new BackgroundTickDriver(() => { }, () => { });
    const stats = driver.getStats();
    assert.equal(stats.isRunning, false, 'Should not be running initially');
    assert.equal(stats.tickInterval, 500, 'Should have 500ms tick interval');
    driver.start();
    const activeStats = driver.getStats();
    assert.equal(activeStats.isRunning, true, 'Should be running after start');
    driver.stop();
});
test('createFixedClock factory works correctly', () => {
    let stepCount = 0;
    const clock = createFixedClock((_dtMs) => {
        stepCount++;
    });
    assert.ok(clock instanceof FixedClock, 'Factory should return FixedClock instance');
    clock.step();
    assert.equal(stepCount, 1, 'Factory-created clock should work correctly');
});
test('createBackgroundTickDriver factory works correctly', () => {
    const driver = createBackgroundTickDriver(() => { }, () => { });
    assert.ok(driver instanceof BackgroundTickDriver, 'Factory should return BackgroundTickDriver instance');
    const stats = driver.getStats();
    assert.equal(stats.isRunning, false, 'Factory-created driver should be inactive initially');
});
test('FixedClock accumulator precision is maintained', () => {
    let _stepCount = 0;
    let _accumulatorError = 0;
    const _clock = new FixedClock((_dtMs) => {
        _stepCount++;
    });
    // Simulate precise timing
    let currentTime = 1000;
    const getNowMs = () => currentTime;
    const _clockWithTime = new FixedClock((_dtMs) => {
        _stepCount++;
    }, getNowMs);
    _clockWithTime.start();
    // Simulate many frames with slight timing variations
    for (let i = 0; i < 100; i++) {
        currentTime += DT_MS + (Math.random() - 0.5) * 2; // ±1ms variation
        _clockWithTime.tick();
    }
    _clockWithTime.stop();
    // Accumulator should be close to zero (no drift)
    const finalAccumulator = _clockWithTime.getAccumulator();
    assert.ok(Math.abs(finalAccumulator) < DT_MS, `Accumulator should be close to zero, got ${finalAccumulator}ms`);
});
await run();
