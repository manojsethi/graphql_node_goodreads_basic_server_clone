import {
  getModelForClass,
  mongoose,
  pre,
  prop,
  Ref,
} from "@typegoose/typegoose";
import bcrypt from "bcrypt";
import { IsEmail, MinLength } from "class-validator";
import { Field, InputType, ObjectType, registerEnumType } from "type-graphql";
import { Book } from "./books.schema";
import { Category } from "./category.schema";

enum BOOK_STATUS {
  WANT_TO_READ = "WANT_TO_READ",
  READING = "READING",
  READ = "READ",
}
registerEnumType(BOOK_STATUS, {
  name: "BOOK_STATUS",
});
@ObjectType()
export class UserBooks {
  @prop({ ref: () => Book, type: mongoose.Types.ObjectId })
  public bookId: Ref<Book>;

  @Field(() => Book, { nullable: true })
  public book?: Book;

  @Field(() => String)
  @prop({ default: Date.now() })
  createdAt?: Date;

  @Field((type) => BOOK_STATUS)
  @prop({ required: true })
  status: BOOK_STATUS;
}

@pre<User>("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(16);
  const hash = await bcrypt.hashSync(this.password, salt);
  this.password = hash;
})
@ObjectType()
export class User {
  @Field(() => String)
  _id: string;

  @Field(() => String)
  @prop({ required: true })
  name: string;

  @Field(() => String)
  @prop({ required: true })
  email: string;

  @prop({ required: true })
  password: string;

  @prop({ ref: () => Category, type: [mongoose.Types.ObjectId] })
  public categoryIds: Ref<Category>[];

  @Field(() => [Category])
  public category: Category[];

  @Field(() => [UserBooks])
  @prop()
  userBooks: UserBooks[];
}

export const UserModel = getModelForClass(User);

@InputType()
export class CreateUserInput {
  @Field(() => String)
  name: string;

  @IsEmail()
  @Field(() => String)
  email: string;

  @MinLength(3, {
    message: "Password length must be 3 characters",
  })
  @MinLength(10, {
    message: "Password length must be less than 10 characters",
  })
  @Field(() => String)
  password: string;
}

@InputType()
export class UpdateUserGenre {
  @Field(() => [String])
  categoryIds: string[];
}

@InputType()
export class UpdateUserBooks {
  @Field(() => String)
  bookId: string;
  @Field((type) => BOOK_STATUS)
  status: BOOK_STATUS;
}

@InputType()
export class LoginUserInput {
  @Field(() => String)
  email: string;
  @Field(() => String)
  password: string;
}
