import { GraphQLError } from "graphql";
import { Category, CategoryModel } from "../schema/category.schema";

class CategoriesService {
  async getAllCategories(): Promise<Category[]> {
    return await CategoryModel.find().lean();
  }
  async getCategoryById(id: string): Promise<Category> {
    return await CategoryModel.findById(id).lean();
  }
  async createNewCategory(name: string): Promise<Category | undefined> {
    let existingCategory = await CategoryModel.findOne({
      name: { $regex: new RegExp(name, "i") },
    });
    if (existingCategory)
      throw new GraphQLError("This category already exists");
    return await (await CategoryModel.create({ name })).toObject();
  }
}

export default CategoriesService;
