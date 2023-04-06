import { FileUpload, GraphQLUpload } from "graphql-upload";
import Context from "src/interfaces/context.interface";
import { Category } from "src/schema/category.schema";
import {
  Arg,
  Authorized,
  Ctx,
  FieldResolver,
  Mutation,
  Query,
  Resolver,
  ResolverInterface,
  Root,
} from "type-graphql";
import { AddBookInput, Book } from "../schema/books.schema";
import BookService from "../services/book.service";

@Resolver((of) => Book)
export class BooksResolver implements ResolverInterface<Book> {
  constructor(private bookService: BookService) {
    this.bookService = new BookService();
  }

  @FieldResolver()
  category(@Root() book: Book) {
    return book.categoryId as Category[];
  }

  @Authorized()
  @Query(() => [Book])
  getBooks(
    @Arg("id", () => String, { nullable: true }) id: string
  ): Promise<Book[]> {
    return this.bookService.GetBooks(id);
  }

  @Authorized()
  @Query(() => [Book])
  getBooksByUser(@Ctx() context: Context): Promise<Book[]> {
    return this.bookService.GetBooksByUser(context.user!._id);
  }

  @Authorized()
  @Mutation(() => Book)
  addBook(
    @Arg("input") input: AddBookInput,
    @Arg("picture", () => GraphQLUpload, {
      nullable: true,
    })
    picture: FileUpload
  ) {
    return this.bookService.CreateBook(input, picture);
  }
}
