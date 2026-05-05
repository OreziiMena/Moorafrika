import {
  createCategory,
  updateCategory as _updateCategory,
  deleteCategory as _deleteCategory,
  getAllCategories,
} from '@/repositories/category.repository';
import { createCategorySchema } from '@/validationSchemas/category';
import z from 'zod';
import { CategoryContract } from '@/contracts/category';
import AuthService from './auth.service';

class CategoryService {
  static async fetchAllCategories(): Promise<CategoryContract[]> {
    const categories = await getAllCategories();
    return categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
    }));
  }

  static async createNewCategory(
    payload: z.infer<typeof createCategorySchema>,
  ): Promise<CategoryContract> {
    await AuthService.authorizeUser(['ADMIN']);

    const { name } = payload;

    const category = await createCategory({ name });

    return {
      id: category.id,
      name: category.name,
    };
  }

  static async updateCategory(
    id: number,
    payload: z.infer<typeof createCategorySchema>,
  ): Promise<CategoryContract> {
    await AuthService.authorizeUser(['ADMIN']);

    const { name } = payload;

    const category = await _updateCategory(id, { name });

    return {
      id: category.id,
      name: category.name,
    };
  }

  static async deleteCategory(id: number): Promise<void> {
    await AuthService.authorizeUser(['ADMIN']);

    await _deleteCategory(id);

    return;
  }
}

export default CategoryService;
