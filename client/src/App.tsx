import './App.css';
import { Outlet } from 'react-router-dom';
import { ApolloProvider, ApolloClient, InMemoryCache } from '@apollo/client';

import Navbar from './components/Navbar';

// Create Apollo Client instance
const client = new ApolloClient({
  uri: '/graphql', // Replace with your GraphQL server URI
  cache: new InMemoryCache(),
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
