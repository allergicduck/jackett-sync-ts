const axios = require("axios");
const parser = require("xml2json");

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
	title: '',
	protocol: '',
	categories: [ 5000 ],
	url: '',
	key: ''
}

module.exports = {
	jackett: {
		source: true,
		params: ['url', 'apikey', 'alturl'],
		// defaults: [],
		get: async (url, apikey, alturl) => {
			const jackettIndexers = `${url}/api/v2.0/indexers/all/results/torznab/api?apikey=${apikey}&t=indexers&configured=true`;

			const response = await axios.get(jackettIndexers);
			const indexers = parser.toJson(response.data, { object: true }).indexers.indexer;

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
		params: ['sonarrurl', 'sonarrkey', 'sonarrcats'],
		required: ['sonarrurl', 'sonarrkey'],
		defaults: [undefined, undefined, '5000,5030,5040'],
		process: [undefined, undefined, (val) => val.split(',').map(el => parseInt(el))],
		get: async (url, key, cats) => {
			const reqUrl = `${url}/api/v3/indexer?apikey=${key}`;

			const response = await axios.get(reqUrl);
			const indexers = [];

			for (const i in response.data) {
				const entry = response.data[i];
				const indexer = Object.assign({}, schema, {
					sonarrId: entry.id,
					title: entry.name,
					protocol: entry.protocol,
					url: entry.fields[0].value,
					id: undefined
				});

				let match = indexer.url.match(indexerRegex);
				if (match) {
					indexer.id = match.groups.id;
				}

				indexers.push(indexer);
			}

			return indexers;
		},
		add: async (url, key, cats, indexer) => {
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
					{ name: 'minimumSeeders', value: 1 },
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
				console.log(`Added ${indexer.id} successfully`);
			} catch (e) { 
				console.error(`Failed to add ${indexer.id} to sonarr: ${e.response.data[0].errorMessage}`);
			}
		},
		shouldAdd: (url, key, cats, el) => el.categories.some(r => cats.includes(r))
	},
	radarr: {
		params: ['radarrurl', 'radarrkey', 'radarrcats'],
		required: ['radarrurl', 'radarrkey'],
		defaults: [undefined, undefined, '2000,2010,2020,2030,2035,2040,2045,2050,2060'],
		process: [undefined, undefined, (val) => val.split(',').map(el => parseInt(el))],
		get: async (url, key, cats) => {
			const reqUrl = `${url}/api/indexer?apikey=${key}`;

			const response = await axios.get(reqUrl);
			const indexers = [];

			for (const i in response.data) {
				const entry = response.data[i];
				const indexer = Object.assign({}, schema, {
					sonarrId: entry.id,
					title: entry.name,
					protocol: entry.protocol,
					url: entry.fields[0].value,
					id: undefined
				});

				let match = indexer.url.match(indexerRegex);
				if (match) {
					indexer.id = match.groups.id;
				}

				indexers.push(indexer);
			}

			return indexers;
		},
		add: async (url, key, cats, indexer) => {
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
					{ name: 'MinimumSeeders', value: 1, },
					{ name: 'RequiredFlags', value: '' }
				],
				implementationName: 'Torznab',
				implementation: 'Torznab',
				configContract: 'TorznabSettings'
			}

			try {
				const resp = await axios.post(reqUrl, body);
				console.log(`Added ${indexer.id} successfully`);
			} catch (e) { 
				console.error(`Failed to add ${indexer.id} to radarr: ${e.response.data[0].errorMessage}`);
			}
		},
		shouldAdd: (url, key, cats, el) => el.categories.some(r => cats.includes(r))
	},
	lidarr: {
		params: ['lidarrurl', 'lidarrkey', 'lidarrcats'],
		required: ['lidarrurl', 'lidarrkey'],
		defaults: [undefined, undefined, '3000,3010,3020,3030,3040'],
		process: [undefined, undefined, (val) => val.split(',').map(el => parseInt(el))],
		get: async (url, key, cats) => {
			const reqUrl = `${url}/api/v1/indexer?apikey=${key}`;

			const response = await axios.get(reqUrl);
			const indexers = [];

			for (const i in response.data) {
				const entry = response.data[i];
				const indexer = Object.assign({}, schema, {
					sonarrId: entry.id,
					title: entry.name,
					protocol: entry.protocol,
					url: entry.fields[0].value,
					id: undefined
				});

				let match = indexer.url.match(indexerRegex);
				if (match) {
					indexer.id = match.groups.id;
				}

				indexers.push(indexer);
			}

			return indexers;
		},
		add: async (url, key, cats, indexer) => {
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
					{ name: 'minimumSeeders', value: 1 },
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
				console.log(`Added ${indexer.id} successfully`);
			} catch (e) { 
				console.error(`Failed to add ${indexer.id} to lidarr: ${e.response.data[0].errorMessage}`);
				// console.error(e)
			}
		},
		shouldAdd: (url, key, cats, el) => el.categories.some(r => cats.includes(r))
	},	
}