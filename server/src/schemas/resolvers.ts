import { IBook } from '../models/Book.js';
import User, { IUser } from '../models/User.js';
import bcrypt from 'bcrypt';
import { signToken } from '../services/auth.js';

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
  },
  
  Mutation: {
    registerUser: async (_: any, { username, email, password }: { username: string; email: string; password: string }) => {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new Error("User already exists with this email");
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({ username, email, password: hashedPassword });
      const token = signToken(user._id, user.username); // Assuming signToken generates a JWT token
      return { token, user };
    },

    loginUser: async (_: any, { email, password }: { email: string; password: string }) => {
      const user = await User.findOne({ $or: [{ username: email }, { email }] });
      if (!user || !(await user.isCorrectPassword(password))) {
        throw new Error("Invalid email or password");
      }
      const token = signToken(user._id, user.username);
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
