import { useEffect, useState } from 'react'
import {
  Review,
  ReviewResponseDecision,
  TemplateElement,
  useGetHistoryForApplicantQuery,
  useGetHistoryForReviewerQuery,
  User,
} from '../generated/graphql'
import { HistoryElement } from '../types'
import strings from '../../utils/constants'

interface UseGetQuestionHistoryProps {
  serial: string
  templateCode: string
  questionCode: string
  userId: number
  // userLevel: number
  isApplicant: boolean
}

interface ResponsesByDate {
  [date: string]: HistoryElement
}

const useGetQuestionHistory = ({ isApplicant, ...variables }: UseGetQuestionHistoryProps) => {
  const [historyList, setHistoryList] = useState<HistoryElement[]>([])
  const { data, error, loading } = isApplicant
    ? useGetHistoryForApplicantQuery({ variables })
    : useGetHistoryForReviewerQuery({ variables })

  useEffect(() => {
    if (!data) return
    // Organise ReviewResponse and Applicant Responses from latest to oldest
    const { applicationResponses, reviewResponses } =
      data?.templateElementByTemplateCodeAndCodeAndTemplateVersion as TemplateElement

    const allResponses: ResponsesByDate = {}

    applicationResponses.nodes.forEach((applicantResponse) => {
      if (!applicantResponse) return
      const { timeUpdated, application, value } = applicantResponse
      const { firstName, lastName } = application?.user as User
      // Set each entry using HistoryElement values
      allResponses[timeUpdated] = {
        author: firstName || '' + ' ' + lastName || '',
        title: strings.TITLE_HISTORY_SUBMITTED_BY_APPLICANT,
        message: value.text,
        timeUpdated,
      }
    })

    reviewResponses.nodes.forEach((reviewResponse) => {
      if (!reviewResponse) return
      const { timeUpdated, decision, comment, review } = reviewResponse
      const { levelNumber, reviewer } = review as Review
      const { id, firstName, lastName } = reviewer as User

      // Set each entry using HistoryElement values
      allResponses[timeUpdated] = {
        author: firstName || '' + ' ' + lastName || '',
        title:
          (levelNumber || 1) > 1
            ? strings.TITLE_HISTORY_CONSOLIDATION
            : strings.TITLE_HISTORY_REVIEW,
        message: decision as ReviewResponseDecision, // TODO: Localisation
        timeUpdated,
        reviewerComment: comment || '',
      }
      // TODO: Need to check for 2 responses in the same time?
    })

    setHistoryList(Object.values(allResponses).reverse()) // Change order to show latest on the top

    // Find stages - Maybe done straight into HistoryPanel - or have in HistoryStructure?
  }, [data])

  return {
    error,
    loading,
    historyList,
  }
}

export default useGetQuestionHistory
