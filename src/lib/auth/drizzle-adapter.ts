import { and, eq } from 'drizzle-orm';
import type {
  Adapter,
  AdapterUser,
  AdapterAccount,
  AdapterSession,
  VerificationToken,
} from 'next-auth/adapters';

import { db } from '@/db';
import {
  users,
  accounts,
  sessions,
  verificationTokens,
} from '@/db/schema';

import { InferSelectModel } from 'drizzle-orm';

type DbUser = InferSelectModel<typeof users>;
type DbSession = InferSelectModel<typeof sessions>;
type DbAccount = InferSelectModel<typeof accounts>;
type DbVerificationToken = InferSelectModel<typeof verificationTokens>;

/* ========================= */
/*         MAPPERS           */
/* ========================= */

function mapUser(user: DbUser): AdapterUser {
  return {
    id: user.id,
    email: user.email,
    emailVerified: user.emailVerified ?? null,
    name: user.name ?? null,
    image: user.image ?? null,
  };
}

function mapSession(session: DbSession): AdapterSession {
  return {
    sessionToken: session.sessionToken,
    userId: session.userId,
    expires: session.expires,
  };
}

export function DrizzleAdapter(): Adapter {
  return {
    /* ---------- USERS ---------- */

    async createUser(
      userData: Omit<AdapterUser, 'id'>
    ): Promise<AdapterUser> {
      const [user] = await db
        .insert(users)
        .values({
          id: crypto.randomUUID(),
          email: userData.email,
          emailVerified: userData.emailVerified,
          name: userData.name,
          image: userData.image,
        })
        .returning();

      return mapUser(user);
    },

    async getUser(id: string): Promise<AdapterUser | null> {
      const user = await db.query.users.findFirst({
        where: eq(users.id, id),
      });

      return user ? mapUser(user) : null;
    },

    async getUserByEmail(email: string): Promise<AdapterUser | null> {
      const user = await db.query.users.findFirst({
        where: eq(users.email, email),
      });

      return user ? mapUser(user) : null;
    },

    async getUserByAccount({
      provider,
      providerAccountId,
    }): Promise<AdapterUser | null> {
      const account = await db.query.accounts.findFirst({
        where: and(
          eq(accounts.provider, provider),
          eq(accounts.providerAccountId, providerAccountId)
        ),
        with: {
          user: true,
        },
      });

      return account?.user ? mapUser(account.user) : null;
    },

    async updateUser(
      user: Partial<AdapterUser> & { id: string }
    ): Promise<AdapterUser> {
      const { id, ...data } = user;

      const updateData: Partial<typeof users.$inferInsert> = {
        ...(data.email !== undefined && { email: data.email }),
        ...(data.emailVerified !== undefined && {
          emailVerified: data.emailVerified,
        }),
        ...(data.name !== undefined && { name: data.name }),
        ...(data.image !== undefined && { image: data.image }),
        updatedAt: new Date(),
      };

      const [updated] = await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, id))
        .returning();

      if (!updated) {
        throw new Error('User not found');
      }

      return mapUser(updated);
    },

    async deleteUser(userId: string): Promise<void> {
      await db.delete(users).where(eq(users.id, userId));
    },

    /* ---------- ACCOUNTS ---------- */

    async linkAccount(account: AdapterAccount): Promise<void> {
      await db.insert(accounts).values(account);
    },

    async unlinkAccount({ provider, providerAccountId }): Promise<void> {
      await db
        .delete(accounts)
        .where(
          and(
            eq(accounts.provider, provider),
            eq(accounts.providerAccountId, providerAccountId)
          )
        );
    },

    /* ---------- SESSIONS ---------- */

    async createSession(session: AdapterSession): Promise<AdapterSession> {
      const [created] = await db
        .insert(sessions)
        .values(session)
        .returning();

      return mapSession(created);
    },

    async getSessionAndUser(sessionToken: string): Promise<{
      session: AdapterSession;
      user: AdapterUser;
    } | null> {
      const row = await db.query.sessions.findFirst({
        where: eq(sessions.sessionToken, sessionToken),
        with: {
          user: true,
        },
      });

      if (!row) return null;

      return {
        session: mapSession(row),
        user: mapUser(row.user),
      };
    },

    async updateSession(
      session: Partial<AdapterSession> & {
        sessionToken: string;
      }
    ): Promise<AdapterSession | null> {
      const { sessionToken, ...data } = session;

      const [updated] = await db
        .update(sessions)
        .set(data)
        .where(eq(sessions.sessionToken, sessionToken))
        .returning();

      return updated ? mapSession(updated) : null;
    },

    async deleteSession(sessionToken: string): Promise<void> {
      await db
        .delete(sessions)
        .where(eq(sessions.sessionToken, sessionToken));
    },

    /* ---------- VERIFICATION TOKENS ---------- */

    async createVerificationToken(
      token: VerificationToken
    ): Promise<VerificationToken> {
      const [created] = await db
        .insert(verificationTokens)
        .values(token)
        .returning();

      return created;
    },

    async useVerificationToken({
      identifier,
      token,
    }): Promise<VerificationToken | null> {
      const [deleted] = await db
        .delete(verificationTokens)
        .where(
          and(
            eq(verificationTokens.identifier, identifier),
            eq(verificationTokens.token, token)
          )
        )
        .returning();

      return deleted ?? null;
    },
  };
}
