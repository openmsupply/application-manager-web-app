import React from 'react'
import { Button, Container, Grid, Icon, Sticky } from 'semantic-ui-react'
import {
  MethodRevalidate,
  MethodToCallProps,
  SectionAndPage,
  SectionDetails,
  SectionsStructureNEW,
} from '../../utils/types'
import strings from '../../utils/constants'
import { useRouter } from '../../utils/hooks/useRouter'
import { FixedOffsetZone } from 'luxon'

interface NavigationProps {
  current: SectionAndPage
  isLinear: boolean
  sections: SectionsStructureNEW
  serialNumber: string
  requestRevalidation: MethodRevalidate
}

const Navigation: React.FC<NavigationProps> = ({
  current,
  isLinear,
  sections,
  serialNumber,
  requestRevalidation,
}) => {
  const { push } = useRouter()

  const currentSectionDetails = sections[current.sectionCode].details

  const nextSections = Object.values(sections)
    .filter(({ details: { index } }) => index > currentSectionDetails.index)
    .sort(({ details: { index: aIndex } }, { details: { index: bIndex } }) => aIndex - bIndex)
  const nextSection = nextSections.length > 0 ? nextSections[0].details : null

  const previousSections = Object.values(sections)
    .filter(({ details: { index } }) => index < currentSectionDetails.index)
    .sort(({ details: { index: aIndex } }, { details: { index: bIndex } }) => bIndex - aIndex)
  const previousSection = previousSections.length > 0 ? previousSections[0].details : null

  const isFirstPage = current.pageNumber - 1 === 0 && previousSection == null
  const isLastPage =
    current.pageNumber + 1 > currentSectionDetails.totalPages && nextSection == null

  const getPreviousSectionPage = (): SectionAndPage => {
    const { sectionCode, pageNumber } = current
    if (pageNumber > 1) return { sectionCode, pageNumber: pageNumber - 1 }
    return {
      sectionCode: (previousSection as SectionDetails).code,
      pageNumber: (previousSection as SectionDetails).totalPages,
    }
  }

  const getNextSectionPage = (): SectionAndPage => {
    const { sectionCode, pageNumber } = current
    if (pageNumber < currentSectionDetails.totalPages)
      return { sectionCode, pageNumber: pageNumber + 1 }
    return {
      sectionCode: (nextSection as SectionDetails).code,
      pageNumber: 1,
    }
  }

  const sendToPage = (sectionPage: SectionAndPage) => {
    const { sectionCode, pageNumber } = sectionPage
    push(`/application/${serialNumber}/${sectionCode}/Page${pageNumber}`)
  }

  const previousButtonHandler = () => {
    const previousSectionPage = getPreviousSectionPage()
    sendToPage(previousSectionPage)
  }

  const nextPageButtonHandler = () => {
    const nextSectionPage = getNextSectionPage()
    if (!isLinear) {
      sendToPage(nextSectionPage)
      return
    }

    // Use validationMethod to check if can change to page (on linear application) OR
    // display current page with strict validation
    requestRevalidation(({ firstStrictInvalidPage, setStrictSectionPage }: MethodToCallProps) => {
      if (
        firstStrictInvalidPage !== null &&
        current.sectionCode === firstStrictInvalidPage.sectionCode &&
        current.pageNumber === firstStrictInvalidPage.pageNumber
      ) {
        setStrictSectionPage(firstStrictInvalidPage)
      } else {
        setStrictSectionPage(null)
        sendToPage(nextSectionPage)
      }
    })
  }

  const summaryButtonHandler = () => {
    requestRevalidation(({ firstStrictInvalidPage, setStrictSectionPage }: MethodToCallProps) => {
      if (firstStrictInvalidPage) {
        setStrictSectionPage(firstStrictInvalidPage)
        sendToPage(firstStrictInvalidPage)
      } else push(`/application/${serialNumber}/summary`)
    })
  }

  return (
    <Container
      style={{
        background: 'white',
        position: 'fixed',
        bottom: 65,
        left: 0,
        right: 0,
        boxShadow: '0px -6px 3px -3px #AAAAAA',
        paddingTop: 10,
      }}
    >
      <div style={{ display: 'flex' }}>
        <div
          style={{
            flexGrow: 1,
            display: 'flex',
            justifyContent: isFirstPage ? 'flex-end' : 'space-between',
            paddingLeft: 30,
            paddingRight: 30,
          }}
        >
          {isFirstPage ? null : (
            <Button
              style={{
                background: 'none',
                letterSpacing: 1.4,
                color: '#003BFE',
                border: 'none',
                borderRadius: 8,
                textTransform: 'capitalize',
              }}
              icon
              onClick={previousButtonHandler}
              content={strings.BUTTON_PREVIOUS}
            >
              {' '}
              <Icon name="angle left" /> {strings.BUTTON_PREVIOUS}{' '}
            </Button>
          )}
          {isLastPage ? null : (
            <Button
              style={{
                background: 'none',
                color: '#003BFE',
                letterSpacing: 1.4,
                border: 'none',
                borderRadius: 8,
                textTransform: 'capitalize',
              }}
              icon
              onClick={nextPageButtonHandler}
            >
              {strings.BUTTON_NEXT} <Icon name="angle right" />
            </Button>
          )}
        </div>

        <Button
          style={{ alignSelf: 'flex-end', marginRight: 30 }}
          color="blue"
          onClick={summaryButtonHandler}
          content={strings.BUTTON_SUMMARY}
        />
      </div>
    </Container>
  )
}

export default Navigation
