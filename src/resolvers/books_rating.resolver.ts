import { User } from "src/schema/user.schema";
import {
  Arg,
  Authorized,
  Ctx,
  FieldResolver,
  Mutation,
  PubSub,
  PubSubEngine,
  Query,
  Resolver,
  ResolverFilterData,
  Root,
  Subscription,
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
  addBookRating(
    @Arg("input") input: AddBookRating,
    @Ctx() context: Context,
    @PubSub() pubSub: PubSubEngine
  ) {
    return this.bookRatingService.AddBookRating(input, context, pubSub);
  }

  @Authorized()
  @Query(() => [BookRating])
  getBookRating(
    @Arg("id", () => String) id: string,
    @Ctx() context: Context
  ): Promise<BookRating[]> {
    return this.bookRatingService.GetBookRatings(id, context);
  }

  @Subscription({
    topics: "NEW_RATING",
    filter: ({ payload, args }: ResolverFilterData<BookRating>) => {
      return args.bookId.toString() == payload.bookId.toString();
    },
  })
  newRating(
    @Root() notificationPayload: BookRating,
    @Arg("bookId", () => String) bookId: string
  ): BookRating {
    return { ...notificationPayload };
  }
}
