import React from 'react'
import { Grid, Form, Image, List } from 'semantic-ui-react'
import config from '../../../config.json'
import { SummaryViewProps } from '../../types'

const host = config.serverREST

const SummaryView: React.FC<SummaryViewProps> = ({ parameters, Markdown, response }) => {
  return (
    <Form.Field required={parameters.isRequired}>
      <label style={{ color: 'black' }}>
        <Markdown text={parameters.label} semanticComponent="noParagraph" />
      </label>
      <Markdown text={parameters.description} />
      <List horizontal verticalAlign="top">
        {response?.files &&
          response.files.map((file) => (
            <List.Item key={file.filename} style={{ maxWidth: 150 }}>
              <Grid verticalAlign="top" celled style={{ boxShadow: 'none' }}>
                <Grid.Row centered style={{ boxShadow: 'none' }} verticalAlign="top">
                  <a href={host + file.fileUrl} target="_blank">
                    <Image src={host + file.thumbnailUrl} style={{ maxHeight: '100px' }} />
                  </a>
                </Grid.Row>
                <Grid.Row centered style={{ boxShadow: 'none' }}>
                  <p style={{ wordBreak: 'break-word' }}>
                    <a href={host + file.fileUrl} target="_blank">
                      {file.filename}
                    </a>
                  </p>
                </Grid.Row>
              </Grid>
            </List.Item>
          ))}
      </List>
    </Form.Field>
  )
}

export default SummaryView
