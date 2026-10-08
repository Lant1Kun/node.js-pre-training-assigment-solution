const User = require('./User');
const Todo = require('./Todo');

User.hasMany(Todo, {
  foreignKey: 'user_id',
  as: 'todos',
});

Todo.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

module.exports = { User, Todo };