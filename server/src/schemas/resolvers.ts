import { IBook } from '../models/Book.js';
import User, { IUser } from '../models/User.js';
import { signToken } from '../services/auth.js';
import jwt, { JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

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

interface CustomJwtPayload extends JwtPayload {
  userId: string;
}

const resolvers = {
  Query: {
    getUser: async (_: any, { token }: { token: string }) => {
      try {
        const secretKey = process.env.JWT_SECRET_KEY || '';
        const decoded = jwt.verify(token, secretKey) as JwtPayload | string;
        console.log('Decoded token:', decoded);

        if (typeof decoded === 'string') {
          throw new Error('Invalid token');
        }

        const userId = decoded.userId;
        const user = await User.findById(userId).populate('savedBooks');

        if (!user) {
          throw new Error('User not found');
        }

        return user;
      } catch (error) {
        throw new Error('Invalid or expired token');
      }
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
  
      // Create user (password is hashed by pre-save hook)
      const user = await User.create({ username, email, password });
  
      // Generate JWT token using signToken with userId
      const token = signToken(user.username, user.email, user._id.toString()); // Use user._id.toString()
  
      return { token, user };
    },
  
    loginUser: async (_: any, { email, password }: { email: string; password: string }) => {
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error("No user found with this email");
      }
  
      // Verify password
      const isPasswordValid = await user.isCorrectPassword(password);
      if (!isPasswordValid) {
        throw new Error("Invalid password");
      }
  
      // Generate JWT token using signToken with userId
      const token = signToken(user.username, user.email, user._id.toString()); // Use user._id.toString()
  
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

    deleteBook: async (_: any, { token, bookId }: { token: string; bookId: string }) => {
      try {
        const secretKey = process.env.JWT_SECRET_KEY || '';
        const decoded = jwt.verify(token, secretKey) as CustomJwtPayload;

        // Validate the token and retrieve the userId
        const userId = decoded.userId;
        if (!userId) throw new Error('Unauthorized');

        // Find and update the user by removing the specified book from savedBooks
        const updatedUser = await User.findByIdAndUpdate(
          userId,
          { $pull: { savedBooks: { bookId } } },
          { new: true }
        ).populate('savedBooks');

        if (!updatedUser) {
          throw new Error("Couldn't find user with this ID!");
        }

        return updatedUser;
      } catch (error) {
        console.error(error);
        throw new Error('Invalid or expired token');
      }
    },
  },

  User: {
    bookCount: (user: IUser): number => user.savedBooks.length,
  },
};

export default resolvers;
