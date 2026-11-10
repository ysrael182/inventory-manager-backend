import { prisma } from '../prisma';
import bcrypt from 'bcrypt';

export const login = async (username: string, password: string, role?: string ) => {
  const user = await prisma.user.findUnique({ where: { username, role: role || "admin" } });
  if (!user ) {
    throw new Error('Invalid credentials');
  }
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    throw new Error('Invalid credentials');
  }
  return user;
}

export const createUser = (data: { username: string; password: string; role?: string }) => {
  const hashedPassword = bcrypt.hashSync(data.password, 10);
  return prisma.user.create({
    data: {
      username: data.username,
      password: hashedPassword,
      role: data.role || 'admin',
    },
  });
}