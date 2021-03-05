import React, { useEffect } from 'react'
import { FullStructure, ResponsesByCode, ElementStateNEW } from '../../utils/types'
import useGetFullApplicationStructure from '../../utils/hooks/useGetFullApplicationStructure'
import { ApplicationStatus } from '../../utils/generated/graphql'
import { useRouter } from '../../utils/hooks/useRouter'
import { Loading, NoMatch } from '../../components'
import { SectionWrapper } from '../../components/Application'
import strings from '../../utils/constants'
import { Button, Header, Message, Container } from 'semantic-ui-react'

interface ApplicationProps {
  structure: FullStructure
}

const ApplicationSummary: React.FC<ApplicationProps> = ({ structure }) => {
  const { replace } = useRouter()
  const { error, fullStructure } = useGetFullApplicationStructure({
    structure,
  })

  useEffect(() => {
    if (!fullStructure) return
    // Re-direct if application is not valid
    if (fullStructure.info.firstStrictInvalidPage) {
      const { sectionCode, pageNumber } = fullStructure.info.firstStrictInvalidPage
      replace(`/applicationNEW/${fullStructure.info.serial}/${sectionCode}/Page${pageNumber}`)
    }
  }, [fullStructure])

  const handleSubmit = () => {}

  if (error) return <Message error header={strings.ERROR_APPLICATION_PAGE} list={[error]} />
  if (!fullStructure) return <Loading />
  const { sections, responsesByCode, info } = fullStructure
  return (
    <Container>
      <Header as="h1" content={strings.TITLE_APPLICATION_SUBMIT} />
      {Object.values(sections).map((section) => (
        <SectionWrapper
          key={`ApplicationSection_${section.details.id}`}
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
