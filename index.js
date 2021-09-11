const fs = require('fs');
const cheerio = require('cheerio');
const got = require('got');
const md5 = require('md5');

console.log('Checking...');

(async () => {
	// Get the HTML from the link.
	const { body } = await got('https://www.mobile.bg/pcgi/mobile.cgi?act=3&slink=lgh8np&f1=1');

	// Load the HTML body into cheerio.
	const $ = cheerio.load(body);

	// Go through each of the posts.
	// Get the href and the text.
	// Create a hash from the combination of both.
	// Save in map with key being the hash and the value being the text and the href.
	const currentData = {};
	$('a.mmm').each((i, el) => {
		const href = $(el).attr('href');
		const text = $(el).text();
		const hash = md5(href + text);
		currentData[hash] = { text, href };
	});

	// Get the previously saved data.
	const previousData = JSON.parse(fs.readFileSync('data.json'));

	// Write the current data into the file.
	fs.writeFileSync('data.json', JSON.stringify(Object.keys(currentData)));

	let isThereNew = false;

	// Iterate through the current data and check if there is a
	// record that is not present in the previous data.
	// Show the one that is missis (is new).
	for (const [key, { text, href }] of Object.entries(currentData)) {
		if (!previousData.includes(key)) {
			console.log(text + ' =>  https:' + href);
			isThereNew = true;
		}
	}

	// If there are no new posts, show a message.
	if (!isThereNew) {
		console.log('No new posts.');
	}
})()