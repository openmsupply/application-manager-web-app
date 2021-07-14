import React, { useContext } from 'react'
import { useIntl, FormattedMessage, FormattedNumber } from 'react-intl'
import { Link } from 'react-router-dom'
import { Label, Container, Header } from 'semantic-ui-react'
import { useRouter } from '../utils/hooks/useRouter'
import { LanguageContext } from './contexts/Language.context'

const ProductListDemo: React.FC = () => {
  const { pathname } = useRouter()
  const intl = useIntl()
  const { state, changeLanguage } = useContext(LanguageContext)

  const updateLocale = async (event: any) => await changeLanguage(event.target.value)

  return (
    <Container text>
      <select value={state.language} onChange={updateLocale}>
        <option value="en">English</option>
        <option value="fr">French</option>
      </select>
      <Header
        as="h1"
        content={intl.formatMessage({
          description: 'Header 1', // Description should be a string literal
          defaultMessage: 'Registered Products', // Message should be a string literal
        })}
      />
      <Header
        as="h2"
        content={intl.formatMessage({
          description: 'Header 2',
          defaultMessage: 'List of (public) registered products in the system',
        })}
      />
      <Header
        as="h3"
        content={intl.formatMessage({
          description: 'Header 3',
          defaultMessage: 'Can be filtered with query parameters, e.g:',
        })}
      />
      <FormattedMessage description="Paragraph" defaultMessage="Just a simple try of addition" />
      <p>
        <FormattedMessage
          description="Paragraph"
          defaultMessage="Today is {ts, date, ::yyyyMMdd}"
          values={{ ts: Date.now() }}
        />
        <br />
        <FormattedNumber value={19} style="currency" currency="EUR" />
        <br />
      </p>
      <Label>
        <Link to={'/products/XYZ276'}>
          <FormattedMessage
            description="Product Link"
            defaultMessage="{val1} - registered by {val2}. {exp, date, ::yyyy/MM/dd}"
            values={{ exp: new Date('December 10, 2020'), val1: 'Drug A', val2: 'Company B' }}
          />
        </Link>
      </Label>
    </Container>
  )
}

export default ProductListDemo
