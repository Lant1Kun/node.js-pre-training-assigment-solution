import { Todo, NewTodo, TodoStatus } from './types';

let nextId = 1;

export function createTodo(input: NewTodo): Todo {
  const result = {} as Todo;
  if (input.description != undefined) {
     result.description = input.description;
  } else {
    result.description = '';
  }
  result.id = nextId;
  nextId++;
  if (input.status != undefined) {
     result.status = input.status;
  } else {
    result.status = TodoStatus.PENDING;
  }
  if (input.title != undefined) {
     result.title = input.title;
  } else {
    result.title = '';
  }
  result.createdAt = new Date();
  return result;
}

