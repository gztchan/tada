import { exec, fork } from 'child_process';
import path from 'path';
import fs from 'fs';
import { app } from 'electron';
import log from 'electron-log';
import { promisify } from 'util';

const execAsync = promisify(exec);

const asyncFork = async  (path: string, args: string[], cwd: string, env: Record<string, string>) => {
  log.info(path, args, cwd, env)

  const child = fork(path, args, {
    env,
    cwd,
  });

  return new Promise((resolve, reject) => {
    child.on('error', (error) => {
      log.error(error)
      resolve(null)
    });
    child.on('close', () => {
      resolve(null)
    });
  });
}

export interface MigrationStatus {
  needsMigration: boolean;
  pendingMigrations: string[];
  hasDatabase: boolean;
  errorMessage?: string;
}

export class DatabaseMigrationService {
  private prismaSchemaPath: string = path.resolve(process.cwd(), 'packages', 'database', 'prisma', 'schema.prisma');
  private migrationsPath: string = path.resolve(process.cwd(), 'packages', 'database', 'migrations');
  private databaseUrl: string;

  constructor(databaseUrl: string) {
    this.databaseUrl = databaseUrl;
    // 在Electron打包后，需要使用正确的路径
    this.setPaths();
  }

  private setPaths() {
    const appPath = app.getAppPath(); // e.g. /.../Resources/app.asar 或 /.../Resources/app
    const databasePath = path.join(appPath, 'node_modules', '@tada', 'database');
    log.info('Database package path:', databasePath);
    this.prismaSchemaPath = path.join(databasePath, 'prisma', 'schema.prisma');
    this.migrationsPath = path.join(databasePath, 'migrations');

    log.info('Database paths configured:');
    log.info('Schema path:', this.prismaSchemaPath);
    log.info('Migrations path:', this.migrationsPath);
  }

  /**
   * 检查是否需要进行数据库迁移
   */
  async checkMigrationStatus(): Promise<MigrationStatus> {
    try {
      // 2. 检查是否有迁移文件
      const hasMigrations = await this.checkMigrationsExist();

      if (!hasMigrations) {
        return {
          needsMigration: false,
          pendingMigrations: [],
          hasDatabase: false,
          errorMessage: 'No migrations found'
        };
      }

      // 3. 使用 prisma migrate status 检查待处理的迁移
      const pendingMigrations = await this.getPendingMigrations();

      log.info(pendingMigrations, 1)

      return {
        needsMigration: pendingMigrations.length > 0,
        pendingMigrations,
        hasDatabase: true
      };

    } catch (error) {
      log.error('Error checking migration status:', error);
      return {
        needsMigration: false,
        pendingMigrations: [],
        hasDatabase: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * 执行数据库迁移
   */
  async executeMigration(isDev: boolean = true): Promise<void> {
    log.info('Starting database migration...');
    const prismaPath = path.join(isDev ? process.cwd() : process.resourcesPath, 'node_modules', 'prisma', 'build', 'index.js');

    const result: any = await asyncFork(
      prismaPath,
      ['migrate', 'deploy'],
      path.join(isDev ? process.cwd() : process.resourcesPath, 'node_modules', '@tada', 'database'),
      { DATABASE_URL: this.databaseUrl }
    );

    log.info('Migration output:', result);
    log.info('Database migration completed successfully');
  }

  /**
   * 检查迁移文件是否存在
   */
  private async checkMigrationsExist(): Promise<boolean> {
    log.info(this.migrationsPath)
    try {
      return fs.existsSync(this.migrationsPath) &&
             fs.readdirSync(this.migrationsPath).length > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * 获取迁移文件列表
   */
  private async getMigrationFiles(): Promise<string[]> {
    try {
      if (!fs.existsSync(this.migrationsPath)) return [];

      const migrations = fs.readdirSync(this.migrationsPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name)
        .sort();

      return migrations;
    } catch (error) {
      log.error('Error getting migration files:', error);
      return [];
    }
  }

  /**
   * 获取待处理的迁移
   */
  private async getPendingMigrations(): Promise<string[]> {
    try {
      // 使用 prisma migrate status 命令
      log.info('Running prisma migrate status command...');
      const appPath = app.getAppPath();
      const prismaPath = path.join(appPath, 'node_modules', 'prisma', 'build', 'index.js');

      const result: any = await asyncFork(
        prismaPath,
        ['migrate', 'status'],
        path.join(appPath, 'node_modules', '@tada', 'database'),
        { DATABASE_URL: this.databaseUrl }
      );

      const migrationRegex = /\b\d{14}_[a-zA-Z0-9_]+\b/g;
      const migrations = Array.from(result.matchAll(migrationRegex)).map(m => {
        // @ts-ignore
        return m[0]
      });

      return migrations;
    } catch (error) {
      log.error('Error getting pending migrations:', error);
      // 如果 migrate status 失败，可能是数据库不存在或其他问题
      log.info('migrate status failed, assuming database needs migration');
      return await this.getMigrationFiles();
    }
  }

  /**
   * 测试数据库连接
   */
  async testConnection(): Promise<boolean> {
    try {
      return true;
    } catch (error) {
      log.error('Database connection test failed:', error);
      return false;
    }
  }
}