import { InMemoryRepository } from './repository';
import { Todo, NewTodo } from './types';
import { createTodo } from './todo-factory';
import { updateTodo } from './todo-crud';

export class TodoApi {
  private repo = new InMemoryRepository<Todo>();
  private nextID = 1;
  private todoar : Todo[] = [];
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  async getAll(): Promise<Todo[]> {
    await this.delay(300);
    return [...this.todoar];
  }

  async add(newTodo: NewTodo): Promise<Todo> {
    await this.delay(300);
    const item = createTodo(newTodo)
    this.todoar.push(item);
    return item;
  }

  async update(id: number, update: Partial<Omit<Todo, 'id' | 'createdAt'>>): Promise<Todo> {
     await this.delay(300);
     let f = 0;
     let newtodo = {} as Todo;
     for (let i = 0; i < this.todoar.length; i++) {
     const item = this.todoar[i];
      if (item.id === id) {
        let updated = update;
        newtodo.id = item.id;
        newtodo.createdAt = item.createdAt;
        if (updated.description != undefined) {
          newtodo.description = updated.description;
        } else {
          newtodo.description = item.description;
        }
        if (updated.status != undefined) {
          newtodo.status = updated.status;
        } else {
          newtodo.status = item.status;
        }
        if (updated.title != undefined) {
          newtodo.title = updated.title;
        } else {
          newtodo.title = item.title;
        }
        this.todoar[i] = newtodo;
        f = 1;
      }
    }
    if (f == 1) {
      return newtodo;
    } else {
      throw Error('TodoNotFoundError');
    }
  }
  async remove(id: number): Promise<void> {
    let f = 0;
    for (let i = 0; i < this.todoar.length; i++) {
      if (this.todoar[i].id === id) {
        f = 1;
      }
    }
    if (f == 1) {
      this.todoar.filter(todo => todo.id !== id);
    } else {
      throw Error('TodoNotFoundError');
    }
  }
}
