import { useState } from 'react';
import type { FormEvent } from 'react';
import {
  Container,
  Col,
  Form,
  Button,
  Card,
  Row
} from 'react-bootstrap';
import { useQuery, useMutation, useLazyQuery, gql } from '@apollo/client';

import Auth from '../utils/auth';
import { SAVE_BOOK } from '../utils/mutations';
import { GET_BOOKS, SEARCH_GOOGLE_BOOKS } from '../utils/queries';
import type { Book } from '../models/Book';

const SearchBooks = () => {
  const [searchInput, setSearchInput] = useState('');
  const [searchedBooks, setSearchedBooks] = useState<Book[]>([]);

  // Fetch saved books if needed
  const { data } = useQuery(GET_BOOKS);
  const savedBooks = data?.getBooks || [];

  // Mutation to save a book to user's savedBooks list
  const [saveBook] = useMutation(SAVE_BOOK, {
    update(cache, { data: { saveBook } }) {
      cache.modify({
        fields: {
          getBooks(existingBooks = []) {
            const newBookRef = cache.writeFragment({
              data: saveBook,
              fragment: gql`
                fragment NewBook on Book {
                  bookId
                  title
                  authors
                  description
                  image
                  link
                }
              `
            });
            return [...existingBooks, newBookRef];
          }
        }
      });
    }
  });

  // Lazy query to search books using GraphQL
  const [searchBooks, { data: searchData }] = useLazyQuery(SEARCH_GOOGLE_BOOKS);

  // Handle form submission to search for books
  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!searchInput) return;

    // Trigger the GraphQL search query with the user's input
    searchBooks({ variables: { query: searchInput } });
    setSearchInput('');
  };

  // Update searchedBooks state when searchData is fetched
  if (searchData && searchData.searchGoogleBooks && searchData.searchGoogleBooks !== searchedBooks) {
    setSearchedBooks(searchData.searchGoogleBooks);
  }

  // Handle saving a book to the user's savedBooks
  const handleSaveBook = async (bookId: string) => {
    const bookToSave = searchedBooks.find((book) => book.bookId === bookId);
    if (!bookToSave) return;

    const token = Auth.loggedIn() ? Auth.getToken() : null;
    if (!token) return false;

    try {
      await saveBook({
        variables: {
          userId: Auth.getProfile().userId,
          book: {
            bookId: bookToSave.bookId,
            title: bookToSave.title,
            authors: bookToSave.authors,
            description: bookToSave.description,
            image: bookToSave.image,
            link: bookToSave.link
          }
        }
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <div className="text-light bg-dark p-5">
        <Container>
          <h1>Search for Books!</h1>
          <Form onSubmit={handleFormSubmit}>
            <Row>
              <Col xs={12} md={8}>
                <Form.Control
                  name='searchInput'
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  type='text'
                  size='lg'
                  placeholder='Search for a book'
                />
              </Col>
              <Col xs={12} md={4}>
                <Button type='submit' variant='success' size='lg'>
                  Submit Search
                </Button>
              </Col>
            </Row>
          </Form>
        </Container>
      </div>

      <Container>
        <h2 className='pt-5'>
          {searchedBooks.length ? `Viewing ${searchedBooks.length} results:` : 'Search for a book to begin'}
        </h2>
        <Row>
          {searchedBooks.map((book) => (
            <Col md="4" key={book.bookId}>
              <Card border='dark'>
                {book.image && <Card.Img src={book.image} alt={`The cover for ${book.title}`} variant='top' />}
                <Card.Body>
                  <Card.Title>{book.title}</Card.Title>
                  <p className='small'>Authors: {book.authors.join(', ')}</p>
                  <Card.Text>{book.description}</Card.Text>
                  {Auth.loggedIn() && (
                    <Button
                      disabled={savedBooks.some((savedBook: Book) => savedBook.bookId === book.bookId)}
                      className='btn-block btn-info'
                      onClick={() => handleSaveBook(book.bookId)}>
                      {savedBooks.some((savedBook: Book) => savedBook.bookId === book.bookId)
                        ? 'This book has already been saved!'
                        : 'Save this Book!'}
                    </Button>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </>
  );
};

export default SearchBooks;
