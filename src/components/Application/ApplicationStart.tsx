import { type } from 'os'
import React from 'react'
import { Button, Container, Divider, Header, Icon, List, Message, Segment } from 'semantic-ui-react'
import strings from '../../utils/constants'
import { TemplateTypePayload, TemplateSectionPayload } from '../../utils/types'
import ApplicationSelectType from './ApplicationSelectType'

export interface ApplicationStartProps {
  template: TemplateTypePayload
  sections: TemplateSectionPayload[]
  handleClick: () => void
}

const ApplicationStart: React.FC<ApplicationStartProps> = (props) => {
  const { template, sections, handleClick } = props
  const { name, startTitle, startMessage } = template

  return template ? (
    <Container text>
      <Header as="h2" textAlign="center">
        {`${name} ${strings.TITLE_APPLICATION_FORM}`}
        <Header.Subheader>{strings.TITLE_INTRODUCTION}</Header.Subheader>
      </Header>
      {template && (
        <Segment basic>
          <Header as="h5">{strings.SUBTITLE_APPLICATION_STEPS}</Header>
          <Header as="h5">{strings.TITLE_STEPS.toUpperCase()}</Header>
          <List divided relaxed>
            {sections &&
              sections.map((section) => (
                <List.Item key={`list-item-${section.code}`}>
                  <List.Icon name="circle outline" />
                  <List.Content>{section.title}</List.Content>
                </List.Item>
              ))}
          </List>
          <Divider />
          {startTitle && (
            <Message info>
              <Message.Header>
                <Icon name="info circle" />
                {startTitle}
              </Message.Header>
              {startMessage && (
                <Message.List>
                  {startMessage.split(/\r?\n/).map((str, index) => (
                    <Message.Item key={`start-item-${index}`}>{str}</Message.Item>
                  ))}
                </Message.List>
              )}
            </Message>
          )}
          <Button color="blue" onClick={handleClick}>
            {strings.BUTTON_APPLICATION_START}
          </Button>
        </Segment>
      )}
    </Container>
  ) : (
    <ApplicationSelectType />
  )
}

export default ApplicationStart
