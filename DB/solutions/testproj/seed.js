const sequelize = require('./config/database');
const { User, Todo } = require('./models');

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database.');
    await sequelize.transaction(async (t) => {
      const [test1, test2] = await User.bulkCreate(
        [
          { name: 'Test User', email: 'first@example.com' },
          { name: 'Test User 2', email: 'second@example.com'   },
        ],
        { returning: true, transaction: t }
      );

      console.log(`👤 Created users: ${test1.name} (id=${test1.id}), ${test2.name} (id=${test2.id})`);
      const todos = await Todo.bulkCreate(
        [
          { title: 'Test todo 6',     description: 'Description of the sixth todo',           status: 'active',    user_id: test1.id },
          { title: 'Test todo 7',     description: 'Description of the seventh todo',        status: 'active',    user_id: test1.id },
          { title: 'Test todo 8',      description: null,                          status: 'completed', user_id: test1.id },

          { title: 'Test todo 9',      description: 'Description of the ninth todo',    status: 'active',    user_id: test2.id },
          { title: 'Test todo 10',     description: 'Description of the tenth todo',       status: 'completed', user_id: test2.id },
          { title: 'Test todo 11',     description: 'Description of the eleventh todo',  status: 'active',    user_id: test2.id },
        ],
        { returning: true, transaction: t }
      );

      console.log(`📋 Created ${todos.length} todos.`);
    });

    console.log('🎉 Seeding complete.');
  } catch (err) {
    console.error('❌ Seeding failed:', err);
  } finally {
    await sequelize.close();
  }
}

seed();