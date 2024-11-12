import { gql } from '@apollo/client';
import { client } from './apolloClient'; // Import Apollo Client instance

// Get saved book IDs from localStorage
export const getSavedBookIds = () => {
  const savedBookIds = localStorage.getItem('saved_books')
    ? JSON.parse(localStorage.getItem('saved_books')!)
    : [];

  return savedBookIds;
};

// Save book IDs to localStorage
export const saveBookIds = (bookIdArr: string[]) => {
  if (bookIdArr.length) {
    localStorage.setItem('saved_books', JSON.stringify(bookIdArr));
  } else {
    localStorage.removeItem('saved_books');
  }
};

// Remove a single book ID from localStorage
export const removeBookId = (bookId: string) => {
  const savedBookIds = localStorage.getItem('saved_books')
    ? JSON.parse(localStorage.getItem('saved_books')!)
    : null;

  if (!savedBookIds) {
    return false;
  }

  const updatedSavedBookIds = savedBookIds?.filter((savedBookId: string) => savedBookId !== bookId);
  localStorage.setItem('saved_books', JSON.stringify(updatedSavedBookIds));

  return true;
};

// Sync saved books with the backend (called after user logs in)
export const syncSavedBooksWithBackend = async (userId: string) => {
  const savedBookIds = getSavedBookIds();

  if (savedBookIds.length > 0) {
    try {
      await saveBooksToBackend({ userId, savedBookIds });
    } catch (error) {
      console.error("Error syncing books with backend:", error);
    }
  }
};

// Mutation for saving books to the backend
const SAVE_BOOKS_MUTATION = gql`
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

// Function to save books to the backend using the GraphQL mutation
export const saveBooksToBackend = async ({ userId, savedBookIds }: { userId: string, savedBookIds: string[] }) => {
  try {
    for (const bookId of savedBookIds) {
      // Assuming you have book information in the client-side, you may need to map this
      const book = { bookId, title: 'Sample Book', authors: ['Author 1'], description: 'Description', image: 'image_url', link: 'link_url' };
      await client.mutate({
        mutation: SAVE_BOOKS_MUTATION,
        variables: { userId, book },
      });
    }
  } catch (err) {
    console.error('Error saving books to backend', err);
    throw err;
  }
};
