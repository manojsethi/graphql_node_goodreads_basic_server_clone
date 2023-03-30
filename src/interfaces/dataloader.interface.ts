import DataLoader from "dataloader";
import { Book } from "src/schema/books.schema";

export interface IDataloaders {
  booksLoader: DataLoader<string, Book[]>;
}
