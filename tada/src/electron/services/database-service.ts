import { DatabaseInitializer } from './database-initializer.js';
import { ipcMain } from 'electron';
import log from 'electron-log';

export class DatabaseService {
  private dbInitializer: DatabaseInitializer | null = null;
  private isInitialized = false;

  constructor() {
    this.dbInitializer = new DatabaseInitializer();
  }

  /**
   * 初始化数据库服务
   */
  async initialize(): Promise<boolean> {
    try {
      if (this.isInitialized) {
        return true;
      }

      log.info('Initializing database service...');
      const result = await this.dbInitializer!.initialize();

      if (!result.success) {
        log.error('Database service initialization failed:', result.error);
        return false;
      }

      this.isInitialized = true;
      log.info('Database service initialized successfully');

      if (result.migrationPerformed) {
        this.sendInfoToRenderer('Database Migration', 'Database schema was updated successfully');
      }

      this.setupIpcHandlers();
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      log.error('Database service initialization error:', error);
      this.sendErrorToRenderer('Database initialization error', errorMessage);
      return false;
    }
  }

  /**
   * 获取数据库状态
   */
  async getDatabaseStatus() {
    try {
      if (!this.dbInitializer) {
        return { error: 'Database service not initialized' };
      }

      const status = await this.dbInitializer.getMigrationStatus();
      return {
        success: true,
        status,
        serviceInitialized: this.isInitialized
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      log.error('Error getting database status:', error);
      return { error: errorMessage };
    }
  }

  /**
   * 强制执行迁移（仅开发环境）
   */
  async forceMigration() {
    try {
      if (!this.dbInitializer) {
        return { error: 'Database service not initialized' };
      }

      const success = await this.dbInitializer.forceMigration();

      if (success) {
        this.sendInfoToRenderer('Migration Complete', 'Database migration completed successfully');
      }

      return { success };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      log.error('Force migration failed:', error);
      this.sendErrorToRenderer('Migration Failed', errorMessage);
      return { error: errorMessage };
    }
  }

  /**
   * 重置数据库（仅开发环境）
   */
  async resetDatabase() {
    try {
      if (!this.dbInitializer) {
        return { error: 'Database service not initialized' };
      }

      const success = await this.dbInitializer.resetDatabase();

      if (success) {
        this.sendInfoToRenderer('Database Reset', 'Database has been reset successfully');
      }

      return { success };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      log.error('Database reset failed:', error);
      this.sendErrorToRenderer('Database Reset Failed', errorMessage);
      return { error: errorMessage };
    }
  }

  /**
   * 测试数据库连接
   */
  async testConnection() {
    try {
      if (!this.dbInitializer) {
        return { error: 'Database service not initialized' };
      }

      // 通过检查状态来测试连接
      const status = await this.dbInitializer.getMigrationStatus();
      return {
        success: !status.errorMessage,
        connected: !status.errorMessage,
        status
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      log.error('Database connection test failed:', error);
      return { error: errorMessage, connected: false };
    }
  }

  /**
   * 设置IPC处理器
   */
  private setupIpcHandlers() {
    // 数据库状态查询
    ipcMain.handle('database:getStatus', async () => {
      return await this.getDatabaseStatus();
    });

    // 强制执行迁移
    ipcMain.handle('database:forceMigration', async () => {
      return await this.forceMigration();
    });

    // 重置数据库
    ipcMain.handle('database:reset', async () => {
      return await this.resetDatabase();
    });

    // 测试连接
    ipcMain.handle('database:testConnection', async () => {
      return await this.testConnection();
    });

    log.info('Database IPC handlers registered');
  }

  /**
   * 发送错误信息到渲染进程
   */
  private sendErrorToRenderer(title: string, message: string) {
    // 这里可以向所有渲染进程发送错误通知
    // 具体实现取决于你的应用架构
    log.error(`[Database Error] ${title}: ${message}`);
  }

  /**
   * 发送信息到渲染进程
   */
  private sendInfoToRenderer(title: string, message: string) {
    log.info(`[Database Info] ${title}: ${message}`);
  }

  /**
   * 清理资源
   */
  cleanup() {
    this.isInitialized = false;
    this.dbInitializer = null;

    // 移除IPC处理器
    ipcMain.removeAllListeners('database:getStatus');
    ipcMain.removeAllListeners('database:forceMigration');
    ipcMain.removeAllListeners('database:reset');
    ipcMain.removeAllListeners('database:testConnection');

    log.info('Database service cleaned up');
  }
}

// 单例模式
export let databaseService: DatabaseService | null = null;

export function createDatabaseService(): DatabaseService {
  if (!databaseService) {
    databaseService = new DatabaseService();
  }
  return databaseService;
}