const typeDefs = `
  type User {
    _id: ID!
    username: String!
    email: String!
    savedBooks: [Book]!
    bookCount: Int
  }

  type Book {
    bookId: String!
    title: String!
    authors: [String]
    description: String!
    image: String
    link: String
  }

  input BookInput {
    bookId: String!
    title: String!
    authors: [String]
    description: String!
    image: String
    link: String
  }

  type GoogleAPIBook {
    bookId: String!
    title: String!
    authors: [String]
    description: String
    image: String
    link: String
  }

  type Query {
    getUser(token: String!): User
    getAllUsers: [User]
    getBooks: [Book]
    searchGoogleBooks(query: String!): [GoogleAPIBook]
  }

  type AuthPayload {
    token: String
    user: User
  }

  type Mutation {
    registerUser(username: String!, email: String!, password: String!): AuthPayload
    loginUser(email: String!, password: String!): AuthPayload
    saveBook(userId: ID!, book: BookInput!): User
    deleteBook(token: String!, bookId: String!): User
  }
`;

export default typeDefs;
