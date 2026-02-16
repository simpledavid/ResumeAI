// Cloudflare D1 Database Utilities
import { D1Database } from '@cloudflare/workers-types';

// Types matching our Prisma schema
export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  avatarUrl: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface UserDashboard {
  id: string;
  userId: string;
  bio: string | null;
  widgets: string | null; // JSON stored as string
  createdAt: number;
  updatedAt: number;
}

// Helper to generate CUID-like IDs (simplified version)
export function generateId(): string {
  return `c${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
}

// D1 Database class for user operations
export class UserService {
  constructor(private db: D1Database) {}

  async createUser(data: {
    username: string;
    email: string;
    passwordHash: string;
    avatarUrl?: string;
  }): Promise<User> {
    const id = generateId();
    const now = Math.floor(Date.now() / 1000);

    await this.db
      .prepare(
        `INSERT INTO User (id, username, email, passwordHash, avatarUrl, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        id,
        data.username,
        data.email,
        data.passwordHash,
        data.avatarUrl || null,
        now,
        now
      )
      .run();

    return {
      id,
      username: data.username,
      email: data.email,
      passwordHash: data.passwordHash,
      avatarUrl: data.avatarUrl || null,
      createdAt: now,
      updatedAt: now,
    };
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const result = await this.db
      .prepare('SELECT * FROM User WHERE email = ?')
      .bind(email)
      .first<User>();

    return result || null;
  }

  async findUserByUsername(username: string): Promise<User | null> {
    const result = await this.db
      .prepare('SELECT * FROM User WHERE username = ?')
      .bind(username)
      .first<User>();

    return result || null;
  }

  async findUserById(id: string): Promise<User | null> {
    const result = await this.db
      .prepare('SELECT * FROM User WHERE id = ?')
      .bind(id)
      .first<User>();

    return result || null;
  }

  async updateUser(
    id: string,
    data: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<User | null> {
    const now = Math.floor(Date.now() / 1000);
    const updates: string[] = [];
    const values: (string | number | null)[] = [];

    Object.entries(data).forEach(([key, value]) => {
      updates.push(`${key} = ?`);
      values.push(value ?? null);
    });

    updates.push('updatedAt = ?');
    values.push(now, id);

    await this.db
      .prepare(`UPDATE User SET ${updates.join(', ')} WHERE id = ?`)
      .bind(...values)
      .run();

    return this.findUserById(id);
  }
}

// D1 Database class for dashboard operations
export class DashboardService {
  constructor(private db: D1Database) {}

  async createDashboard(data: {
    userId: string;
    bio?: string;
    widgets?: Record<string, unknown>;
  }): Promise<UserDashboard> {
    const id = generateId();
    const now = Math.floor(Date.now() / 1000);
    const widgetsJson = data.widgets ? JSON.stringify(data.widgets) : null;

    await this.db
      .prepare(
        `INSERT INTO UserDashboard (id, userId, bio, widgets, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .bind(id, data.userId, data.bio || null, widgetsJson, now, now)
      .run();

    return {
      id,
      userId: data.userId,
      bio: data.bio || null,
      widgets: widgetsJson,
      createdAt: now,
      updatedAt: now,
    };
  }

  async findDashboardByUserId(userId: string): Promise<UserDashboard | null> {
    const result = await this.db
      .prepare('SELECT * FROM UserDashboard WHERE userId = ?')
      .bind(userId)
      .first<UserDashboard>();

    return result || null;
  }

  async updateDashboard(
    userId: string,
    data: { bio?: string; widgets?: Record<string, unknown> }
  ): Promise<UserDashboard | null> {
    const now = Math.floor(Date.now() / 1000);
    const updates: string[] = [];
    const values: (string | number)[] = [];

    if (data.bio !== undefined) {
      updates.push('bio = ?');
      values.push(data.bio);
    }

    if (data.widgets !== undefined) {
      updates.push('widgets = ?');
      values.push(JSON.stringify(data.widgets));
    }

    updates.push('updatedAt = ?');
    values.push(now, userId);

    await this.db
      .prepare(`UPDATE UserDashboard SET ${updates.join(', ')} WHERE userId = ?`)
      .bind(...values)
      .run();

    return this.findDashboardByUserId(userId);
  }
}

// Helper to get database services from request context
export function getDbServices(db: D1Database) {
  return {
    users: new UserService(db),
    dashboards: new DashboardService(db),
  };
}
