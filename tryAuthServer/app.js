const express = require('express');
const mongoose = require('mongoose');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());

// Middleware
const jwtMiddleware = require('./middleware/jwtMiddleware');
const refreshTokenMiddleware = require('./middleware/refreshTokenMiddleware');
app.use('/api/auth', require(__dirname + '/routes/auth'));
app.use('/api/user', require(__dirname + '/routes/user'));

// Connect to MongoDB
mongoose.connect('mongodb+srv://ashikurjhalak:jholok7510748209@cluster0.lgpuqkk.mongodb.net/?retryWrites=true&w=majority&appName=AtlasApp', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

// Use the jwtMiddleware and refreshTokenMiddleware for all routes under '/api'
app.use('/api', jwtMiddleware);
app.use('/api', refreshTokenMiddleware);

// Use the userMiddleware router for '/api/user' routes
const userMiddleware = require('./middleware/UserMiddleware'); // Update the path to your UserMiddleware file
app.use('/api/user', userMiddleware);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});