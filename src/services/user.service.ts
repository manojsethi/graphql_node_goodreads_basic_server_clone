import { mongoose } from "@typegoose/typegoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Context from "src/interfaces/context.interface";
import EnvironmentConfig from "../interfaces/environment";
import { BooksModel } from "../schema/books.schema";
import {
  CreateUserInput,
  LoginUserInput,
  UpdateUserBooks,
  UpdateUserGenre,
  UserBooks,
  UserModel,
} from "../schema/user.schema";

class UserService {
  async CreateUser(input: CreateUserInput) {
    input.email = input.email.toLowerCase().trim();
    let User = await UserModel.findOne({ email: input.email });
    if (!User) return await UserModel.create(input);
    else throw new Error("User Already Exist");
  }
  async UpdateUserGenre(input: UpdateUserGenre, context: Context) {
    await UserModel.findByIdAndUpdate(context.user?._id, {
      categoryIds: input.categoryIds,
    });
    return await UserModel.findById(context.user?._id)
      .populate(["categoryIds", "userBooks.bookId"])
      .lean();
  }

  async UpdateUserBooks(input: UpdateUserBooks, context: Context) {
    let user = await UserModel.findById(context.user?._id);
    if (user) {
      let userBooks = user.userBooks;
      let foundBookIndex = userBooks.findIndex(
        (book) => book.bookId.toString() === input.bookId
      );
      if (foundBookIndex !== -1) {
        userBooks[foundBookIndex].status = input.status;
        userBooks[foundBookIndex][
          (input.status.toLowerCase() + "_time") as keyof UserBooks
        ] = new Date() as any;
      } else {
        userBooks.push({
          bookId: new mongoose.Types.ObjectId(input.bookId) as any,
          status: input.status,
          want_to_read_time: new Date(),
        });
      }
      await UserModel.findByIdAndUpdate(context.user?._id, {
        userBooks,
      });
    }
    let result = await UserModel.findById(context.user?._id)
      .populate([
        { path: "categoryIds" },
        {
          path: "userBooks",
          populate: {
            path: "bookId",
            model: BooksModel,
          },
        },
      ])
      .lean();
    return result;
  }

  async LoginUser(input: LoginUserInput, context: Context) {
    let d = context.req.t("home.title");
    input.email = input.email.toLowerCase().trim();
    let User = await UserModel.findOne({ email: input.email })
      .populate(["categoryIds"])
      .lean();
    if (User && (await bcrypt.compare(input.password, User.password))) {
      let tokenObj: any = User;
      delete tokenObj.password;
      const token = jwt.sign(tokenObj, EnvironmentConfig.JWT_SECRET, {
        expiresIn: "120m",
      });
      context.res.cookie("accessToken", token, {
        maxAge: 3.154e10,
        httpOnly: true,
        domain: "localhost",
        sameSite: "none",
        secure: true,
        path: "/",
      });
      return token;
    } else throw new Error(`${context.req.t("errors.user_does_not_exists")}`);
  }

  async getUserById(context: Context) {
    let result = await UserModel.findById(context.user?._id)
      .populate([
        { path: "categoryIds" },
        {
          path: "userBooks",
          populate: {
            path: "bookId",
            model: BooksModel,
          },
        },
      ])
      .lean();
    return result;
  }
}

export default UserService;
