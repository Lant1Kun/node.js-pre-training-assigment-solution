import React, { useState } from 'react';
import { Todo } from '../../types';

/**
 * Task 10: AddToDoForm Component
 * 
 * Theory: Controlled Components and Form Handling
 * 
 * Controlled components are React components where the form data is handled by the component's state.
 * This gives you full control over the form's behavior and makes it easier to validate and process data.
 * 
 * Controlled vs Uncontrolled Components:
 * 
 * Controlled Components:
 * - Form data is stored in component state
 * - Value is set by state, onChange updates state
 * - Example: <input value={value} onChange={setValue} />
 * - Benefits: Full control, easy validation, predictable behavior
 * 
 * Uncontrolled Components:
 * - Form data is handled by the DOM
 * - Use refs to access form values
 * - Example: <input ref={inputRef} />
 * - Benefits: Less code, better performance for simple forms
 * 
 * Form Handling Best Practices:
 * 
 * 1. Prevent Default Behavior:
 *    - Use event.preventDefault() in onSubmit
 *    - Prevents page reload on form submission
 *    - Example: const handleSubmit = (e) => { e.preventDefault(); }
 * 
 * 2. Input Validation:
 *    - Validate on change or submit
 *    - Show error messages to users
 *    - Disable submit button if form is invalid
 * 
 * 3. Form State Management:
 *    - Track multiple form fields in state
 *    - Use object to store form data
 *    - Example: const [formData, setFormData] = useState({ title: '', description: '' })
 * 
 * 4. Form Submission:
 *    - Handle submission in onSubmit handler
 *    - Process form data
 *    - Clear form after successful submission
 * 
 * Common Form Patterns:
 * 
 * 1. Single Input:
 *    - Track single value in state
 *    - Simple and straightforward
 * 
 * 2. Multiple Inputs:
 *    - Use object to store all form data
 *    - Update specific fields with spread operator
 *    - Example: setFormData({...formData, title: value})
 * 
 * 3. Dynamic Forms:
 *    - Add/remove form fields dynamically
 *    - Use arrays to store multiple items
 * 
 * 4. Form Validation:
 *    - Track validation state separately
 *    - Show/hide error messages
 *    - Disable submit when invalid
 * 
 * Key Concepts:
 * - Use controlled components for complex forms
 * - Always prevent default form submission
 * - Validate input data
 * - Provide user feedback for errors
 * - Clear form after successful submission
 */
export const AddToDoForm: React.FC = () => {
  // TODO: Implement the AddToDoForm component
  // 
  // Requirements:
  // 1. Create a controlled form with input field
  // 2. Add a submit button
  // 3. Handle form submission properly
  // 4. Clear the form after submission
  // 5. Validate that input is not empty
  // 
  // Example implementation:
  // const [title, setTitle] = useState('');
  // const [todos, setTodos] = useState<Todo[]>([]);
  // 
  // const handleSubmit = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (!title.trim()) return;
  //   
  //   const newTodo: Todo = {
  //     id: Date.now(),
  //     title: title.trim(),
  //     completed: false
  //   };
  //   
  //   setTodos([...todos, newTodo]);
  //   setTitle('');
  // };
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
          <button type='submit'>Submit</button>
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