const axios = require('axios');
const body = {
  enableRss: true,
  enableAutomaticSearch: true,
  enableInteractiveSearch: true,
  supportsRss: true,
  supportsSearch: true,
  protocol: 'torrent',
  name: '1337x',
  id: 31,
  fields: [
    { name: 'baseUrl', value: 'http://jackett:9117/jackett/api/v2.0/indexers/1337x/results/torznab/' },
    { name: 'apiPath', value: '/api' },
    { name: 'apiKey', value: 'sen08b96xf8x1o3twv9n1aml8da8p7mp' },
    { name: 'categories', value: [5000, 5030, 5040] },
    { name: 'animeCategories', value: [] },
    { name: 'additionalParameters' },
    { name: 'minimumSeeders', value: 4 },
    { name: 'seedCriteria.seedRatio' },
    { name: 'seedCriteria.seedTime' },
    { name: 'seedCriteria.seasonPackSeedTime' }
  ],
  implementationName: 'Torznab',
  implementation: 'Torznab',
  configContract: 'TorznabSettings',
  // infoLink: 'https://github.com/Sonarr/Sonarr/wiki/Supported-Indexers#torznab',
  tags: [],
}

axios.put('http://localhost:8989/sonarr/api/v3/indexer/31?apikey=b27b78ff3e994da1b4460f40e576a029', body).catch(e => console.error(e))