#!/usr/bin/env node

// Comprehensive test runner script
const { spawn } = require('child_process')
const fs = require('fs')
const path = require('path')

// Test configuration
const TEST_CONFIG = {
  unit: {
    command: 'npm',
    args: ['run', 'test:unit'],
    description: 'Running unit tests...',
    timeout: 300000, // 5 minutes
  },
  integration: {
    command: 'npm',
    args: ['run', 'test:integration'],
    description: 'Running integration tests...',
    timeout: 600000, // 10 minutes
  },
  e2e: {
    command: 'npm',
    args: ['run', 'test:e2e'],
    description: 'Running end-to-end tests...',
    timeout: 900000, // 15 minutes
  },
  coverage: {
    command: 'npm',
    args: ['run', 'test:coverage'],
    description: 'Generating coverage report...',
    timeout: 300000, // 5 minutes
  },
  lint: {
    command: 'npm',
    args: ['run', 'lint'],
    description: 'Running linter...',
    timeout: 120000, // 2 minutes
  },
  typecheck: {
    command: 'npm',
    args: ['run', 'type-check'],
    description: 'Running type check...',
    timeout: 180000, // 3 minutes
  }
}

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
}

// Utility functions
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`)
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green)
}

function logError(message) {
  log(`❌ ${message}`, colors.red)
}

function logWarning(message) {
  log(`⚠️  ${message}`, colors.yellow)
}

function logInfo(message) {
  log(`ℹ️  ${message}`, colors.blue)
}

function logHeader(message) {
  log(`\n${'='.repeat(50)}`, colors.cyan)
  log(`${message}`, colors.cyan + colors.bright)
  log(`${'='.repeat(50)}\n`, colors.cyan)
}

// Run a single test suite
function runTest(testType, config) {
  return new Promise((resolve, reject) => {
    logInfo(config.description)
    
    const startTime = Date.now()
    const child = spawn(config.command, config.args, {
      stdio: 'inherit',
      shell: true,
      env: { ...process.env, NODE_ENV: 'test' }
    })

    // Set timeout
    const timeout = setTimeout(() => {
      child.kill('SIGKILL')
      reject(new Error(`Test ${testType} timed out after ${config.timeout / 1000} seconds`))
    }, config.timeout)

    child.on('close', (code) => {
      clearTimeout(timeout)
      const duration = ((Date.now() - startTime) / 1000).toFixed(2)
      
      if (code === 0) {
        logSuccess(`${testType} tests passed in ${duration}s`)
        resolve({ testType, success: true, duration })
      } else {
        logError(`${testType} tests failed with exit code ${code}`)
        reject(new Error(`Test ${testType} failed with exit code ${code}`))
      }
    })

    child.on('error', (error) => {
      clearTimeout(timeout)
      logError(`Failed to start ${testType} tests: ${error.message}`)
      reject(error)
    })
  })
}

// Generate test report
function generateReport(results) {
  const totalDuration = results.reduce((sum, result) => sum + parseFloat(result.duration), 0)
  const successCount = results.filter(result => result.success).length
  const totalCount = results.length

  logHeader('TEST SUMMARY')
  
  results.forEach(result => {
    const status = result.success ? '✅ PASS' : '❌ FAIL'
    log(`${status} ${result.testType.padEnd(12)} ${result.duration}s`)
  })

  log(`\nTotal: ${successCount}/${totalCount} test suites passed`)
  log(`Duration: ${totalDuration.toFixed(2)}s`)
  
  if (successCount === totalCount) {
    logSuccess('\n🎉 All tests passed!')
    return true
  } else {
    logError(`\n💥 ${totalCount - successCount} test suite(s) failed`)
    return false
  }
}

// Check prerequisites
function checkPrerequisites() {
  logInfo('Checking prerequisites...')
  
  // Check if node_modules exists
  if (!fs.existsSync('node_modules')) {
    logError('node_modules not found. Please run "npm install" first.')
    process.exit(1)
  }

  // Check if package.json has required scripts
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
  const requiredScripts = ['test:unit', 'test:integration', 'lint', 'type-check']
  
  const missingScripts = requiredScripts.filter(script => !packageJson.scripts[script])
  if (missingScripts.length > 0) {
    logWarning(`Missing package.json scripts: ${missingScripts.join(', ')}`)
  }

  logSuccess('Prerequisites check passed')
}

// Setup test environment
function setupTestEnvironment() {
  logInfo('Setting up test environment...')
  
  // Create test directories if they don't exist
  const testDirs = ['test-results', 'coverage', '.jest-cache']
  testDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
  })

  // Set environment variables
  process.env.NODE_ENV = 'test'
  process.env.CI = process.env.CI || 'false'
  
  logSuccess('Test environment setup complete')
}

// Cleanup test environment
function cleanupTestEnvironment() {
  logInfo('Cleaning up test environment...')
  
  // Clean up temporary files
  const tempDirs = ['.jest-cache']
  tempDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true })
    }
  })
  
  logSuccess('Test environment cleanup complete')
}

// Main test runner
async function runTests() {
  const args = process.argv.slice(2)
  const testTypes = args.length > 0 ? args : ['lint', 'typecheck', 'unit', 'integration']
  
  logHeader('PROPERTY MANAGEMENT SYSTEM - TEST RUNNER')
  
  try {
    checkPrerequisites()
    setupTestEnvironment()
    
    const results = []
    
    for (const testType of testTypes) {
      if (!TEST_CONFIG[testType]) {
        logWarning(`Unknown test type: ${testType}. Skipping...`)
        continue
      }
      
      try {
        const result = await runTest(testType, TEST_CONFIG[testType])
        results.push(result)
      } catch (error) {
        results.push({
          testType,
          success: false,
          duration: '0.00',
          error: error.message
        })
        
        // Continue with other tests unless it's a critical failure
        if (testType === 'lint' || testType === 'typecheck') {
          logWarning(`${testType} failed but continuing with other tests...`)
        }
      }
    }
    
    const allPassed = generateReport(results)
    
    // Generate badges
    generateBadges(results)
    
    cleanupTestEnvironment()
    
    process.exit(allPassed ? 0 : 1)
    
  } catch (error) {
    logError(`Test runner failed: ${error.message}`)
    cleanupTestEnvironment()
    process.exit(1)
  }
}

// Generate status badges
function generateBadges(results) {
  const badgesDir = 'badges'
  if (!fs.existsSync(badgesDir)) {
    fs.mkdirSync(badgesDir, { recursive: true })
  }

  results.forEach(result => {
    const status = result.success ? 'passing' : 'failing'
    const color = result.success ? 'brightgreen' : 'red'
    const badge = `https://img.shields.io/badge/${result.testType}-${status}-${color}`
    
    fs.writeFileSync(
      path.join(badgesDir, `${result.testType}.svg`),
      `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="104" height="20">
        <linearGradient id="b" x2="0" y2="100%">
          <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
          <stop offset="1" stop-opacity=".1"/>
        </linearGradient>
        <clipPath id="a">
          <rect width="104" height="20" rx="3" fill="#fff"/>
        </clipPath>
        <g clip-path="url(#a)">
          <path fill="#555" d="M0 0h63v20H0z"/>
          <path fill="${color === 'brightgreen' ? '#4c1' : '#e05d44'}" d="M63 0h41v20H63z"/>
          <path fill="url(#b)" d="M0 0h104v20H0z"/>
        </g>
        <g fill="#fff" text-anchor="middle" font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="110">
          <text x="325" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)" textLength="530">${result.testType}</text>
          <text x="325" y="140" transform="scale(.1)" textLength="530">${result.testType}</text>
          <text x="825" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)" textLength="310">${status}</text>
          <text x="825" y="140" transform="scale(.1)" textLength="310">${status}</text>
        </g>
      </svg>`
    )
  })
  
  logInfo(`Generated badges in ${badgesDir}/`)
}

// Handle process signals
process.on('SIGINT', () => {
  logWarning('\nReceived SIGINT. Cleaning up...')
  cleanupTestEnvironment()
  process.exit(130)
})

process.on('SIGTERM', () => {
  logWarning('\nReceived SIGTERM. Cleaning up...')
  cleanupTestEnvironment()
  process.exit(143)
})

// Run the tests
if (require.main === module) {
  runTests()
}

module.exports = {
  runTests,
  runTest,
  generateReport,
  checkPrerequisites,
  setupTestEnvironment,
  cleanupTestEnvironment
}
