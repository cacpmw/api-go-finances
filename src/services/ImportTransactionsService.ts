import csvParse from 'csv-parse';
import fs from 'fs';
import { getCustomRepository, In } from 'typeorm';
import Transaction from '../models/Transaction';
import CategoriesRepository from '../repositories/CategoriesRepository';
import TransactionsRepository from '../repositories/TransactionsRepository';

class ImportTransactionsService {
  async execute(filePath: string): Promise<Transaction[]> {
    const contactsReadStream = fs.createReadStream(filePath);
    const parser = csvParse({
      from_line: 2,
    });
    const csv = contactsReadStream.pipe(parser);
    const transactions: {
      title: string;
      value: number;
      type: 'income' | 'outcome';
      category: string;
    }[] = [];
    const categories: string[] = [];
    csv.on('data', async line => {
      const [title, type, value, category] = line.map((cell: string) =>
        cell.trim(),
      );
      if (!title || !type || !value) return;

      categories.push(category);
      transactions.push({
        title,
        type,
        value,
        category,
      });
    });

    await new Promise(resolve => csv.on('end', resolve));

    const categoryRepository = getCustomRepository(CategoriesRepository);
    const existingCategories = await categoryRepository.find({
      where: { title: In(categories) },
    });
    const existingCategoriesTitles = existingCategories.map(
      (category: { title: string }) => category.title,
    );
    const newCategoryTitles = categories
      .filter(category => !existingCategoriesTitles.includes(category))
      .filter((value, index, self) => self.indexOf(value) === index);

    const newCategories = categoryRepository.create(
      newCategoryTitles.map(title => ({ title })),
    );
    await categoryRepository.save(newCategories);

    const transactionRepository = getCustomRepository(TransactionsRepository);
    const mergedCategories = [...newCategories, ...existingCategories];
    const newTransactions = transactionRepository.create(
      transactions.map(transaction => ({
        title: transaction.title,
        type: transaction.type,
        value: transaction.value,
        category: mergedCategories.find(
          category => category.title === transaction.category,
        ),
      })),
    );
    await transactionRepository.save(newTransactions);
    await fs.promises.unlink(filePath);

    return newTransactions;
  }
}

export default ImportTransactionsService;
