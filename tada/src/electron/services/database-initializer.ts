import { DatabaseMigrationService, MigrationStatus } from './database-migration.js';
import { isDev } from '../utils.js';
import path from 'path';
import { app } from 'electron';
import log from 'electron-log';

export interface DatabaseInitializationResult {
  success: boolean;
  migrationPerformed: boolean;
  error?: string;
}

export class DatabaseInitializer {
  private migrationService: DatabaseMigrationService;
  private dbPath: string;

  constructor() {
    // 设置数据库路径到用户数据目录
    this.dbPath = path.join(app.getPath('userData'), 'data.db');
    const databaseUrl = `file:${this.dbPath}`;

    this.migrationService = new DatabaseMigrationService(databaseUrl);
  }

  /**
   * 初始化数据库，包括自动迁移检测和执行
   */
  async initialize(): Promise<DatabaseInitializationResult> {
    try {
      log.info('Initializing database...');
      log.info(`Database path: ${this.dbPath}`);
      log.info(`Is development mode: ${isDev()}`);

      await this.migrationService.executeMigration(isDev());

      log.info('Database initialization completed successfully');

      return {
        success: true,
        migrationPerformed: true,
        error: undefined,
        // migrationDetails: migrationStatus
      };

    } catch (error) {
      log.error('Database initialization failed:', error);
      return {
        success: false,
        migrationPerformed: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred during database initialization'
      };
    }
  }

  /**
   * 获取数据库路径
   */
  getDatabasePath(): string {
    return this.dbPath;
  }

  /**
   * 强制执行迁移（忽略状态检查）
   */
  async forceMigration(): Promise<boolean> {
    try {
      log.info('Force executing database migration...');
      await this.migrationService.executeMigration(isDev());
      return true;
    } catch (error) {
      log.error('Force migration failed:', error);
      return false;
    }
  }

  /**
   * 重置数据库（危险操作，仅用于开发）
   */
  async resetDatabase(): Promise<boolean> {
    if (!isDev()) {
      log.warn('Database reset is only allowed in development mode');
      return false;
    }

    try {
      log.info('Resetting database...');

      const { exec } = require('child_process');
      const { promisify } = require('util');
      const execAsync = promisify(exec);

      await execAsync(`npx prisma migrate reset --force`, {
        cwd: path.join(process.cwd(), 'packages', 'database'),
        env: { ...process.env, DATABASE_URL: `file:${this.dbPath}` }
      });

      log.info('Database reset completed');
      return true;
    } catch (error) {
      log.error('Database reset failed:', error);
      return false;
    }
  }

  /**
   * 获取迁移状态（不执行迁移）
   */
  async getMigrationStatus(): Promise<MigrationStatus> {
    return await this.migrationService.checkMigrationStatus();
  }
}