import {
  ApplicationListShape,
  ApplicationResponse,
  ApplicationStatus,
  Decision,
  PermissionPolicyType,
  ReviewAssignmentStatus,
  ReviewDecision,
  ReviewQuestionAssignment,
  ReviewResponse,
  ReviewResponseDecision,
  ReviewStatus,
  TemplateElementCategory,
  User as GraphQLUser,
  Organisation as GraphQLOrg,
  Filter,
  Application,
} from './generated/graphql'

import { ValidationState } from '../formElementPlugins/types'
import { EvaluatorNode } from '@openmsupply/expression-evaluator/lib/types'
import { SemanticICONS } from 'semantic-ui-react/dist/commonjs/generic'
import { DocumentNode } from '@apollo/client'

export {
  ApplicationDetails,
  ApplicationElementStates,
  ApplicationListRow,
  ApplicationProps,
  AssignmentDetails,
  CellProps,
  ChangeRequestsProgress,
  ColumnDetails,
  ContextApplicationState,
  CurrentPage,
  DecisionOption,
  ElementBase,
  ElementsById,
  ElementPluginParameterValue,
  ElementPluginParameters,
  ElementState,
  EvaluatorNode,
  EvaluatorParameters,
  FullStructure,
  LooseString,
  MethodRevalidate,
  MethodToCallProps,
  Page,
  PageElement,
  ApplicationProgress,
  ResponseFull,
  ResponsesByCode,
  ReviewAction,
  ReviewDetails,
  ReviewProgress,
  ConsolidationProgress,
  ReviewQuestion,
  ReviewSectionComponentProps,
  SectionAndPage,
  SectionDetails,
  SectionAssignment,
  SectionState,
  SectionsStructure,
  SetStrictSectionPage,
  SortQuery,
  StageAndStatus,
  TemplateDetails,
  TemplateCategoryDetails,
  TemplatePermissions,
  TemplateInList,
  TemplatesDetails,
  UseGetApplicationProps,
  User,
  UseGetReviewStructureForSectionProps,
  OrganisationSimple,
  Organisation,
  LoginPayload,
  BasicStringObject,
}

interface ApplicationDetails {
  id: number
  template: TemplateDetails
  serial: string
  name: string
  outcome: string
  isLinear: boolean
  isChangeRequest: boolean
  current: StageAndStatus
  firstStrictInvalidPage: SectionAndPage | null
  submissionMessage?: string
  startMessage?: string
  user?: GraphQLUser
  org?: GraphQLOrg
  config?: any
}

interface ApplicationElementStates {
  [key: string]: ElementState
}

interface ApplicationListRow extends ApplicationListShape {
  isExpanded: boolean
}

interface ApplicationProps {
  structure: FullStructure
  requestRevalidation?: MethodRevalidate
  strictSectionPage?: SectionAndPage | null
}

interface ApplicationStage {
  id: number
  name: string
  number: number
  colour: string
}

interface AssignmentDetails {
  id: number
  status: ReviewAssignmentStatus | null
  timeUpdated: Date
  level: number
  reviewerId?: number
  review: ReviewDetails | null
  reviewer: GraphQLUser
  totalAssignedQuestions: number
  stage: ApplicationStage
  reviewQuestionAssignments: ReviewQuestionAssignment[]
  isCurrentUserAssigner: boolean
  assignableSectionRestrictions: (string | null)[]
  isCurrentUserReviewer: boolean
}

interface BasicStringObject {
  [key: string]: string
}

interface CellProps {
  application: ApplicationListShape
}

interface ColumnDetails {
  headerName: string
  sortName: string
  ColumnComponent: React.FunctionComponent<any>
}

interface ContextApplicationState {
  id: number | null
  serialNumber: string | null
  inputElementsActivity: ElementsActivityState
}

interface CurrentPage {
  section: SectionDetails
  page: number
}

type DecisionOption = {
  code: Decision
  title: string
  isVisible: boolean
  value: boolean
}

type ElementPluginParameterValue = string | number | string[] | EvaluatorNode

