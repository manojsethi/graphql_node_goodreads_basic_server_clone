import { BooksResolver } from "./books.resolver";
import CategoryResolver from "./category.resolver";
import UserResolver, { UserBookResolver } from "./user.resolver";

export const resolvers = [
  UserResolver,
  UserBookResolver,
  CategoryResolver,
  BooksResolver,
] as const;
