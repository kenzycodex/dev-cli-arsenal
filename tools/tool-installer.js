#!/usr/bin/env node

/**
 * dev-cli-arsenal Interactive Tool Installer
 * Version: 1.0.0
 * 
 * An interactive CLI tool for selectively installing development tools
 * Features: Category selection, batch installation, progress tracking
 */

const { execSync, spawn } = require('child_process');
const readline = require('readline');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Configuration
const CONFIG = {
    version: '1.0.0',
    name: 'dev-cli-arsenal-interactive-installer',
    logFile: path.join(os.tmpdir(), 'dev-cli-arsenal-installer.log'),
    timeout: 30000, // 30 seconds timeout per package
    maxRetries: 2
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
    white: '\x1b[37m',
    bgBlue: '\x1b[44m',
    bgGreen: '\x1b[42m'
};

// Installation statistics
const STATS = {
    selected: 0,
    installed: 0,
    failed: 0,
    skipped: 0,
    startTime: null,
    endTime: null
};

// Tool categories with descriptions and tools
const TOOL_CATEGORIES = {
    'Essential': {
        description: 'Must-have tools for every developer - package managers, file operations, and basic utilities',
        emoji: '⚡',
        priority: 1,
        tools: [
            {
                name: '@antfu/ni',
                displayName: 'ni',
                description: 'Universal package manager detector - automatically uses npm, yarn, or pnpm',
                command: 'npm install -g @antfu/ni',
                verify: 'ni --version',
                critical: true,
                size: '2.1MB',
                platforms: ['win32', 'darwin', 'linux']
            },
            {
                name: 'rimraf',
                displayName: 'rimraf',
                description: 'Cross-platform rm -rf alternative - delete files and folders safely',
                command: 'npm install -g rimraf',
                verify: 'rimraf --version',
                critical: true,
                size: '890KB',
                platforms: ['win32', 'darwin', 'linux']
            },
            {
                name: 'serve',
                displayName: 'serve',
                description: 'Static file server - instantly serve any directory over HTTP',
                command: 'npm install -g serve',
                verify: 'serve --version',
                critical: true,
                size: '1.5MB',
                platforms: ['win32', 'darwin', 'linux']
            },
            {
                name: 'nodemon',
                displayName: 'nodemon',
                description: 'Auto-restart Node.js applications when files change',
                command: 'npm install -g nodemon',
                verify: 'nodemon --version',
                critical: true,
                size: '3.2MB',
                platforms: ['win32', 'darwin', 'linux']
            },
            {
                name: 'trash-cli',
                displayName: 'trash',
                description: 'Safe delete to trash instead of permanent deletion',
                command: 'npm install -g trash-cli',
                verify: 'trash --version',
                critical: false,
                size: '1.1MB',
                platforms: ['win32', 'darwin', 'linux']
            }
        ]
    },
    
    'Code Quality': {
        description: 'Linting, formatting, and code analysis tools to maintain code quality',
        emoji: '🎨',
        priority: 2,
        tools: [
            {
                name: 'prettier',
                displayName: 'prettier',
                description: 'Opinionated code formatter supporting multiple languages',
                command: 'npm install -g prettier',
                verify: 'prettier --version',
                critical: false,
                size: '8.7MB',
                platforms: ['win32', 'darwin', 'linux']
            },
            {
                name: 'eslint',
                displayName: 'eslint',
                description: 'JavaScript and TypeScript linter for finding and fixing problems',
                command: 'npm install -g eslint',
                verify: 'eslint --version',
                critical: false,
                size: '12.3MB',
                platforms: ['win32', 'darwin', 'linux']
            },
            {
                name: 'eslint_d',
                displayName: 'eslint_d',
                description: 'ESLint daemon for faster linting performance',
                command: 'npm install -g eslint_d',
                verify: 'eslint_d --version',
                critical: false,
                size: '890KB',
                platforms: ['win32', 'darwin', 'linux']
            },
            {
                name: 'stylelint',
                displayName: 'stylelint',
                description: 'CSS linter that helps avoid errors and enforce conventions',
                command: 'npm install -g stylelint',
                verify: 'stylelint --version',
                critical: false,
                size: '15.6MB',
                platforms: ['win32', 'darwin', 'linux']
            }
        ]
    },
    
    'Build Tools': {
        description: 'Modern bundlers and build systems for optimizing applications',
        emoji: '🔧',
        priority: 3,
        tools: [
            {
                name: 'esbuild',
                displayName: 'esbuild',
                description: 'Extremely fast JavaScript bundler and minifier',
                command: 'npm install -g esbuild',
                verify: 'esbuild --version',
                critical: false,
                size: '7.2MB',
                platforms: ['win32', 'darwin', 'linux']
            },
            {
                name: 'vite',
                displayName: 'vite',
                description: 'Lightning-fast build tool and dev server',
                command: 'npm install -g vite',
                verify: 'vite --version',
                critical: false,
                size: '45.8MB',
                platforms: ['win32', 'darwin', 'linux']
            },
            {
                name: 'turbo',
                displayName: 'turbo',
                description: 'High-performance build system for JavaScript and TypeScript',
                command: 'npm install -g turbo',
                verify: 'turbo --version',
                critical: false,
                size: '23.1MB',
                platforms: ['win32', 'darwin', 'linux']
            },
            {
                name: 'rollup',
                displayName: 'rollup',
                description: 'Module bundler for JavaScript with tree-shaking',
                command: 'npm install -g rollup',
                verify: 'rollup --version',
                critical: false,
                size: '6.8MB',
                platforms: ['win32', 'darwin', 'linux']
            }
        ]
    },
    
    'Testing': {
        description: 'Testing frameworks and tools for ensuring code quality',
        emoji: '🧪',
        priority: 4,
        tools: [
            {
                name: 'vitest',
                displayName: 'vitest',
                description: 'Blazing fast unit testing framework powered by Vite',
                command: 'npm install -g vitest',
                verify: 'vitest --version',
                critical: false,
                size: '12.5MB',
                platforms: ['win32', 'darwin', 'linux']
            },
            {
                name: 'jest',
                displayName: 'jest',
                description: 'JavaScript testing framework with zero configuration',
                command: 'npm install -g jest',
                verify: 'jest --version',
                critical: false,
                size: '31.2MB',
                platforms: ['win32', 'darwin', 'linux']
            },
            {
                name: '@playwright/test',
                displayName: 'playwright',
                description: 'End-to-end testing for modern web applications',
                command: 'npm install -g @playwright/test',
                verify: 'playwright --version',
                critical: false,
                size: '78.9MB',
                platforms: ['win32', 'darwin', 'linux']
            },
            {
                name: 'lighthouse',
                displayName: 'lighthouse',
                description: 'Web performance and quality auditing tool',
                command: 'npm install -g lighthouse',
                verify: 'lighthouse --version',
                critical: false,
                size: '28.4MB',
                platforms: ['win32', 'darwin', 'linux']
            }
        ]
    },
    
    'Process Management': {
        description: 'Tools for managing and monitoring processes and applications',
        emoji: '⚙️',
        priority: 5,
        tools: [
            {
                name: 'pm2',
                displayName: 'pm2',
                description: 'Production process manager for Node.js applications',
                command: 'npm install -g pm2',
                verify: 'pm2 --version',
                critical: false,
                size: '18.7MB',
                platforms: ['win32', 'darwin', 'linux']
            },
            {
                name: 'fkill-cli',
                displayName: 'fkill',
                description: 'Interactive process killer with fuzzy search',
                command: 'npm install -g fkill-cli',
                verify: 'fkill --version',
                critical: false,
                size: '4.2MB',
                platforms: ['win32', 'darwin', 'linux']
            },
            {
                name: 'concurrently',
                displayName: 'concurrently',
                description: 'Run multiple commands concurrently with colored output',
                command: 'npm install -g concurrently',
                verify: 'concurrently --version',
                critical: false,
                size: '2.8MB',
                platforms: ['win32', 'darwin', 'linux']
            },
            {
                name: 'kill-port',
                displayName: 'kill-port',
                description: 'Kill processes running on specific ports',
                command: 'npm install -g kill-port',
                verify: 'kill-port --version',
                critical: false,
                size: '1.3MB',
                platforms: ['win32', 'darwin', 'linux']
            }
        ]
    },
    
    'Productivity': {
        description: 'Utilities to boost developer productivity and workflow',
        emoji: '🚀',
        priority: 6,
        tools: [
            {
                name: 'tldr',
                displayName: 'tldr',
                description: 'Simplified and community-driven man pages',
                command: 'npm install -g tldr',
                verify: 'tldr --version',
                critical: false,
                size: '5.1MB',
                platforms: ['win32', 'darwin', 'linux']
            },
            {
                name: 'json-server',
                displayName: 'json-server',
                description: 'Create a REST API with zero coding in seconds',
                command: 'npm install -g json-server',
                verify: 'json-server --version',
                critical: false,
                size: '8.9MB',
                platforms: ['win32', 'darwin', 'linux']
            },
            {
                name: 'carbon-now-cli',
                displayName: 'carbon-now-cli',
                description: 'Generate beautiful code screenshots from terminal',
                command: 'npm install -g carbon-now-cli',
                verify: 'carbon-now --version',
                critical: false,
                size: '12.8MB',
                platforms: ['win32', 'darwin', 'linux']
            },
            {
                name: 'qrcode-terminal',
                displayName: 'qrcode-terminal',
                description: 'Generate QR codes in the terminal',
                command: 'npm install -g qrcode-terminal',
                verify: 'qrcode-terminal --version',
                critical: false,
                size: '2.4MB',
                platforms: ['win32', 'darwin', 'linux']
            }
        ]
    },
    
    'Network & Performance': {
        description: 'Tools for network testing and performance analysis',
        emoji: '🌐',
        priority: 7,
        tools: [
            {
                name: 'speed-test',
                displayName: 'speed-test',
                description: 'Test internet connection speed from the command line',
                command: 'npm install -g speed-test',
                verify: 'speed-test --version',
                critical: false,
                size: '3.7MB',
                platforms: ['win32', 'darwin', 'linux']
            },
            {
                name: 'fast-cli',
                displayName: 'fast-cli',
                description: 'Netflix speed test from the command line',
                command: 'npm install -g fast-cli',
                verify: 'fast --version',
                critical: false,
                size: '1.9MB',
                platforms: ['win32', 'darwin', 'linux']
            }
        ]
    }
};

