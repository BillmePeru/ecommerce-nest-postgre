import { DataSource } from 'typeorm';

/**
 * Base class for all seed scripts
 */
export abstract class BaseSeed {
  constructor(protected dataSource: DataSource) {}

  /**
   * Run the seed
   */
  abstract run(): Promise<void>;

  /**
   * Log a message with a timestamp
   */
  protected log(message: string): void {
    console.log(`[${new Date().toISOString()}] [Seed] ${message}`);
  }

  /**
   * Check if a table is empty
   */
  protected async isTableEmpty(tableName: string): Promise<boolean> {
    try {
      const result: unknown = await this.dataSource.query(
        `SELECT COUNT(*) as count FROM "${tableName}"`,
      );

      // Type-safe access to query result
      if (Array.isArray(result) && result.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        return parseInt(String(result[0].count), 10) === 0;
      }

      // Fallback: assume table is not empty if we can't determine
      return false;
    } catch (error) {
      this.log(
        `Error checking if table ${tableName} is empty: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      // Fallback: assume table is not empty if query fails
      return false;
    }
  }

  /**
   * Clear a table
   */
  protected async clearTable(tableName: string): Promise<void> {
    await this.dataSource.query(`DELETE FROM "${tableName}"`);
    this.log(`Cleared table: ${tableName}`);
  }
}
