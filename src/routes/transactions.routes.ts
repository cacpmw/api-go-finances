import { Router, Request, Response } from 'express';
import multer from 'multer';
import multerConfig from '../config/multerConfig';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';
import RetrieveTransactionsService from '../services/RetrieveTransactionsService';

// import TransactionsRepository from '../repositories/TransactionsRepository';
// import CreateTransactionService from '../services/CreateTransactionService';
// import DeleteTransactionService from '../services/DeleteTransactionService';
// import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();
const multerObject = multer(multerConfig);

transactionsRouter.get('/', async (request: Request, response: Response) => {
  const retrieveTransactionsService = new RetrieveTransactionsService();
  const transactionsWithBalance = await retrieveTransactionsService.execute();

  return response.status(200).json(transactionsWithBalance);
});

transactionsRouter.post('/', async (request: Request, response: Response) => {
  const { title, value, type, category } = request.body;
  const data = {
    title,
    value,
    type,
    category,
  };

  const createTransactionService = new CreateTransactionService();
  const transaction = await createTransactionService.execute(data);
  return response.status(201).json(transaction);
});

transactionsRouter.delete(
  '/:id',
  async (request: Request, response: Response) => {
    const deleteTransactionService = new DeleteTransactionService();
    const { id } = request.params;
    await deleteTransactionService.execute(id);
    return response.status(204).send();
  },
);

transactionsRouter.post(
  '/import',
  multerObject.single('file'),
  async (request: Request, response: Response) => {
    const importTransactionService = new ImportTransactionsService();
    const result = await importTransactionService.execute(request.file.path);
    return response.status(201).json(result);
  },
);

export default transactionsRouter;