// Utility functions
function colorize(text, color) {
    if (!process.stdout.isTTY) return text;
    return `${COLORS[color]}${text}${COLORS.reset}`;
}

function log(message, color = 'white') {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const coloredTimestamp = colorize(`[${timestamp}]`, 'dim');
    console.log(`${coloredTimestamp} ${colorize(message, color)}`);
    
    // Log to file with proper error handling
    try {
        if (CONFIG.logFile) {
            fs.appendFileSync(CONFIG.logFile, `[${new Date().toISOString()}] ${message}\n`);
        }
    } catch (error) {
        // Silently continue if logging fails
    }
}

function createInterface() {
    return readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
}

function clearScreen() {
    console.clear();
}

function printHeader() {
    console.log('');
    console.log(colorize('╔════════════════════════════════════════════════════════════════╗', 'cyan'));
    console.log(colorize('║                                                                ║', 'cyan'));
    console.log(colorize(`║  🛠️  dev-cli-arsenal Interactive Installer v${CONFIG.version}           ║`, 'cyan'));
    console.log(colorize('║                                                                ║', 'cyan'));
    console.log(colorize('║  Select and install CLI tools tailored to your needs          ║', 'cyan'));
    console.log(colorize('║                                                                ║', 'cyan'));
    console.log(colorize('╚════════════════════════════════════════════════════════════════╝', 'cyan'));
    console.log('');
}

