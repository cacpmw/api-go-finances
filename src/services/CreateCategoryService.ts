// import AppError from '../errors/AppError';

import { getCustomRepository } from 'typeorm';
import Category from '../models/Category';
import CategoriesRepository from '../repositories/CategoriesRepository';

class CreateCategoryService {
  public async execute(title: string): Promise<Category> {
    const categoryRepository = getCustomRepository(CategoriesRepository);
    const categoryExists = await categoryRepository.findOne({
      where: { title },
    });
    if (categoryExists) {
      return categoryExists;
    }
    const data = {
      title,
    };
    const category = categoryRepository.create(data);
    await categoryRepository.save(category);
    return category;
  }
}

export default CreateCategoryService;
