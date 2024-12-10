import mongoose from "mongoose";

const connections = {};

const ConnectionToDatabase = async (username, password, database) => {
    if (connections[database]) {
        console.log("Reusing existing connection for", database);
        return connections[database];
    }

    try {
        const uri = `mongodb+srv://${username}:${password}@cluster0.jb6pz7m.mongodb.net/${database}?retryWrites=true&w=majority&appName=Cluster0`;
        
        // Use mongoose.connect for a unified connection
        const connection = await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        connections[database] = connection;
        console.log("New connection established for", database);
        return connection;
    } catch (err) {
        console.error("Connection Error:", err.message);
        throw new Error("Database connection failed");
    }
};

export default ConnectionToDatabase;
