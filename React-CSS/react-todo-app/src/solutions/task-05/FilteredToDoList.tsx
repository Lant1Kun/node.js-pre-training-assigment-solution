import React, { useState } from 'react';
import { Todo } from '../../types';

/**
 * Task 5: FilteredToDoList Component
 * 
 * Theory: Derived State and Computed Values
 * 
 * In React, you often need to compute values based on your state. These are called "derived state"
 * or "computed values" and should be calculated during render rather than stored in state.
 * 
 * Why Use Derived State:
 * 1. Avoids state synchronization issues
 * 2. Reduces complexity by having a single source of truth
 * 3. Automatically updates when source data changes
 * 4. Prevents stale state bugs
 * 
 * Common Derived State Patterns:
 * 
 * Filtering:
 * - const activeTodos = todos.filter(todo => !todo.completed)
 * - const completedTodos = todos.filter(todo => todo.completed)
 * 
 * Searching:
 * - const filteredTodos = todos.filter(todo => 
 *     todo.title.toLowerCase().includes(searchTerm.toLowerCase())
 *   )
 * 
 * Sorting:
 * - const sortedTodos = [...todos].sort((a, b) => a.title.localeCompare(b.title))
 * 
 * Aggregations:
 * - const completedCount = todos.filter(todo => todo.completed).length
 * - const totalCount = todos.length
 * 
 * Multiple Filters:
 * - Use multiple filter conditions or combine them
 * - Consider using useMemo for expensive computations
 * 
 * Key Concepts:
 * - Calculate derived values during render
 * - Don't store computed values in state
 * - Use useMemo for expensive calculations
 * - Keep state minimal and derive the rest
 */
export const FilteredToDoList: React.FC = () => {
  // TODO: Implement the FilteredToDoList component
  // 
  // Requirements:
  // 1. Display a list of todos with add functionality
  // 2. Add filter buttons: "All", "Active", "Completed"
  // 3. Filter todos based on selected filter
  // 4. Use derived state for filtered results
  // 5. Add complete functionality for todos
  // 
  // Example implementation:
  // const [todos, setTodos] = useState<Todo[]>([]);
  // const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  // 
  // const filteredTodos = todos.filter(todo => {
  //   if (filter === 'active') return !todo.completed;
  //   if (filter === 'completed') return todo.completed;
  //   return true; // 'all' case
  // });

    const [todos, setTodos] = useState<Todo[]>([]);
    const [todoName, setTodoName] = useState<Todo['title']>('');
    const [todoStatus, setTodoStatus] = useState<Todo['completed']>(false);
    const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
    const filteredTodos = todos.filter(todo => {
       if (filter === 'active') return !todo.completed;
       if (filter === 'completed') return todo.completed;
       return true; // 'all' case
    });
    const newFixTodo = (event: React.ChangeEvent<HTMLInputElement>) => {
      const todoCurName = event.target;
      setTodoName(todoCurName.value);
    };
    function addTodo(event: React.FormEvent<HTMLFormElement>) {
      event.preventDefault(); 
      const newTodo = {
        title: todoName,
        id: todos.length + 1,
        completed: todoStatus
      };
      setTodos(todos => [...todos, newTodo]);
      setTodoName('');
    };
    const completeTodo = (id : number) => {
      let todoList = todos;
      todoList[id - 1].completed = true;
      setTodos(todos => [...todoList]);
    }
    const showAll = () => {
      setFilter('all');
    }
    const showCompleted = () => {
      setFilter('completed');
    }
    const showActive = () => {
      setFilter('active');
    }
    return (
      <div>
        <form onSubmit={addTodo}>
          <div>
            <input type='text' id='name' name='name' placeholder='Add todo' value={todoName} onChange={newFixTodo} required/>
          </div>
          <button type='submit'>Add new ToDo</button>
        </form>
        <ul style={{listStyle: 'none'}}>
          {filteredTodos.map((todo) => (
            <li key={todo.id}>
              <span style={{marginRight: 20}}>{todo.title} - {todo.completed ? 'completed' : 'not completed'}</span>
              <button onClick={() => completeTodo(todo.id)}>Complete</button>
            </li>
          ))};
        </ul>
        <h4>Filters</h4>
        <button style={{marginRight: 10}} onClick={() => showAll()}>All</button>
        <button style={{marginRight: 10}} onClick={() => showActive()}>Active</button>
        <button onClick={() => showCompleted  ()}>Completed</button>
      </div>
    );
}; 