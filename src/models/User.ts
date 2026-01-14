import { Schema, model, type HydratedDocument } from "mongoose";

export interface User {
  _id?: Schema.Types.ObjectId;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export type UserDocument = HydratedDocument<User>;

const userSchema = new Schema<User>(
  {
    _id: { type: Schema.Types.ObjectId, auto: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

export const UserModel = model<User>("User", userSchema);
