import { BooksResolver } from "./books.resolver";
import { BooksRatingResolver } from "./books_rating.resolver";
import CategoryResolver from "./category.resolver";
import UserResolver, { UserBookResolver } from "./user.resolver";

export const resolvers = [
  UserResolver,
  UserBookResolver,
  CategoryResolver,
  BooksResolver,
  BooksRatingResolver,
] as const;
