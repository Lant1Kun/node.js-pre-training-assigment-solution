import { Todo, TodoStatus } from './types';
import { createTodo } from './todo-factory';

export function addTodo(state: Todo[], todo: Todo): Todo[] {
  const result : Todo[] = [];
  for (let i = 0; i < state.length; i++) {
    result.push(state[i]);
  }
  result.push(todo);
  return result;
}

export function updateTodo(state: Todo[], id: number, update: Partial<Omit<Todo, 'id' | 'createdAt'>>): Todo[] {
  const result : Todo[] = [];
  let f = 0;
  for (let i = 0; i < state.length; i++) {
    const item = state[i];
    if (item.id === id) {
      let updated = update;
      let newtodo = {} as Todo;
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
      result.push(newtodo);
      f = 1;
    } else {
      result.push(item);
    }
  }
  if (f == 1) {
    return result;
  } else {
    throw Error('Updating unexisting Todo');
  }
}

export function removeTodo(state: Todo[], id: number): Todo[] {
  const result : Todo[] = [];
  let f = 0;
  for (let i = 0; i < state.length; i++) {
    if (state[i].id !== id) {
      result.push(state[i]);
    } else {
      f = 1;
    }
  }
  if (f == 1) {
    return result;
  } else {
    throw Error('Removing unexisting Todo');
  }
  
}

export function getTodo(state: Todo[], id: number): Todo | undefined {
  let result = {} as Todo;
  for (let i = 0; i < state.length; i++) {
    if (state[i].id === id) {
      result = state[i];
      break;
    }
  }
  return result;
}
