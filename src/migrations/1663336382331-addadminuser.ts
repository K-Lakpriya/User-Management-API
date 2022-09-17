import { getDb } from '../migrations-utils/db';
import * as bcrypt from 'bcrypt';

export const up = async () => {
  const db = await getDb();
  const users = db.collection('users');

  const salt = bcrypt.genSaltSync(10);
  await users.insertOne({
    email: 'lakpriya@gmail.com',
    name: 'Kanchana Lakpriya',
    department: 'IT',
    role: 'manager',
    password: bcrypt.hashSync('123456', salt),
    createdAt: new Date(),
    updatedAt: new Date(),
  });
};

export const down = async () => {
  const db = await getDb();
  const users = db.collection('users');
  await users.deleteOne({ email: 'lakpriya@gmail.com' });
};
