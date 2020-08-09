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
		params: ['url', 'apikey', 'alturl'],
		// defaults: [],
		get: async (url, apikey, alturl) => {
			const jackettIndexers = `${url}/api/v2.0/indexers/all/results/torznab/api?apikey=${apikey}&t=indexers&configured=true`;

			const response = await axios.get(jackettIndexers);
			const indexers = parser.toJson(response.data, { object: true }).indexers.indexer;

			for (const i in indexers) {
				const entry = indexers[i];

				const category = entry.caps.categories.category;

				const obj = Object.assign({}, schema, {
					id: entry.id,
					title: entry.title,
					protocol: "torrent",
					categories: typeof category === 'array' ? category.map(cat => parseInt(cat.id)) : [parseInt(category.id)],
					url: `${alturl || url}/api/v2.0/indexers/${entry.id}/results/torznab/`,
					key: apikey,
				});



				indexers[i] = obj
			}

			return indexers;
		}
	},
	sonarr: {
		params: ['sonarrurl', 'sonarrkey', 'sonarrcats'],
		required: ['sonarrurl', 'sonarrkey'],
		defaults: [undefined, undefined, '5000,5030,5040'],
		get: async (url, key) => {
			const sonarrIndexers = `${url}/api/v3/indexer?apikey=${key}`;

			const response = await axios.get(sonarrIndexers);
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

			if (typeof cats === 'string')
				cats = cats.split(",").map(el => parseInt(el));

			const body = {
				enableRss: true,
				enableAutomaticSearch: true,
				enableInteractiveSearch: true,
				supportsRss: true,
				supportsSearch: true,
				protocol: 'torrent',
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
				infoLink: 'https://github.com/Sonarr/Sonarr/wiki/Supported-Indexers#torznab',
				tags: []
			}

			try {
				const resp = await axios.post(reqUrl, body);
				console.log(`Added ${indexer.id} successfully`);
			} catch (e) { 
				console.log(`Failed to add ${indexer.id}`);
			}
		},
		sync: async (url, key, cats, to) => {
			try {
				const indexers = (await module.exports.sonarr.get(url, key)).filter(el => el.id);
				cats = cats.split(",").map(el => parseInt(el));

				const idList = indexers.map(el => el.id);

				const promises = [];
				const toAddIds = [];

				to.filter(el => !idList.includes(el.id))
					.filter(el => el.categories.some(r => cats.includes(r)))
					.forEach(el => {
						toAddIds.push(el.id);
						promises.push(module.exports.sonarr.add(url, key, cats, el));
					});

				if (toAddIds.length > 0) {
					console.log(`Adding ${toAddIds.join(', ')}`);
				} else {
					console.log("Nothing do add");
				}
				await Promise.all(promises);
			} catch (e) {
				console.error(e);
			}

		}
	}
}