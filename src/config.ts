// for production we get URL relative to web app
const { port, hostname, protocol } = window.location
const getUrl = (path: string) => `${protocol}//${hostname}:${port}/${path}`
const isProductionBuild = process.env.NODE_ENV === 'production'

const config = {
  serverGraphQL: isProductionBuild
    ? getUrl('postgraphile/graphql')
    : 'http://localhost:5000/graphql',
  serverREST: isProductionBuild ? getUrl('server') : 'http://localhost:8080',
  uploadEndpoint: '/upload',
  paginationPresets: [2, 5, 10, 20, 50],
}

export default config
