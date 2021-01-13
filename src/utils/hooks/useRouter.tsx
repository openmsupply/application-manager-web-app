import {
  useParams,
  useLocation,
  useHistory,
  useRouteMatch,
  RouteComponentProps,
  match,
} from 'react-router-dom'
import queryString from 'query-string'
import { useMemo } from 'react'

interface QueryObject {
  mode?: string
  type?: string
  userRole?: string
  serialNumber?: string
  sectionCode?: string
  page?: string
  templateId?: string
  step?: string
  notificationId?: string
  productId?: string
  orgName?: string
}

interface RouterResult {
  goBack: () => void
  pathname: string
  push: (path: string) => void
  query: QueryObject
  replace: (path: string) => void
  match: match
  history: any
  params: any
  location: any
}

const replaceHifenKeys = (parsedQuery: { [key: string]: any }) => {
  if (Object.keys(parsedQuery).length === 0) return parsedQuery
  const replacedHifenKeys = Object.keys(parsedQuery).map((key) => {
    const convertedKey = key.replace(/-([a-z])/g, function (m, w) {
      return w.toUpperCase()
    })
    return { [convertedKey]: parsedQuery[key] }
  })
  return replacedHifenKeys.reduce((a, b) => Object.assign({}, a, b))
}

export function useRouter(): RouterResult {
  const params = useParams()
  const location = useLocation()
  const history = useHistory()
  const match = useRouteMatch()

  // Return our custom router object
  // Memoize so that a new object is only returned if something changes

  return useMemo(() => {
    // Convert string to object, then replace snake with camelCase
    const queryFilters = replaceHifenKeys(queryString.parse(location.search))

    return {
      // For convenience add push(), replace(), pathname at top level
      push: history.push,
      replace: history.replace,
      goBack: history.goBack,
      pathname: location.pathname,

      // Merge params and parsed query string into single "query" object
      // so that they can be used interchangeably.
      // Example: /:topic?sort=popular -> { topic: "react", sort: "popular" }
      query: {
        ...queryFilters,
        ...params,
      },

      // Include match, location, history objects so we have
      // access to extra React Router functionality if needed.
      params,
      match,
      location,
      history,
    }
  }, [params, match, location, history])
}
