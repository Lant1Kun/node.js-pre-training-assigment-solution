import { Todo, TodoStatus } from './types';
import { createTodo } from './todo-factory';
import { addTodo } from './todo-crud';

export function toggleAll(state: Todo[], completed: boolean): Todo[] {
  let result : Todo[] = [];
  let resstate;
  if (completed == true) {
    resstate = TodoStatus.COMPLETED;
  } else {
    resstate = TodoStatus.IN_PROGRESS;
  }
  result = state.map(todo => ({...todo}));
  result.forEach(todo => todo.status = resstate);
  return result;
}

export function clearCompleted(state: Todo[]): Todo[] {
  let result : Todo[] = [];
  result = state.filter(todo => todo.status != TodoStatus.COMPLETED);
  return result;
}

export function countByStatus(state: Todo[], status: TodoStatus): number {
  let counter : number;
  let result : Todo[] = [];
  result = state.filter(todo => todo.status == status);
  counter = result.length;
  return counter;
}