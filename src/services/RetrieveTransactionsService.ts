// import AppError from '../errors/AppError';

import { getCustomRepository } from 'typeorm';
import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';

class RetrieveTransactionsService {
  public async execute(): Promise<{
    transactions: Transaction[];
    balance: { income: number; outcome: number; total: number };
  }> {
    const transactionRepository = getCustomRepository(TransactionsRepository);
    const transactions = await transactionRepository.find();

    const balance = await transactionRepository.getBalance();

    return {
      transactions,
      balance,
    };
  }
}

export default RetrieveTransactionsService;
