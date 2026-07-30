const { chromium } = require('playwright');

(async () => {
	const browser = await chromium.launch({ args: ['--no-sandbox'] });
	const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
	const errors = [];
	page.on('console', (msg) => {
		if (msg.type() === 'error') errors.push(msg.text());
	});
	page.on('pageerror', (err) => errors.push(String(err)));

	await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
	await page.waitForTimeout(1000);
	console.log('ERRORS:', JSON.stringify(errors));

	await page.screenshot({
		path: '/private/tmp/claude-501/-Users-imlargo-Unergy-hackaton-stww/2b5a2da8-a386-4095-8e9c-a2d3a354e6b9/scratchpad/sidebar-crop.png',
		clip: { x: 0, y: 0, width: 260, height: 80 }
	});
	await page.screenshot({
		path: '/private/tmp/claude-501/-Users-imlargo-Unergy-hackaton-stww/2b5a2da8-a386-4095-8e9c-a2d3a354e6b9/scratchpad/home-dark.png'
	});

	await browser.close();
})();