interface ElementPluginParameters {
  [key: string]: ElementPluginParameterValue
}

export type ElementForEvaluation = {
  isEditableExpression?: EvaluatorNode
  isRequiredExpression?: EvaluatorNode
  isVisibleExpression?: EvaluatorNode
  validationExpression?: EvaluatorNode
  defaultValueExpression?: EvaluatorNode
  code: string
}

interface ElementBase extends ElementForEvaluation {
  id: number
  title: string
  pluginCode: string
  sectionIndex: number
  sectionCode: string
  elementIndex: number
  page: number
  category: TemplateElementCategory
  validationMessage: string | null
  helpText: string | null
  parameters: any
}

export type EvaluatedElement = {
  isEditable: boolean
  isRequired: boolean
  isVisible: boolean
  isValid: boolean | undefined
  defaultValue: any
}

export type EvaluationOptions = (keyof EvaluatedElement)[]

type ElementState = ElementBase & EvaluatedElement

interface ElementsActivityState {
  elementEnteredTimestamp: number
  elementLostFocusTimestamp: number
  elementsStateUpdatedTimestamp: number
  areTimestampsInSequence: boolean
}

interface EvaluatorParameters {
  objects?: { [key: string]: any }
  pgConnection?: any // Any, because not likely to be used in front-end
  graphQLConnection?: IGraphQLConnection
  APIfetch?: Function
}

type ElementsById = { [templateElementId: string]: PageElement }

interface FullStructure {
  thisReview?: ReviewDetails | null
  elementsById?: ElementsById
  lastValidationTimestamp?: number
  attemptSubmission: boolean
  info: ApplicationDetails
  sections: SectionsStructure
  stages: StageDetails[]
  responsesByCode?: ResponsesByCode
  firstIncompleteReviewPage?: SectionAndPage
  canSubmitReviewAs?: Decision | null
  sortedSections?: SectionState[]
  sortedPages?: Page[]
}

interface IGraphQLConnection {
  fetch: Function
  endpoint: string
}

type LooseString = string | null | undefined

interface MethodRevalidate {
  (methodToCall: (props: MethodToCallProps) => void): void
}

interface MethodToCallProps {
  firstStrictInvalidPage: SectionAndPage | null
  setStrictSectionPage: SetStrictSectionPage
}

interface Page {
  number: number
  sectionCode: string
  name: string
  progress: ApplicationProgress
  reviewProgress?: ReviewProgress
  consolidationProgress?: ConsolidationProgress
  changeRequestsProgress?: ChangeRequestsProgress
  state: PageElement[]
}

type PageElement = {
  element: ElementState
  response: ResponseFull | null
  previousApplicationResponse: ApplicationResponse
  latestApplicationResponse: ApplicationResponse
  lowerLevelReviewLatestResponse?: ReviewResponse
  lowerLevelReviewPreviousResponse?: ReviewResponse
  thisReviewLatestResponse?: ReviewResponse
  thisReviewPreviousResponse?: ReviewResponse
  latestOriginalReviewResponse?: ReviewResponse
  previousOriginalReviewResponse?: ReviewResponse
  isNewApplicationResponse?: boolean
  review?: ReviewQuestionDecision
  isPendingReview?: boolean
  reviewQuestionAssignmentId: number
  isAssigned?: boolean
  isChangeRequest?: boolean
  isChanged?: boolean
  isActiveReviewResponse?: boolean
}

interface ApplicationProgress {
  doneRequired: number
  doneNonRequired: number
  completed: boolean
  totalRequired: number
  totalNonRequired: number
  totalSum: number
  valid: boolean
  firstStrictInvalidPage: number | null
}

interface ResponseFull {
  id: number
  text: string | null | undefined
  optionIndex?: number
  isValid?: boolean | null
  hash?: string // Used in Password plugin
  files?: any[] // Used in FileUpload plugin
  other?: string // Used in RadioChoice plugin
  selection?: any // Used in Dropdown/Radio selectors
  code?: string // Used in ListBuilder
  list?: any // Used in ListBuilder
  timeCreated?: Date
  reviewResponse?: ReviewResponse
  customValidation?: ValidationState
}

