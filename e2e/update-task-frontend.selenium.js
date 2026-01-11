
 // Prerequisites:
 // - IEDriverServer.exe in PATH for IE11
 // - MicrosoftWebDriver.exe in PATH for Edge Legacy
 

const { Builder, By, Key, until } = require('selenium-webdriver');
const ie = require('selenium-webdriver/ie');
const edge = require('selenium-webdriver/edge');
const fs = require('fs').promises;
const path = require('path');
const assert = require('assert');

// Configuration
const BASE_URL = 'http://localhost:5050';
const TASKS_FILE = path.join(__dirname, '..', 'utils', 'tasks.json');
const REPORT_DIR = path.join(__dirname, '..', 'selenium-report');
const TIMEOUT = 10000; // 10 seconds

// Mock task for testing
const mockTask = {
    id: 'selenium-test-task',
    title: 'Selenium Test Task',
    description: 'Task for Selenium legacy browser testing',
    status: 'To Do',
    priority: 'Medium',
    dueDate: '2026-01-15',
    imageUrl: null
};

/**
 * Helper: Reset tasks.json with mock data
 */
async function resetTasksFile() {
    await fs.writeFile(TASKS_FILE, JSON.stringify([mockTask], null, 2), 'utf-8');
}

/**
 * Helper: Read tasks from file
 */
async function readTasks() {
    const data = await fs.readFile(TASKS_FILE, 'utf8');
    return JSON.parse(data);
}

/**
 * Helper: Wait for element to be visible
 */
async function waitForElement(driver, selector, timeout = TIMEOUT) {
    const element = await driver.wait(
        until.elementLocated(By.css(selector)),
        timeout
    );
    await driver.wait(until.elementIsVisible(element), timeout);
    return element;
}

/**
 * Helper: Wait for element to be hidden
 */
async function waitForElementHidden(driver, selector, timeout = TIMEOUT) {
    try {
        await driver.wait(async () => {
            const elements = await driver.findElements(By.css(selector));
            if (elements.length === 0) return true;
            const isDisplayed = await elements[0].isDisplayed().catch(() => false);
            return !isDisplayed;
        }, timeout);
    } catch (e) {
        // Element might not exist, which is fine
    }
}

/**
 * Helper: Accept alert if present
 */
async function acceptAlertIfPresent(driver) {
    try {
        await driver.wait(until.alertIsPresent(), 2000);
        const alert = await driver.switchTo().alert();
        const text = await alert.getText();
        await alert.accept();
        return text;
    } catch (e) {
        return null;
    }
}

/**
 * Build driver for specified browser
 */
async function buildDriver(browserName) {
    let driver;
    
    if (browserName === 'ie') {
        // Internet Explorer 11 configuration
        const options = new ie.Options();
        options.introduceFlakinessByIgnoringProtectedModeSettings(true);
        options.ignoreZoomSetting();
        options.requireWindowFocus();
        
        driver = await new Builder()
            .forBrowser('internet explorer')
            .setIeOptions(options)
            .build();
    } else if (browserName === 'edge-legacy') {
        // Edge Legacy (EdgeHTML) configuration
        const options = new edge.Options();
        
        driver = await new Builder()
            .forBrowser('MicrosoftEdge')
            .setEdgeOptions(options)
            .build();
    } else {
        throw new Error(`Unsupported browser: ${browserName}`);
    }
    
    await driver.manage().setTimeouts({ implicit: TIMEOUT });
    await driver.manage().window().maximize();
    
    return driver;
}

/**
 * Test Suite: Critical UPDATE Tests for Legacy Browsers
 */
class LegacyBrowserTests {
    constructor(browserName) {
        this.browserName = browserName;
        this.driver = null;
        this.passed = 0;
        this.failed = 0;
        this.results = [];
    }

    async setup() {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`Setting up ${this.browserName} tests...`);
        console.log(`${'='.repeat(60)}\n`);
        
