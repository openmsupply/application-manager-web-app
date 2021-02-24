import React from 'react'
import { Loader, Segment } from 'semantic-ui-react'
import strings from '../utils/constants'

const Loading: React.FC = () => (
  <Segment basic style={{ height: '50vh' }}>
    <Loader active size="massive">
      {strings.LABEL_LOADING}
    </Loader>
  </Segment>
)

export default Loading
