import { Global, Module, OnApplicationShutdown } from '@nestjs/common';
import { Pool } from 'node_modules/@types/pg';
import { closePool, getPool } from './pool';

export const PG_POOL = 'PG_POOL';

@Global()
@Module({
  providers: [{ provide: PG_POOL, useFactory: (): Pool => getPool() }],
  exports: [PG_POOL],
})
export class DatabaseModule implements OnApplicationShutdown {
  async onApplicationShutdown(): Promise<void> {
    await closePool();
  }
}
