#!/usr/bin/env node

/**
 * Performance metrics to CSV converter
 * 
 * Parses NDJSON log files and generates CSV with performance metrics
 * Usage: node scripts/logs-perf-to-csv.mjs <input.ndjson> <output.csv>
 */

import { readFileSync, writeFileSync } from 'fs';
import { join as _join } from 'path';

function parseNDJSON(filePath) {
  const content = readFileSync(filePath, 'utf8');
  const lines = content.trim().split('\n');
  
  return lines.map(line => {
    try {
      return JSON.parse(line);
    } catch {
      console.warn(`Failed to parse line: ${line}`);
      return null;
    }
  }).filter(Boolean);
}

function generateCSV(logs) {
  const headers = ['timestamp', 'level', 'source', 'message', 'seq'];
  const rows = [headers.join(',')];
  
  for (const log of logs) {
    const row = [
      new Date(log.t).toISOString(),
      log.lvl,
      log.src,
      `"${log.msg.replace(/"/g, '""')}"`,
      log.data?.seq || ''
    ];
    rows.push(row.join(','));
  }
  
  return rows.join('\n');
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.length !== 2) {
    console.error('Usage: node logs-perf-to-csv.mjs <input.ndjson> <output.csv>');
    process.exit(1);
  }
  
  const [inputFile, outputFile] = args;
  
  try {
    console.log(`Parsing ${inputFile}...`);
    const logs = parseNDJSON(inputFile);
    console.log(`Found ${logs.length} log entries`);
    
    const csv = generateCSV(logs);
    writeFileSync(outputFile, csv, 'utf8');
    
    console.log(`CSV written to ${outputFile}`);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
