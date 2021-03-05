import React from 'react'
import { Button, Grid, Sticky } from 'semantic-ui-react'
import {
  MethodRevalidate,
  MethodToCallProps,
  SectionAndPage,
  SectionDetails,
  SectionsStructureNEW,
} from '../../utils/types'
import strings from '../../utils/constants'
import { useRouter } from '../../utils/hooks/useRouter'

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
    push(`/applicationNEW/${serialNumber}/${sectionCode}/Page${pageNumber}`)
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

  return (
    <Sticky
      pushing
      style={{ backgroundColor: 'white', boxShadow: ' 0px -5px 8px 0px rgba(0,0,0,0.1)' }}
    >
      <Grid container>
        <Grid.Row verticalAlign="middle">
          <Grid.Column width={5}>
            <Button
              basic
              onClick={previousButtonHandler}
              content={strings.BUTTON_PREVIOUS}
              style={{ display: isFirstPage ? 'none' : 'inline-block' }}
            />
          </Grid.Column>
          <Grid.Column width={5}>
            <Button
              basic
              onClick={nextPageButtonHandler}
              content={strings.BUTTON_NEXT}
              style={{ display: isLastPage ? 'none' : 'inline-block' }}
            />
          </Grid.Column>
          <Grid.Column width={5}>
            <Button
              color="blue"
              onClick={() => {
                /* TO-DO */
              }}
              content={strings.BUTTON_SUMMARY}
            />
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </Sticky>
  )
}

export default Navigation
