import { useState, useEffect } from 'react';
import { Container, Card, Button, Row, Col } from 'react-bootstrap';
import { useQuery, useMutation } from '@apollo/client';
import { GET_USER } from '../utils/queries'; // Import GraphQL queries and mutations
import { DELETE_BOOK } from '../utils/mutations'
import Auth from '../utils/auth';
import { removeBookId } from '../utils/localStorage';
import type { User } from '../models/User';

const SavedBooks = () => {
  const [userData, setUserData] = useState<User>({
    username: '',
    email: '',
    password: '',
    savedBooks: [],
  });

  const token = Auth.loggedIn() ? Auth.getToken() : null;

  // Use useQuery hook to fetch user data (saved books)
  const { data, loading, error } = useQuery(GET_USER, {
    variables: { token },
    skip: !token, // Skip query if no token
  });

  // Use useMutation hook to handle book deletion
  const [removeBookMutation] = useMutation(DELETE_BOOK);

  // Update user data from the query result
  useEffect(() => {
    if (data) {
      setUserData(data.getUser);
    }
  }, [data]);

  // Handle deleting a book
  const handleDeleteBook = async (bookId: string) => {
    if (!token) return;

    try {
      // Call REMOVE_BOOK mutation
      const { data } = await removeBookMutation({
        variables: { bookId, token },
      });

      if (data) {
        // Update the user data after removing the book
        setUserData(data.removeBook);
        // Remove the book's ID from localStorage
        removeBookId(bookId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Loading state
  if (loading) return <h2>LOADING...</h2>;

  // Error state
  if (error) {
    console.error(error);
    return <h2>Something went wrong!</h2>;
  }

  return (
    <>
      <div className='text-light bg-dark p-5'>
        <Container>
          {userData.username ? (
            <h1>Viewing {userData.username}'s saved books!</h1>
          ) : (
            <h1>Viewing saved books!</h1>
          )}
        </Container>
      </div>
      <Container>
        <h2 className='pt-5'>
          {userData.savedBooks.length
            ? `Viewing ${userData.savedBooks.length} saved ${
                userData.savedBooks.length === 1 ? 'book' : 'books'
              }:`
            : 'You have no saved books!'}
        </h2>
        <Row>
          {userData.savedBooks.map((book) => {
            return (
              <Col md='4' key={book.bookId}>
                <Card border='dark'>
                  {book.image ? (
                    <Card.Img
                      src={book.image}
                      alt={`The cover for ${book.title}`}
                      variant='top'
                    />
                  ) : null}
                  <Card.Body>
                    <Card.Title>{book.title}</Card.Title>
                    <p className='small'>Authors: {book.authors}</p>
                    <Card.Text>{book.description}</Card.Text>
                    <Button
                      className='btn-block btn-danger'
                      onClick={() => handleDeleteBook(book.bookId)}
                    >
                      Delete this Book!
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      </Container>
    </>
  );
};

export default SavedBooks;
