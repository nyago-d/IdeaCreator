import 'dotenv/config';
import { AIConceptKeyword, AIConcept, AIConceptTag } from './entity';
import { ILLMData, IDBData, IDateTimeProvider } from './interfaces';
import { DateTimeProvider } from '../infrastructure/datetime_provider';

/**
 * モデルの種別
 * 
 * @description infrastructureっぽいけど、あくまでアプリケーションで扱う種別なのでここ
 */
export type ModelType = "GPT-3.5" | "GPT-4" | "Gemini" | "claude3-haiku" | "Command-R-Plus";

/**
 * アイデア生成
 */
export class IdeaCreater {

    private readonly llm: ILLMData;
    private readonly db: IDBData;
    private readonly dateTimeProvider: IDateTimeProvider;
    private readonly logger: (str: any) => void;
    private readonly debugMode: boolean;

    /**
     * アイデア生成
     * 
     * @param llm LLM
     * @param db データベース
     * @param logger ログ
     * @param debugMode デバッグモード（trueの時にはデータの取得は行いますが、保存は行いません）
     */
    constructor(llm: ILLMData, db: IDBData, dateTimeProvider: IDateTimeProvider, logger: (str: any) => void = console.log, debugMode: boolean = false) {
        this.llm = llm;
        this.db = db;
        this.dateTimeProvider = dateTimeProvider;
        this.logger = logger;
        this.debugMode = debugMode;
    };
    
    /**
     * キーワードを生成します
     */
    async createKeywords(size: number) {

        // LLMから取得
        const keywords = await this.llm.createKeywords(size);

        // たまに変なことになるので、100文字以上のキーワードが取れたらスキップ
        if (keywords.filter(k => k.length > 100).length > 0) {
            this.logger("なんか変なので登録スキップ");
            return;
        }

        // デバッグモードの時は出力しておしまい
        if (this.debugMode) {
            this.logger("デバッグモード");
            this.logger("キーワード");
            this.logger(keywords);
            return;
        }

        // キーワードを登録
        for (const k of keywords) {
            // on duplicate keyに依存しちゃってる感…
            const keyword = {
                Keyword: k,
                CreateCount: 1,
                UseCount: 0,
                ModelName: this.llm.modelName
            } as AIConceptKeyword;
            await this.db.saveKeyword(keyword);
        }
    }

    /**
     * キーワードを取得します
     */
    async getKeywords(cnt: number) {
        return await this.db.getKeywords(cnt);
    }
    
    /**
     * キーワードを基にコンセプトを生成します
     */
    async createConcept(cnt: number, keywords: string[]) {

        this.logger("このキーワードで生成します：" + keywords.join());

        // LLMから取得
        const data = await this.llm.createConcept(cnt, keywords); 

        // デバッグモードの時は出力しておしまい
        if (this.debugMode) {
            this.logger("デバッグモード");
            this.logger("アイデア");
            this.logger(data);
            return;
        }

        // 登録日付（揃えたいのでループの外）
        const dt = this.dateTimeProvider.getCurrentDate();

        // 新しいIDを生成（別にAutoIncrementでも良かったかも）
        let id = await this.db.getNewId();
        
        for (const e of data) {

            // コンセプトを登録
            const concept = {
                Id: id,
                NameEn: e.name_en,
                NameJp: e.name_jp,
                Description: e.description_jp,
                ModelName: this.llm.modelName,
                EntryDate: dt
            } as AIConcept;
            this.db.saveConcept(concept);

            // タグをすべて登録
            for (let t of e.tags_jp) {
                const tag = { 
                    Id: id,
                    Tag: t 
                } as AIConceptTag;
                this.db.saveTag(tag);
            }
            id++;
        }
        
        // キーワードの使用回数を更新
        await this.db.updateUseCount(keywords);
    }
}