import { IBook } from '../models/Book.js';
import User, { IUser } from '../models/User.js';
import bcrypt from 'bcrypt';
import { signToken } from '../services/auth.js';

interface GoogleAPIBookVolumeInfo {
  title: string;
  authors: string[] | null;
  description: string | null;
  imageLinks?: {
    thumbnail: string;
  };
  infoLink: string;
}

interface GoogleAPIBook {
  id: string;
  volumeInfo: GoogleAPIBookVolumeInfo;
}

const resolvers = {
  Query: {
    getUser: async (_: any, { id, username }: { id?: string; username?: string }) => {
      if (id) {
        return await User.findById(id).populate('savedBooks');
      }
      if (username) {
        return await User.findOne({ username }).populate('savedBooks');
      }
      throw new Error("Must provide either id or username to query a user");
    },
    getAllUsers: async (): Promise<IUser[]> => {
      return await User.find({}).populate('savedBooks');
    },
    getBooks: async (): Promise<IBook[]> => {
      const users = await User.find({});
      return users.flatMap((user) => user.savedBooks as IBook[]);
    },
    searchGoogleBooks: async (_: unknown, { query }: { query: string }) => {
      try {
        const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}`);
        const data = await response.json();

        // Transform the response data to match the GoogleAPIBook type
        return data.items.map((book: GoogleAPIBook) => ({
          bookId: book.id,
          title: book.volumeInfo.title,
          authors: book.volumeInfo.authors || ['No author available'],
          description: book.volumeInfo.description,
          image: book.volumeInfo.imageLinks?.thumbnail || '',
          link: book.volumeInfo.infoLink,
        }));
      } catch (error) {
        console.error(error);
        throw new Error('Failed to fetch books from Google API');
      }
    },
  },
  
  Mutation: {
    registerUser: async (_: any, { username, email, password }: { username: string; email: string; password: string }) => {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new Error("User already exists with this email");
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({ username, email, password: hashedPassword });

      // Generate JWT token using signToken method
      const token = signToken(user.username, user.email, user._id); 
      
      return { token, user };
    },

    loginUser: async (_: any, { email, password }: { email: string; password: string }) => {
      const user = await User.findOne({ $or: [{ username: email }, { email }] });
      if (!user || !(await user.isCorrectPassword(password))) {
        throw new Error("Invalid email or password");
      }

      // Generate JWT token using signToken method
      const token = signToken(user.username, user.email, user._id);
      
      return { token, user };
    },

    saveBook: async (_: any, { userId, book }: { userId: string; book: IBook }) => {
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $addToSet: { savedBooks: book } },
        { new: true, runValidators: true }
      );
      if (!updatedUser) {
        throw new Error("User not found");
      }
      return updatedUser;
    },

    deleteBook: async (_: any, { userId, bookId }: { userId: string; bookId: string }) => {
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $pull: { savedBooks: { bookId } } },
        { new: true }
      );
      if (!updatedUser) {
        throw new Error("Couldn't find user with this id!");
      }
      return updatedUser;
    },
  },

  User: {
    bookCount: (user: IUser): number => user.savedBooks.length,
  },
};

export default resolvers;