        await resetTasksFile();
        this.driver = await buildDriver(this.browserName);
    }

    async teardown() {
        if (this.driver) {
            await this.driver.quit();
        }
        await resetTasksFile();
        
        console.log(`\n${'='.repeat(60)}`);
        console.log(`${this.browserName} Results: ${this.passed} passed, ${this.failed} failed`);
        console.log(`${'='.repeat(60)}\n`);
    }

    async runTest(testName, testFn) {
        console.log(`  Running: ${testName}...`);
        try {
            await resetTasksFile();
            await testFn();
            console.log(`    PASSED`);
            this.passed++;
            this.results.push({ name: testName, status: 'passed' });
        } catch (error) {
            console.log(`    FAILED: ${error.message}`);
            this.failed++;
            this.results.push({ name: testName, status: 'failed', error: error.message });
        }
    }

    // ==========================================
    // STARTING FLOW TESTS
    // ==========================================

    async testEditModalOpens() {
        await this.driver.get(BASE_URL);
        await waitForElement(this.driver, '.task-card');

        // Click edit button
        const editBtn = await this.driver.findElement(
            By.css(`button.btn-edit[data-id="${mockTask.id}"]`)
        );
        await editBtn.click();

        // Verify modal is visible
        await waitForElement(this.driver, '#updateTaskModal.show');
        const modal = await this.driver.findElement(By.id('updateTaskModal'));
        const isDisplayed = await modal.isDisplayed();
        
        assert.strictEqual(isDisplayed, true, 'Edit modal should be visible');
    }

    async testFieldsPreFilled() {
        await this.driver.get(BASE_URL);
        await waitForElement(this.driver, '.task-card');

        // Click edit button
        const editBtn = await this.driver.findElement(
            By.css(`button.btn-edit[data-id="${mockTask.id}"]`)
        );
        await editBtn.click();
        await waitForElement(this.driver, '#updateTaskModal.show');

        // Check pre-filled values
        const titleInput = await this.driver.findElement(By.id('updateTaskTitle'));
        const titleValue = await titleInput.getAttribute('value');
        assert.strictEqual(titleValue, mockTask.title, 'Title should be pre-filled');

        const descInput = await this.driver.findElement(By.id('updateTaskDescription'));
        const descValue = await descInput.getAttribute('value');
        assert.strictEqual(descValue, mockTask.description, 'Description should be pre-filled');

        const statusSelect = await this.driver.findElement(By.id('updateTaskStatus'));
        const statusValue = await statusSelect.getAttribute('value');
        assert.strictEqual(statusValue, mockTask.status, 'Status should be pre-filled');
    }

    // ==========================================
    // PRIMARY FLOW TESTS (Success)
    // ==========================================

    async testUpdateTitleSuccessfully() {
        await this.driver.get(BASE_URL);
        await waitForElement(this.driver, '.task-card');

        // Open modal
        const editBtn = await this.driver.findElement(
            By.css(`button.btn-edit[data-id="${mockTask.id}"]`)
        );
        await editBtn.click();
        await waitForElement(this.driver, '#updateTaskModal.show');

        // Update title
        const titleInput = await this.driver.findElement(By.id('updateTaskTitle'));
        await titleInput.clear();
        await titleInput.sendKeys('Updated Title via Selenium');

        // Submit
        const submitBtn = await this.driver.findElement(
            By.css('#updateTaskForm button[type="submit"]')
        );
        await submitBtn.click();

        // Wait for modal to close
        await waitForElementHidden(this.driver, '#updateTaskModal.show');

        // Verify in database
        const tasks = await readTasks();
        const updatedTask = tasks.find(t => t.id === mockTask.id);
        assert.strictEqual(updatedTask.title, 'Updated Title via Selenium', 'Title should be updated in database');
    }

    async testUpdateStatusSuccessfully() {
        await this.driver.get(BASE_URL);
        await waitForElement(this.driver, '.task-card');

        // Open modal
        const editBtn = await this.driver.findElement(
            By.css(`button.btn-edit[data-id="${mockTask.id}"]`)
        );
        await editBtn.click();
        await waitForElement(this.driver, '#updateTaskModal.show');

        // Change status
        const statusSelect = await this.driver.findElement(By.id('updateTaskStatus'));
        await statusSelect.sendKeys('Completed');

        // Submit
        const submitBtn = await this.driver.findElement(
            By.css('#updateTaskForm button[type="submit"]')
        );
        await submitBtn.click();

        // Wait for modal to close
        await waitForElementHidden(this.driver, '#updateTaskModal.show');

        // Verify in database
        const tasks = await readTasks();
        const updatedTask = tasks.find(t => t.id === mockTask.id);
        assert.strictEqual(updatedTask.status, 'Completed', 'Status should be updated in database');
    }

    async testModalClosesAfterUpdate() {
        await this.driver.get(BASE_URL);
        await waitForElement(this.driver, '.task-card');

        // Open modal
        const editBtn = await this.driver.findElement(
            By.css(`button.btn-edit[data-id="${mockTask.id}"]`)
        );
        await editBtn.click();
        await waitForElement(this.driver, '#updateTaskModal.show');

        // Submit without changes
        const submitBtn = await this.driver.findElement(
            By.css('#updateTaskForm button[type="submit"]')
        );
        await submitBtn.click();

        // Verify modal closes
        await waitForElementHidden(this.driver, '#updateTaskModal.show');
        
        const modals = await this.driver.findElements(By.css('#updateTaskModal.show'));
        assert.strictEqual(modals.length, 0, 'Modal should be closed after update');
    }

    // ==========================================
    // ERROR FLOW 1 TESTS (Invalid Input)
    // ==========================================

    async testAlertOnEmptyTitle() {
        await this.driver.get(BASE_URL);
        await waitForElement(this.driver, '.task-card');

        // Open modal
        const editBtn = await this.driver.findElement(
            By.css(`button.btn-edit[data-id="${mockTask.id}"]`)
        );
        await editBtn.click();
        await waitForElement(this.driver, '#updateTaskModal.show');

        // Clear title
        const titleInput = await this.driver.findElement(By.id('updateTaskTitle'));
        await titleInput.clear();

        // Submit
        const submitBtn = await this.driver.findElement(
            By.css('#updateTaskForm button[type="submit"]')
        );
        await submitBtn.click();

        // Check for alert
        const alertText = await acceptAlertIfPresent(this.driver);
        assert.ok(alertText !== null, 'Alert should be displayed for empty title');
        assert.ok(alertText.toLowerCase().includes('title'), 'Alert should mention title');
    }

    // ==========================================
    // ERROR FLOW 2 TESTS (Cancelled)
    // ==========================================

    async testModalClosesOnCancel() {
        await this.driver.get(BASE_URL);
        await waitForElement(this.driver, '.task-card');

        // Open modal
        const editBtn = await this.driver.findElement(
            By.css(`button.btn-edit[data-id="${mockTask.id}"]`)
        );
        await editBtn.click();
        await waitForElement(this.driver, '#updateTaskModal.show');

        // Click cancel
        const cancelBtn = await this.driver.findElement(By.id('cancelUpdateBtn'));
        await cancelBtn.click();

        // Verify modal closes
        await waitForElementHidden(this.driver, '#updateTaskModal.show');
        
        const modals = await this.driver.findElements(By.css('#updateTaskModal.show'));
        assert.strictEqual(modals.length, 0, 'Modal should be closed after cancel');
    }

    async testNoChangesOnCancel() {
        await this.driver.get(BASE_URL);
        await waitForElement(this.driver, '.task-card');

        // Open modal
        const editBtn = await this.driver.findElement(
            By.css(`button.btn-edit[data-id="${mockTask.id}"]`)
        );
        await editBtn.click();
        await waitForElement(this.driver, '#updateTaskModal.show');

        // Make changes
        const titleInput = await this.driver.findElement(By.id('updateTaskTitle'));
        await titleInput.clear();
        await titleInput.sendKeys('Changed But Cancelled');

        // Cancel
        const cancelBtn = await this.driver.findElement(By.id('cancelUpdateBtn'));
        await cancelBtn.click();

        // Verify database unchanged
        const tasks = await readTasks();
        const task = tasks.find(t => t.id === mockTask.id);
        assert.strictEqual(task.title, mockTask.title, 'Title should not change after cancel');
    }

    async testModalClosesOnEscape() {
        await this.driver.get(BASE_URL);
        await waitForElement(this.driver, '.task-card');

        // Open modal
        const editBtn = await this.driver.findElement(
            By.css(`button.btn-edit[data-id="${mockTask.id}"]`)
        );
        await editBtn.click();
        await waitForElement(this.driver, '#updateTaskModal.show');

        // Press Escape
        await this.driver.findElement(By.css('body')).sendKeys(Key.ESCAPE);

        // Verify modal closes
        await waitForElementHidden(this.driver, '#updateTaskModal.show');
    }

    // ==========================================
    // ERROR FLOW 3 TESTS (Task Not Found)
    // ==========================================

    async testAlertOnTaskNotFound() {
        await this.driver.get(BASE_URL);
        await waitForElement(this.driver, '.task-card');

        // Open modal
        const editBtn = await this.driver.findElement(
            By.css(`button.btn-edit[data-id="${mockTask.id}"]`)
        );
        await editBtn.click();
        await waitForElement(this.driver, '#updateTaskModal.show');

        // Delete task from file while modal is open
        await fs.writeFile(TASKS_FILE, '[]', 'utf-8');

        // Try to submit
        const submitBtn = await this.driver.findElement(
            By.css('#updateTaskForm button[type="submit"]')
        );
        await submitBtn.click();

        // Check for alert
        const alertText = await acceptAlertIfPresent(this.driver);
        assert.ok(alertText !== null, 'Alert should be displayed when task not found');
    }

    // ==========================================
    // UI/UX TESTS
    // ==========================================

    async testEditButtonVisible() {
        await this.driver.get(BASE_URL);
        await waitForElement(this.driver, '.task-card');

        const editBtn = await this.driver.findElement(
            By.css(`button.btn-edit[data-id="${mockTask.id}"]`)
        );
        const isDisplayed = await editBtn.isDisplayed();
        
        assert.strictEqual(isDisplayed, true, 'Edit button should be visible on task card');
    }

    async testModalHasCorrectTitle() {
        await this.driver.get(BASE_URL);
        await waitForElement(this.driver, '.task-card');

        // Open modal
        const editBtn = await this.driver.findElement(
            By.css(`button.btn-edit[data-id="${mockTask.id}"]`)
        );
        await editBtn.click();
        await waitForElement(this.driver, '#updateTaskModal.show');

        const modalTitle = await this.driver.findElement(By.css('#updateTaskModal .modal-title'));
        const titleText = await modalTitle.getText();
        
        assert.ok(titleText.toLowerCase().includes('edit') || titleText.toLowerCase().includes('update'), 
            'Modal title should indicate editing');
    }

    // ==========================================
    // RUN ALL TESTS
    // ==========================================

    async runAllTests() {
        await this.setup();

        try {
            // Starting Flow
            await this.runTest('Edit modal opens on button click', () => this.testEditModalOpens());
            await this.runTest('Fields are pre-filled with task data', () => this.testFieldsPreFilled());

            // Primary Flow (Success)
            await this.runTest('Update title successfully', () => this.testUpdateTitleSuccessfully());
            await this.runTest('Update status successfully', () => this.testUpdateStatusSuccessfully());
            await this.runTest('Modal closes after successful update', () => this.testModalClosesAfterUpdate());

            // Error Flow 1 (Invalid Input)
            await this.runTest('Alert shown on empty title', () => this.testAlertOnEmptyTitle());

            // Error Flow 2 (Cancelled)
            await this.runTest('Modal closes on cancel', () => this.testModalClosesOnCancel());
            await this.runTest('No changes applied on cancel', () => this.testNoChangesOnCancel());
            await this.runTest('Modal closes on Escape key', () => this.testModalClosesOnEscape());

            // Error Flow 3 (Task Not Found)
            await this.runTest('Alert shown when task not found', () => this.testAlertOnTaskNotFound());

            // UI/UX
            await this.runTest('Edit button is visible', () => this.testEditButtonVisible());
            await this.runTest('Modal has correct title', () => this.testModalHasCorrectTitle());

        } finally {
            await this.teardown();
        }

        return {
            browser: this.browserName,
            passed: this.passed,
            failed: this.failed,
            results: this.results
        };
    }
}

