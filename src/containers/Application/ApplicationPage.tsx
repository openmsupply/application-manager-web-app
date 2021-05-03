import React, { CSSProperties, useEffect } from 'react'
import { Container, Grid, Header, Segment } from 'semantic-ui-react'
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
import usePageTitle from '../../utils/hooks/usePageTitle'
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

  usePageTitle(strings.PAGE_TITLE_APPLICATION.replace('%1', serialNumber))

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
  console.log(currentUser)
  return (
    <>
      <Container id="application-form">
        <Grid stackable className="dev-border">
          <Grid.Column width={4} id="progress-column" className="dev-border">
            <ProgressBar
              structure={fullStructure}
              requestRevalidation={requestRevalidation as MethodRevalidate}
              strictSectionPage={strictSectionPage as SectionAndPage}
            />
          </Grid.Column>
          <Grid.Column width={9} stretched id="form-column" className="dev-border">
            <Segment basic>
              <Header as="h4" content={fullStructure.sections[sectionCode].details.title} />
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
          <Grid.Column width={3} id="help-column" className="dev-border">
            Help tips go here
          </Grid.Column>
        </Grid>
      </Container>
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

export default ApplicationPage

const getCurrentPageElements = (structure: FullStructure, section: string, page: number) => {
  return structure.sections[section].pages[page].state
}
