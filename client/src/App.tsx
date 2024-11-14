import './App.css';
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  createHttpLink,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { Outlet } from 'react-router-dom';

import Navbar from './components/Navbar'; // Replaced Header with Navbar

// Construct the GraphQL endpoint to your backend running on port 3001
const httpLink = createHttpLink({
  uri: '/graphql', 
});

// Set up middleware to include JWT token in every request if available
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('id_token'); // Retrieves token from localStorage
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '', // Adds token to headers if available
    },
  };
});

// Create the Apollo Client
const client = new ApolloClient({
  link: authLink.concat(httpLink), // Combine auth and HTTP link
  cache: new InMemoryCache(), // Use Apollo's in-memory cache
});

function App() {
  return (
    <ApolloProvider client={client}>
      <Navbar />
      <Outlet />
    </ApolloProvider>
  );
}

export default App;
