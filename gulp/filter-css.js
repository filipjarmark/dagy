const through = require('through2');
const cheerio = require('cheerio');
const postcss = require('postcss');
const PluginError = require('gulp-util').PluginError;

const PLUGIN_NAME = 'filter-css';

const pseudoSelectors = [
	'before',
	'after',
	'active',
	'any',
	'checked',
	'default',
	'dir()',
	'disabled',
	'empty',
	'enabled',
	'first-child',
	'first-of-type',
	'first',
	'fullscreen',
	'focus',
	'hover',
	'indeterminate',
	'in-range',
	'invalid',
	'lang()',
	'last-child',
	'last-of-type',
	'left',
	'link',
	'not()',
	'nth-child()',
	'nth-last-child()',
	'nth-last-of-type()',
	'nth-of-type()',
	'only-child',
	'only-of-type',
	'optional',
	'out-of-range',
	'read-only',
	'read-write',
	'required',
	'right',
	'root',
	'scope',
	'target',
	'valid',
	'visited'
].map(s => s.replace('()', '\\(([^)]*)\\)'));



const filterSelectors = postcss.plugin(PLUGIN_NAME, ({ $, whitelist = [] } = {}) => {
	const pseudos = new RegExp(':(' + pseudoSelectors.join('|') + ')', 'gi');

	return function (root) {
		root.walkRules(rule => {
			if (rule.parent.type === 'atrule') return;

			const selector = rule.selector.replace(pseudos, '');
			if (whitelist.includes(selector)) return;

			if ($(selector).length === 0)
				rule.remove();
		});
	};
});


function parseHTML(str, { whitelist = [] } = {}) {
	const $ = cheerio.load(str);

	$('style').each((i, e) => {
		const style = $(e);

		const filtered = postcss([
			filterSelectors({ $, whitelist })
		]).process(style.text()).css;

		style.text(filtered);
	});

	combineStyleTags($);

	return $.html();
}


function combineStyleTags($) {
	const styles = Array.from($('style'));

	if (styles.length <= 1) return;

	const firstStyle = $(styles.shift());
	styles.forEach(el => {
		const style = $(el);
		firstStyle.text(firstStyle.text() + style.text());
		style.remove();
	});
}


function filterCSS({ whitelist = [] } = {}) {
	return through.obj((file, encoding, callback) => {
		if (file.isNull())
			return callback(null, file);

		if (file.isStream()) {
			this.emit('error', new PluginError(PLUGIN_NAME, 'Streams not supported!'));
		} else if (file.isBuffer()) {
			const str = file.contents.toString();
			file.contents = new Buffer(parseHTML(str, { whitelist }));

			return callback(null, file);
		}
	});
}


module.exports = filterCSS;