function printSystemInfo() {
    const platformMap = {
        'win32': 'Windows',
        'darwin': 'macOS',
        'linux': 'Linux'
    };
    const platform = platformMap[process.platform] || process.platform;
    
    log(`Platform: ${platform} (${process.arch})`, 'cyan');
    log(`Node.js: ${process.version}`, 'cyan');
    
    try {
        const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
        log(`npm: v${npmVersion}`, 'cyan');
    } catch (error) {
        log('npm: Not found', 'red');
    }
    
    console.log('');
}

function displayCategories() {
    console.log(colorize('📦 Available Tool Categories:', 'bright'));
    console.log('');
    
    const sortedCategories = Object.entries(TOOL_CATEGORIES)
        .sort(([,a], [,b]) => a.priority - b.priority);
    
    sortedCategories.forEach(([name, categoryData], index) => {
        const number = (index + 1).toString().padStart(2);
        const toolCount = categoryData.tools.filter(tool => 
            tool.platforms.includes(process.platform)
        ).length;
        
        console.log(`${colorize(number, 'yellow')}. ${categoryData.emoji} ${colorize(name, 'bright')} ${colorize(`(${toolCount} tools)`, 'dim')}`);
        console.log(`    ${colorize(categoryData.description, 'white')}`);
        console.log('');
    });
    
    console.log(`${colorize('99', 'yellow')}. ${colorize('🎯 Quick Setup', 'bright')} ${colorize('(Install essential tools only)', 'dim')}`);
    console.log(`    ${colorize('Install only the most critical tools for immediate productivity', 'white')}`);
    console.log('');
    console.log(`${colorize(' 0', 'yellow')}. ${colorize('🔧 Custom Selection', 'bright')} ${colorize('(Choose individual tools)', 'dim')}`);
    console.log(`    ${colorize('Browse all tools and select exactly what you need', 'white')}`);
    console.log('');
}

