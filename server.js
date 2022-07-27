const { app } = require('./app');

// Init models relations function
const { initModels } = require('./models/initModels');

// Utils
const { db } = require('./utils/database.util');

const startServer = async () => {
  try {
    await db.authenticate();
    console.log('Database authenticated');

    // Establish model's relations
    initModels();

    await db.sync();
    console.log('Database synced');

    const PORT = process.env.PORT || 4000;

    // Start server
    app.listen(PORT, () => console.log('Server on port', PORT));
  } catch (err) {
    console.log(err);
  }
};

startServer();
