import React from 'react'
import { Container, Image, Segment } from 'semantic-ui-react'
import strings from '../../utils/constants'

const Footer: React.FC = () => (
  <Container id="footer">
    <div id="footer-content">
      <Image src="/images/logo-32x32.png" />
      <p>
        {strings.FOOTER_TEXT}
        <br />
        {strings.FOOTER_COPYRIGHT}
      </p>
    </div>
  </Container>
)

export default Footer
