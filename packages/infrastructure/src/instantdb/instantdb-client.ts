import { init } from '@instantdb/react';
import { nanoid } from 'nanoid';
import type { DayLog } from '../../../domain/src/types';

type InstantClient = ReturnType<typeof init>;

interface TransactOperation {
  type: 'create' | 'update' | 'delete';
  entity: string;
  id?: string;
  data?: any;
}

export class InstantDBClient {
  private readonly client: InstantClient;

  constructor() {
    const appId = process.env.VITE_INSTANTDB_APP_ID;
    if (!appId) {
      throw new Error('VITE_INSTANTDB_APP_ID is required');
    }

    this.client = init({ appId });
  }

  // ============================
  // Authentication
  // ============================

  async sendMagicCode(email: string): Promise<void> {
    await this.client.auth.createMagicCode({ email });
  }

  async signInWithMagicCode(
    email: string,
    code: string
  ): Promise<{ user: any }> {
    return await this.client.auth.signInWithMagicCode({ email, code });
  }

  async signOut(): Promise<void> {
    await this.client.auth.signOut();
  }

  // ============================
  // Day Log Operations
  // ============================

  async createDayLog(
    dayLog: Omit<DayLog, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<{ id: string }> {
    const id = nanoid();
    const now = Date.now();

    await this.client.db.transact([
      {
        __op: 'create',
        __entity: 'daylogs',
        data: {
          ...dayLog,
          id,
          createdAt: now,
          updatedAt: now,
        },
      },
    ]);

    return { id };
  }

  async updateDayLog(id: string, updates: Partial<DayLog>): Promise<void> {
    await this.client.db.transact([
      {
        __op: 'update',
        __entity: 'daylogs',
        id,
        data: {
          ...updates,
          updatedAt: Date.now(),
        },
      },
    ]);
  }

  // ============================
  // Batch Operations
  // ============================

  async batchTransact(operations: TransactOperation[]): Promise<void> {
    const txOps = operations.map((op) => {
      const now = Date.now();

      if (op.type === 'create') {
        return {
          __op: 'create' as const,
          __entity: op.entity,
          data: {
            ...op.data,
            id: nanoid(),
            createdAt: now,
            updatedAt: now,
          },
        };
      }

      if (op.type === 'update' && op.id) {
        return {
          __op: 'update' as const,
          __entity: op.entity,
          id: op.id,
          data: {
            ...op.data,
            updatedAt: now,
          },
        };
      }

      // Delete operation - id is required
      if (op.id) {
        return {
          __op: 'delete' as const,
          __entity: op.entity,
          id: op.id,
        };
      }

      throw new Error(`Invalid operation: ${op.type} requires an id`);
    });

    await this.client.db.transact(txOps);
  }
}