function promptUser(question) {
    const rl = createInterface();
    return new Promise((resolve) => {
        rl.question(colorize(question, 'cyan'), (answer) => {
            rl.close();
            resolve(answer.trim());
        });
    });
}

function promptConfirm(question) {
    return promptUser(`${question} ${colorize('(y/N)', 'dim')}: `).then(answer => {
        return answer.toLowerCase().startsWith('y');
    });
}

async function selectCategory() {
    displayCategories();
    
    let choice;
    let isValidChoice = false;
    
    while (!isValidChoice) {
        choice = await promptUser('Select a category (number): ');
        
        if (choice === '0') {
            return 'custom';
        } else if (choice === '99') {
            return 'essential';
        } else {
            const categoryIndex = parseInt(choice) - 1;
            const categories = Object.keys(TOOL_CATEGORIES);
            
            if (categoryIndex >= 0 && categoryIndex < categories.length) {
                return categories[categoryIndex];
            }
        }
        
        console.log(colorize('Invalid selection. Please try again.', 'red'));
    }
}

function displayCategoryTools(categoryName) {
    const categoryData = TOOL_CATEGORIES[categoryName];
    const platformTools = categoryData.tools.filter(tool => 
        tool.platforms.includes(process.platform)
    );
    
    console.log('');
    console.log(colorize(`${categoryData.emoji} ${categoryName} Tools:`, 'bright'));
    console.log(colorize(categoryData.description, 'dim'));
    console.log('');
    
    platformTools.forEach((tool, index) => {
        const number = (index + 1).toString().padStart(2);
        const critical = tool.critical ? colorize(' [CRITICAL]', 'red') : '';
        const size = colorize(`(${tool.size})`, 'dim');
        
        console.log(`${colorize(number, 'yellow')}. ${colorize(tool.displayName, 'bright')}${critical} ${size}`);
        console.log(`    ${colorize(tool.description, 'white')}`);
        console.log('');
    });
}

async function selectToolsFromCategory(categoryName) {
    const categoryData = TOOL_CATEGORIES[categoryName];
    const platformTools = categoryData.tools.filter(tool => 
        tool.platforms.includes(process.platform)
    );
    
    displayCategoryTools(categoryName);
    
    console.log(colorize('Selection options:', 'cyan'));
    console.log(`${colorize('a', 'yellow')} - Install all tools in this category`);
    console.log(`${colorize('c', 'yellow')} - Install only critical tools`);
    console.log(`${colorize('n', 'yellow')} - Select individual tools by number (e.g., 1,3,5)`);
    console.log('');
    
    const choice = await promptUser('Your choice: ');
    
    if (choice.toLowerCase() === 'a') {
        return platformTools;
    } else if (choice.toLowerCase() === 'c') {
        return platformTools.filter(tool => tool.critical);
    } else {
        const numbers = choice.split(',').map(n => parseInt(n.trim()) - 1);
        return numbers
            .filter(n => n >= 0 && n < platformTools.length)
            .map(n => platformTools[n]);
    }
}

