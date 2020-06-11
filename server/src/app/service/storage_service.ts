import { ClientSession, Db, MongoClient } from 'mongodb';
import { config } from '../../config';
import { assert } from '../../core/assert';
import { OnApplicationInit } from '../../core/on_application_init';

export class StorageService implements OnApplicationInit {
    db!: Db;
    private client!: MongoClient;

    async init() {
        try {
            this.client = new MongoClient(config.mongoConnectionString, { useUnifiedTopology: true });
            await this.client.connect();
            this.db = this.client.db();
        }
        catch (e) {
            console.error('MongodbTransport: Could not connect to mongodb');
            console.error(e);
        }
    }

    async transaction<T>(fn: (session: ClientSession) => Promise<T>) {
        assert.value(this.client, 'Database connection lost');
        const session = this.client.startSession();
        let result: T;
        await session
            .withTransaction(async () => {
                result = await fn(session)
            })
            .finally(() => {
                session.endSession()
            });
        return result!;
    }
}
