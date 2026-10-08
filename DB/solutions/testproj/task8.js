const sequelize = require('./config/database');
const { User, Todo } = require('./models');

async function createTodo({ title, description, status, userId }) {
  const todo = await Todo.create({
    title,
    description: description ?? null,
    status: status ?? 'active',
    user_id: userId,
  });

  console.log('Created todo:', todo.toJSON());
  return todo;
}

async function getAllTodos() {
    const todos = await Todo.findAll();
    console.log(todos.map((t) => t.toJSON()));
    return todos;
}

async function updateTodo(id, data) {
    const todo = await Todo.findByPk(id);
    if (!todo) {
        console.log(`Todo with id = ${id} doesn't exists`);
        return null;
    }
    await todo.update(data);
    console.log('Updated: ', todo.toJSON());
    return todo;
}

async function deleteTodo(id) {
  const todo = await Todo.findByPk(id);
  if (!todo) {
    console.log(`Todo with id = ${id} doesn't exists`);
    return false;
  }
  await todo.destroy();
  console.log(`Deleted todo ${id}`);
  return true;
}

updateTodo(3, { status: 'completed' });
getAllTodos();
createTodo({
  title: 'Test',
  description: 'Test desc',
  status: 'active',
  userId: 3,
});
getAllTodos();
deleteTodo(8);
getAllTodos();