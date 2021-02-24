import { useParams, useLocation, useHistory, useRouteMatch, match } from 'react-router-dom'
import queryString from 'query-string'
import { useMemo } from 'react'
import { BasicStringObject } from '../types'

interface RouterResult {
  goBack: () => void
  pathname: string
  push: (path: string) => void
  query: BasicStringObject
  updateQuery: Function
  replace: (path: string) => void
  match: match
  history: any
  params: any
  location: any
}

/**
 * @function: replaceKebabCaseKeys / restoreKebabCaseKeys
 * For each filter key in the query, converts from kebab-case to camelCase
 * or vice-versa.
 * - @param parsedQuery - URL query after parsed to object
 * - @returns Object with all query {key: value} with keys in
 * camelCase/kebab-case format.
 */
const replaceKebabCaseKeys = (parsedQuery: { [key: string]: any }) => {
  return replaceObjectKeys(parsedQuery, (key: string) =>
    key.replace(/-([a-z])/g, (_, w) => w.toUpperCase())
  )
}
const restoreKebabCaseKeys = (parsedQuery: { [key: string]: any }) => {
  return replaceObjectKeys(parsedQuery, (key: string) =>
    key.replace(/([a-z])([A-Z])/g, (_, w1, w2) => `${w1}-${w2.toLowerCase()}`)
  )
}
const replaceObjectKeys = (object: { [key: string]: any }, replacementFunction: Function) => {
  if (Object.keys(object).length === 0) return object
  const replacedKeys = Object.keys(object).map((key) => {
    const convertedKey = replacementFunction(key)
    return [[convertedKey], object[key]]
  })
  return Object.fromEntries(replacedKeys)
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
    const queryFilters = replaceKebabCaseKeys(queryString.parse(location.search, { sort: false }))

    // Add new key-value pairs to existing query string and update URL
    const updateQuery = (newQueries: { [key: string]: string }) => {
      const newQueryObject = { ...queryFilters }
      Object.entries(newQueries).forEach(([key, value]) => {
        if (!value) {
          delete newQueryObject[key]
        } else newQueryObject[key] = value
      })
      history.push({
        search: queryString.stringify(restoreKebabCaseKeys(newQueryObject), { sort: false }),
      })
    }

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
      updateQuery,

      // Include match, location, history objects so we have
      // access to extra React Router functionality if needed.
      params,
      match,
      location,
      history,
    }
  }, [location])
}
