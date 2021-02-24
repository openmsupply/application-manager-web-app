import React from 'react'
import { withRouter } from 'react-router'
import { Container, Divider, Grid, Header, Icon, Image, List, Segment } from 'semantic-ui-react'

const Footer: React.FC = () => (
  <Segment inverted vertical style={{ margin: '2em 0em 0em', padding: '2em 0em' }}>
    <Image
      circular
      centered
      size="mini"
      src="/images/logo-32x32.png"
      style={{ background: 'white', padding: 4 }}
    />
  </Segment>
)

export default Footer
