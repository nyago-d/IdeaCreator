import { MySQL } from "./database";
import { AIConcept, AIConceptKeyword, AIConceptTag, Count } from "../application/entity";
import { IDBData } from "../application/interfaces";

/**
 * データベース
 */
export class DBData implements IDBData {

    // MySQLデータベース
    private readonly db: MySQL;

    /**
     * データベース
     * @param db いったんMySQLのみです
     */
    constructor(db: MySQL) {
        this.db = db;
    }

    /**
     * キーワードを取得します
     */
    async getKeywords(size: number) : Promise<string[]> {

        const records = await this.db.query<AIConceptKeyword>(`select
    Keyword 
from
    ai_concept_keyword 
ORDER BY
    RAND() * (9999 - UseCount)
limit
    ${size}`);
        
        return records.map(r => r.Keyword);
    }

    /**
     * キーワードの利用回数を更新します
     */
    async updateUseCount(keywords: string[]) {
        await this.db.execute(`update ai_concept_keyword 
set
    UseCount = UseCount + 1
where
    Keyword in (${[...Array(keywords.length)].map(_ => "?").join(",")})`, keywords);
    }
    /**
     * 新しいIDを取得します
     */
    async getNewId() : Promise<number> {
        const result = await this.db.querySingle<Count>(`select
    ifnull(max(Id), 0) + 1 as NewId
from
    ai_concept`);
        return result?.NewId!;
    }
    /**
     * キーワードを保存します
     * 
     * @description すでにある場合は生成回数を増やします
     */
    async saveKeyword(keyword: AIConceptKeyword) {
        await this.db.execute(
            "insert into ai_concept_keyword(Keyword, CreateCount, UseCount, ModelName) values (?, ?, ?, ?) on duplicate key update CreateCount = CreateCount + 1", 
            [keyword.Keyword, keyword.CreateCount, keyword.UseCount, keyword.ModelName]
        );
    }

    /**
     * コンセプトを保存します
     */
    async saveConcept(concept: AIConcept) {
        await this.db.execute(
            "insert into ai_concept(Id, NameEn, NameJp, Description, ModelName, EntryDate) values (?, ?, ?, ?, ?, ?)", 
            [concept.Id, concept.NameEn, concept.NameJp, concept.Description, concept.ModelName, concept.EntryDate]
        );
    }
    
    /**
     * タグを保存します
     */
    async saveTag(tag: AIConceptTag) {   
        await this.db.execute(
            "insert into ai_concept_tag(Id, Tag) values (?, ?)", 
            [tag.Id, tag.Tag]
        );
    }
}