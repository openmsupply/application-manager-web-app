import React from 'react'
import { Container, Image } from 'semantic-ui-react'
import strings from '../../utils/constants'
const logo = require('../../../images/logos/logo_512.png').default

const Footer: React.FC = () => (
  <Container id="footer">
    <div id="footer-content">
      <Image src={logo} />
      <p>
        {strings.FOOTER_TEXT}
        <br />
        {strings.FOOTER_COPYRIGHT}
      </p>
    </div>
  </Container>
)

export default Footer
