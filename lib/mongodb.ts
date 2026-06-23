import { MongoClient, Db } from "mongodb";

let client: MongoClient | null = null;
let db: Db | null = null;

export async function getDb(): Promise<Db | null> {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) return null;
  if (db) return db;
  client = new MongoClient(url);
  await client.connect();
  db = client.db();
  return db;
}

export type SiteUser = {
  _id?: string;
  email: string;
  passwordHash: string;
  role: "admin" | "user";
  createdAt: Date;
};

export async function ensureIndexes(): Promise<void> {
  const database = await getDb();
  if (!database) return;
  await database.collection<SiteUser>("users").createIndex({ email: 1 }, { unique: true });
}
