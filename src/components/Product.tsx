import React from 'react'
import { Link } from 'react-router-dom'
import { List, Label, Container, Header, Button } from 'semantic-ui-react'
import useGetOutcomeDisplays from '../utils/hooks/useGetOutcomeDisplays'
import { useRouter } from '../utils/hooks/useRouter'

export const ProductList: React.FC = () => {
  const { pathname, query } = useRouter()
  const { error, displays } = useGetOutcomeDisplays()

  console.log(error, displays)
  return (
    <Container text>
      <Header as="h1" content="Registered Products" />
      <Header as="h2" content="List of (public) registered products in the system" />
      <Header as="h3" content="Can be filtered with query parameters, e.g:" />
      <List>
        <List.Item content="Pharamaceutical products" as={Link} to="?type=pharmaceutical" />
        <List.Item content="Products expiring in the next 20 days." as={Link} to="?expiration=20" />
        <List.Item content="Expired Class A drugs." as={Link} to="?class=A&expired=true" />
        <List.Item content="Reset query" as={Link} to={pathname} />
      </List>
      {Object.keys(query).length > 0 && <h4>Query parameters:</h4>}
      <List>
        {Object.entries(query).map(([key, value]) => (
          <List.Item>{key + ' : ' + value}</List.Item>
        ))}
      </List>
      <Header as="h4" content="Product List:" />
      <Label>
        <Link to={'/products/XYZ276'}>Drug A - registered by Company B. Exp: 2020/12/10</Link>
      </Label>
    </Container>
  )
}

export const Product: React.FC = () => {
  const { query } = useRouter()
  const { productId } = query

  return (
    <Container text>
      <Header as="h1" content="Drug A" />
      <Header as="h2" content="Company B" />
      <Header as="h3" content={`Info for Product with id: ${productId}.`}>
        <Button content="Back to Products" as={Link} to="/products" />
      </Header>
    </Container>
  )
}