async function selectAllTools() {
    const allTools = [];
    
    for (const [categoryName, categoryData] of Object.entries(TOOL_CATEGORIES)) {
        const platformTools = categoryData.tools.filter(tool => 
            tool.platforms.includes(process.platform)
        );
        
        console.log('');
        console.log(colorize(`${categoryData.emoji} ${categoryName}:`, 'bright'));
        
        platformTools.forEach((tool, index) => {
            const number = allTools.length + index + 1;
            const critical = tool.critical ? colorize(' [CRITICAL]', 'red') : '';
            const size = colorize(`(${tool.size})`, 'dim');
            
            console.log(`${colorize(number.toString().padStart(2), 'yellow')}. ${colorize(tool.displayName, 'bright')}${critical} ${size}`);
            console.log(`    ${colorize(tool.description, 'white')}`);
        });
        
        allTools.push(...platformTools);
    }
    
    console.log('');
    console.log(colorize('Selection options:', 'cyan'));
    console.log(`${colorize('a', 'yellow')} - Install all tools`);
    console.log(`${colorize('c', 'yellow')} - Install only critical tools`);
    console.log(`${colorize('n', 'yellow')} - Select tools by number (e.g., 1,3,5-10,15)`);
    console.log('');
    
    const choice = await promptUser('Your choice: ');
    
    if (choice.toLowerCase() === 'a') {
        return allTools;
    } else if (choice.toLowerCase() === 'c') {
        return allTools.filter(tool => tool.critical);
    } else {
        // Parse complex selection (1,3,5-10,15)
        const selectedTools = [];
        const parts = choice.split(',');
        
        for (const part of parts) {
            const trimmed = part.trim();
            if (trimmed.includes('-')) {
                const [start, end] = trimmed.split('-').map(n => parseInt(n));
                for (let i = start; i <= end; i++) {
                    if (i >= 1 && i <= allTools.length) {
                        selectedTools.push(allTools[i - 1]);
                    }
                }
            } else {
                const num = parseInt(trimmed);
                if (num >= 1 && num <= allTools.length) {
                    selectedTools.push(allTools[num - 1]);
                }
            }
        }
        
        return selectedTools;
    }
}

function getEssentialTools() {
    const essentialTools = [];
    
    for (const categoryData of Object.values(TOOL_CATEGORIES)) {
        const criticalTools = categoryData.tools.filter(tool => 
            tool.critical && tool.platforms.includes(process.platform)
        );
        essentialTools.push(...criticalTools);
    }
    
    return essentialTools;
}

async function confirmInstallation(selectedTools) {
    console.log('');
    console.log(colorize('📋 Installation Summary:', 'bright'));
    console.log('');
    
    const categories = {};
    selectedTools.forEach(tool => {
        // Find which category this tool belongs to
        for (const [catName, categoryData] of Object.entries(TOOL_CATEGORIES)) {
            if (categoryData.tools.includes(tool)) {
                if (!categories[catName]) categories[catName] = [];
                categories[catName].push(tool);
                break;
            }
        }
    });
    
    let totalSize = 0;
    Object.entries(categories).forEach(([categoryName, tools]) => {
        const categoryData = TOOL_CATEGORIES[categoryName];
        console.log(colorize(`${categoryData.emoji} ${categoryName}:`, 'cyan'));
        
        tools.forEach(tool => {
            const size = parseFloat(tool.size.replace(/[^\d.]/g, ''));
            totalSize += size;
            const critical = tool.critical ? colorize(' [CRITICAL]', 'red') : '';
            console.log(`   • ${tool.displayName}${critical} ${colorize(`(${tool.size})`, 'dim')}`);
        });
        console.log('');
    });
    
    console.log(colorize(`Total tools: ${selectedTools.length}`, 'bright'));
    console.log(colorize(`Estimated download size: ~${totalSize.toFixed(1)}MB`, 'bright'));
    console.log('');
    
    return await promptConfirm('Proceed with installation?');
}

async function checkIfInstalled(tool) {
    try {
        execSync(tool.verify, { stdio: 'ignore', timeout: 5000 });
        return true;
    } catch (error) {
        return false;
    }
}

