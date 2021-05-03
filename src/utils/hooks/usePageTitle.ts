import { useEffect, useState } from 'react'

const usePageTitle = (title: string) => {
  const [pageTitle, setPageTitle] = useState(title)

  useEffect(() => {
    document.title = pageTitle
  }, [pageTitle])

  return { pageTitle, setPageTitle }
}

export default usePageTitle
