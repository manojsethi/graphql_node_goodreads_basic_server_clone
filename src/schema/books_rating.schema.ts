import { getModelForClass, mongoose, prop, Ref } from "@typegoose/typegoose";
import { Field, InputType, Int, ObjectType } from "type-graphql";
import { Book } from "./books.schema";
import { User } from "./user.schema";

@ObjectType()
export class BookRating {
  @Field(() => String)
  _id: string;

  @prop({ ref: () => User, type: mongoose.Types.ObjectId })
  public addedBy: Ref<User>;

  @Field(() => User)
  public user: User;

  @prop({ ref: () => Book, type: mongoose.Types.ObjectId })
  public bookId: Ref<Book>;

  @Field(() => Int)
  @prop({ required: true })
  public rating: number;

  @Field(() => String)
  @prop({ required: true })
  review: string;

  @Field(() => Int, { nullable: true })
  @prop({ required: true })
  public totalTimeTaken: number;

  @Field(() => Date)
  @prop({ required: true })
  publishDate: Date;
}
export const BooksRatingModel = getModelForClass(BookRating);

@InputType()
export class AddBookRating {
  @Field(() => String!)
  bookId: string;
  @Field(() => String!)
  addedBy: string;
  @Field(() => Int!)
  rating: number;
  @Field(() => String!)
  review: string;
}
