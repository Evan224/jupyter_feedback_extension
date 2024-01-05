const express = require('express');
const cors = require('cors'); // Import the cors library
const app = express();
const PORT = 3000;
const db = require('./models');
const userRoutes = require('./routes/users');
const commentRoutes = require('./routes/comments');
const routes = require('./routes');
const eventRoutes = require('./routes/events');
const { seedMockData } = require('./controllers/seedController');  
const { generateMockData } = require('./controllers/commentsController');
const rateRoutes = require('./routes/rates');

app.use(cors()); // Use the cors middleware
app.use(express.json());
app.use('/users', userRoutes);
app.use('/comments', commentRoutes);
app.use('/', routes);
app.use('/events', eventRoutes);
app.use('/rates', rateRoutes);

db.sequelize.sync({
    force: false
}).then(async() => {

    try {
        // await seedMockData();
        // await generateMockData();
        console.log('Mock data seeded successfully!');
    } catch (error) {
        console.error('Error seeding mock data:', error.message);
    }

    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
});
