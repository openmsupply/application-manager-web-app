import { DocumentNode } from 'graphql'
import {
  ApplicationOutcome,
  ApplicationStatus,
  AssignerAction,
  ReviewerAction,
} from '../generated/graphql'
import getApplicantFilterList from '../graphql/queries/applicationListFilters/getApplicantFilterList'
import getAssignerFilterList from '../graphql/queries/applicationListFilters/getAssignerFilterList'
import getOrganisationFilterList from '../graphql/queries/applicationListFilters/getOrganisationFilterList'
import getReviewersFilterList from '../graphql/queries/applicationListFilters/getReviewersFilterList'
import getStageFilterList from '../graphql/queries/applicationListFilters/getStageFilterList'
import { FilterDefinitions, GetFilterListQuery } from '../types'

const constructFilterListQuery = (query: DocumentNode, queryMethod: string) => {
  const getListQuery: GetFilterListQuery = ({ searchValue, filterListParameters }) => {
    const { templateCode = '' } = filterListParameters || {}
    return {
      query,
      variables: {
        searchValue,
        templateCode,
      },
      resultExtractor: (resultQuery) => ({
        list: resultQuery?.[queryMethod]?.nodes || [],
        totalCount: resultQuery?.[queryMethod]?.totalCount || 0,
      }),
    }
  }
  return getListQuery
}

export const APPLICATION_FILTERS: FilterDefinitions = {
  lastActiveDate: {
    type: 'date',
    title: '',
  },
  isFullyAssignedLevel1: {
    type: 'boolean',
    title: 'Assignment Status',
    options: {
      booleanMapping: {
        true: 'Fully Assigned',
        false: 'Not Fully Assigned',
      },
    },
  },
  // reviewersAssignedCount: {
  //   type: 'number',
  // },
  type: {
    type: 'equals',
    options: { substituteColumnName: 'templateCode' },
  },
  status: {
    type: 'enumList',
    title: 'Status',
    options: { enumList: Object.values(ApplicationStatus) },
  },
  outcome: {
    type: 'enumList',
    title: 'Outcome',
    options: { enumList: Object.values(ApplicationOutcome) },
  },
  orgName: {
    type: 'searchableListIn',
    title: 'Organisation',
    options: {
      getListQuery: constructFilterListQuery(
        getOrganisationFilterList,
        'applicationListFilterOrganisation'
      ),
    },
  },
  stage: {
    type: 'staticList',
    title: 'Stage',
    options: {
      getListQuery: constructFilterListQuery(getStageFilterList, 'applicationListFilterStage'),
    },
  },
  search: {
    type: 'search',
    options: {
      orFieldNames: ['name', 'applicant', 'orgName', 'templateName', 'stage'],
    },
  },
  applicant: {
    type: 'searchableListIn',
    title: 'Applicant',
    options: {
      getListQuery: constructFilterListQuery(
        getApplicantFilterList,
        'applicationListFilterApplicant'
      ),
    },
  },
  reviewers: {
    type: 'searchableListInArray',
    title: 'Reviewer',
    options: {
      getListQuery: constructFilterListQuery(
        getReviewersFilterList,
        'applicationListFilterReviewer'
      ),
    },
  },
  assigner: {
    type: 'searchableListInArray',
    title: 'Assigner',
    options: {
      getListQuery: constructFilterListQuery(
        getAssignerFilterList,
        'applicationListFilterAssigner'
      ),
    },
  },
  reviewerAction: {
    type: 'enumList',
    title: 'Reviewer Action',
    options: { enumList: Object.values(ReviewerAction) },
  },
  assignerAction: {
    type: 'enumList',
    title: 'Assigner Action',
    options: { enumList: Object.values(AssignerAction) },
  },
}