interface ResponsesByCode {
  [key: string]: ResponseFull
}

type ReviewSectionComponentProps = {
  fullStructure: FullStructure
  section: SectionState
  assignment: AssignmentDetails
  thisReview?: ReviewDetails | null
  action: ReviewAction
  isAssignedToCurrentUser: boolean
  isConsolidation: boolean
}

interface ReviewDetails {
  id: number
  status: ReviewStatus
  timeStatusCreated?: Date
  stage: ApplicationStage
  isLastLevel: boolean
  level: number
  reviewDecision?: ReviewDecision | null
}

interface ReviewQuestion {
  code: string
  responseId: number
  id: number
  sectionIndex: number
}

interface ReviewQuestionDecision {
  id: number
  comment?: string | null
  decision?: ReviewResponseDecision | null
}

type SectionAndPage = {
  sectionCode: string
  pageNumber: number
}

interface SectionDetails {
  id: number
  index: number
  code: string
  title: string
  totalPages: number
}

interface BaseReviewProgress {
  totalReviewable: number
  totalPendingReview: number
  totalActive: number // review or application responses that are in progress (as oppose to awaiting review to be started)
}

interface ReviewProgress extends BaseReviewProgress {
  doneConform: number
  doneNonConform: number
  doneNewReviewable: number
  totalNewReviewable: number
}

interface ConsolidationProgress extends BaseReviewProgress {
  doneAgreeConform: number
  doneAgreeNonConform: number
  doneDisagree: number
  doneActiveDisagree: number
  doneActiveAgreeConform: number
  doneActiveAgreeNonConform: number
  totalConform: number
  totalNonConform: number
}

// TODO: Maybe better to replace with combined actions from ReviewerAction and AssignerAction
enum ReviewAction {
  canContinue = 'CAN_CONTINUE',
  canView = 'CAN_VIEW',
  canReReview = 'CAN_RE_REVIEW',
  canSelfAssign = 'CAN_SELF_ASSIGN',
  canSelfAssignLocked = 'CAN_SELF_ASSIGN_LOCKED',
  canStartReview = 'CAN_START_REVIEW',
  canContinueLocked = 'CAN_CONTINUE_LOCKED',
  canUpdate = 'CAN_UPDATE',
  unknown = 'UNKNOWN',
}

interface ChangeRequestsProgress {
  totalChangeRequests: number
  doneChangeRequests: number
}

interface SectionAssignment {
  action: ReviewAction
  isAssignedToCurrentUser: boolean
  isConsolidation: boolean
  isReviewable: boolean
}

interface SectionState {
  details: SectionDetails
  progress?: ApplicationProgress
  reviewProgress?: ReviewProgress
  consolidationProgress?: ConsolidationProgress
  assignment?: SectionAssignment
  changeRequestsProgress?: ChangeRequestsProgress
  pages: {
    [pageNum: number]: Page
  }
}

interface SectionsStructure {
  [code: string]: SectionState
}

interface SetStrictSectionPage {
  (sectionAndPage: SectionAndPage | null): void
}

interface SortQuery {
  sortColumn?: string
  sortDirection?: 'ascending' | 'descending'
}

interface StageAndStatus {
  stage: ApplicationStage
  status: ApplicationStatus
  date: Date
}

interface StageDetails {
  number: number
  id: number
  title: string
  colour?: string
  description?: string
}

interface TemplateCategoryDetails {
  title: string
  icon: SemanticICONS | undefined
}

interface TemplateInList {
  id: number
  name: string
  code: string
  templateCategory: TemplateCategoryDetails
  permissions: PermissionPolicyType[]
  hasApplyPermission: boolean
  hasNonApplyPermissions: boolean
  filters: Filter[]
}

interface TemplateDetails {
  id: number
  name: string
  code: string
  elementsIds?: number[] // TODO: Change to not optional after re-structure
  elementsDefaults?: EvaluatorNode[]
  sections?: SectionDetails[] // TODO: Change to not optional after re-structure
  startMessage?: string
}

