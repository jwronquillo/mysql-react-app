const express = require('express');
const cors = require('cors');
const searchRoutes = require('./Routes/searchRoutes.js');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/search', searchRoutes);

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});