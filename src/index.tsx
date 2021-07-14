import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom'
import '../semantic/src/semantic.less'
import config from './config'
import cache from './cache'
import { AppWrapper } from './containers/Main'
import { ApolloClient, ApolloProvider, createHttpLink, NormalizedCacheObject } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { persistCache } from 'apollo3-cache-persist'
import { Loading } from './components'
import { LanguageProvider } from './intl/contexts/Language.context'

// Adds authorisation header with token from local storage (to be used on every request)
// see https://www.apollographql.com/docs/react/networking/authentication/#header
const authLink = setContext((_, { headers }) => {
  const JWT = localStorage.getItem('persistJWT')
  return {
    headers: {
      ...headers,
      authorization: JWT ? `Bearer ${JWT}` : '',
    },
  }
})

// Needed to link or 'chain' commands in Apollo Clients (so that headers can be added to every apollo request)
// see https://www.apollographql.com/docs/react/networking/authentication/#header
const httpLink = createHttpLink({
  uri: ({ operationName }) => {
    return `${config.serverGraphQL}?dev=${operationName}`
  },
})

const App: React.FC = () => {
  const [client, setClient] = useState<ApolloClient<NormalizedCacheObject> | undefined>(undefined)
  useEffect(() => {
    const client = new ApolloClient({
      link: authLink.concat(httpLink),
      cache,
    })
    setClient(client)

    // persistCache({
    //   cache,
    //   storage: window.localStorage,
    //   /**
    //    * Storage options.
    //    */
    //   // Maximum size of cache to persist (in bytes).
    //   // Defaults to 1048576 (1 MB). For unlimited cache size, provide false.
    //   // If exceeded, persistence will pause and app will start up cold on next launch.
    //   maxSize: false,

    //   /**
    //    * Debugging options.
    //    */
    //   // Enable console logging.
    //   // debug: boolean,
    // }).then(() => {
    //   // TODO: Check when this would run!
    //   client.onResetStore(async () => cache.reset())
    //   setClient(client)
    // })
    return () => {}
  }, [])

  return client ? (
    <ApolloProvider client={client}>
      <LanguageProvider>
        <AppWrapper />
      </LanguageProvider>
    </ApolloProvider>
  ) : (
    <Loading />
  )
}

ReactDOM.render(<App />, document.getElementById('root'))
