import { User } from "src/schema/user.schema";
import {
  Arg,
  Authorized,
  Ctx,
  FieldResolver,
  Mutation,
  Query,
  Resolver,
  Root,
} from "type-graphql";
import Context from "../interfaces/context.interface";
import { AddBookRating, BookRating } from "../schema/books_rating.schema";
import BookRatingService from "../services/book_rating.service";
import UserService from "../services/user.service";

@Resolver((of) => BookRating)
export class BooksRatingResolver {
  constructor(
    private bookRatingService: BookRatingService,
    private userService: UserService
  ) {
    this.userService = new UserService();
    this.bookRatingService = new BookRatingService(this.userService);
  }

  @FieldResolver()
  user(@Root() book: BookRating) {
    return book.addedBy as User;
  }
  @Authorized()
  @Mutation(() => [BookRating])
  addBookRating(@Arg("input") input: AddBookRating, @Ctx() context: Context) {
    return this.bookRatingService.AddBookRating(input, context);
  }

  @Authorized()
  @Query(() => [BookRating])
  getBookRating(
    @Arg("id", () => String) id: string,
    @Ctx() context: Context
  ): Promise<BookRating[]> {
    return this.bookRatingService.GetBookRatings(id, context);
  }
}
