// With Playwright available: node scripts/check-scroll.mjs http://localhost:5173
// PLAYWRIGHT_MODULE and CHROMIUM_PATH can reuse an existing browser installation.
import assert from 'node:assert/strict';

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({
	headless: true,
	executablePath: process.env.CHROMIUM_PATH || undefined
});
const url = process.argv[2] || 'http://localhost:5173';
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
const settle = () => page.waitForTimeout(250);
const contentState = () =>
	page.evaluate(() => ({
		y: window.scrollY,
		sectionY: document.querySelector('section article').closest('section').getBoundingClientRect()
			.top,
		contentY: new DOMMatrix(getComputedStyle(document.querySelector('#smooth-content')).transform)
			.m42,
		trackX: new DOMMatrix(
			getComputedStyle(document.querySelector('section article').parentElement).transform
		).m41
	}));
const position = () => page.evaluate(() => window.scrollY);
const headerHeight = () => page.locator('.hero-shell').evaluate((el) => el.clientHeight);
const waitForHeader = (height) =>
	page.waitForFunction(
		(expected) => document.querySelector('.hero-shell')?.clientHeight === expected,
		height
	);
const scrollTo = async (y) => {
	await page.evaluate((top) => window.scrollTo(0, top), y);
	await settle();
};

try {
	await page.goto(url);
	await page.locator('.hero-shell').waitFor();
	await page.waitForFunction(() => !!document.querySelector('#smooth-wrapper')?.style.position);
	await page.evaluate(() => document.fonts.ready);
	await page.waitForTimeout(900);
	assert.equal(await headerHeight(), 876);
	const initialContent = await contentState();
	await page.mouse.move(720, 450);
	await page.mouse.wheel(320, 300);
	await page.waitForFunction(() => {
		const height = document.querySelector('.hero-shell').clientHeight;
		return height > 80 && height < 874;
	});
	assert.deepEqual(
		await contentState(),
		initialContent,
		'Starting the hero must not move content or its scroll timeline'
	);

	// Generate the tail in the page so automation round trips cannot turn it into
	// separate gestures. The real wheel events before/after verify native scrolling.
	const capturedTail = await page.evaluate(
		() =>
			new Promise((resolve) => {
				const captured = [];
				const timer = setInterval(() => {
					const event = new WheelEvent('wheel', { deltaY: 40, cancelable: true });
					window.dispatchEvent(event);
					captured.push({
						blocked: event.defaultPrevented,
						height: document.querySelector('.hero-shell').getBoundingClientRect().height
					});
					if (captured.length === 28) {
						clearInterval(timer);
						resolve(captured);
					}
				}, 50);
			})
	);
	assert.ok(capturedTail[0].blocked, 'Input stays with the hero during the main morph');
	assert.ok(
		capturedTail.some(({ blocked, height }) => !blocked && height < 88 && height > 80),
		'The visible pill must release scrolling during its final settling motion'
	);
	assert.equal(
		capturedTail.at(-1).blocked,
		false,
		'Continued wheel input must be released when the morph finishes, without an idle gap'
	);

	await waitForHeader(80);
	await page.waitForTimeout(300);
	assert.deepEqual(
		await contentState(),
		initialContent,
		'The content still starts at zero after the morph'
	);
	assert.equal(await headerHeight(), 80, 'The completed hero stays collapsed at scroll zero');

	// Small input exposes a vertical lead-in that a large wheel event can skip over.
	await page.mouse.wheel(0, 12);
	await page.waitForFunction(() => window.scrollY === 12);
	await page.waitForTimeout(250);
	const firstContentScroll = await contentState();
	assert.ok(
		firstContentScroll.trackX < initialContent.trackX - 1,
		'The first small scroll after the morph must move the cards horizontally'
	);
	assert.ok(
		Math.abs(firstContentScroll.sectionY - initialContent.sectionY) < 1,
		'The horizontal section must hold its vertical position from the first scroll'
	);
	await page.mouse.wheel(0, 288);
	await page.waitForFunction(() => window.scrollY === 300);
	await page.waitForTimeout(100);
	const scrollingContent = await contentState();
	assert.ok(
		scrollingContent.contentY < 0 && scrollingContent.contentY > -300,
		'The next gesture uses smooth scrolling'
	);
	await page.waitForFunction(() => {
		const contentY = new DOMMatrix(
			getComputedStyle(document.querySelector('#smooth-content')).transform
		).m42;
		return Math.abs(contentY + 300) < 2;
	});
	const trackAtScrollEnd = (await contentState()).trackX;
	await page.waitForTimeout(300);
	assert.ok(
		Math.abs((await contentState()).trackX - trackAtScrollEnd) < 3,
		'The horizontal section must settle with the page, without a second smoothing tail'
	);
	assert.ok(
		(await contentState()).trackX < initialContent.trackX,
		'Scroll-driven content advances after the handoff'
	);
	await page.mouse.wheel(0, -120);
	await settle();
	assert.equal(await position(), 180, 'Upward scrolling must not snap to the hero');
	assert.ok(
		(await contentState()).trackX > trackAtScrollEnd,
		'The horizontal section must respond to upward scrolling before its end'
	);
	assert.equal(await headerHeight(), 80);
	await page.mouse.wheel(0, -180);
	await page.waitForFunction(() => window.scrollY === 0);
	await page.waitForFunction(() => document.querySelector('.hero-shell').clientHeight > 82, null, {
		timeout: 350
	});
	await waitForHeader(876);
	assert.equal(await position(), 0);

	// Reverse within one wheel stream; the previous gesture lock ignored this input.
	await page.mouse.wheel(0, 80);
	await page.waitForFunction(() => document.querySelector('.hero-shell').clientHeight < 700);
	await page.mouse.wheel(0, 40);
	await page.mouse.wheel(0, -80);
	await waitForHeader(876);
	assert.equal(await position(), 0, 'Reversing the morph must not scroll the content');
	await page.waitForTimeout(200);
	for (let i = 0; i < 8; i++) {
		await page.mouse.wheel(0, 40);
		await page.waitForTimeout(230);
	}
	assert.equal(await headerHeight(), 80);
	assert.ok((await position()) > 0, 'Repeated wheel ticks must not keep restarting the morph');
	await page.keyboard.press('Home');
	await waitForHeader(876);

	// Key repeat is blocked during the morph, then continues into content scrolling.
	await page.keyboard.down('PageDown');
	await page.setViewportSize({ width: 1280, height: 800 });
	await page.keyboard.down('PageDown');
	assert.equal(await position(), 0, 'Key repeat must not scroll behind the active morph');
	await waitForHeader(80);
	await page.setViewportSize({ width: 1440, height: 900 });
	await settle();
	await page.keyboard.down('PageDown');
	await page.waitForFunction(() => window.scrollY > 0);
	await page.keyboard.up('PageDown');
	assert.equal(await headerHeight(), 80);
	await page.keyboard.press('Home');
	await waitForHeader(876);
	assert.equal(await position(), 0);

	await scrollTo(1200);
	await waitForHeader(80);
	assert.equal(await headerHeight(), 80);
	await page.evaluate(() => {
		const link = document.createElement('a');
		link.href = '/about';
		link.textContent = 'Scroll regression navigation';
		document.body.append(link);
		link.click();
	});
	await page.waitForURL('**/about');
	await settle();
	assert.equal(await position(), 0, 'New routes start at the top');
	assert.equal(await headerHeight(), 80);
	await page.goBack();
	await settle();
	assert.equal(await position(), 1200, 'Back restores the previous scroll position');
	await page.reload();
	await page.waitForFunction(() => !!document.querySelector('#smooth-wrapper')?.style.position);
	await settle();
	assert.equal(await position(), 1200, 'Reload preserves the restored position');
	assert.equal(await headerHeight(), 80);

	await page.setViewportSize({ width: 1280, height: 800 });
	await scrollTo(0);
	await waitForHeader(776);
	assert.equal(await headerHeight(), 776, 'Resize rebuilds the expanded hero');
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await scrollTo(200);
	assert.equal(await headerHeight(), 80, 'Reduced motion skips the timed morph');

	await page.setViewportSize({ width: 390, height: 844 });
	await scrollTo(0);
	assert.equal(await page.locator('.mobile-hero-section').count(), 1);
	await scrollTo(900);
	assert.equal((await page.locator('.mobile-pill-anchor').boundingBox()).y, 12);
	assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), 390);
	const touchPage = await browser.newPage({
		viewport: { width: 1024, height: 900 },
		isMobile: true,
		hasTouch: true
	});
	touchPage.on('pageerror', (error) => errors.push(error.message));
	await touchPage.goto(url);
	await touchPage.waitForFunction(
		() => !!document.querySelector('#smooth-wrapper')?.style.position
	);
	await touchPage.waitForTimeout(900);
	const touch = await touchPage.context().newCDPSession(touchPage);
	const sendTouch = (type, y) =>
		touch.send('Input.dispatchTouchEvent', {
			type,
			touchPoints: y === undefined ? [] : [{ x: 512, y, id: 1 }]
		});
	await sendTouch('touchStart', 650);
	await sendTouch('touchMove', 550);
	await sendTouch('touchMove', 450);
	assert.equal(
		await touchPage.evaluate(() => window.scrollY),
		0,
		'Touch must not scroll the content during the morph'
	);
	await touchPage.waitForFunction(() => document.querySelector('.hero-shell').clientHeight === 80);
	await touchPage.waitForTimeout(150);
	await sendTouch('touchMove', 250);
	await touchPage.waitForFunction(() => window.scrollY > 0, null, { timeout: 500 });
	await sendTouch('touchEnd');
	await sendTouch('touchStart', 650);
	await sendTouch('touchMove', 500);
	await sendTouch('touchMove', 350);
	await sendTouch('touchEnd');
	await touchPage.waitForFunction(() => window.scrollY > 0);
	await touchPage.close();
	assert.deepEqual(errors, [], 'No browser runtime errors');
	console.log(
		'Scroll checks passed: stationary content during main morph, early handoff, horizontal movement from first input, return, reversal, smoothing, touch, keyboard, navigation, resize'
	);
} finally {
	await browser.close();
}