/**
 * Generate HTML report
 */
async function generateHtmlReport(results, totalPassed, totalFailed) {
    const timestamp = new Date().toISOString();
    
    let browserSections = '';
    for (const result of results) {
        if (result.error) {
            browserSections += `
            <div class="browser-section error">
                <h2>${result.browser}</h2>
                <p class="error-msg">ERROR: ${result.error}</p>
            </div>`;
        } else {
            let testRows = '';
            for (const test of result.results) {
                const statusClass = test.status === 'passed' ? 'pass' : 'fail';
                const errorInfo = test.error ? `<br><small class="error-detail">${test.error}</small>` : '';
                testRows += `
                    <tr class="${statusClass}">
                        <td>${test.name}</td>
                        <td class="status">${test.status.toUpperCase()}</td>
                        <td>${errorInfo}</td>
                    </tr>`;
            }
            browserSections += `
            <div class="browser-section">
                <h2>${result.browser}</h2>
                <p class="summary">${result.passed} passed, ${result.failed} failed</p>
                <table>
                    <thead>
                        <tr>
                            <th>Test Name</th>
                            <th>Status</th>
                            <th>Error</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${testRows}
                    </tbody>
                </table>
            </div>`;
        }
    }

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Selenium Legacy Browser Test Report</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; padding: 20px; }
        .container { max-width: 1200px; margin: 0 auto; }
        h1 { color: #333; margin-bottom: 10px; }
        .timestamp { color: #666; margin-bottom: 20px; }
        .total-summary { background: #fff; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .total-summary h2 { margin-bottom: 10px; }
        .total-summary .passed { color: #22c55e; font-size: 24px; font-weight: bold; }
        .total-summary .failed { color: #ef4444; font-size: 24px; font-weight: bold; }
        .browser-section { background: #fff; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .browser-section h2 { color: #333; margin-bottom: 10px; text-transform: uppercase; }
        .browser-section.error { border-left: 4px solid #ef4444; }
        .error-msg { color: #ef4444; }
        .summary { color: #666; margin-bottom: 15px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }
        th { background: #f9f9f9; font-weight: 600; }
        tr.pass td.status { color: #22c55e; font-weight: bold; }
        tr.fail td.status { color: #ef4444; font-weight: bold; }
        tr.fail { background: #fef2f2; }
        .error-detail { color: #ef4444; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Selenium Legacy Browser Test Report</h1>
        <p class="timestamp">Generated: ${timestamp}</p>
        
        <div class="total-summary">
            <h2>Total Results</h2>
            <p><span class="passed">${totalPassed} PASSED</span> | <span class="failed">${totalFailed} FAILED</span></p>
        </div>
        
        ${browserSections}
    </div>
</body>
</html>`;

    return html;
}

/**
 * Save reports to files
 */
async function saveReports(results, totalPassed, totalFailed) {
    // Create report directory
    try {
        await fs.mkdir(REPORT_DIR, { recursive: true });
    } catch (e) {
        // Directory may already exist
    }

    const timestamp = new Date().toISOString();

    // Save JSON report
    const jsonReport = {
        timestamp,
        summary: {
            totalPassed,
            totalFailed,
            totalTests: totalPassed + totalFailed
        },
        browsers: results
    };
    await fs.writeFile(
        path.join(REPORT_DIR, 'results.json'),
        JSON.stringify(jsonReport, null, 2),
        'utf-8'
    );

    // Save HTML report
    const htmlReport = await generateHtmlReport(results, totalPassed, totalFailed);
    await fs.writeFile(
        path.join(REPORT_DIR, 'index.html'),
        htmlReport,
        'utf-8'
    );

    // Save log file
    let logContent = `Selenium Legacy Browser Tests - ${timestamp}\n`;
    logContent += '='.repeat(60) + '\n\n';
    
    for (const result of results) {
        logContent += `Browser: ${result.browser}\n`;
        if (result.error) {
            logContent += `  ERROR: ${result.error}\n`;
        } else {
            logContent += `  Passed: ${result.passed}, Failed: ${result.failed}\n`;
            for (const test of result.results) {
                logContent += `    [${test.status.toUpperCase()}] ${test.name}`;
                if (test.error) {
                    logContent += ` - ${test.error}`;
                }
                logContent += '\n';
            }
        }
        logContent += '\n';
    }
    
    logContent += '='.repeat(60) + '\n';
    logContent += `TOTAL: ${totalPassed} passed, ${totalFailed} failed\n`;
    
    await fs.writeFile(
        path.join(REPORT_DIR, 'test-run.log'),
        logContent,
        'utf-8'
    );

    console.log('\n  Reports saved to:');
    console.log(`    HTML: selenium-report/index.html`);
    console.log(`    JSON: selenium-report/results.json`);
    console.log(`    Log:  selenium-report/test-run.log`);
}

/**
 * Main: Run tests on all legacy browsers
 */
async function runLegacyBrowserTests() {
    console.log('\n');
    console.log('='.repeat(60));
    console.log('  SELENIUM LEGACY BROWSER TESTS');
    console.log('  Testing UPDATE Feature on IE11 and Edge Legacy');
    console.log('='.repeat(60));
    console.log('\n');

    const browsers = [];
    const results = [];

    // Check which browsers to run
    const args = process.argv.slice(2);
    
    if (args.includes('--ie') || args.includes('--all') || args.length === 0) {
        browsers.push('ie');
    }
    if (args.includes('--edge') || args.includes('--all') || args.length === 0) {
        browsers.push('edge-legacy');
    }

    // Run tests for each browser
    for (const browser of browsers) {
        try {
            const tester = new LegacyBrowserTests(browser);
            const result = await tester.runAllTests();
            results.push(result);
        } catch (error) {
            console.error(`\nFailed to run tests on ${browser}: ${error.message}`);
            console.error('Make sure the browser driver is installed and in PATH.');
            console.error('For IE11: Download IEDriverServer from https://www.selenium.dev/downloads/');
            console.error('For Edge Legacy: Download MicrosoftWebDriver from Microsoft.\n');
            results.push({
                browser,
                passed: 0,
                failed: 0,
                error: error.message
            });
        }
    }

    // Print summary
    console.log('\n');
    console.log('='.repeat(60));
    console.log('  FINAL SUMMARY');
    console.log('='.repeat(60));
    
    let totalPassed = 0;
    let totalFailed = 0;
    
    for (const result of results) {
        if (result.error) {
            console.log(`  ${result.browser}: ERROR - ${result.error}`);
        } else {
            console.log(`  ${result.browser}: ${result.passed} passed, ${result.failed} failed`);
            totalPassed += result.passed;
            totalFailed += result.failed;
        }
    }
    
    console.log('-'.repeat(60));
    console.log(`  TOTAL: ${totalPassed} passed, ${totalFailed} failed`);
    console.log('='.repeat(60));

    // Save reports
    await saveReports(results, totalPassed, totalFailed);

    console.log('\n');

    // Exit with appropriate code
    process.exit(totalFailed > 0 ? 1 : 0);
}

// Run if executed directly
if (require.main === module) {
    runLegacyBrowserTests().catch(console.error);
}

module.exports = { LegacyBrowserTests, runLegacyBrowserTests };
