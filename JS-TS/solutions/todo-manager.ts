import { TodoService } from './todo-service';
import { TodoApi } from './todo-api';
import { Todo } from './types';

export class ToDoManager {
  private service = new TodoService(new TodoApi());
  private todoarr : Todo[] = [];
  async init(): Promise<void> {
    this.todoarr.push(await this.service.create('testtodo', ''));
  }

  async add(title: string, description = ''): Promise<void> {
    this.todoarr.push(await this.service.create(title, description));
  }

  async complete(id: number): Promise<void> {
    const listik = await this.list();
    for (let i = 0; i < listik.length; i++) {
      if (listik[i].id === id) {
        listik[i] = await this.service.toggleStatus(id);
      }
    }
    this.todoarr = listik;
  }

  async list(): Promise<Todo[]> {
    return this.todoarr;
  }
}
/*const todomanage = new ToDoManager;
todomanage.init();
todomanage.add('67');
console.log(todomanage.list());
todomanage.complete(2);*/