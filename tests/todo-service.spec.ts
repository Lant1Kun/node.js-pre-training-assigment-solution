import { InMemoryRepository } from "../JS-TS/solutions/repository"
import { TodoApi, TodoNotFoundError } from "../JS-TS/solutions/todo-api";
import { createTodo } from "../JS-TS/solutions/todo-factory";
import { TodoService } from "../JS-TS/solutions/todo-service"
import {Todo, TodoStatus, NewTodo} from "../JS-TS/solutions/types"

jest.mock('../todo-factory', () => {
  return {
    createTodo: jest.fn(),
  };
});

jest.mock('../todo-crud', () => ({
  updateTodo: jest.fn(),
}));

describe('TodoService', () => {
  let api: TodoApi;
  let service: TodoService;
  let idCounter: number;
  beforeEach (() => {
    idCounter = 1;
    (createTodo as jest.Mock).mockImplementation((newTodo: NewTodo) => {
      return {
        id: idCounter++,
        createdAt: new Date(),
        ...newTodo,
      } as Todo;
    });

    api = new TodoApi();
    api.delay = jest.fn().mockResolvedValue(undefined);
    service = new TodoService(api);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  const getStoredTodoByTitle = async (title: string): Promise<Todo | undefined> => {
    const all = await api.getAll();
    return all.find(t => t.title === title);
  };
  describe('create', () => {
    it('should create a todo and store it', async () => {
      const returned = await service.create('Test title', 'Some description');
      expect(returned.title).toBe('Test title');
      expect(returned.description).toBe('Some description');
      expect(returned.status).toBe(TodoStatus.PENDING);
      expect(returned.createdAt).toBeInstanceOf(Date);
      expect(returned.id).toBeDefined();
    });
  });

  describe('toggleStatus', () => {
    it('should toggle an existing todo to COMPLETED', async () => {
      await service.create('Toggle me', '');
      const stored = await getStoredTodoByTitle('Toggle me');
      expect(stored).toBeDefined();
      const id = stored!.id;

      const updated = await service.toggleStatus(id);
      expect(updated.status).toBe(TodoStatus.COMPLETED);
    });

    it('should throw TodoNotFoundError when toggling a non‑existing id', async () => {
      await expect(service.toggleStatus(-1)).rejects.toThrow(TodoNotFoundError);
    });
  });

  describe('search', () => {
    beforeEach(async () => {
      await service.create('Buy milk', '');
      await service.create('Buy eggs', '');
      await service.create('Walk the dog', '');
    });

    it('should return todos whose title contains the keyword (case‑insensitive)', async () => {
      const result2 = await service.search('dog');
      expect(result2).toHaveLength(1);
      expect(result2[0].title).toBe('Walk the dog');
    });
  });
});