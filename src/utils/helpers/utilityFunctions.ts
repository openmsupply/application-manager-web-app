export const isArraySorted = (array: any[], ascending = true) => {
  if (ascending) return array.every((element, index) => index === 0 || element >= array[index - 1])
  else
    return array.every(
      (element, index) => index === array.length - 1 || element >= array[index + 1]
    )
}

/*
Checks if a URL string is an external URL or a local/relative one
If local/relative, it prepends it with a specified host, else it
returns it unchanged.
*/
export const getFullUrl = (baseUrl: string | undefined, host: string) => {
  return baseUrl?.startsWith('http') ? baseUrl : host + baseUrl
}
