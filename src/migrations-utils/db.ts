import { MongoClient } from 'mongodb';
import { config } from 'dotenv';
config();

const ENVs = {
    MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017/insuremetest"
}

export const getDb = async () => {
    const client: any = await MongoClient.connect(ENVs.MONGODB_URI);
    return client.db();
};
