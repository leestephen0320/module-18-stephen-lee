import { gql } from '@apollo/client';

// Mutation for creating a new user
export const CREATE_USER = gql`
  mutation createUser($username: String!, $email: String!, $password: String!) {
    registerUser(username: $username, email: $email, password: $password) {
      token
      user {
        _id
        username
        email
      }
    }
  }
`;

// Mutation for logging in a user
export const LOGIN_USER = gql`
  mutation loginUser($email: String!, $password: String!) {
    loginUser(email: $email, password: $password) {
      token
    }
  }
`;

// Mutation for saving a book to the user's savedBooks
export const SAVE_BOOK = gql`
  mutation saveBook($userId: ID!, $book: BookInput!) {
    saveBook(userId: $userId, book: $book) {
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
    }
  }
`;

// Mutation for deleting a book from the user's savedBooks
export const DELETE_BOOK = gql`
  mutation deleteBook($token: String!, $bookId: String!) {
    deleteBook(token: $token, bookId: $bookId) {
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
    }
  }
`;