interface TemplatePermissions {
  [index: string]: Array<PermissionPolicyType>
}

type TemplatesDetails = {
  permissions: Array<PermissionPolicyType>
  name: string
  code: string
}[]

interface UseGetApplicationProps {
  serialNumber: string
  currentUser: User
  sectionCode?: string
  page?: number
  networkFetch?: boolean
  isApplicationReady?: boolean
  setApplicationState?: Function
}

interface User {
  userId: number
  firstName: string
  lastName?: string | null
  username: string
  email: string
  dateOfBirth?: Date | null
  organisation?: Organisation
  sessionId: string
}

interface OrganisationSimple {
  orgId: number
  userRole: string | null
  orgName: string
}

interface Organisation extends OrganisationSimple {
  registration: string
  address: string
  logoUrl: string
}

interface LoginPayload {
  success?: boolean
  user: User
  JWT: string
  templatePermissions: TemplatePermissions
  orgList?: OrganisationSimple[]
}

interface UseGetReviewStructureForSectionProps {
  fullApplicationStructure: FullStructure
  reviewAssignment: AssignmentDetails
  filteredSectionIds?: number[]
  awaitMode?: boolean
}

interface SortQuery {
  sortColumn?: string
  sortDirection?: 'ascending' | 'descending'
}

// Outcomes Display Related

export type OutcomeDisplay = {
  code: string
  detailColumnName: string
  pluralTableName: string
  tableName: string
  title: string
}

export type OutcomeDisplays = OutcomeDisplay[]

export type TableDisplay = {
  columnName: string
  isTextColumn: boolean
  title: string
}

export type TableDisplaysByCode = {
  [code: string]: TableDisplay[]
}

export type DetailDisplay = {
  columnName: string
  elementTypePluginCode: string
  isTextColumn: boolean
  title: string
  parameters: object
}

export type DetailDisplaysByCode = {
  [code: string]: DetailDisplay[]
}

export type GenericNode = {
  [field: string]: object | string
}

export type TableQueryResult = { [queryName: string]: { nodes: GenericNode[] } }

export type TableDisplayQuery = {
  query: DocumentNode
  getNodes: (queryResult: TableQueryResult) => GenericNode[]
}

export type TableDisplaysQueryByCode = {
  [code: string]: TableDisplayQuery
}

export type DetailQueryResult = { [queryName: string]: GenericNode }

export type DetailDisplayQuery = {
  query: DocumentNode
  getNode: (queryResult: DetailQueryResult) => GenericNode
}

export type DetailDisplayQueryByCode = {
  [code: string]: DetailDisplayQuery
}

export type ApplicationLinkQueryResult = {
  [tableName: string]: {
    [applicationJoin: string]: {
      nodes: {
        application: Application
      }[]
    }
  }
}

export type ApplicationLinkQuery = {
  query: DocumentNode
  getApplications: (queryResult: ApplicationLinkQueryResult) => {
    name: string
    serial: string
    templateName: string
  }[]
}

export type ApplicationLinkQueryByCode = {
  [code: string]: ApplicationLinkQuery
}

export type OutcomeCountQueryResult = {
  [tableName: string]: { totalCount: number }
}

export type OutcomeCountQuery = {
  query: DocumentNode
  getCount: (queryResult: OutcomeCountQueryResult) => number
}

export type OutcomeCountQueryByCode = {
  [code: string]: OutcomeCountQuery
}

export type OutcomeDisplaysStructure = {
  outcomeDisplays: OutcomeDisplays
  tableDisplaysByCode: TableDisplaysByCode
  detailDisplaysByCode: DetailDisplaysByCode
  tableDisplayQueryByCode: TableDisplaysQueryByCode
  detailDisplayQueryByCode: DetailDisplayQueryByCode
  outcomeCountQueryByCode: OutcomeCountQueryByCode
  applicationLinkQueryByCode: ApplicationLinkQueryByCode
}
