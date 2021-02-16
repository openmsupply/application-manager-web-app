import React from 'react'
import { Container, Header } from 'semantic-ui-react'
import useLoadTemplate from '../utils/hooks/useLoadTemplate'
import { useRouter } from '../utils/hooks/useRouter'

type TParams = { templateId: string; step?: string }

const Template: React.FC = () => {
  const { templateActions } = useLoadTemplate({ templateCode: 'UserRegistration' })
  const { query } = useRouter()
  const { templateId, step } = query

  console.log(templateActions)
  return (
    <Container text>
      <Header as="h1" content="Template Builder" />
      <Header
        as="h2"
        content={`This is the ${step} step of creating/editing the template code: ${templateId}`}
      />
    </Container>
  )
}
export default Template
