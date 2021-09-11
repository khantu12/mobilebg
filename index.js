const fs = require('fs');
const cheerio = require('cheerio');
const got = require('got');
const md5 = require('md5');

console.log('Checking...');

(async () => {
	const { body } = await got('https://www.mobile.bg/pcgi/mobile.cgi?act=3&slink=lgh8np&f1=1');
	const $ = cheerio.load(body);

	const currentData = {};
	$('a.mmm').each((i, el) => {
		const href = $(el).attr('href');
		const text = $(el).text();
		const hash = md5(href + text);
		currentData[hash] = { text, href };
	});

	const previousData = JSON.parse(fs.readFileSync('data.json'));

	let isThereNew = false;

	for (const [key, { text, href }] of Object.entries(currentData)) {
		if (!previousData.includes(key)) {
			console.log(text + ' =>  https:' + href);
			isThereNew = true;
		}
	}

	if (!isThereNew) {
		console.log('No new posts.');
	}

	fs.writeFileSync('data.json', JSON.stringify(Object.keys(currentData)));
})()