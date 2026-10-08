const sequelize = require('./config/database');
const { User, Todo } = require('./models');

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connection has been established successfully.');

    const userCount = await User.count();
    console.log(`📊 Found ${userCount} users in the database.`);
    
    const todos = await Todo.findAll();
    console.log('📋 Sample todos:', todos.map(t => t.title));
    
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
  } finally {
    await sequelize.close();
  }
}

testConnection();