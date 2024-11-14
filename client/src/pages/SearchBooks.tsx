import { useState, useEffect, FormEvent } from 'react';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import { useMutation, useLazyQuery } from '@apollo/client';
import { SAVE_BOOK } from '../utils/mutations';
import { SEARCH_GOOGLE_BOOKS } from '../utils/queries';
import { Book } from '../models/Book';
import Auth from '../utils/auth';

const SearchBooks = () => {
  const [searchInput, setSearchInput] = useState('');
  const [searchedBooks, setSearchedBooks] = useState<Book[]>([]);

  const [saveBook] = useMutation(SAVE_BOOK);

  const [searchBooks, { data: searchData }] = useLazyQuery(SEARCH_GOOGLE_BOOKS);

  const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!searchInput) return;
    searchBooks({ variables: { query: searchInput } });
    setSearchInput('');
  };

  useEffect(() => {
    if (searchData) {
      setSearchedBooks(searchData.searchGoogleBooks);
    }
  }, [searchData]);

  const handleSaveBook = async (bookId: string) => {
    const bookToSave = searchedBooks.find((book) => book.bookId === bookId);
    if (!bookToSave) return; // Return if no book is found
  
    // Check if the user is logged in and get the token
    const token = Auth.loggedIn() ? Auth.getToken() : null;
    if (!token) return false; // Exit if there's no token
  
    try {
      // Ensure the token and user profile are valid
      const userProfile = Auth.getProfile(); // Make sure this function correctly returns the user profile
      console.log(userProfile);
      if (!userProfile || !userProfile.userId) {
        console.error("User not found or missing userId");
        return;
      }
  
      // Call the saveBook mutation with the required variables
      await saveBook({
        variables: {
          userId: userProfile.userId, // Pass the userId to the mutation
          book: {
            bookId: bookToSave.bookId, // Ensure book data is in the correct shape for your mutation
            title: bookToSave.title,
            authors: bookToSave.authors,
            description: bookToSave.description,
            // Add any other book fields expected by the mutation
          },
        },
      });
    } catch (err) {
      console.error("Error saving book:", err); // Log any errors that occur
    }
  };
  

  return (
    <div className="text-light bg-dark p-5">
      <Container>
        <Form onSubmit={handleFormSubmit}>
          <Row>
            <Col xs={12} md={8}>
              <Form.Control
                type='text'
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder='Search for a book'
              />
            </Col>
            <Col xs={12} md={4}>
              <Button variant='success' type='submit'>
                Search
              </Button>
            </Col>
          </Row>
        </Form>
        <Row>
          {searchedBooks.map((book) => (
            <Col md='4' key={book.bookId}>
              <Card border='dark'>
                <Card.Img src={book.image} alt={`Cover for ${book.title}`} />
                <Card.Body>
                  <Card.Title>{book.title}</Card.Title>
                  <Button
                    className='btn-primary'
                    onClick={() => handleSaveBook(book.bookId)}
                  >
                    Save this Book!
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

export default SearchBooks;
