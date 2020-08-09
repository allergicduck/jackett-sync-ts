const axios = require('axios');
const body = {
  enableRss: true,
  enableSearch: true,
  supportsRss: true,
  supportsSearch: true,
  protocol: 'torrent',
  name: 'AAA',
  fields: [
    { name: 'BaseUrl', value: 'http://jackett:9117/jackett/api/v2.0/indexers/1337x/results/torznab/' },
    { name: 'MultiLanguages', value: '' },
    { name: 'ApiKey', value: 'sen08b96xf8x1o3twv9n1aml8da8p7mp' },
    { name: 'Categories', value: [2000, 2010, 2020, 2030, 2035, 2040, 2045, 2050, 2060] },
    { name: 'AnimeCategories', value: [] },
    { name: 'AdditionalParameters' },
    { name: 'RemoveYear', value: false },
    { name: 'SearchByTitle', value: false },
    { name: 'MinimumSeeders', value: 1 },
    { name: 'RequiredFlags', value: '' }
  ],
  implementationName: 'Torznab',
  implementation: 'Torznab',
  configContract: 'TorznabSettings'
}

axios.post('http://localhost:7878/radarr/api/indexer?apikey=b2af47b281e944b2b446cafc6a2832db', body).catch(e => console.error(e))