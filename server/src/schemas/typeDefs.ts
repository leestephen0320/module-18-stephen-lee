const typeDefs = `
  type User {
    _id: ID!
    username: String!
    email: String!
    savedBooks: [Book]
    bookCount: Int
  }

  type Matchup {
    bookId: String!
    title: String!
    authors: [String]
    description: String!
    image: String
    link: String
  }

  type Query {
    getUser(id: String, username: String): User
    getAllUsers: [User]
    getBooks: [Book]
  }

  type AuthPayload {
    token: String
    user: User
  }

  type Mutation {
    registerUser(username: String!, email: String!, password: String!): AuthPayload
    loginUser(email: String!, password: String!): String  # Returns a token after login
    saveBook(userId: ID!, book: BookInput!): User
    deleteBook(userId: ID!, bookId: String!): User
  }
`;

export default typeDefs;
