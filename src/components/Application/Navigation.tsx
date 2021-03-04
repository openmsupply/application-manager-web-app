import React from 'react'
import { Button, Segment, Sticky } from 'semantic-ui-react'
import {
  MethodRevalidate,
  MethodToCallProps,
  SectionAndPage,
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

  const getSortedPages = () => {
    const sectionPageArray: any = []
    const sortedSections = Object.values(sections).sort(
      ({ details: { index: aIndex } }, { details: { index: bIndex } }) => aIndex - bIndex
    )
    sortedSections.forEach((section) => {
      const sortedPages = Object.values(section.pages).sort(
        ({ number: aNum }, { number: bNum }) => aNum - bNum
      )
      sortedPages.forEach((page) =>
        sectionPageArray.push({ sectionCode: section.details.code, pageNumber: page.number })
      )
    })
    return sectionPageArray
  }

  const sortedSectionPages: SectionAndPage[] = getSortedPages()

  const getCurrentSectionPageIndex = () =>
    sortedSectionPages.findIndex(
      ({ sectionCode, pageNumber }: any) =>
        sectionCode === current.sectionCode && pageNumber == current.pageNumber
    )

  const isFirstPage = getCurrentSectionPageIndex() === 0
  const isLastPage = getCurrentSectionPageIndex() === sortedSectionPages.length - 1

  const getSectionPage = (offset: number) => {
    const currentSortedPageIndex = sortedSectionPages.findIndex(
      ({ sectionCode, pageNumber }) =>
        sectionCode === current.sectionCode && pageNumber == current.pageNumber
    )
    let newIndex = currentSortedPageIndex + offset
    return newIndex >= sortedSectionPages.length
      ? sortedSectionPages[sortedSectionPages.length - 1]
      : newIndex < 0
      ? sortedSectionPages[0]
      : sortedSectionPages[newIndex]
  }

  const sendToPage = (sectionPage: SectionAndPage) => {
    const { sectionCode, pageNumber } = sectionPage
    push(`/applicationNEW/${serialNumber}/${sectionCode}/Page${pageNumber}`)
  }

  const navButtonHandler = (offset: number) => {
    if (offset < 0 || !isLinear) sendToPage(getSectionPage(offset))
    else {
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
          sendToPage(getSectionPage(offset))
        }
      })
    }
  }

  return (
    <Sticky
      pushing
      style={{ backgroundColor: 'white', boxShadow: ' 0px -5px 8px 0px rgba(0,0,0,0.1)' }}
    >
      <Segment.Group horizontal>
        <Segment style={{ minWidth: '50%' }}>
          {!isFirstPage && (
            <Button
              basic
              floated="left"
              onClick={() => navButtonHandler(-1)}
              content={strings.BUTTON_PREVIOUS}
            />
          )}
          {!isLastPage && (
            <Button
              basic
              floated="right"
              onClick={() => navButtonHandler(1)}
              content={strings.BUTTON_NEXT}
            />
          )}
        </Segment>
        <Segment basic textAlign="center" clearing>
          <Button
            color="blue"
            onClick={() => {
              /* TO-DO */
            }}
            content={strings.BUTTON_SUMMARY}
          />
        </Segment>
      </Segment.Group>
    </Sticky>
  )
}

export default Navigation