async function installTool(tool, index, total) {
    const progress = `[${(index + 1).toString().padStart(2)}/${total}]`;
    
    // Check if already installed
    if (await checkIfInstalled(tool)) {
        log(`${progress} ${tool.displayName} is already installed`, 'yellow');
        STATS.skipped++;
        return { success: true, skipped: true };
    }
    
    log(`${progress} Installing ${tool.displayName}...`, 'blue');
    
    let attempts = 0;
    while (attempts < CONFIG.maxRetries) {
        try {
            const installResult = await new Promise((resolve, reject) => {
                const child = spawn('npm', ['install', '-g', tool.name], {
                    stdio: 'pipe',
                    timeout: CONFIG.timeout
                });
                
                let output = '';
                let errorOutput = '';
                
                child.stdout.on('data', (data) => {
                    output += data.toString();
                });
                
                child.stderr.on('data', (data) => {
                    errorOutput += data.toString();
                });
                
                child.on('close', (code) => {
                    if (code === 0) {
                        resolve({ success: true, output });
                    } else {
                        reject(new Error(`Installation failed with code ${code}: ${errorOutput}`));
                    }
                });
                
                child.on('error', (error) => {
                    reject(error);
                });
                
                // Handle timeout
                setTimeout(() => {
                    if (!child.killed) {
                        child.kill();
                        reject(new Error('Installation timed out'));
                    }
                }, CONFIG.timeout);
            });
            
            // Verify installation
            if (await checkIfInstalled(tool)) {
                log(`${progress} ✅ ${tool.displayName} installed successfully`, 'green');
                STATS.installed++;
                return { success: true };
            } else {
                throw new Error('Installation completed but verification failed');
            }
            
        } catch (error) {
            attempts++;
            if (attempts < CONFIG.maxRetries) {
                log(`${progress} ⚠️ ${tool.displayName} failed, retrying... (${attempts}/${CONFIG.maxRetries})`, 'yellow');
                await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retry
            } else {
                log(`${progress} ❌ ${tool.displayName} failed to install: ${error.message}`, 'red');
                STATS.failed++;
                return { success: false, error: error.message };
            }
        }
    }
}

async function installTools(selectedTools) {
    STATS.selected = selectedTools.length;
    STATS.startTime = Date.now();
    
    console.log('');
    log('🚀 Starting installation process...', 'cyan');
    console.log('');
    
    const results = [];
    
    for (let i = 0; i < selectedTools.length; i++) {
        const tool = selectedTools[i];
        const installResult = await installTool(tool, i, selectedTools.length);
        results.push({ tool, ...installResult });
    }
    
    STATS.endTime = Date.now();
    return results;
}

function displayInstallationResults(results) {
    const duration = ((STATS.endTime - STATS.startTime) / 1000).toFixed(1);
    
    console.log('');
    console.log(colorize('╔════════════════════════════════════════════════════════════════╗', 'cyan'));
    console.log(colorize('║                    Installation Complete!                     ║', 'cyan'));
    console.log(colorize('╚════════════════════════════════════════════════════════════════╝', 'cyan'));
    console.log('');
    
    // Summary statistics
    console.log(colorize('📊 Installation Summary:', 'bright'));
    console.log('');
    console.log(`   Tools selected:      ${STATS.selected}`);
    console.log(colorize(`   ✅ Successfully installed: ${STATS.installed}`, 'green'));
    console.log(colorize(`   ⚠️  Already installed:     ${STATS.skipped}`, 'yellow'));
    console.log(colorize(`   ❌ Failed:                ${STATS.failed}`, 'red'));
    console.log(`   ⏱️  Duration:              ${duration}s`);
    
    const successRate = Math.round(((STATS.installed + STATS.skipped) / STATS.selected) * 100);
    console.log(colorize(`   📈 Success rate:          ${successRate}%`, 'cyan'));
    console.log('');
    
    // Detailed results by status
    const successful = results.filter(r => r.success && !r.skipped);
    const skipped = results.filter(r => r.skipped);
    const failed = results.filter(r => !r.success);
    
    if (successful.length > 0) {
        console.log(colorize('✅ Successfully Installed:', 'green'));
        successful.forEach(r => {
            console.log(`   • ${r.tool.displayName} - ${r.tool.description}`);
        });
        console.log('');
    }
    
    if (skipped.length > 0) {
        console.log(colorize('⚠️  Already Installed:', 'yellow'));
        skipped.forEach(r => {
            console.log(`   • ${r.tool.displayName}`);
        });
        console.log('');
    }
    
    if (failed.length > 0) {
        console.log(colorize('❌ Failed Installations:', 'red'));
        failed.forEach(r => {
            console.log(`   • ${r.tool.displayName} - ${r.error}`);
        });
        console.log('');
        console.log(colorize('💡 You can try installing failed tools manually:', 'yellow'));
        failed.forEach(r => {
            console.log(colorize(`   ${r.tool.command}`, 'dim'));
        });
        console.log('');
    }
}

