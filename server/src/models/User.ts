import { Schema, Types, model, type Document } from 'mongoose';
import bcrypt from 'bcrypt';

// Import bookSchema and IBook from Book.js
import bookSchema from './Book.js';
import type { IBook } from './Book.js';

export interface IUser extends Document {
  _id: Types.ObjectId;
  username: string;
  email: string;
  password: string;
  savedBooks: IBook[]; // Array of IBook subdocuments
  isCorrectPassword(password: string): Promise<boolean>;
  bookCount: number;
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/.+@.+\..+/, 'Must use a valid email address'],
    },
    password: {
      type: String,
      required: true,
    },
    // Define savedBooks as an array of bookSchema subdocuments
    savedBooks: [bookSchema],
  },
  {
    toJSON: {
      virtuals: true,
    },
  }
);

// Hash user password before saving
userSchema.pre('save', async function (next) {
  if (this.isNew || this.isModified('password')) {
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
  }
  next();
});

// Method to compare and validate password for logging in
userSchema.methods.isCorrectPassword = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};

// Virtual field to get the number of saved books
userSchema.virtual('bookCount').get(function () {
  return this.savedBooks.length;
});

const User = model<IUser>('User', userSchema);

export default User;
