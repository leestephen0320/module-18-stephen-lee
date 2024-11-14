import { useState, useEffect } from 'react';
import { Container, Card, Button, Row, Col } from 'react-bootstrap';
import { useQuery, useMutation } from '@apollo/client';
import { GET_USER } from '../utils/queries'; // Use GraphQL queries
import { DELETE_BOOK } from '../utils/mutations';
import { Book } from '../models/Book';
import Auth from '../utils/auth';

const SavedBooks = () => {
  const [userData, setUserData] = useState<{ savedBooks: Book[] }>({ savedBooks: [] });
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
      console.log('Received user data:', data);
      setUserData(data.getUser);
    }
  }, [data]);

  const handleDeleteBook = async (bookId: string) => {
    if (!token) return;
  
    try {
      const { data } = await removeBookMutation({
        variables: { token, bookId },
      });
  
      if (data) {
        setUserData(data.deleteBook);
      }
    } catch (err) {
      console.error(err);
    }
  };
  

  if (loading) return <h2>LOADING...</h2>;
  if (error) {
    console.error('Error fetching user data:', error);
    return <h2>Something went wrong!</h2>;
  }

  return (
    <div className='text-light bg-dark p-5'>
      <Container>
        <h1>Viewing saved books!</h1>
        <Row>
          {userData.savedBooks.map((book) => (
            <Col md='4' key={book.bookId}>
              <Card border='dark'>
                <Card.Img src={book.image} alt={`Cover for ${book.title}`} />
                <Card.Body>
                  <Card.Title>{book.title}</Card.Title>
                  <Button
                    className='btn-danger'
                    onClick={() => handleDeleteBook(book.bookId)}
                  >
                    Delete this Book!
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </div>
  );
};

export default SavedBooks;
