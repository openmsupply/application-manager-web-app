import config from './src/config'

module.exports = {
  client: {
    service: {
      name: 'Application Manager',
      url: config.server,
    },
  },
}
