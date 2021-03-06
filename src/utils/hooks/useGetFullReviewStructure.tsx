import { useState, useEffect } from 'react'
import { FullStructure } from '../types'
import {
  ApplicationResponse,
  Review,
  ReviewResponse,
  useGetReviewNewQuery,
  ReviewQuestionAssignment,
} from '../generated/graphql'
import addEvaluatedResponsesToStructure from '../helpers/structure/addEvaluatedResponsesToStructure'
import { useUserState } from '../../contexts/UserState'
import addThisReviewResponses from '../helpers/structure/addThisReviewResponses'
import addElementsById from '../helpers/structure/addElementsById'
import generateReviewProgress from '../helpers/structure/generateReviewProgress'

interface useGetFullReviewStructureProps {
  structure: FullStructure
  reviewAssignmentId: number
}

const useGetFullReviewStructure = ({
  structure,
  reviewAssignmentId,
}: useGetFullReviewStructureProps) => {
  const [fullStructure, setFullStructure] = useState<FullStructure>()
  const [structureError, setStructureError] = useState('')

  const {
    userState: { currentUser },
  } = useUserState()

  const { data, error } = useGetReviewNewQuery({
    variables: {
      reviewAssignmentId,
      userId: currentUser?.userId as number,
    },
  })

  useEffect(() => {
    if (error) return

    if (!data) return

    const reviewAssignment = data.reviewAssignment
    if (!reviewAssignment) return setStructureError('Cannot find review Assignemnt')

    addEvaluatedResponsesToStructure({
      structure,
      applicationResponses: reviewAssignment.application?.applicationResponses
        ?.nodes as ApplicationResponse[],
      currentUser,
      evaluationOptions: {
        isEditable: false,
        isVisible: true,
        isRequired: false,
        isValid: false,
      },
    }).then((evaluatedStructure: FullStructure) => {
      // This is usefull for linking assignments to elements
      let newStructure: FullStructure = addElementsById(evaluatedStructure)
      // This is usefull for generating progress (maybe also usefull downstream, but dont' want too refactor too much at this stage)
      newStructure = addSortedSectionsAndPages(newStructure)

      const reviewQuestionAssignments = reviewAssignment.reviewQuestionAssignments?.nodes
      if (reviewQuestionAssignments)
        newStructure = addIsAssigned(
          newStructure,
          reviewQuestionAssignments as ReviewQuestionAssignment[]
        )

      // here we add responses from other review (not from this review assignmnet)

      // There will always just be one review assignment linked to a review. (since review is related to reviewAssignment, many to one relation is created)
      const review = data?.reviewAssignment?.reviews?.nodes[0] as Review
      if ((data.reviewAssignment?.reviews?.nodes?.length || 0) > 1)
        console.error(
          'More then one review associated with reviewAssignment with id',
          reviewAssignment.id
        )
      if (review) {
        newStructure = addThisReviewResponses({
          structure: newStructure,
          sortedReviewResponses: review?.reviewResponses.nodes as ReviewResponse[], // Sorted in useGetReviewNewQuery
        })
      }

      generateReviewProgress(newStructure)
      // generateConsolidationProgress
      setFullStructure(newStructure)
    })
  }, [data, error])

  return {
    fullStructure,
    error: structureError || error?.message,
  }
}

const addSortedSectionsAndPages = (newStructure: FullStructure): FullStructure => {
  const sortedSections = Object.values(newStructure.sections).sort(
    (sectionOne, sectionTwo) => sectionOne.details.index - sectionTwo.details.index
  )
  const sortedPages = sortedSections
    .map((section) =>
      Object.values(section.pages).sort((pageOne, pageTwo) => pageOne.number - pageTwo.number)
    )
    .flat()

  return { ...newStructure, sortedPages, sortedSections }
}

const addIsAssigned = (
  newStructure: FullStructure,
  reviewQuestionAssignments: ReviewQuestionAssignment[]
) => {
  reviewQuestionAssignments.forEach((questionAssignment) => {
    if (!questionAssignment) return

    const assignedElement =
      newStructure?.elementsById?.[questionAssignment.templateElementId as number]
    if (!assignedElement) return

    assignedElement.isAssigned = true
  })

  return newStructure
}

export default useGetFullReviewStructure
