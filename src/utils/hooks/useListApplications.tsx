import { useEffect, useState } from 'react'
import { useRouter } from '../hooks/useRouter'
import buildFilter from '../helpers/list/buildQueryFilters'
import buildSortFields, { getPaginationVariables } from '../helpers/list/buildQueryVariables'
import { useGetApplicationsListQuery, ApplicationList } from '../../utils/generated/graphql'
import { BasicStringObject } from '../types'

const useListApplications = ({ sortBy, page, perPage, ...queryFilters }: BasicStringObject) => {
  const [applications, setApplications] = useState<ApplicationList[]>([])
  const [applicationCount, setApplicationCount] = useState<number>(0)
  const [error, setError] = useState('')
  const { updateQuery } = useRouter()

  const filters = buildFilter(queryFilters)
  const sortFields = sortBy ? buildSortFields(sortBy) : []
  const { paginationOffset, numberToFetch } = getPaginationVariables(
    page ? Number(page) : 1,
    perPage ? Number(perPage) : undefined
  )
  const { data, loading, error: applicationsError } = useGetApplicationsListQuery({
    variables: { filters, sortFields, paginationOffset, numberToFetch },
    fetchPolicy: 'network-only',
  })

  // Ensures that query doesn't request a page beyond the available total
  useEffect(() => {
    const pageNum = Number(page) || 1
    const perPageNum = Number(perPage) || 20
    const totalPages = Math.ceil(applicationCount / perPageNum)
    if (pageNum > (totalPages > 0 ? totalPages : 1)) updateQuery({ page: totalPages })
  }, [applicationCount])

  useEffect(() => {
    if (applicationsError) {
      setError(applicationsError.message)
      return
    }
    if (data?.applicationLists) {
      const applicationsList = data?.applicationLists?.nodes
      setApplications(applicationsList as ApplicationList[])
      setApplicationCount(data?.applicationLists?.totalCount)
    }
  }, [data, applicationsError])

  return {
    error,
    loading,
    applications,
    applicationCount,
  }
}

export default useListApplications
