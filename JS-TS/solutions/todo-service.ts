import { TodoApi } from './todo-api';
import { Todo, TodoStatus } from './types';

export class TodoService {
  constructor(private readonly api: TodoApi) { }
  private currentid = 1;
  async create(title: string, description = ''): Promise<Todo> {
    const result = {} as Todo;
    result.id = this.currentid;
    this.currentid++;
    result.title = title;
    result.description = description;
    result.createdAt = new Date();
    result.status = TodoStatus.PENDING;
    this.api.add(result);
    return result;
  }

  async toggleStatus(id: number): Promise<Todo> {
    const item = this.api.update(id, { status : TodoStatus.COMPLETED });
    return item;
  }

  async search(keyword: string): Promise<Todo[]> {
    const result : Todo[] = [];
    const curarr = this.api.getAll();
    for (let i = 0; i < (await curarr).length; i++) {
      const item = (await curarr);
      if (item[i].title === keyword) {
        result.push(item[i]);
      }
    }
    return result;
  }
}
