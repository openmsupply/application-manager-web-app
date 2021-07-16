import React, { useRef } from 'react'
import { Accordion, Header, Icon, Sticky } from 'semantic-ui-react'
import {
  ResponsesByCode,
  SectionState,
  Page,
  ApplicationDetails,
  StageDetails,
} from '../../utils/types'
import { useUserState } from '../../contexts/UserState'
import styleConstants from '../../utils/data/styleConstants'
import { PageElements } from '../'

interface SectionProps {
  toggleSection: () => void
  extraSectionTitleContent?: (section: SectionState) => React.ReactNode
  extraPageContent?: (page: Page) => React.ReactNode
  scrollableAttachment?: (page: Page) => React.ReactNode
  section: SectionState
  responsesByCode: ResponsesByCode
  applicationData: ApplicationDetails
  stages: StageDetails[]
  isActive: boolean
  isConsolidation?: boolean
  isReview?: boolean
  isSummary?: boolean
  isUpdating?: boolean
  serial: string
  canEdit?: boolean
  isSectionInvalid?: boolean
}

const SectionWrapper: React.FC<SectionProps> = ({
  toggleSection,
  extraSectionTitleContent,
  extraPageContent,
  scrollableAttachment,
  section,
  serial,
  responsesByCode,
  applicationData,
  stages,
  isActive,
  isConsolidation = false,
  isReview = false,
  isSummary = false,
  isUpdating = false,
  canEdit = false,
  isSectionInvalid = false,
}) => {
  const { details, pages } = section
  const stickyRef = useRef(null)
  const {
    userState: { isNonRegistered },
  } = useUserState()

  const validationStateStyle = isSectionInvalid ? 'invalid-section' : ''

  return (
    <div ref={stickyRef} key={`${section.details.id}`}>
      <Accordion className={`summary-section ${validationStateStyle}`}>
        <Accordion.Title active={isActive} onClick={toggleSection}>
          <Sticky
            context={stickyRef}
            offset={!isNonRegistered ? styleConstants.HEADER_OFFSET : 0}
            bottomOffset={styleConstants.BOTTOM_OFFSET}
          >
            <div className="summary-section-header">
              <Header as="h4" content={details.title} />
              <div className="extra-content">
                {extraSectionTitleContent && extraSectionTitleContent(section)}
              </div>
              <Icon name={isActive ? 'chevron up' : 'chevron down'} className="dark-grey" />
            </div>
          </Sticky>
        </Accordion.Title>
        <Accordion.Content active={isActive}>
          {Object.values(pages).map((page) => (
            <div key={`${section.details.id}Page_${page.number}Container`} className="summary-page">
              {scrollableAttachment && scrollableAttachment(page)}
              <Header as="h6" className="summary-page-header">
                {page.name}
              </Header>
              <PageElements
                key={`${section.details.id}Page_${page.number}`}
                elements={page.state}
                responsesByCode={responsesByCode}
                applicationData={applicationData}
                stages={stages}
                serial={serial}
                sectionAndPage={{ sectionCode: details.code, pageNumber: page.number }}
                isReview={isReview}
                isConsolidation={isConsolidation}
                isSummary={isSummary}
                isUpdating={isUpdating}
                canEdit={canEdit}
              />
              {extraPageContent && extraPageContent(page)}
            </div>
          ))}
        </Accordion.Content>
      </Accordion>
    </div>
  )
}

export default SectionWrapper
