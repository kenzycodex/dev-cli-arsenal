#!/usr/bin/env node

/**
 * dev-cli-arsenal Tool Verification System
 * Version: 1.0.0
 * 
 * This script verifies the installation and functionality of CLI tools
 * Supports: Cross-platform verification with detailed reporting
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const util = require('util');

// Configuration
const CONFIG = {
    version: '1.0.0',
    timeout: 10000, // 10 seconds timeout for each tool check
    concurrency: 5, // Number of tools to check simultaneously
    logFile: path.join(os.tmpdir(), 'dev-cli-arsenal-verification.log'),
    reportFile: path.join(process.cwd(), 'tool-verification-report.json')
};

// Color codes for console output
const COLORS = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m'
};

// Global statistics
const STATS = {
    totalTools: 0,
    verified: 0,
    failed: 0,
    warnings: 0,
    startTime: Date.now(),
    endTime: null,
    systemInfo: {
        platform: process.platform,
        arch: process.arch,
        nodeVersion: process.version,
        npmVersion: null
    }
};

// Tool definitions with verification commands and metadata
const TOOLS = [
    // Package Managers & Installation Tools
    {
        name: 'ni',
        command: 'ni --version',
        category: 'Package Managers',
        description: 'Universal package manager detector',
        packageName: '@antfu/ni',
        installType: 'npm',
        critical: true,
        platforms: ['win32', 'darwin', 'linux']
    },
    {
        name: 'bun',
        command: 'bun --version',
        category: 'Package Managers',
        description: 'Fast JavaScript runtime and package manager',
        packageName: 'bun',
        installType: 'curl',
        critical: false,
        platforms: ['win32', 'darwin', 'linux']
    },
    {
        name: 'pnpm',
        command: 'pnpm --version',
        category: 'Package Managers',
        description: 'Efficient package manager',
        packageName: 'pnpm',
        installType: 'npm',
        critical: false,
        platforms: ['win32', 'darwin', 'linux']
    },
    {
        name: 'yarn',
        command: 'yarn --version',
        category: 'Package Managers',
        description: 'Modern package manager',
        packageName: 'yarn',
        installType: 'npm',
        critical: false,
        platforms: ['win32', 'darwin', 'linux']
    },
    {
        name: 'volta',
        command: 'volta --version',
        category: 'Package Managers',
        description: 'Node version manager',
        packageName: 'volta',
        installType: 'curl',
        critical: false,
        platforms: ['win32', 'darwin', 'linux']
    },

    // File & Directory Operations
    {
        name: 'rimraf',
        command: 'rimraf --version',
        category: 'File Operations',
        description: 'Cross-platform rm -rf',
        packageName: 'rimraf',
        installType: 'npm',
        critical: true,
        platforms: ['win32', 'darwin', 'linux']
    },
    {
        name: 'trash',
        command: 'trash --version',
        category: 'File Operations',
        description: 'Safe delete to trash',
        packageName: 'trash-cli',
        installType: 'npm',
        critical: false,
        platforms: ['win32', 'darwin', 'linux']
    },
    {
        name: 'fd',
        command: 'fd --version',
        category: 'File Operations',
        description: 'Fast alternative to find',
        packageName: 'fd-find',
        installType: 'system',
        critical: false,
        platforms: ['win32', 'darwin', 'linux']
    },
    {
        name: 'rg',
        command: 'rg --version',
        category: 'File Operations',
        description: 'Ultra-fast grep (ripgrep)',
        packageName: 'ripgrep',
        installType: 'system',
        critical: false,
        platforms: ['win32', 'darwin', 'linux']
    },

    // Development Servers & Networking
    {
        name: 'serve',
        command: 'serve --version',
        category: 'Development Servers',
        description: 'Static file server',
        packageName: 'serve',
        installType: 'npm',
        critical: true,
        platforms: ['win32', 'darwin', 'linux']
    },
    {
        name: 'nodemon',
        command: 'nodemon --version',
        category: 'Development Servers',
        description: 'Auto-restart Node.js apps',
        packageName: 'nodemon',
        installType: 'npm',
        critical: true,
        platforms: ['win32', 'darwin', 'linux']
    },
    {
        name: 'live-server',
        command: 'live-server --version',
        category: 'Development Servers',
        description: 'Auto-reload dev server',
        packageName: 'live-server',
        installType: 'npm',
        critical: false,
        platforms: ['win32', 'darwin', 'linux']
    },
    {
        name: 'json-server',
        command: 'json-server --version',
        category: 'Development Servers',
        description: 'Mock REST API',
        packageName: 'json-server',
        installType: 'npm',
        critical: false,
        platforms: ['win32', 'darwin', 'linux']
    },

    // Process Management & Monitoring
    {
        name: 'pm2',
        command: 'pm2 --version',
        category: 'Process Management',
        description: 'Production process manager',
        packageName: 'pm2',
        installType: 'npm',
        critical: false,
        platforms: ['win32', 'darwin', 'linux']
    },
    {
        name: 'fkill',
        command: 'fkill --version',
        category: 'Process Management',
        description: 'Interactive process killer',
        packageName: 'fkill-cli',
        installType: 'npm',
        critical: false,
        platforms: ['win32', 'darwin', 'linux']
    },
    {
        name: 'concurrently',
        command: 'concurrently --version',
        category: 'Process Management',
        description: 'Run multiple commands',
        packageName: 'concurrently',
        installType: 'npm',
        critical: false,
        platforms: ['win32', 'darwin', 'linux']
    },
    {
        name: 'kill-port',
        command: 'kill-port --version',
        category: 'Process Management',
        description: 'Kill process on port',
        packageName: 'kill-port',
        installType: 'npm',
        critical: false,
        platforms: ['win32', 'darwin', 'linux']
    },

    // Code Quality & Formatting
    {
        name: 'prettier',
        command: 'prettier --version',
        category: 'Code Quality',
        description: 'Code formatter',
        packageName: 'prettier',
        installType: 'npm',
        critical: true,
        platforms: ['win32', 'darwin', 'linux']
    },
    {
        name: 'eslint',
        command: 'eslint --version',
        category: 'Code Quality',
        description: 'JavaScript linter',
        packageName: 'eslint',
        installType: 'npm',
        critical: false,
        platforms: ['win32', 'darwin', 'linux']
    },
    {
        name: 'eslint_d',
        command: 'eslint_d --version',
        category: 'Code Quality',
        description: 'ESLint daemon (faster)',
        packageName: 'eslint_d',
        installType: 'npm',
        critical: false,
        platforms: ['win32', 'darwin', 'linux']
    },
    {
        name: 'stylelint',
        command: 'stylelint --version',
        category: 'Code Quality',
        description: 'CSS linter',
        packageName: 'stylelint',
        installType: 'npm',
        critical: false,
        platforms: ['win32', 'darwin', 'linux']
    },

    // Build Tools & Bundlers
    {
        name: 'esbuild',
        command: 'esbuild --version',
        category: 'Build Tools',
        description: 'Extremely fast bundler',
        packageName: 'esbuild',
        installType: 'npm',
        critical: false,
        platforms: ['win32', 'darwin', 'linux']
    },
    {
        name: 'vite',
        command: 'vite --version',
        category: 'Build Tools',
        description: 'Lightning-fast dev server',
        packageName: 'vite',
        installType: 'npm',
        critical: false,
        platforms: ['win32', 'darwin', 'linux']
    },
    {
        name: 'turbo',
        command: 'turbo --version',
        category: 'Build Tools',
        description: 'High-performance build system',
        packageName: 'turbo',
        installType: 'npm',
        critical: false,
        platforms: ['win32', 'darwin', 'linux']
    },
    {
        name: 'rollup',
        command: 'rollup --version',
        category: 'Build Tools',
        description: 'Module bundler',
        packageName: 'rollup',
        installType: 'npm',
        critical: false,
        platforms: ['win32', 'darwin', 'linux']
    },

    // Testing & Debugging
    {
        name: 'vitest',
        command: 'vitest --version',
        category: 'Testing',
        description: 'Blazing fast unit tests',
        packageName: 'vitest',
        installType: 'npm',
        critical: false,
        platforms: ['win32', 'darwin', 'linux']
    },
    {
        name: 'jest',
        command: 'jest --version',
        category: 'Testing',
        description: 'JavaScript testing framework',
        packageName: 'jest',
        installType: 'npm',
        critical: false,
        platforms: ['win32', 'darwin', 'linux']
    },
    {
        name: 'playwright',
        command: 'playwright --version',
        category: 'Testing',
        description: 'End-to-end testing',
        packageName: '@playwright/test',
        installType: 'npm',
        critical: false,
        platforms: ['win32', 'darwin', 'linux']
    },
    {
        name: 'lighthouse',
        command: 'lighthouse --version',
        category: 'Testing',
        description: 'Performance auditing',
        packageName: 'lighthouse',
        installType: 'npm',
        critical: false,
        platforms: ['win32', 'darwin', 'linux']
    },

    // System Tools & Utilities
    {
        name: 'bat',
        command: 'bat --version',
        category: 'System Tools',
        description: 'Better cat with syntax highlighting',
        packageName: 'bat',
        installType: 'system',
        critical: false,
        platforms: ['win32', 'darwin', 'linux']
    },
    {
        name: 'fzf',
        command: 'fzf --version',
        category: 'System Tools',
        description: 'Fuzzy finder',
        packageName: 'fzf',
        installType: 'system',
        critical: false,
        platforms: ['win32', 'darwin', 'linux']
    },
    {
        name: 'jq',
        command: 'jq --version',
        category: 'System Tools',
        description: 'JSON processor',
        packageName: 'jq',
        installType: 'system',
        critical: false,
        platforms: ['win32', 'darwin', 'linux']
    },
    {
        name: 'tree',
        command: 'tree --version',
        category: 'System Tools',
        description: 'Directory structure visualization',
        packageName: 'tree',
        installType: 'system',
        critical: false,
        platforms: ['win32', 'darwin', 'linux']
    },

    // Productivity & Utilities
    {
        name: 'tldr',
        command: 'tldr --version',
        category: 'Productivity',
        description: 'Simplified man pages',
        packageName: 'tldr',
        installType: 'npm',
        critical: false,
        platforms: ['win32', 'darwin', 'linux']
    },
    {
        name: 'gh',
        command: 'gh --version',
        category: 'Git Tools',
        description: 'GitHub CLI',
        packageName: 'gh',
        installType: 'system',
        critical: false,
        platforms: ['win32', 'darwin', 'linux']
    },

    // Network & Performance
    {
        name: 'speed-test',
        command: 'speed-test --version',
        category: 'Network Tools',
        description: 'Internet speed test',
        packageName: 'speed-test',
        installType: 'npm',
        critical: false,
        platforms: ['win32', 'darwin', 'linux']
    },
    {
        name: 'fast-cli',
        command: 'fast --version',
        category: 'Network Tools',
        description: 'Netflix speed test',
        packageName: 'fast-cli',
        installType: 'npm',
        critical: false,
        platforms: ['win32', 'darwin', 'linux']
    },

    // Fun & Customization
    {
        name: 'neofetch',
        command: 'neofetch --version',
        category: 'Fun Tools',
        description: 'System info display',
        packageName: 'neofetch',
        installType: 'system',
        critical: false,
        platforms: ['darwin', 'linux']
    },
    {
        name: 'figlet',
        command: 'figlet -v',
        category: 'Fun Tools',
        description: 'ASCII art banners',
        packageName: 'figlet',
        installType: 'system',
        critical: false,
        platforms: ['win32', 'darwin', 'linux']
    }
];

// Utility functions
function colorize(text, color) {
    if (!process.stdout.isTTY) return text;
    return `${COLORS[color]}${text}${COLORS.reset}`;
}

function log(level, message, category = '') {
    const timestamp = new Date().toISOString();
    const categoryStr = category ? ` [${category}]` : '';
    const logMessage = `[${timestamp}] [${level.toUpperCase()}]${categoryStr} ${message}`;
    
    // Console output with colors
    const levelColors = {
        info: 'cyan',
        success: 'green',
        warning: 'yellow',
        error: 'red',
        header: 'magenta',
        step: 'blue'
    };
    
    const coloredLevel = colorize(`[${level.toUpperCase()}]`, levelColors[level] || 'white');
    const coloredCategory = category ? colorize(`[${category}]`, 'dim') : '';
    const consoleMessage = `${colorize(timestamp.split('T')[1].split('.')[0], 'dim')} ${coloredLevel}${coloredCategory} ${message}`;
    
    console.log(consoleMessage);
    
    // File logging
    try {
        fs.appendFileSync(CONFIG.logFile, logMessage + '\n');
    } catch (error) {
        // Silently continue if logging fails
    }
}

function printHeader() {
    console.log('');
    console.log(colorize('╔════════════════════════════════════════════════════════════════╗', 'cyan'));
    console.log(colorize('║                                                                ║', 'cyan'));
    console.log(colorize(`║  🔍 dev-cli-arsenal Tool Verification v${CONFIG.version}               ║`, 'cyan'));
    console.log(colorize('║                                                                ║', 'cyan'));
    console.log(colorize('║  Comprehensive CLI Tools Health Check                         ║', 'cyan'));
    console.log(colorize('║                                                                ║', 'cyan'));
    console.log(colorize('╚════════════════════════════════════════════════════════════════╝', 'cyan'));
    console.log('');
}

function getCurrentSystemInfo() {
    try {
        const npmVersion = execSync('npm --version', { encoding: 'utf8', timeout: 5000 }).trim();
        STATS.systemInfo.npmVersion = npmVersion;
    } catch (error) {
        STATS.systemInfo.npmVersion = 'Not found';
    }

    log('info', `Platform: ${STATS.systemInfo.platform} (${STATS.systemInfo.arch})`);
    log('info', `Node.js: ${STATS.systemInfo.nodeVersion}`);
    log('info', `npm: ${STATS.systemInfo.npmVersion}`);
    log('info', `Verification started at: ${new Date().toLocaleString()}`);
    console.log('');
}

async function checkTool(tool) {
    return new Promise((resolve) => {
        const startTime = Date.now();
        
        // Skip tools not supported on current platform
        if (!tool.platforms.includes(process.platform)) {
            resolve({
                ...tool,
                status: 'skipped',
                reason: `Not supported on ${process.platform}`,
                duration: 0,
                version: null,
                error: null
            });
            return;
        }

        try {
            // Use spawn for better control over the process
            const child = spawn(tool.command.split(' ')[0], tool.command.split(' ').slice(1), {
                stdio: 'pipe',
                timeout: CONFIG.timeout,
                shell: true
            });

            let stdout = '';
            let stderr = '';

            child.stdout.on('data', (data) => {
                stdout += data.toString();
            });

            child.stderr.on('data', (data) => {
                stderr += data.toString();
            });

            child.on('close', (code) => {
                const duration = Date.now() - startTime;
                
                if (code === 0) {
                    // Extract version from output
                    const output = stdout || stderr;
                    const versionMatch = output.match(/(\d+\.\d+\.\d+(?:\.\d+)?)/);
                    const version = versionMatch ? versionMatch[1] : output.trim().split('\n')[0];

                    resolve({
                        ...tool,
                        status: 'verified',
                        reason: null,
                        duration,
                        version: version.substring(0, 50), // Limit version string length
                        error: null
                    });
                } else {
                    resolve({
                        ...tool,
                        status: 'failed',
                        reason: 'Command failed or not found',
                        duration,
                        version: null,
                        error: stderr.trim() || stdout.trim() || `Exit code: ${code}`
                    });
                }
            });

            child.on('error', (error) => {
                const duration = Date.now() - startTime;
                resolve({
                    ...tool,
                    status: 'failed',
                    reason: 'Command not found or execution error',
                    duration,
                    version: null,
                    error: error.message
                });
            });

            // Handle timeout
            setTimeout(() => {
                if (!child.killed) {
                    child.kill();
                    const duration = Date.now() - startTime;
                    resolve({
                        ...tool,
                        status: 'failed',
                        reason: 'Timeout',
                        duration,
                        version: null,
                        error: `Command timed out after ${CONFIG.timeout}ms`
                    });
                }
            }, CONFIG.timeout);

        } catch (error) {
            const duration = Date.now() - startTime;
            resolve({
                ...tool,
                status: 'failed',
                reason: 'Execution error',
                duration,
                version: null,
                error: error.message
            });
        }
    });
}

async function verifyToolsBatch(tools, batchSize = CONFIG.concurrency) {
    const results = [];
    
    for (let i = 0; i < tools.length; i += batchSize) {
        const batch = tools.slice(i, i + batchSize);
        const batchPromises = batch.map(tool => {
            process.stdout.write(`\rChecking ${tool.name}... [${i + 1}-${Math.min(i + batchSize, tools.length)}/${tools.length}]`);
            return checkTool(tool);
        });
        
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
        
        // Small delay between batches to prevent overwhelming the system
        if (i + batchSize < tools.length) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }
    
    process.stdout.write('\r' + ' '.repeat(80) + '\r'); // Clear progress line
    return results;
}

function categorizeResults(results) {
    const categories = {};
    
    results.forEach(result => {
        if (!categories[result.category]) {
            categories[result.category] = [];
        }
        categories[result.category].push(result);
    });
    
    return categories;
}

function updateStats(results) {
    STATS.totalTools = results.length;
    STATS.verified = results.filter(r => r.status === 'verified').length;
    STATS.failed = results.filter(r => r.status === 'failed').length;
    STATS.warnings = results.filter(r => r.status === 'skipped').length;
    STATS.endTime = Date.now();
}

function displayResults(results) {
    const categories = categorizeResults(results);
    
    updateStats(results);
    
    console.log('');
    log('header', '📊 Verification Results');
    console.log('');
    
    // Summary statistics
    const successRate = Math.round((STATS.verified / (STATS.totalTools - STATS.warnings)) * 100);
    const duration = ((STATS.endTime - STATS.startTime) / 1000).toFixed(1);
    
    console.log(colorize('Summary:', 'bright'));
    console.log(`   Total tools checked: ${STATS.totalTools}`);
    console.log(colorize(`   ✅ Verified: ${STATS.verified}`, 'green'));
    console.log(colorize(`   ❌ Failed: ${STATS.failed}`, 'red'));
    console.log(colorize(`   ⏭️  Skipped: ${STATS.warnings}`, 'yellow'));
    console.log(colorize(`   📈 Success rate: ${successRate}%`, 'cyan'));
    console.log(colorize(`   ⏱️  Duration: ${duration}s`, 'cyan'));
    console.log('');
    
    // Detailed results by category
    Object.entries(categories).forEach(([category, tools]) => {
        console.log(colorize(`📂 ${category}:`, 'blue'));
        
        tools.forEach(tool => {
            const statusIcon = {
                'verified': '✅',
                'failed': '❌',
                'skipped': '⏭️'
            }[tool.status];
            
            const nameWidth = 20;
            const paddedName = tool.name.padEnd(nameWidth);
            
            if (tool.status === 'verified') {
                const versionInfo = tool.version ? colorize(tool.version, 'dim') : '';
                console.log(`   ${statusIcon} ${paddedName} ${versionInfo}`);
            } else if (tool.status === 'failed') {
                console.log(`   ${statusIcon} ${paddedName} ${colorize('Not installed', 'red')}`);
            } else {
                console.log(`   ${statusIcon} ${paddedName} ${colorize(tool.reason, 'yellow')}`);
            }
        });
        console.log('');
    });
}

function generateInstallationSuggestions(results) {
    const failedTools = results.filter(r => r.status === 'failed');
    
    if (failedTools.length === 0) {
        log('success', 'All supported tools are installed! 🎉');
        return;
    }
    
    console.log(colorize('💡 Installation Suggestions:', 'yellow'));
    console.log('');
    
    // Group by installation type
    const npmTools = failedTools.filter(t => t.installType === 'npm');
    const systemTools = failedTools.filter(t => t.installType === 'system');
    const curlTools = failedTools.filter(t => t.installType === 'curl');
    
    if (npmTools.length > 0) {
        const npmPackages = npmTools.map(t => t.packageName).join(' ');
        console.log(colorize('📦 NPM packages:', 'cyan'));
        console.log(`npm install -g ${npmPackages}`);
        console.log('');
    }
    
    if (systemTools.length > 0) {
        console.log(colorize('🔧 System packages:', 'cyan'));
        
        // Platform-specific suggestions
        if (process.platform === 'darwin') {
            const brewPackages = systemTools.map(t => t.packageName).join(' ');
            console.log(`# macOS (using Homebrew):`);
            console.log(`brew install ${brewPackages}`);
        } else if (process.platform === 'linux') {
            const debPackages = systemTools.map(t => t.packageName).join(' ');
            console.log(`# Ubuntu/Debian:`);
            console.log(`sudo apt install ${debPackages}`);
            console.log(`# RHEL/CentOS/Fedora:`);
            console.log(`sudo dnf install ${debPackages}`);
        } else if (process.platform === 'win32') {
            console.log(`# Windows (using Scoop):`);
            systemTools.forEach(t => {
                console.log(`scoop install ${t.packageName}`);
            });
        }
        console.log('');
    }
    
    if (curlTools.length > 0) {
        console.log(colorize('🌐 Special installations:', 'cyan'));
        curlTools.forEach(tool => {
            switch (tool.name) {
                case 'bun':
                    console.log('# Install Bun:');
                    if (process.platform === 'win32') {
                        console.log('powershell -c "irm bun.sh/install.ps1 | iex"');
                    } else {
                        console.log('curl -fsSL https://bun.sh/install | bash');
                    }
                    break;
                case 'volta':
                    console.log('# Install Volta:');
                    if (process.platform === 'win32') {
                        console.log('# Download installer from: https://volta.sh');
                    } else {
                        console.log('curl https://get.volta.sh | bash');
                    }
                    break;
            }
        });
        console.log('');
    }
    
    // Critical tools warning
    const criticalFailed = failedTools.filter(t => t.critical);
    if (criticalFailed.length > 0) {
        console.log(colorize('⚠️  Critical tools missing:', 'red'));
        criticalFailed.forEach(tool => {
            console.log(`   • ${tool.name} - ${tool.description}`);
        });
        console.log('');
        console.log('These tools are essential for basic development workflows.');
        console.log('');
    }
}

function saveReport(results) {
    const report = {
        timestamp: new Date().toISOString(),
        version: CONFIG.version,
        systemInfo: STATS.systemInfo,
        statistics: {
            totalTools: STATS.totalTools,
            verified: STATS.verified,
            failed: STATS.failed,
            warnings: STATS.warnings,
            successRate: Math.round((STATS.verified / (STATS.totalTools - STATS.warnings)) * 100),
            duration: (STATS.endTime - STATS.startTime) / 1000
        },
        results: results.map(r => ({
            name: r.name,
            category: r.category,
            description: r.description,
            status: r.status,
            version: r.version,
            duration: r.duration,
            error: r.error,
            reason: r.reason,
            critical: r.critical,
            installType: r.installType,
            packageName: r.packageName
        }))
    };
    
    try {
        fs.writeFileSync(CONFIG.reportFile, JSON.stringify(report, null, 2));
        log('info', `Detailed report saved to: ${CONFIG.reportFile}`);
    } catch (error) {
        log('error', `Failed to save report: ${error.message}`);
    }
}

function displayPostVerificationInfo() {
    console.log('');
    console.log(colorize('📚 Additional Information:', 'cyan'));
    console.log('');
    console.log('• For installation guides, visit: https://github.com/kenzycodex/dev-cli-arsenal');
    console.log('• To re-run verification: node scripts/verify-tools.js');
    console.log('• For issues or suggestions: https://github.com/kenzycodex/dev-cli-arsenal/issues');
    console.log('');
    console.log(colorize('Happy coding! 🚀', 'green'));
    console.log('');
}

// Main execution function
async function main() {
    try {
        // Initialize logging
        try {
            fs.writeFileSync(CONFIG.logFile, `Tool Verification Log - ${new Date().toISOString()}\n`);
        } catch (error) {
            console.warn('Warning: Could not initialize log file');
        }
        
        printHeader();
        getCurrentSystemInfo();
        
        log('info', 'Starting tool verification...');
        console.log('');
        
        // Filter tools for current platform
        const platformTools = TOOLS.filter(tool => 
            tool.platforms.includes(process.platform)
        );
        
        log('info', `Checking ${platformTools.length} tools supported on ${process.platform}...`);
        
        // Verify tools in batches
        const results = await verifyToolsBatch(platformTools);
        
        // Display results
        displayResults(results);
        
        // Generate suggestions
        generateInstallationSuggestions(results);
        
        // Save detailed report
        saveReport(results);
        
        // Post-verification info
        displayPostVerificationInfo();
        
        // Exit with appropriate code
        const hasFailures = results.some(r => r.status === 'failed' && r.critical);
        process.exit(hasFailures ? 1 : 0);
        
    } catch (error) {
        log('error', `Verification failed: ${error.message}`);
        console.error(error.stack);
        process.exit(1);
    }
}

// Command line argument handling
function parseArguments() {
    const args = process.argv.slice(2);
    
    if (args.includes('--help') || args.includes('-h')) {
        console.log(`
dev-cli-arsenal Tool Verification v${CONFIG.version}

Usage: node verify-tools.js [options]

Options:
  --help, -h        Show this help message
  --version, -v     Show version information
  --config          Show current configuration
  --critical-only   Check only critical tools
  --category <cat>  Check tools from specific category

Examples:
  node verify-tools.js
  node verify-tools.js --critical-only
  node verify-tools.js --category "Package Managers"

For more information: https://github.com/kenzycodex/dev-cli-arsenal
        `);
        process.exit(0);
    }
    
    if (args.includes('--version') || args.includes('-v')) {
        console.log(`dev-cli-arsenal tool verification v${CONFIG.version}`);
        process.exit(0);
    }
    
    if (args.includes('--config')) {
        console.log('Current Configuration:');
        console.log(JSON.stringify(CONFIG, null, 2));
        process.exit(0);
    }
    
    // Handle critical-only flag
    if (args.includes('--critical-only')) {
        const criticalTools = TOOLS.filter(tool => tool.critical);
        return criticalTools;
    }
    
    // Handle category filter
    const categoryIndex = args.indexOf('--category');
    if (categoryIndex !== -1 && categoryIndex + 1 < args.length) {
        const category = args[categoryIndex + 1];
        const categoryTools = TOOLS.filter(tool => 
            tool.category.toLowerCase().includes(category.toLowerCase())
        );
        
        if (categoryTools.length === 0) {
            console.error(`No tools found for category: ${category}`);
            console.log('Available categories:');
            const categories = [...new Set(TOOLS.map(t => t.category))];
            categories.forEach(cat => console.log(`  - ${cat}`));
            process.exit(1);
        }
        
        return categoryTools;
    }
    
    return TOOLS;
}

// Handle process signals
process.on('SIGINT', () => {
    console.log('\n\nVerification interrupted by user');
    process.exit(130);
});

process.on('SIGTERM', () => {
    console.log('\n\nVerification terminated');
    process.exit(143);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    log('error', `Uncaught exception: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    log('error', `Unhandled rejection at ${promise}: ${reason}`);
    process.exit(1);
});

// Export for testing
if (require.main === module) {
    // Parse arguments and filter tools
    const toolsToCheck = parseArguments();
    
    // Update TOOLS constant for filtered execution
    if (toolsToCheck !== TOOLS) {
        log('info', `Filtered to ${toolsToCheck.length} tools`);
        // Replace TOOLS array content
        TOOLS.length = 0;
        TOOLS.push(...toolsToCheck);
    }
    
    // Run main function
    main().catch(error => {
        log('error', `Fatal error: ${error.message}`);
        console.error(error.stack);
        process.exit(1);
    });
} else {
    // Export functions for testing or module usage
    module.exports = {
        checkTool,
        TOOLS,
        CONFIG,
        verifyToolsBatch,
        categorizeResults,
        generateInstallationSuggestions
    };
}