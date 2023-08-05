import { Transaction } from './Transaction';
import { ConstructorType } from '../types/Types';

export class TransactionManager {
  private createdTransactions: Transaction[] = [];
  constructor(private transaction: Map<string | Symbol | ConstructorType<any>, Transaction> = new Map()) {}

  setTransaction(key: string | Symbol | ConstructorType<any>, transaction: Transaction) {
    return this.transaction.set(key, transaction);
  }

  hasTransaction(key: string | Symbol | ConstructorType<any>) {
    return this.transaction.has(key);
  }

  deleteTransaction(key: string | Symbol | ConstructorType<any>) {
    return this.transaction.delete(key);
  }

  getTransaction<T = any, I = any>(type: string | Symbol | ConstructorType<T>): Transaction<I, T> | undefined {
    const transaction = this.transaction.get(type);
    if (transaction) {
      this.createdTransactions.push(transaction);
      return transaction as Transaction<I, T>;
    } else {
      return undefined;
    }
  }

  async try() {
    // console.log('try', this.transaction);
  }
  //
  async catch(e: any) {
    // console.log('error', e, this.transaction);
    for (let createdTransaction of this.createdTransactions) {
      try {
        await createdTransaction.catch(e);
      } catch (e) {}
    }
  }

  async finally() {
    // console.log('finally', this.transaction);
    for (let createdTransaction of this.createdTransactions) {
      try {
        await createdTransaction.finally();
      } catch (e) {}
    }
    this.transaction.clear();
  }
}