function displayQuickStartGuide(results) {
    const successful = results.filter(r => r.success);
    
    if (successful.length === 0) {
        return;
    }
    
    console.log(colorize('🎉 Quick Start Guide:', 'bright'));
    console.log('');
    
    // Show examples based on what was installed
    const installedTools = successful.map(r => r.tool.displayName);
    
    if (installedTools.includes('ni')) {
        console.log(colorize('📦 Package Management:', 'cyan'));
        console.log('   ni                    # Install dependencies (auto-detects package manager)');
        console.log('   nr dev                # Run dev script');
        console.log('   nu                    # Update dependencies');
        console.log('');
    }
    
    if (installedTools.includes('serve')) {
        console.log(colorize('🌐 Static File Serving:', 'cyan'));
        console.log('   serve .               # Serve current directory on http://localhost:3000');
        console.log('   serve dist -p 8080    # Serve dist folder on port 8080');
        console.log('');
    }
    
    if (installedTools.includes('nodemon')) {
        console.log(colorize('🔄 Auto-restart Development:', 'cyan'));
        console.log('   nodemon app.js        # Auto-restart on file changes');
        console.log('   nodemon --exec "npm start"  # Auto-restart npm scripts');
        console.log('');
    }
    
    if (installedTools.includes('prettier')) {
        console.log(colorize('🎨 Code Formatting:', 'cyan'));
        console.log('   prettier --write .    # Format all files in current directory');
        console.log('   prettier --check .    # Check if files are formatted');
        console.log('');
    }
    
    if (installedTools.includes('fkill')) {
        console.log(colorize('⚙️  Process Management:', 'cyan'));
        console.log('   fkill                 # Interactive process killer');
        console.log('   fkill :3000           # Kill process on port 3000');
        console.log('');
    }
    
    if (installedTools.includes('json-server')) {
        console.log(colorize('🔧 Mock API:', 'cyan'));
        console.log('   json-server db.json   # Create REST API from JSON file');
        console.log('');
    }
    
    console.log(colorize('📚 Learn More:', 'bright'));
    console.log('   • Documentation: https://github.com/kenzycodex/dev-cli-arsenal');
    console.log('   • Tool verification: node scripts/verify-tools.js');
    console.log('   • Report issues: https://github.com/kenzycodex/dev-cli-arsenal/issues');
    console.log('');
    console.log(colorize('Happy coding! 🚀', 'green'));
    console.log('');
}

async function checkPrerequisites() {
    console.log(colorize('🔍 Checking prerequisites...', 'cyan'));
    console.log('');
    
    // Check Node.js
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
    
    if (majorVersion < 16) {
        console.log(colorize('❌ Node.js 16+ is required', 'red'));
        console.log(colorize(`   Current version: ${nodeVersion}`, 'red'));
        console.log(colorize('   Please update Node.js: https://nodejs.org', 'yellow'));
        return false;
    } else {
        console.log(colorize(`✅ Node.js ${nodeVersion}`, 'green'));
    }
    
    // Check npm
    try {
        const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
        const npmMajor = parseInt(npmVersion.split('.')[0]);
        
        if (npmMajor < 8) {
            console.log(colorize('❌ npm 8+ is required', 'red'));
            console.log(colorize(`   Current version: ${npmVersion}`, 'red'));
            console.log(colorize('   Please update npm: npm install -g npm@latest', 'yellow'));
            return false;
        } else {
            console.log(colorize(`✅ npm v${npmVersion}`, 'green'));
        }
    } catch (error) {
        console.log(colorize('❌ npm not found', 'red'));
        console.log(colorize('   Please install npm: https://nodejs.org', 'yellow'));
        return false;
    }
    
    // Check internet connection
    try {
        execSync('npm ping', { stdio: 'ignore', timeout: 10000 });
        console.log(colorize('✅ npm registry connection', 'green'));
    } catch (error) {
        console.log(colorize('⚠️  npm registry connection issues', 'yellow'));
        console.log(colorize('   Some installations may fail', 'yellow'));
    }
    
    console.log('');
    return true;
}

