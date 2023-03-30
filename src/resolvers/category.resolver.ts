import { IDataloaders } from "src/interfaces/dataloader.interface";
import {
  Arg,
  Ctx,
  FieldResolver,
  Mutation,
  Query,
  Resolver,
  Root,
} from "type-graphql";
import { Category } from "../schema/category.schema";
import CategoriesService from "../services/categories.service";

@Resolver((of) => Category)
class CategoryResolver {
  constructor(private categoriesService: CategoriesService) {
    this.categoriesService = new CategoriesService();
  }
  @FieldResolver()
  books(
    @Root() category: Category,
    @Ctx() { loaders }: { loaders: IDataloaders }
  ) {
    return loaders.booksLoader.load(category._id);
  }

  @Query(() => [Category])
  getCategories() {
    return this.categoriesService.getAllCategories();
  }

  @Query(() => Category)
  getCategoryById(@Arg("id", () => String) id: string) {
    return this.categoriesService.getCategoryById(id);
  }

  @Mutation(() => Category)
  createCategory(@Arg("name") name: string) {
    return this.categoriesService.createNewCategory(name);
  }
}
export default CategoryResolver;
