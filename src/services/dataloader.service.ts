import DataLoader from "dataloader";
import { IDataloaders } from "src/interfaces/dataloader.interface";
import { Book } from "src/schema/books.schema";
import BookService from "./book.service";

export class DataloaderService {
  private bookService: BookService;
  constructor() {
    this.bookService = new BookService();
  }

  getLoaders(): IDataloaders {
    const booksLoader = this._createBooksLoader();
    return {
      booksLoader,
    };
  }

  private _createBooksLoader() {
    return new DataLoader<string, Book[]>(async (keys: readonly string[]) => {
      return this.bookService.GetBooksByCategory(keys as string[]);
    });
  }
}
