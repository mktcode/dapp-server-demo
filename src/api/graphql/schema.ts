import gql from "graphql-tag";

export default gql`
type MetaData {
  logo: String
  website: String
}

type Sponsor {
  address: String!
  amount: String!
  metadata: MetaData!
}

type Query {
  sponsors: [Sponsor!]
  sponsor(address: String!): Sponsor
}
`