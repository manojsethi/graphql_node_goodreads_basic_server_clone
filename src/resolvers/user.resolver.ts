import { Book } from "src/schema/books.schema";
import { Category } from "src/schema/category.schema";
import {
  Arg,
  Authorized,
  Ctx,
  FieldResolver,
  Mutation,
  Query,
  Resolver,
  Root,
} from "type-graphql";
import Context from "../interfaces/context.interface";
import {
  CreateUserInput,
  LoginUserInput,
  UpdateUserBooks,
  UpdateUserGenre,
  User,
  UserBooks,
} from "../schema/user.schema";
import UserService from "../services/user.service";

@Resolver((of) => UserBooks)
export class UserBookResolver {
  @FieldResolver()
  book(@Root() userBook: UserBooks) {
    if (userBook) return userBook.bookId as Book;
    else return null;
  }
}
@Resolver((of) => User)
class UserResolver {
  constructor(private userService: UserService) {
    this.userService = new UserService();
  }

  @FieldResolver()
  category(@Root() user: User) {
    if (user.categoryIds) return user.categoryIds as Category[];
    else return [];
  }

  @Mutation(() => User)
  createUser(@Arg("input") input: CreateUserInput) {
    return this.userService.CreateUser(input);
  }
  @Authorized()
  @Mutation(() => User)
  updateCategory(
    @Arg("input") input: UpdateUserGenre,
    @Ctx() context: Context
  ) {
    return this.userService.UpdateUserGenre(input, context);
  }

  @Authorized()
  @Mutation(() => User)
  updateUserBooks(
    @Arg("input") input: UpdateUserBooks,
    @Ctx() context: Context
  ) {
    return this.userService.UpdateUserBooks(input, context);
  }

  @Authorized()
  @Mutation(() => User)
  removeUserBooks(
    @Arg("input") input: UpdateUserBooks,
    @Ctx() context: Context
  ) {
    return this.userService.RemoveUserBooks(input, context);
  }

  @Mutation(() => String)
  login(@Arg("input") input: LoginUserInput, @Ctx() context: Context) {
    return this.userService.LoginUser(input, context);
  }

  @Query(() => Boolean)
  logout(@Ctx() context: Context) {
    context.res.clearCookie("accessToken");
    return true;
  }

  @Authorized()
  @Query(() => User)
  me(@Ctx() context: Context) {
    return context.user;
  }
  @Authorized()
  @Query(() => User)
  getUpdatedMe(@Ctx() context: Context) {
    return this.userService.getUserById(context);
  }
}
export default UserResolver;
