import React from 'react'
import { Container, Divider, Grid, Header, Icon, Image, List, Segment } from 'semantic-ui-react'

const Footer: React.FC = () => (
  <Container style={{ position: 'fixed', bottom: 0, padding: 0, zIndex: 10, height: '65px' }}>
    <Segment style={{ margin: 0, border: 'none', borderRadius: 0 }}>
      <Image centered size="mini" src="/images/logo-32x32.png" />
    </Segment>
  </Container>
)

export default Footer
