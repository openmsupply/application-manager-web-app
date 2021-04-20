import React, { CSSProperties, useEffect } from 'react'
import { Grid, Header, Segment } from 'semantic-ui-react'
import {
  FullStructure,
  SectionAndPage,
  MethodRevalidate,
  ApplicationProps,
} from '../../utils/types'
import { Loading, Navigation, PageElements, ProgressBar } from '../../components'
import { useUserState } from '../../contexts/UserState'
import { ApplicationStatus } from '../../utils/generated/graphql'
import { checkPageIsAccessible } from '../../utils/helpers/structure'
import { useRouter } from '../../utils/hooks/useRouter'
import strings from '../../utils/constants'

const ApplicationPage: React.FC<ApplicationProps> = ({
  structure: fullStructure,
  requestRevalidation,
  strictSectionPage,
}) => {
  const {
    userState: { currentUser },
  } = useUserState()
  const {
    query: { serialNumber, sectionCode, page },
    push,
    replace,
  } = useRouter()

  const pageNumber = Number(page)

  useEffect(() => {
    if (!fullStructure) return

    // Re-direct based on application status
    if (fullStructure.info.current?.status !== ApplicationStatus.Draft)
      replace(`/application/${fullStructure.info.serial}`)

    // Re-direct if trying to access page higher than allowed
    if (!fullStructure.info.isLinear || !fullStructure.info?.firstStrictInvalidPage) return
    const firstIncomplete = fullStructure.info?.firstStrictInvalidPage
    const current = { sectionCode, pageNumber }
    if (!checkPageIsAccessible({ fullStructure, firstIncomplete, current })) {
      const { sectionCode, pageNumber } = firstIncomplete
      push(`/application/${fullStructure.info.serial}/${sectionCode}/Page${pageNumber}`)
    }
  }, [fullStructure, sectionCode, page])

  if (!fullStructure || !fullStructure.responsesByCode) return <Loading />

  const {
    info: { isLinear, current },
  } = fullStructure

  return (
    <>
      <Header
        as="h1"
        textAlign="center"
        // style={inlineStyles.title}
        content={currentUser?.organisation?.orgName || strings.TITLE_NO_ORGANISATION}
      />
      <Grid stackable style={inlineStyles.grid}>
        <Grid.Column width={4}>
          <ProgressBar
            structure={fullStructure}
            requestRevalidation={requestRevalidation as MethodRevalidate}
            strictSectionPage={strictSectionPage as SectionAndPage}
          />
        </Grid.Column>
        <Grid.Column width={10} stretched>
          <Segment vertical style={{ marginBottom: 20 }}>
            <Header content={fullStructure.sections[sectionCode].details.title} />
            <PageElements
              canEdit={current?.status === ApplicationStatus.Draft}
              elements={getCurrentPageElements(fullStructure, sectionCode, pageNumber)}
              responsesByCode={fullStructure.responsesByCode}
              applicationData={fullStructure.info}
              isStrictPage={
                sectionCode === strictSectionPage?.sectionCode &&
                pageNumber === strictSectionPage?.pageNumber
              }
            />
          </Segment>
        </Grid.Column>
        <Grid.Column width={2} />
      </Grid>
      <Navigation
        current={{ sectionCode, pageNumber }}
        isLinear={isLinear}
        sections={fullStructure.sections}
        serialNumber={serialNumber}
        requestRevalidation={requestRevalidation as MethodRevalidate}
      />
    </>
  )
}

// Styles - TODO: Move to LESS || Global class style (semantic)
const inlineStyles = {
  title: {
    color: 'rgb(150,150,150)',
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontWeight: 400,
    paddingTop: 25,
    fontSize: 24,
  } as CSSProperties,
  grid: {
    backgroundColor: 'white',
    padding: 10,
    margin: '0px 50px',
    minHeight: 500,
    flex: 1,
  } as CSSProperties,
}

export default ApplicationPage

const getCurrentPageElements = (structure: FullStructure, section: string, page: number) => {
  return structure.sections[section].pages[page].state
}
