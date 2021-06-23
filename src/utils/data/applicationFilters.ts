import { DocumentNode } from 'graphql'
import { DateTime, DurationObjectUnits, DurationUnit } from 'luxon'
import { today } from '../dateAndTime/parseDateRange'
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
import { FilterDefinitions, GetFilterListQuery, NamedDates } from '../types'

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

type GetDateRangeForUnit = (unit: keyof DurationObjectUnits, value?: number) => [DateTime, DateTime]

const getDateRangeForUnit: GetDateRangeForUnit = (unit, value = 0) => {
  if (value === 0) return [today().startOf(unit), today().endOf(unit).startOf('day')]

  return [
    today()
      [value < 0 ? 'minus' : 'plus']({ [unit]: Math.abs(value) })
      .startOf(unit),
    today()
      [value < 0 ? 'minus' : 'plus']({ [unit]: Math.abs(value) })
      .endOf(unit)
      .startOf('day'),
  ]
}

const NAMED_DATE_RANGES: NamedDates = {
  today: { getDates: () => [today(), today()], title: 'Today' },
  yesterday: {
    getDates: () => getDateRangeForUnit('day', -1),
    title: 'Yesterday',
  },
  'this-week': {
    getDates: () => getDateRangeForUnit('week'),
    title: 'This Week',
  },
  'last-week': {
    getDates: () => getDateRangeForUnit('week', -1),
    title: 'Last Week',
  },
  'this-month': {
    getDates: () => getDateRangeForUnit('month'),
    title: 'This Month',
  },
  'last-month': {
    getDates: () => getDateRangeForUnit('month', -1),

    title: 'Last Month',
  },
  'next-month': {
    getDates: () => getDateRangeForUnit('month', 1),
    title: 'Next Month',
  },
  'this-year': {
    getDates: () => getDateRangeForUnit('year'),
    title: 'This Year',
  },
  'last-year': {
    getDates: () => getDateRangeForUnit('year', -1),
    title: 'Last Year',
  },
  'next-year': {
    getDates: () => getDateRangeForUnit('year', 1),
    title: 'Next Year',
  },
}

export const APPLICATION_FILTERS: FilterDefinitions = {
  lastActiveDate: {
    type: 'date',
    title: 'Last Active',
    options: { namedDates: NAMED_DATE_RANGES },
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
  assignReviewerAssignedCount: {
    type: 'number',
  },
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
