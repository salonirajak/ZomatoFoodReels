// start server
console.log('Loading dotenv config...');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
console.log('JWT_SECRET from process.env:', process.env.JWT_SECRET ? 'Loaded' : 'Not found');

const app = require('./src/app');
const connectDB = require('./src/db/db');

// Connect to database
connectDB();

// Start server with error handling and dynamic port selection
let PORT = process.env.PORT || 3000;
console.log(`Attempting to start server on port ${PORT}`);

// Try to start server with error handling and dynamic port selection
function startServer() {
    const server = app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
        console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    // Handle server errors
    server.on('error', (err) => {
        console.error('Server error:', err);
        if (err.code === 'EADDRINUSE') {
            console.log(`Port ${PORT} is already in use. Trying ${PORT + 1}...`);
            PORT++;
            setTimeout(startServer, 1000);
        }
    });
    
    // Log the actual port the server is listening on
    server.on('listening', () => {
        const address = server.address();
        console.log(`Server is now listening on port ${address.port}`);
    });
}

startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('Process terminated');
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    server.close(() => {
        console.log('Process terminated');
    });
});