import "dotenv/config";
import mysql, { Connection, ConnectionOptions, ResultSetHeader } from 'mysql2/promise';

// MySQL接続情報
// ポートはデフォなので省略してるけど、必要なら追加してください
const dbConfig : ConnectionOptions = {
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  charset: process.env.DB_CHARSET
};

/**
 * MySQLデータベース
 */
export class MySQL {

    // コネクション
    private connection: Connection | undefined;

    /**
     * コンストラクタ（非公開）
     */
    private constructor() {
    }
    
    /**
     * このユーティリティを初期化します
     */
    private async initialize() {
        this.connection = await mysql.createConnection(dbConfig);
    }

    /**
     * using用です
     */
    async [Symbol.dispose]() {
        await this.dispose();
    }

    /**
     * このユーティリティを破棄します
     */
    async dispose() {
        await this.connection?.end();
    }

    /**
     * インスタンス生成します
     */
    static async create(): Promise<MySQL> {
        const instance = new MySQL();
        await instance.initialize();
        return instance;
    }

    /**
     * クエリを実行して結果を取得します
     * 
     * @param sql クエリ
     * @param params パラメタ
     * @returns 結果（配列）
     */
    async query<T>(sql: string, params?: any[]): Promise<T[]> {
        try {
            const [results] = await this.connection!.query(sql, params);
            return results as T[];
        } catch (error) {
            throw error;
        }
    }

    /**
     * クエリを実行して結果を取得します
     * 
     * @param sql クエリ
     * @param params パラメタ
     * @returns 結果（1件）　取得できない場合はnull
     */
    async querySingle<T>(sql: string, param?: any) : Promise<T | null> {
        const ret = await this.query<T>(sql, param);
        return ret.length > 0 ? ret[0] : null;
    }
    
    /**
     * 更新系の用途でクエリを実行します
     * 
     * @param sql クエリ
     * @param params パラメタ
     * @returns 実行結果
     */
    async execute(sql: string, params?: any[]): Promise<ResultSetHeader> {
        try {
            const [result] = await this.connection!.execute(sql, params);
            return result as ResultSetHeader;
        } catch (error) {
            throw error;
        }
    }
}