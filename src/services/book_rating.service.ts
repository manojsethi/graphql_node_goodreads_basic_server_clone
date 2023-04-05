import { mongoose } from "@typegoose/typegoose";
import Context from "../interfaces/context.interface";
import { Book, BooksModel } from "../schema/books.schema";
import {
  AddBookRating,
  BookRating,
  BooksRatingModel,
} from "../schema/books_rating.schema";
import UserService from "./user.service";

class BookRatingService {
  constructor(private userService: UserService) {
    this.userService = new UserService();
  }
  async AddBookRating(
    input: AddBookRating,
    context: Context
  ): Promise<BookRating[]> {
    input.addedBy = new mongoose.Types.ObjectId(input.addedBy) as any;
    input.bookId = new mongoose.Types.ObjectId(input.bookId) as any;
    let user = await this.userService.getUserById(context);
    let book = await BooksModel.findById(input.bookId).lean();
    let obj: BookRating = new BookRating();
    let userBook = user?.userBooks.find(
      (x) => (x.bookId as Book)._id.toString() == input.bookId.toString()
    );
    if (userBook && book) {
      var difference = Math.abs(
        userBook.finish_time!.getTime() - userBook.reading_time!.getTime()
      );
      var resultInMinutes = Math.round(difference / 60000);
      let timeDiff: number = resultInMinutes;

      obj.addedBy = new mongoose.Types.ObjectId(input.addedBy) as any;
      obj.bookId = new mongoose.Types.ObjectId(input.bookId) as any;
      obj.rating = input.rating;
      obj.review = input.review;
      obj.totalTimeTaken = timeDiff;
      obj.publishDate = new Date();

      await BooksRatingModel.create(obj);
      if (!book.totalRatingCount) book.totalRatingCount = 0;
      book.totalRatingCount += 1;
      if (book.totalRatingCount == 1) book.totalRatingValue = input.rating;
      else book.totalRatingValue = (book.totalRatingValue + input.rating) / 2;
      await BooksModel.updateOne(
        {
          _id: new mongoose.Types.ObjectId(book._id),
        },
        book
      );
    }
    return await BooksRatingModel.find({ bookId: input.bookId })
      .populate(["addedBy"])
      .lean();
  }
  async GetBookRatings(id: string, context: Context): Promise<BookRating[]> {
    let allRatings = (await BooksRatingModel.find({
      bookId: new mongoose.Types.ObjectId(id),
    })
      .populate(["addedBy"])
      .lean()) as BookRating[];

    return allRatings;
  }
}

export default BookRatingService;

export interface AllBookRating {
  myBookRating: BookRating | null | undefined;
  allRatings: BookRating[] | [];
}