async function main() {
    try {
        // Initialize log file
        try {
            if (CONFIG.logFile) {
                fs.writeFileSync(CONFIG.logFile, `Interactive Installer Log - ${new Date().toISOString()}\n`);
            }
        } catch (error) {
            console.warn('Warning: Could not initialize log file');
        }
        
        clearScreen();
        printHeader();
        printSystemInfo();
        
        // Check prerequisites
        const prereqsOk = await checkPrerequisites();
        if (!prereqsOk) {
            throw new Error('Prerequisites check failed');
        }
        
        // Main selection flow
        const categoryChoice = await selectCategory();
        let selectedTools = [];
        
        if (categoryChoice === 'essential') {
            selectedTools = getEssentialTools();
            console.log('');
            console.log(colorize('🎯 Essential tools selected for quick setup', 'green'));
        } else if (categoryChoice === 'custom') {
            selectedTools = await selectAllTools();
        } else {
            selectedTools = await selectToolsFromCategory(categoryChoice);
        }
        
        if (selectedTools.length === 0) {
            console.log(colorize('No tools selected. Exiting...', 'yellow'));
            throw new Error('No tools selected');
        }
        
        // Confirm installation
        const confirmed = await confirmInstallation(selectedTools);
        if (!confirmed) {
            console.log(colorize('Installation cancelled by user.', 'yellow'));
            throw new Error('Installation cancelled');
        }
        
        // Install tools
        const results = await installTools(selectedTools);
        
        // Display results
        displayInstallationResults(results);
        displayQuickStartGuide(results);
        
        // Save installation report
        const report = {
            timestamp: new Date().toISOString(),
            platform: process.platform,
            nodeVersion: process.version,
            selectedCategory: categoryChoice,
            stats: STATS,
            results: results.map(r => ({
                tool: r.tool.displayName,
                success: r.success,
                skipped: r.skipped,
                error: r.error
            }))
        };
        
        try {
            const reportFile = path.join(process.cwd(), 'installation-report.json');
            fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
            console.log(colorize(`📄 Installation report saved: ${reportFile}`, 'dim'));
        } catch (error) {
            // Silently continue if report saving fails
        }
        
        // Exit with appropriate code using throw instead of process.exit
        if (STATS.failed > 0) {
            throw new Error('Some installations failed');
        }
        
    } catch (error) {
        console.error('');
        console.error(colorize('❌ Installation failed:', 'red'));
        console.error(colorize(error.message, 'red'));
        console.error('');
        
        if (error.stack) {
            log(`Fatal error: ${error.stack}`, 'red');
        }
        
        throw error;
    }
}

// Handle process signals
process.on('SIGINT', () => {
    console.log('\n\n' + colorize('Installation interrupted by user', 'yellow'));
    process.exitCode = 130;
});

process.on('SIGTERM', () => {
    console.log('\n\n' + colorize('Installation terminated', 'yellow'));
    process.exitCode = 143;
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('\n' + colorize('Uncaught exception:', 'red'));
    console.error(error.stack);
    process.exitCode = 1;
});

process.on('unhandledRejection', (reason) => {
    console.error('\n' + colorize('Unhandled rejection:', 'red'));
    console.error(reason);
    process.exitCode = 1;
});

// Command line help
if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log(`
dev-cli-arsenal Interactive Installer v${CONFIG.version}

Usage: node tool-installer.js [options]

Options:
  --help, -h     Show this help message
  --version, -v  Show version information

This interactive installer helps you select and install CLI tools
based on your development needs. It provides:

• Category-based tool selection
• Essential tools quick setup
• Individual tool selection
• Installation progress tracking
• Verification and error handling
• Quick start guide

For more information: https://github.com/kenzycodex/dev-cli-arsenal
    `);
    process.exitCode = 0;
} else if (process.argv.includes('--version') || process.argv.includes('-v')) {
    console.log(`dev-cli-arsenal interactive installer v${CONFIG.version}`);
    process.exitCode = 0;
} else if (require.main === module) {
    // Run main function if this script is executed directly
    main().catch(error => {
        if (error.message === 'Prerequisites check failed' ||
            error.message === 'No tools selected' ||
            error.message === 'Installation cancelled') {
            // Normal exit for user cancellation or missing prerequisites
            process.exitCode = 0;
        } else {
            console.error('Fatal error:', error.message);
            process.exitCode = 1;
        }
    });
}

// Export for testing
module.exports = {
    TOOL_CATEGORIES,
    CONFIG,
    checkIfInstalled,
    installTool,
    getEssentialTools
};
