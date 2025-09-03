// tests/performance-monitor.mjs
export function measureTestPerformance(testName, testFn) {
  return async () => {
    const start = performance.now();
    const startMemory = process.memoryUsage();
    
    try {
      await testFn();
    } finally {
      const end = performance.now();
      const endMemory = process.memoryUsage();
      
      console.log(`⏱️  ${testName}: ${(end - start).toFixed(2)}ms`);
      console.log(`💾 Memory: +${((endMemory.heapUsed - startMemory.heapUsed) / 1024 / 1024).toFixed(2)}MB`);
    }
  };
}

export function logTestPerformance(testName, startTime, startMemory) {
  const endTime = performance.now();
  const endMemory = process.memoryUsage();
  
  const duration = endTime - startTime;
  const memoryDelta = (endMemory.heapUsed - startMemory.heapUsed) / 1024 / 1024;
  
  console.log(`📊 ${testName}: ${duration.toFixed(2)}ms, Memory: ${memoryDelta >= 0 ? '+' : ''}${memoryDelta.toFixed(2)}MB`);
  
  return { duration, memoryDelta };
}
