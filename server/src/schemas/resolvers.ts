import Book, { IBook } from '../models/Book.js';
import User, { IUser } from '../models/User.js';

const resolvers = {
  Query: {
    book: async (): Promise<IBook[] | null> => {
      return Book.find({});
    },
    users: async (_parent: any, { _id }: { _id: string }): Promise<IUser[] | null> => {
      const params = _id ? { _id } : {};
      return User.find(params);
    },
  },
  Mutation: {
    createUser: async (_parent: any, args: any): Promise<IUser | null> => {
      const user = await User.create(args);
      return user;
    },
    createVote: async (_parent: any, { _id, techNum }: { _id: string, techNum: number}): Promise<IUser | null> => {
      const vote = await User.findOneAndUpdate(
        { _id },
        { $inc: { [`tech${techNum}_votes`]: 1 } },
        { new: true }
      );
      return vote;
    },
  },
};

export default resolvers;
