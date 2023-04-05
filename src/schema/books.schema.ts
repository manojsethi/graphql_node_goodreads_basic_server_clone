import { getModelForClass, mongoose, prop, Ref } from "@typegoose/typegoose";
import { GraphQLFloat } from "graphql";
import { FileUpload, GraphQLUpload } from "graphql-upload";
import { Field, InputType, Int, ObjectType } from "type-graphql";
import { Category } from "./category.schema";
import { User } from "./user.schema";

@ObjectType()
export class Book {
  @Field(() => String)
  _id: string;

  @Field(() => String)
  @prop({ required: true })
  name: string;

  @Field(() => String, { nullable: true })
  @prop({ required: true })
  author: string;

  @Field(() => Date, { nullable: true })
  @prop()
  publishDate: Date;

  @Field(() => String, { nullable: true })
  @prop({ required: true })
  description: string;

  @prop({ ref: () => User, type: mongoose.Types.ObjectId })
  public addedBy: Ref<User>;

  @prop({ ref: () => Category, type: [mongoose.Types.ObjectId] })
  public categoryId: Ref<Category>[];

  @Field(() => [Category])
  public category: Category[];

  @Field(() => String, { nullable: true })
  @prop({ required: false })
  image: string;

  @Field(() => Int, { nullable: true })
  @prop({ required: false })
  totalRatingCount: number;

  @Field(() => GraphQLFloat, { nullable: true })
  @prop({ required: false })
  totalRatingValue: number;
}
export const BooksModel = getModelForClass(Book);

@InputType()
export class AddBookInput {
  @Field(() => String!)
  name: string;
  @Field(() => String!)
  author: string;
  @Field(() => String!)
  description: string;
  @Field(() => String!)
  addedBy: string;
  @Field(() => [String]!)
  categoryId: string[];
  @Field(() => GraphQLUpload, { nullable: true })
  picture: FileUpload;
  @Field()
  publishDate: Date;
  image: string;
}
