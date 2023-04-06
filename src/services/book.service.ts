import { mongoose } from "@typegoose/typegoose";
import fs from "fs";
import { FileUpload } from "graphql-upload";
import path from "path";
import { AddBookInput, Book, BooksModel } from "../schema/books.schema";

class BookService {
  storeFS = ({ stream, filename }: any): Promise<string> => {
    const uploadDir = path.join("rootPath", "photos");
    const filePath = `${uploadDir}/${filename}`;
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    return new Promise((resolve, reject) =>
      stream
        .on("error", (error: any) => {
          if (stream.truncated) fs.unlinkSync(filePath);
          reject(error);
        })
        .pipe(fs.createWriteStream(filePath))
        .on("error", (error: any) => reject(error))
        .on("finish", () => resolve(filename))
    );
  };
  async CreateBook(input: AddBookInput, picture?: FileUpload): Promise<Book> {
    if (picture) {
      const stream = picture.createReadStream();
      const pathObj = await this.storeFS({
        stream,
        filename: picture.filename,
      });
      input.image = pathObj;
    }
    let book = await BooksModel.create(input);
    return await BooksModel.findById(book._id)
      .populate(["categoryId", "addedBy"])
      .lean();
  }
  async GetBooks(id: string | null): Promise<Book[]> {
    let query = {};
    if (id)
      query = {
        _id: new mongoose.Types.ObjectId(id),
      };
    let allBooks = await BooksModel.find(query)
      .populate(["categoryId", "addedBy"])
      .lean();
    return allBooks as Book[];
  }

  async GetBooksByUser(id: string | null): Promise<Book[]> {
    let query = {};
    if (id)
      query = {
        addedBy: new mongoose.Types.ObjectId(id),
      };
    let allBooks = await BooksModel.find(query)
      .populate(["categoryId", "addedBy"])
      .lean();
    return allBooks as Book[];
  }

  async GetBookById(id: string): Promise<Book> {
    return await BooksModel.findById(id)
      .populate(["categoryId", "addedBy"])
      .lean();
  }
  async GetBooksByCategory(categoryIds: string[]) {
    let allCategoryBooks = await BooksModel.find({
      categoryId: { $in: categoryIds },
    }).lean();

    let mappedResult = this._mapResultToIds(
      categoryIds,
      allCategoryBooks as Book[]
    );
    return mappedResult;
  }

  private _mapResultToIds(ids: readonly string[], books: Book[]) {
    return ids.map(
      (id) =>
        books.filter((book: Book) =>
          book.categoryId.map((x) => x.toString()).includes(id.toString())
        ) || []
    );
  }
}

export default BookService;

export type CategoryBooks = {
  categoryId: string;
  books: Book[] | [];
};
