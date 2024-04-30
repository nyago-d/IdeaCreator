/**
 * LLMが返却するデータ
 */
export interface LlmResult {
    name_en: string;
    name_jp: string;
    description_jp: string;
    tags_jp: string[];
}

/**
 * キーワード
 */
export interface AIConceptKeyword {
    Keyword: string;
    CreateCount: number;
    UseCount: number;
    ModelName: string;
}

/**
 * コンセプト
 */
export interface AIConcept {
    Id: number;
    NameEn: string;
    NameJp: string;
    Description: string;
    ModelName: string;
    EntryDate: Date;
}

/**
 * タグ
 */
export interface AIConceptTag {
    Id: number;
    Tag: string;
}

/**
 * 件数
 */
export interface Count {
    NewId: number;
}