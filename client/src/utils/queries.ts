import { gql } from '@apollo/client';

// Query for fetching a user's data (by ID or username)
export const GET_USER = gql`
  query getUser($id: String, $username: String) {
    getUser(id: $id, username: $username) {
      _id
      username
      email
      savedBooks {
        bookId
        title
        authors
        description
        image
        link
      }
      bookCount
    }
  }
`;

// Query for getting all users
export const GET_ALL_USERS = gql`
  query getAllUsers {
    getAllUsers {
      _id
      username
      email
      savedBooks {
        bookId
        title
        authors
      }
    }
  }
`;

// Query for fetching all saved books
export const GET_BOOKS = gql`
  query getBooks {
    getBooks {
      bookId
      title
      authors
      description
      image
      link
    }
  }
`;
