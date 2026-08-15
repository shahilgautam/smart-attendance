const app = require("./app");
const initializeDatabase = require("./config/initDatabase");

const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        // Initialize database first
        await initializeDatabase();

        // Start server only after DB is ready
        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error("❌ Failed to start server");
        console.error(error);
        process.exit(1);
    }
}

startServer();
