import React, { useEffect, useState } from 'react'
import { FullStructure, ResponsesByCode, ElementStateNEW } from '../../utils/types'
import useGetFullApplicationStructure from '../../utils/hooks/useGetFullApplicationStructure'
import { ApplicationStatus } from '../../utils/generated/graphql'
import { useApplicationState } from '../../contexts/ApplicationState'
import { useUserState } from '../../contexts/UserState'
import { useRouter } from '../../utils/hooks/useRouter'
import { Loading, NoMatch } from '../../components'
import { SectionWrapper } from '../../components/Application'
import strings from '../../utils/constants'
import messages from '../../utils/messages'
import { Button, Grid, Header, Message, Segment, Sticky, Container, Form } from 'semantic-ui-react'
import { PageElements } from '../../components/Application'

interface ApplicationProps {
  structure: FullStructure
}

const ApplicationSummary: React.FC<ApplicationProps> = ({ structure }) => {
  const { push } = useRouter()
  const { error, fullStructure } = useGetFullApplicationStructure({
    structure,
  })

  useEffect(() => {
    if (!fullStructure) return
    // Re-direct if application is not valid
    if (fullStructure.info.firstStrictInvalidPage) {
      const { sectionCode, pageNumber } = fullStructure.info.firstStrictInvalidPage
      push(`/applicationNEW/${fullStructure.info.serial}/${sectionCode}/Page${pageNumber}`)
    }
  }, [fullStructure])

  const handleSubmit = () => {}

  console.log('fullStructure', fullStructure)

  if (error) return <Message error header={strings.ERROR_APPLICATION_PAGE} list={[error]} />
  if (!fullStructure) return <Loading />
  const { sections, responsesByCode, info } = fullStructure
  return (
    <Container>
      <Header as="h1" content={strings.TITLE_APPLICATION_SUBMIT} />
      {Object.values(sections).map((section) => (
        <SectionWrapper
          key={`ApplicationSection_${section.details.code}`}
          section={section}
          responsesByCode={responsesByCode as ResponsesByCode}
          serial={info.serial}
          isSummary
          canEdit={info.current?.status === ApplicationStatus.Draft}
        />
      ))}
      {info.current?.status === ApplicationStatus.Draft ? (
        <Button content={strings.BUTTON_APPLICATION_SUBMIT} onClick={handleSubmit} />
      ) : null}
      {/* <ModalWarning showModal={showModal} /> */}
    </Container>
  )
}

export default ApplicationSummary