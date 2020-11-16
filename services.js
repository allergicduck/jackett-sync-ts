const axios = require("axios");
const parser = require("fast-xml-parser");

const parseOpts = {
	attributeNamePrefix: "",
	ignoreAttributes: false,
	// parseTrueNumberOnly: false
}

const indexerRegex = /.*\/api\/v2.0\/indexers\/(?<id>.*)\/results\/torznab\//;

function serviceParams(program, service) {
	const params = []

	service.params.forEach(el => {
		params.push(program[el]);
	});

	return params;
}

// Indexer schema
const schema = {
	id: '',
	appId: 0,
	title: '',
	protocol: '',
	categories: [5000],
	seeds: 1,
	url: '',
	key: ''
}

function deepCompare() {
	var i, l, leftChain, rightChain;

	function compare2Objects(x, y) {
		var p;

		// remember that NaN === NaN returns false
		// and isNaN(undefined) returns true
		if (isNaN(x) && isNaN(y) && typeof x === 'number' && typeof y === 'number') {
			return true;
		}

		// Compare primitives and functions.     
		// Check if both arguments link to the same object.
		// Especially useful on the step where we compare prototypes
		if (x === y) {
			return true;
		}

		// Works in case when functions are created in constructor.
		// Comparing dates is a common scenario. Another built-ins?
		// We can even handle functions passed across iframes
		if ((typeof x === 'function' && typeof y === 'function') ||
			(x instanceof Date && y instanceof Date) ||
			(x instanceof RegExp && y instanceof RegExp) ||
			(x instanceof String && y instanceof String) ||
			(x instanceof Number && y instanceof Number)) {
			return x.toString() === y.toString();
		}

		// At last checking prototypes as good as we can
		if (!(x instanceof Object && y instanceof Object)) {
			return false;
		}

		if (x.isPrototypeOf(y) || y.isPrototypeOf(x)) {
			return false;
		}

		if (x.constructor !== y.constructor) {
			return false;
		}

		if (x.prototype !== y.prototype) {
			return false;
		}

		// Check for infinitive linking loops
		if (leftChain.indexOf(x) > -1 || rightChain.indexOf(y) > -1) {
			return false;
		}

		// Quick checking of one object being a subset of another.
		// todo: cache the structure of arguments[0] for performance
		for (p in y) {
			if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
				return false;
			}
			else if (typeof y[p] !== typeof x[p]) {
				return false;
			}
		}

		for (p in x) {
			if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
				return false;
			}
			else if (typeof y[p] !== typeof x[p]) {
				return false;
			}

			switch (typeof (x[p])) {
				case 'object':
				case 'function':

					leftChain.push(x);
					rightChain.push(y);

					if (!compare2Objects(x[p], y[p])) {
						return false;
					}

					leftChain.pop();
					rightChain.pop();
					break;

				default:
					if (x[p] !== y[p]) {
						return false;
					}
					break;
			}
		}

		return true;
	}

	if (arguments.length < 1) {
		return true; //Die silently? Don't know how to handle such case, please help...
		// throw "Need two or more arguments to compare";
	}

	for (i = 1, l = arguments.length; i < l; i++) {

		leftChain = []; //Todo: this can be cached
		rightChain = [];

		if (!compare2Objects(arguments[0], arguments[i])) {
			return false;
		}
	}

	return true;
}

