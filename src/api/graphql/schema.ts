import { buildASTSchema } from "graphql";
import gql from "graphql-tag";

const ast = gql`
type MetaData {
  logo: String!
  website: String!
}

type Sponsor {
  address: String!
  amount: Boolean!
  metadata: MetaData!
}

type Query {
  sponsors: [Sponsor!]
  sponsor(address: String!): Sponsor
}
`;

export default buildASTSchema(ast);