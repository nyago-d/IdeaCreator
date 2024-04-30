import { AIConceptKeyword, AIConcept, AIConceptTag, LlmResult } from "./entity";

/**
 * データベースのインタフェース
 */
export interface IDBData {

    /**
     * キーワードを取得します
     */
    getKeywords(size: number) : Promise<string[]>;
    
    /**
     * キーワードの利用回数を更新します
     */
    updateUseCount(keywords: string[]) : Promise<void>;

    /**
     * 新しいIDを取得します
     */
    getNewId() : Promise<number>;

    /**
     * キーワードを保存します
     */
    saveKeyword(keyword: AIConceptKeyword) : Promise<void>;
    
    /**
     * コンセプトを保存します
     */
    saveConcept(concept: AIConcept) : Promise<void>;
    
    /**
     * タグを保存します
     */
    saveTag(tag: AIConceptTag) : Promise<void>;
}

/**
 * LLMのインタフェース
 */
export interface ILLMData {

    /**
     * モデル名を取得します
     * 
     * @description 詳細の流出になりそうな気もするけど、データとして持っておきたいので
     */
    readonly modelName: string;

    /**
     * キーワードを生成します
     */
    createKeywords(size: number) : Promise<string[]>;

    /**
     * コンセプトを生成します
     */
    createConcept(cnt: number, keywords: string[]) : Promise<LlmResult[]>;
}

/**
 * 日時作成のインタフェース
 */
export interface IDateTimeProvider {

    /**
     * 現在日時を取得します
     */
    getCurrentDate(): Date;
}