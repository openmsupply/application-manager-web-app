import React from 'react'
import { Accordion, Container, Grid, Header, Icon, Label, List, Sticky } from 'semantic-ui-react'
import strings from '../../utils/constants'
import { checkPageIsAccessible } from '../../utils/helpers/structure'
import { useRouter } from '../../utils/hooks/useRouter'
import {
  FullStructure,
  MethodRevalidate,
  MethodToCallProps,
  PageNEW,
  Progress,
  SectionAndPage,
} from '../../utils/types'

interface ProgressBarProps {
  structure: FullStructure
  requestRevalidation: MethodRevalidate
  strictSectionPage: SectionAndPage | null
}

const ProgressBarNEW: React.FC<ProgressBarProps> = ({
  structure,
  requestRevalidation,
  strictSectionPage,
}) => {
  const {
    info: { isLinear },
    sections,
  } = structure

  const {
    query: { sectionCode: currentSectionCode, page },
    push,
  } = useRouter()

  const activeIndex =
    Object.values(sections).findIndex(({ details }) => details.code === currentSectionCode) || 0

  const handleChangeToPage = (sectionCode: string, pageNumber: number) => {
    if (!isLinear) {
      push(`/application/${structure.info.serial}/${sectionCode}/Page${pageNumber}`)
      return
    }

    // Use validationMethod to check if can change to page (on linear application) OR
    // display current page with strict validation
    requestRevalidation(({ firstStrictInvalidPage, setStrictSectionPage }: MethodToCallProps) => {
      if (!firstStrictInvalidPage) {
        setStrictSectionPage(null)
        push(`/application/${structure.info.serial}/${sectionCode}/Page${pageNumber}`)
        return
      }
      if (
        checkPageIsAccessible({
          fullStructure: structure,
          firstIncomplete: firstStrictInvalidPage,
          current: { sectionCode, pageNumber },
        })
      ) {
        setStrictSectionPage(null)
        push(`/application/${structure.info.serial}/${sectionCode}/Page${pageNumber}`)
      } else {
        setStrictSectionPage(firstStrictInvalidPage)
        push(
          `/application/${structure.info.serial}/${firstStrictInvalidPage.sectionCode}/Page${firstStrictInvalidPage.pageNumber}`
        )
      }
    })
  }

  const getPageList = (
    sectionCode: string,
    pages: { [pageNumber: string]: PageNEW },
    isStrictSection: boolean
  ) => {
    const isActivePage = (sectionCode: string, pageNumber: number) =>
      currentSectionCode === sectionCode && Number(page) === pageNumber

    const checkPageIsStrict = (pageNumber: string) =>
      isStrictSection && strictSectionPage?.pageNumber === Number(pageNumber)

    return (
      <List
        link
        style={{ paddingLeft: '50px' }}
        items={Object.entries(pages).map(([number, { name: pageName, progress }]) => ({
          key: `ProgressSection_${sectionCode}_${number}`,
          active: isActivePage(sectionCode, Number(number)),
          as: 'a',
          icon: progress ? getIndicator(progress, checkPageIsStrict(number)) : null,
          content: pageName,
          onClick: () => handleChangeToPage(sectionCode, Number(number)),
        }))}
      />
    )
  }

  // We want to show three states:
  // error -> if at least one error or if not completed and strict
  // success -> if completed and valid
  // empty circle with number -> if none of the above and section (has step), also add key
  // or empty circle -> if none of the above
  const getIndicator = (progress: Progress, isStrict: boolean, step?: number) => {
    const { completed, valid } = progress
    const isStrictlylInvalid = !valid || (isStrict && !completed)
    const size = step ? 'large' : 'small'

    if (isStrictlylInvalid) return <Icon name={'exclamation circle'} color={'red'} size={size} />
    if (completed && valid) return <Icon name={'check circle'} color={'green'} size={size} />

    return step ? (
      <Label circular as="a" basic color="blue" key={`progress_${step}`}>
        {step}
      </Label>
    ) : (
      <Icon name="circle outline" />
    )
  }

  const sectionsList = Object.values(sections).map(({ details, progress, pages }, index) => {
    const isStrictSection = !!strictSectionPage && strictSectionPage.sectionCode === details.code

    const stepNumber = index + 1
    const { code, title } = details
    return {
      key: `progress_${stepNumber}`,
      title: {
        children: (
          <Grid>
            <Grid.Column width={4} textAlign="right" verticalAlign="middle">
              {progress && getIndicator(progress, isStrictSection, stepNumber)}
            </Grid.Column>
            <Grid.Column width={12} textAlign="left" verticalAlign="middle">
              <Header as="h4">{title}</Header>
            </Grid.Column>
          </Grid>

          // OR:
          // <div>
          //   {progress && getIndicator(progress, stepNumber)}
          //   <Label basic disabled={isSectionDisabled(index)} content={title} />
          // </div>
        ),
      },
      onTitleClick: () => handleChangeToPage(code, 1),
      content: {
        content: getPageList(code, pages, isStrictSection),
      },
    }
  })

  return (
    <Sticky as={Container}>
      <Header as="h5" style={{ paddingLeft: 30 }}>
        {strings.TITLE_INTRODUCTION}
      </Header>
      <Accordion activeIndex={activeIndex} panels={sectionsList} />
    </Sticky>
  )
}

export default ProgressBarNEW