module.exports = {
	jackett: {
		source: true,
		params: ['url', 'apikey', 'alturl'],
		defaults: ['', ''],
		get: async (url, apikey, alturl) => {
			const jackettIndexers = `${url}/api/v2.0/indexers/all/results/torznab/api?apikey=${apikey}&t=indexers&configured=true`;

			const response = await axios.get(jackettIndexers);
			// console.log(parser.parse(response.data, parseOpts).indexers.indexer[0].caps.categories.category)

			const parsedXML = parser.parse(response.data, parseOpts);

			if (parsedXML.error) {
				throw new Error("Jackett: " + parsedXML.error.description);
			}

			const indexers = parsedXML.indexers.indexer;

			for (const i in indexers) {
				const entry = indexers[i];

				let category = entry.caps.categories.category;

				if (!category.map)
					category = [category];

				const obj = Object.assign({}, schema, {
					id: entry.id,
					title: entry.title,
					protocol: "torrent",
					categories: category.map(cat => parseInt(cat.id)),
					url: `${alturl || url}/api/v2.0/indexers/${entry.id}/results/torznab/`,
					key: apikey,
				});

				indexers[i] = obj
			}

			// console.log(indexers)


			return indexers;
		}
	},
	sonarr: {
		params: ['sonarrurl', 'sonarrkey', 'sonarrcats', 'seeds'],
		required: ['sonarrurl', 'sonarrkey'],
		defaults: ['', '', '5000,5030,5040', 1],
		process: [undefined, undefined, (val) => val.split(',').map(el => parseInt(el)), e=>parseInt(e)],
		get: async (url, key, cats) => {
			const reqUrl = `${url}/api/v3/indexer?apikey=${key}`;

			const response = await axios.get(reqUrl);
			const indexers = [];

			for (const i in response.data) {
				const entry = response.data[i];
				const indexer = Object.assign({}, schema, {
					title: entry.name,
					protocol: entry.protocol,
					url: entry.fields[0].value,
					key: entry.fields[2].value,
					seeds: entry.fields[6].value,
					id: undefined,
					appId: entry.id
				});

				let match = indexer.url.match(indexerRegex);
				if (match) {
					indexer.id = match.groups.id;
				}

				indexers.push(indexer);
			}

			return indexers;
		},
		add: async (url, key, cats, seeds, indexer) => {
			const reqUrl = `${url}/api/v3/indexer?apikey=${key}`

			const body = {
				enableRss: true,
				enableAutomaticSearch: true,
				enableInteractiveSearch: true,
				supportsRss: true,
				supportsSearch: true,
				protocol: indexer.protocol,
				name: indexer.title,
				fields: [
					{ name: 'baseUrl', value: indexer.url },
					{ name: 'apiPath', value: '/api' },
					{ name: 'apiKey', value: indexer.key },
					{ name: 'categories', value: cats },
					{ name: 'animeCategories', value: [] },
					{ name: 'additionalParameters' },
					{ name: 'minimumSeeders', value: seeds },
					{ name: 'seedCriteria.seedRatio' },
					{ name: 'seedCriteria.seedTime' },
					{ name: 'seedCriteria.seasonPackSeedTime' }
				],
				implementationName: 'Torznab',
				implementation: 'Torznab',
				configContract: 'TorznabSettings',
				tags: []
			}

			try {
				const resp = await axios.post(reqUrl, body);
				console.log(`[Sonarr] Added ${indexer.id} successfully`);
			} catch (e) {
				console.error(`[Sonarr] Failed to add ${indexer.id}: ${e.response.data[0] ? e.response.data[0].errorMessage : e}`);
			}
		},
		shouldAdd: (url, key, cats, seeds, el) => el.categories.some(r => cats.includes(r)),
		update: async (url, key, cats, seeds, current, indexer) => {
			const reqUrl = `${url}/api/v3/indexer/${current.appId}?apikey=${key}`

			const body = {
				enableRss: true,
				enableAutomaticSearch: true,
				enableInteractiveSearch: true,
				supportsRss: true,
				supportsSearch: true,
				protocol: indexer.protocol,
				name: indexer.title,
				id: current.appId,
				fields: [
					{ name: 'baseUrl', value: indexer.url },
					{ name: 'apiPath', value: '/api' },
					{ name: 'apiKey', value: indexer.key },
					{ name: 'categories', value: cats },
					{ name: 'animeCategories', value: [] },
					{ name: 'additionalParameters' },
					{ name: 'minimumSeeders', value: seeds },
					{ name: 'seedCriteria.seedRatio' },
					{ name: 'seedCriteria.seedTime' },
					{ name: 'seedCriteria.seasonPackSeedTime' }
				],
				implementationName: 'Torznab',
				implementation: 'Torznab',
				configContract: 'TorznabSettings',
				tags: [],
			}

			try {
				const resp = await axios.put(reqUrl, body);
				console.log(`[Sonarr] Updated ${indexer.id} successfully`);
			} catch (e) {
				console.error(`[Sonarr] Failed to update ${indexer.id}: ${e.response.data[0] ? e.response.data[0].errorMessage : e}`);
			}
		},
		shouldUpdate: (url, key, cats, seeds, current, indexer) => {

			const mask = {categories: undefined, appId: undefined};

			const cr = Object.assign({}, current, mask);
			const ix = Object.assign({}, indexer, {...mask, seeds: seeds});

			console.log(cr, ix)

			return !deepCompare(cr, ix);
		}
	},
	radarr: {
		params: ['radarrurl', 'radarrkey', 'radarrcats', 'seeds'],
		required: ['radarrurl', 'radarrkey'],
		defaults: ["", "", '2000,2010,2020,2030,2035,2040,2045,2050,2060', 1],
		process: [undefined, undefined, (val) => val.split(',').map(el => parseInt(el))],
		get: async (url, key, cats) => {
			const reqUrl = `${url}/api/indexer?apikey=${key}`;

			const response = await axios.get(reqUrl);
			const indexers = [];

			for (const i in response.data) {
				const entry = response.data[i];
				const indexer = Object.assign({}, schema, {
					title: entry.name,
					protocol: entry.protocol,
					url: entry.fields[0].value,
					id: undefined,
					seeds: entry.fields[8].value,
					appId: entry.id
				});

				let match = indexer.url.match(indexerRegex);
				if (match) {
					indexer.id = match.groups.id;
				}

				indexers.push(indexer);
			}

			return indexers;
		},
		add: async (url, key, cats, seeds, indexer) => {
			const reqUrl = `${url}/api/indexer?apikey=${key}`

			const body = {
				enableRss: true,
				enableSearch: true,
				supportsRss: true,
				supportsSearch: true,
				protocol: indexer.protocol,
				name: indexer.title,
				fields: [
					{ name: 'BaseUrl', value: indexer.url },
					{ name: 'MultiLanguages', value: '' },
					{ name: 'ApiKey', value: indexer.key },
					{ name: 'Categories', value: cats, },
					{ name: 'AnimeCategories', value: [] },
					{ name: 'AdditionalParameters', },
					{ name: 'RemoveYear', value: false, },
					{ name: 'SearchByTitle', value: false, },
					{ name: 'MinimumSeeders', value: seeds, },
					{ name: 'RequiredFlags', value: '' }
				],
				implementationName: 'Torznab',
				implementation: 'Torznab',
				configContract: 'TorznabSettings'
			}

			try {
				const resp = await axios.post(reqUrl, body);
				console.log(`[Radarr] Added ${indexer.id} successfully`);
			} catch (e) {
				console.error(`[Radarr] Failed to add ${indexer.id}: ${e.response.data[0] ? e.response.data[0].errorMessage : e}`);
			}
		},
		shouldAdd: (url, key, cats, seeds, el) => el.categories.some(r => cats.includes(r)),
		update: async (url, key, cats, seeds, current, indexer) => {
			const reqUrl = `${url}/api/indexer/${current.appId}?apikey=${key}`

			const body = {
				enableRss: true,
				enableAutomaticSearch: true,
				enableInteractiveSearch: true,
				supportsRss: true,
				supportsSearch: true,
				protocol: indexer.protocol,
				name: indexer.title,
				id: current.appId,
				fields: [
					{ name: 'BaseUrl', value: indexer.url },
					{ name: 'MultiLanguages', value: '' },
					{ name: 'ApiKey', value: indexer.key },
					{ name: 'Categories', value: cats, },
					{ name: 'AnimeCategories', value: [] },
					{ name: 'AdditionalParameters', },
					{ name: 'RemoveYear', value: false, },
					{ name: 'SearchByTitle', value: false, },
					{ name: 'MinimumSeeders', value: seeds, },
					{ name: 'RequiredFlags', value: '' }
				],
				implementationName: 'Torznab',
				implementation: 'Torznab',
				configContract: 'TorznabSettings',
				tags: [],
			}

			try {
				const resp = await axios.put(reqUrl, body);
				console.log(`[Radarr] Updated ${indexer.id} successfully`);
			} catch (e) {
				console.error(`[Radarr] Failed to update ${indexer.id}: ${e.response.data[0] ? e.response.data[0].errorMessage : e}`);
			}
		},
		shouldUpdate: (url, key, cats, seeds, current, indexer) => {

			const mask = {categories: undefined, appId: undefined};

			const cr = Object.assign({}, current, mask);
			const ix = Object.assign({}, indexer, {...mask, seeds: seeds});

			return !deepCompare(cr, ix);
		}		
	},
	lidarr: {
		params: ['lidarrurl', 'lidarrkey', 'lidarrcats', 'seeds'],
		required: ['lidarrurl', 'lidarrkey'],
		defaults: ["", "", '3000,3010,3020,3030,3040', 1],
		process: [undefined, undefined, (val) => val.split(',').map(el => parseInt(el))],
		get: async (url, key, cats) => {
			const reqUrl = `${url}/api/v1/indexer?apikey=${key}`;

			const response = await axios.get(reqUrl);
			const indexers = [];

			for (const i in response.data) {
				const entry = response.data[i];
				const indexer = Object.assign({}, schema, {
					title: entry.name,
					protocol: entry.protocol,
					url: entry.fields[0].value,
					seeds: entry.fields[6].value,
					id: undefined,
					appId: entry.id
				});

				let match = indexer.url.match(indexerRegex);
				if (match) {
					indexer.id = match.groups.id;
				}

				indexers.push(indexer);
			}

			return indexers;
		},
		add: async (url, key, cats, seeds, indexer) => {
			const reqUrl = `${url}/api/v1/indexer?apikey=${key}`

			const body = {
				enableRss: true,
				enableAutomaticSearch: true,
				enableInteractiveSearch: true,
				supportsRss: true,
				supportsSearch: true,
				protocol: indexer.protocol,
				name: indexer.title,
				fields: [
					{ name: 'baseUrl', value: indexer.url },
					{ name: 'apiPath', value: '/api' },
					{ name: 'apiKey', value: indexer.key },
					{ name: 'categories', value: cats },
					{ name: 'earlyReleaseLimit' },
					{ name: 'additionalParameters' },
					{ name: 'minimumSeeders', value: seeds },
					{ name: 'seedCriteria.seedRatio' },
					{ name: 'seedCriteria.seedTime' },
					{ name: 'seedCriteria.discographySeedTime' }
				],
				implementationName: 'Torznab',
				implementation: 'Torznab',
				configContract: 'TorznabSettings',
				tags: []
			}

			try {
				const resp = await axios.post(reqUrl, body);
				console.log(`[Lidarr] Added ${indexer.id} successfully`);
			} catch (e) {
				console.error(`[Lidarr] Failed to add ${indexer.id}: ${e.response.data[0] ? e.response.data[0].errorMessage : e}`);
				// console.error(e)
			}
		},
		shouldAdd: (url, key, cats, seeds, el) => el.categories.some(r => cats.includes(r)),
		update: async (url, key, cats, seeds, current, indexer) => {
			const reqUrl = `${url}/api/v1/indexer/${current.appId}?apikey=${key}`

			const body = {
				enableRss: true,
				enableAutomaticSearch: true,
				enableInteractiveSearch: true,
				supportsRss: true,
				supportsSearch: true,
				protocol: indexer.protocol,
				name: indexer.title,
				id: current.appId,
				fields: [
					{ name: 'baseUrl', value: indexer.url },
					{ name: 'apiPath', value: '/api' },
					{ name: 'apiKey', value: indexer.key },
					{ name: 'categories', value: cats },
					{ name: 'earlyReleaseLimit' },
					{ name: 'additionalParameters' },
					{ name: 'minimumSeeders', value: seeds },
					{ name: 'seedCriteria.seedRatio' },
					{ name: 'seedCriteria.seedTime' },
					{ name: 'seedCriteria.discographySeedTime' }
				],
				implementationName: 'Torznab',
				implementation: 'Torznab',
				configContract: 'TorznabSettings',
				tags: [],
			}

			try {
				const resp = await axios.put(reqUrl, body);
				console.log(`[Lidarr] Updated ${indexer.id} successfully`);
			} catch (e) {
				console.error(`[Lidarr] Failed to update ${indexer.id}: ${e.response.data[0] ? e.response.data[0].errorMessage : e}`);
			}
		},
		shouldUpdate: (url, key, cats, seeds, current, indexer) => {
			const mask = {categories: undefined, appId: undefined};

			const cr = Object.assign({}, current, mask);
			const ix = Object.assign({}, indexer, {...mask, seeds: seeds});

			return !deepCompare(cr, ix);
		}		
	},
}
