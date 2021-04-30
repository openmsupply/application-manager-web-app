import React from 'react'
import { Link } from 'react-router-dom'
import { Label, Header, List, Divider, Form, Button } from 'semantic-ui-react'
import { useUserState } from '../contexts/UserState'

const Home: React.FC = () => {
  const {
    userState: { currentUser },
  } = useUserState()
  return (
    <div>
      <Label>Hello, {currentUser?.firstName}. Welcome to the Dashboard!</Label>
      <Header as="h2">Quick Links (for Dev)</Header>
      <List>
        <List.Item>
          <Link to="/applications">Applications list</Link>
        </List.Item>
        <List.Item>
          <Link to="/application/new?type=Demo">Feature showcase application</Link>
        </List.Item>
        <List.Item>
          <Link to="/application/new?type=UserRegistration">User registration application</Link>
        </List.Item>
      </List>
      <Header as="h1" textAlign="center">
        Font Styles Reference:
      </Header>
      <div className="hide-on-mobile">
        <Header as="h2">Desktop Headings</Header>
        <p>Adjust the viewport width to see mobile fonts</p>
        <Divider />
        <Header as="h1">H1 Open Sans 36px, Regular, #00000</Header>
        <Header as="h2">H2 Open Sans 26px, Regular, #00000</Header>
        <Header as="h3">H3 Open Sans 20px, Regular, #4A4A4A</Header>
        <Header as="h4">H4 Open Sans 14px, Semibold, #4A4A4A, UPPERCASE</Header>
        <Header as="h5">H5 Open Sans 15px, Semibold, #4A4A4A</Header>
        <Header as="h6">H6 Open Sans 13px, Semibold, #4A4A4A</Header>
      </div>
      <div className="hide-on-desktop">
        <Header as="h2">Mobile Headings</Header>
        <Divider />
        <Header as="h1">H1 Open Sans 20px, Semibold, #000000</Header>
        <Header as="h2">H2 Open Sans 16px, Semibold, #000000</Header>
        <Header as="h3">H3 Open Sans 14px, Medium, #4A4A4A</Header>
        <Header as="h4">H4 Open Sans 12PX, Semibold, #4A4A4A, UPPERCASE</Header>
        <Header as="h5">H5 Open Sans 15PX, Semibold, #4A4A4A</Header>
      </div>
      <Divider />
      <p>Paragraph Open Sans, 15px, Regular, #000000</p>
      <p>
        <strong>Paragraph-strong Open Sans, 15px, Semi-bold, #000000</strong>
      </p>
      <p className="secondary">Secondary Open Sans, 13px, Regular, #000000</p>
      <p className="small">Small Open Sans 12px, Regular, #000000</p>
      <p className="small interactive">Small Blue Open Sans, 12px, Regular, #003BFE</p>
      <p className="attention">Error/Attention Open Sans, 12px, Regular, #FF0082</p>
      <Divider />
      <Form>
        <Form.Field>
          <label>Form Label Open Sans, 15px, Semi-bold, #000000</label>
          <input placeholder="Input Open Sans, 15px, #4A4A4A" />
        </Form.Field>
        <Button primary type="submit" className="button-wide">
          Primary Button
        </Button>
        <Button secondary type="submit">
          Secondary Button -- not used
        </Button>
      </Form>
    </div>
  )
}

export default Home
