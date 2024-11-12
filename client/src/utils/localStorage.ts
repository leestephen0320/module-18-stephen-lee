import { gql } from '@apollo/client';
import { saveBooksToBackend } from './graphql'; // Ensure you import your actual GraphQL function

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
      // Example mutation to save books
      await saveBooksToBackend({ userId, savedBookIds });
    } catch (error) {
      console.error("Error syncing books with backend:", error);
    }
  }
};

// Function to save books to the backend (GraphQL mutation)
const SAVE_BOOKS_MUTATION = gql`
  mutation SaveBooks($userId: ID!, $savedBookIds: [String!]!) {
    saveBooks(userId: $userId, savedBookIds: $savedBookIds) {
      success
      message
    }
  }
`;

export const saveBooksToBackend = async ({ userId, savedBookIds }: { userId: string, savedBookIds: string[] }) => {
  try {
    const result = await client.mutate({
      mutation: SAVE_BOOKS_MUTATION,
      variables: {
        userId,
        savedBookIds,
      },
    });
    return result.data.saveBooks;
  } catch (err) {
    console.error('Error saving books to backend', err);
    throw err;
  }
};
