import { InMemoryRepository } from './repository';
import { Todo, NewTodo } from './types';
import { createTodo } from './todo-factory';
import { updateTodo } from './todo-crud';

export class TodoApi {
  private repo = new InMemoryRepository<Todo>();
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  async getAll(): Promise<Todo[]> {
    await this.delay(300);
    return this.repo.findAll();
  }

  async add(newTodo: NewTodo): Promise<Todo> {
    await this.delay(300);
    const item = createTodo(newTodo);
    return this.repo.add(item);
  }

  async update(id: number, update: Partial<Omit<Todo, 'id' | 'createdAt'>>): Promise<Todo> {
    await this.delay(300);
    let f = this.repo.findById(id);
    if (f !== undefined) {
      return this.repo.update(id, update);
    } else {
      throw Error('TodoNotFoundError');
    }
  }
  async remove(id: number): Promise<void> {
    await this.delay(400);
    let f = this.repo.findById(id);
    if (f !== undefined) {
      return this.repo.remove(id);
    } else {
      throw Error('TodoNotFoundError');
    }
  }
}
