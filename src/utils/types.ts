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
} from './generated/graphql'

import { ValidationState } from '../formElementPlugins/types'
import { IQueryNode } from '@openmsupply/expression-evaluator/lib/types'

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
  EvaluatorParameters,
  FullStructure,
  LooseString,
  MethodRevalidate,
  MethodToCallProps,
  Page,
  PageElement,
  Progress,
  ResponseFull,
  ResponsesByCode,
  ReviewAction,
  ReviewDetails,
  ReviewProgress,
  ReviewQuestion,
  ReviewSectionComponentProps,
  SectionAndPage,
  SectionDetails,
  SectionProgress,
  SectionState,
  SectionsStructure,
  SetStrictSectionPage,
  SortQuery,
  StageAndStatus,
  TemplateDetails,
  TemplateElementState,
  TemplatePermissions,
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
  type: string
  serial: string
  name: string
  outcome: string
  isLinear: boolean
  isChangeRequest: boolean
  current: StageAndStatus
  firstStrictInvalidPage: SectionAndPage | null
  submissionMessage?: string // TODO: Change to compulsory after re-structure is finished
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

type ElementPluginParameterValue = string | number | string[] | IQueryNode

interface ElementPluginParameters {
  [key: string]: ElementPluginParameterValue
}

interface ElementBase {
  id: number
  code: string
  title: string
  pluginCode: string
  sectionIndex: number
  sectionCode: string
  elementIndex: number
  page: number
  category: TemplateElementCategory
  validationExpression: IQueryNode
  validationMessage: string | null
  parameters: any
}

interface ElementState extends ElementBase {
  isEditable: boolean
  isRequired: boolean
  isVisible: boolean
}

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
  progress: Progress
  reviewProgress?: ReviewProgress
  changeRequestsProgress?: ChangeRequestsProgress
  state: PageElement[]
}

type PageElement = {
  element: ElementState
  response: ResponseFull | null
  previousApplicationResponse: ApplicationResponse
  latestApplicationResponse: ApplicationResponse
  thisReviewLatestResponse?: ReviewResponse
  isNewApplicationResponse?: boolean
  review?: ReviewQuestionDecision
  assignmentId: number
  isAssigned?: boolean
  isChangeRequest?: boolean
  isChanged?: boolean
}

interface Progress {
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

interface ReviewerDetails {
  id: number
  firstName: string
  lastName: string
  current: boolean
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
interface SectionProgress {
  total: number
  done: number
  completed: boolean
  valid: boolean
  linkedPage: number
}

interface ReviewProgress {
  totalReviewable: number
  doneConform: number
  doneNonConform: number
  doneNewReviewable: number
  totalNewReviewable: number
}
enum ReviewAction {
  canContinue = 'CAN_CONTINUE',
  canView = 'CAN_VIEW',
  canReReview = 'CAN_RE_REVIEW',
  canSelfAssign = 'CAN_SELF_ASSIGN',
  canStartReview = 'CAN_START_REVIEW',
  canContinueLocked = 'CAN_CONTINUE_LOCKED',
  canUpdate = 'CAN_UPDATE',
  unknown = 'UNKNOWN',
}

interface ChangeRequestsProgress {
  totalChangeRequests: number
  doneChangeRequests: number
}

interface SectionState {
  details: SectionDetails
  progress?: Progress
  reviewProgress?: ReviewProgress
  reviewAction?: {
    action: ReviewAction
    isAssignedToCurrentUser: boolean
    isReviewable: boolean
  }
  changeRequestsProgress?: ChangeRequestsProgress
  assigned?: ReviewerDetails
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
  description?: string
}

interface TemplateDetails {
  id: number
  name: string
  code: string
  elementsIds?: number[] // TODO: Change to not optional after re-structure
  sections?: SectionDetails[] // TODO: Change to not optional after re-structure
  startMessage?: string
}

interface TemplateElementState extends ElementBase {
  isRequiredExpression: IQueryNode
  isVisibleExpression: IQueryNode
  isEditableExpression: IQueryNode
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
