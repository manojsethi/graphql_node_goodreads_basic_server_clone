import { getModelForClass, prop } from "@typegoose/typegoose";
import { Field, ID, ObjectType } from "type-graphql";
import { Book } from "./books.schema";

@ObjectType()
export class Category {
  @Field(() => ID)
  _id: string;
  @Field(() => String)
  @prop({ required: true })
  name: string;
  @Field(() => [Book])
  books: Book[];
}
export const CategoryModel = getModelForClass(Category);
