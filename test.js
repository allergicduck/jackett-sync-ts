const axios = require('axios');
const body = {
  enableRss: true,
  enableAutomaticSearch: true,
  enableInteractiveSearch: true,
  supportsRss: true,
  supportsSearch: true,
  protocol: 'torrent',
  name: 'aaaa',
  fields: [
    { name: 'baseUrl', value: 'http://jackett:9117/jackett/api/v2.0/indexers/1337x/results/torznab/' },
    { name: 'apiPath', value: '/api' },
    { name: 'apiKey', value: 'sen08b96xf8x1o3twv9n1aml8da8p7mp' },
    { name: 'categories', value: [3000, 3010, 3020, 3030, 3040] },
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

axios.post('https://localhost/lidarr/api/v1/indexer?apikey=0e0d8c9fa9234ffaa81c501d37d926a8', body).catch(e => console.error(e))