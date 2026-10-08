const { User, Todo } = require('./models');
const sequelize = require('./config/database');

(async () => {
  const users = await User.findAll({
    include: [{ model: Todo, as: 'todos' }],
  });
  users.forEach((u) => {
    console.log(`\n${u.name} <${u.email}> — ${u.todos.length} todos`);
    u.todos.forEach((t) => console.log(`  - [${t.status}] ${t.title}`));
  });
  await sequelize.close();
})();