import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { createId } from '@paralleldrive/cuid2';

export const AuthService = {
  async findByEmail(email: string) {
    return await db.query.users.findFirst({
      where: eq(users.email, email),
    });
  },

  async register(data: {
    email: string;
    password: string;
    name?: string;
  }) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const [user] = await db
      .insert(users)
      .values({
        id: createId(),
        email: data.email,
        password: hashedPassword,
        name: data.name,
        role: 'user',
      })
      .returning();
    return user;
  },

  async validatePassword(
    user: { password: string | null },
    inputPassword: string
  ) {
    if (!user.password) return false;
    return bcrypt.compare(inputPassword, user.password);
  },
};
