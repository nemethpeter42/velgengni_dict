export type MongoCredentials = {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
    authSource?: string;
};
