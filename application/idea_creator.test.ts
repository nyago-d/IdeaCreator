import { AIConcept, AIConceptKeyword, AIConceptTag, LlmResult } from "./entity";
import { IdeaCreater } from "./idea_creator";
import { IDBData, IDateTimeProvider, ILLMData } from "./interfaces";

describe("キーワード生成のテスト", () => {

    it("100文字超過するキーワードあり", async () => {

        const LLM = jest.fn<ILLMData, []>().mockImplementation(() => ({
            createKeywords: async (_: number) => {
                return [ "aa", "aaa", "a".repeat(101) ];
            }
        } as ILLMData));

        const DB = jest.fn<IDBData, []>();

        const DTP = jest.fn<IDateTimeProvider, []>();

        const logger = jest.fn();

        const creator = new IdeaCreater(new LLM(), new DB(), new DTP(), logger, false);
        await creator.createKeywords(3);

        expect(logger).toHaveBeenCalledWith("なんか変なので登録スキップ");
    });

    it("デバッグモード", async () => {

        const LLM = jest.fn<ILLMData, []>().mockImplementation(() => ({
            createKeywords: async (_: number) => {
                return [ "hoge", "fuga", "piyo" ];
            }
        } as ILLMData));

        const saveKeyword: (_: AIConceptKeyword) => Promise<void> = jest.fn<Promise<void>, [AIConceptKeyword]>();
        const DB = jest.fn<IDBData, []>().mockImplementation(() => ({
            saveKeyword
        } as IDBData));

        const DTP = jest.fn<IDateTimeProvider, []>();

        const logger = jest.fn();

        const creator = new IdeaCreater(new LLM(), new DB(), new DTP(), logger, true);
        await creator.createKeywords(3);

        expect(logger).toHaveBeenNthCalledWith(1, "デバッグモード");
        expect(logger).toHaveBeenNthCalledWith(2, "キーワード");
        expect(logger).toHaveBeenNthCalledWith(3, [ "hoge", "fuga", "piyo" ]);

        // 保存はされない
        expect(saveKeyword).not.toHaveBeenCalled();
    });

    it("正常", async () => {

        const LLM = jest.fn<ILLMData, []>().mockImplementation(() => ({
            createKeywords: async (_: number) => {
                return [ "hoge", "fuga", "piyo" ];
            },
            modelName: "Sample-Model"
        } as ILLMData));

        const saveKeyword: (_: AIConceptKeyword) => Promise<void> = jest.fn<Promise<void>, [AIConceptKeyword]>();
        const DB = jest.fn<IDBData, []>().mockImplementation(() => ({
            saveKeyword
        } as IDBData));

        const DTP = jest.fn<IDateTimeProvider, []>();

        const logger = jest.fn();

        const creator = new IdeaCreater(new LLM(), new DB(), new DTP(), logger, false);
        await creator.createKeywords(3);

        expect(saveKeyword).toHaveBeenNthCalledWith(1, { Keyword: "hoge", CreateCount: 1, UseCount: 0, ModelName: "Sample-Model" });
        expect(saveKeyword).toHaveBeenNthCalledWith(2, { Keyword: "fuga", CreateCount: 1, UseCount: 0, ModelName: "Sample-Model" });
        expect(saveKeyword).toHaveBeenNthCalledWith(3, { Keyword: "piyo", CreateCount: 1, UseCount: 0, ModelName: "Sample-Model" });
    });
});

describe("コンセプト生成のテスト", () => {

    it("デバッグモード", async () => {

        const LLM = jest.fn<ILLMData, []>().mockImplementation(() => ({
            createConcept: async (cnt, _) => {
                return Promise.resolve(
                    [...Array(cnt)].map((_, idx) => idx + 1)
                                   .map(n => ({ 
                                       name_en: `name_en_${n}`, 
                                       name_jp: `name_jp_${n}`,
                                       description_jp: `description_jp_${n}`,
                                       tags_jp: [ `tag_${n}_1`, `tag_${n}_2` ]
                                   } as LlmResult))
                );
            }
        } as ILLMData));

        const DB = jest.fn<IDBData, []>();

        const getCurrentDate = jest.fn<Date, []>().mockImplementation(() => new Date(2024, 4, 29, 0, 0, 0));
        const DTP = jest.fn<IDateTimeProvider, []>().mockImplementation(() => ({
            getCurrentDate
        } as IDateTimeProvider));

        const logger = jest.fn();

        const creator = new IdeaCreater(new LLM(), new DB(), new DTP(), logger, true);
        await creator.createConcept(3, []);

        expect(logger).toHaveBeenNthCalledWith(1, "このキーワードで生成します：");
        expect(logger).toHaveBeenNthCalledWith(2, "デバッグモード");
        expect(logger).toHaveBeenNthCalledWith(3, "アイデア");
        expect(logger).toHaveBeenNthCalledWith(4, [
            { name_en: "name_en_1", name_jp: "name_jp_1", description_jp: "description_jp_1", tags_jp: [ "tag_1_1", "tag_1_2" ] },
            { name_en: "name_en_2", name_jp: "name_jp_2", description_jp: "description_jp_2", tags_jp: [ "tag_2_1", "tag_2_2" ] },
            { name_en: "name_en_3", name_jp: "name_jp_3", description_jp: "description_jp_3", tags_jp: [ "tag_3_1", "tag_3_2" ] }
        ]);

        expect(getCurrentDate).not.toHaveBeenCalled();
    });

    
    it("正常", async () => {
        
        const LLM = jest.fn<ILLMData, []>().mockImplementation(() => ({
            createConcept: async (cnt, _) => {
                return Promise.resolve(
                    [...Array(cnt)].map((_, idx) => idx + 1)
                                   .map(n => ({ 
                                       name_en: `name_en_${n}`, 
                                       name_jp: `name_jp_${n}`,
                                       description_jp: `description_jp_${n}`,
                                       tags_jp: [ `tag_${n}_1`, `tag_${n}_2` ]
                                   } as LlmResult))
                );
            },
            modelName: "Sample-Model"
        } as ILLMData));

        const saveConcept : (_:AIConcept) => Promise<void> = jest.fn<Promise<void>, [AIConcept]>();
        const saveTag : (_:AIConceptTag) => Promise<void> = jest.fn<Promise<void>, [AIConceptTag]>();
        const updateUseCount : (_:string[]) => Promise<void> = jest.fn<Promise<void>, [string[]]>();
        const DB = jest.fn<IDBData, []>().mockImplementation(() => ({
            getNewId: async () => 3,
            saveConcept,
            saveTag,
            updateUseCount
        } as IDBData));

        const getCurrentDate = jest.fn<Date, []>().mockImplementation(() => new Date(2024, 4, 29, 0, 0, 0));
        const DTP = jest.fn<IDateTimeProvider, []>().mockImplementation(() => ({
            getCurrentDate
        } as IDateTimeProvider));

        const logger = jest.fn();

        const creator = new IdeaCreater(new LLM(), new DB(), new DTP(), logger, false);
        await creator.createConcept(3, [ "hoge", "fuga", "piyo" ]);

        expect(saveConcept).toHaveBeenNthCalledWith(1, { Id: 3, NameEn: "name_en_1", NameJp: "name_jp_1", Description: "description_jp_1", ModelName: "Sample-Model", EntryDate: new Date(2024, 4, 29, 0, 0, 0) });
        expect(saveConcept).toHaveBeenNthCalledWith(2, { Id: 4, NameEn: "name_en_2", NameJp: "name_jp_2", Description: "description_jp_2", ModelName: "Sample-Model", EntryDate: new Date(2024, 4, 29, 0, 0, 0) });
        expect(saveConcept).toHaveBeenNthCalledWith(3, { Id: 5, NameEn: "name_en_3", NameJp: "name_jp_3", Description: "description_jp_3", ModelName: "Sample-Model", EntryDate: new Date(2024, 4, 29, 0, 0, 0) });

        expect(saveTag).toHaveBeenNthCalledWith(1, { Id: 3, Tag: "tag_1_1" });
        expect(saveTag).toHaveBeenNthCalledWith(2, { Id: 3, Tag: "tag_1_2" });
        expect(saveTag).toHaveBeenNthCalledWith(3, { Id: 4, Tag: "tag_2_1" });
        expect(saveTag).toHaveBeenNthCalledWith(4, { Id: 4, Tag: "tag_2_2" });
        expect(saveTag).toHaveBeenNthCalledWith(5, { Id: 5, Tag: "tag_3_1" });
        expect(saveTag).toHaveBeenNthCalledWith(6, { Id: 5, Tag: "tag_3_2" });

        expect(updateUseCount).toHaveBeenCalledWith([ "hoge", "fuga", "piyo" ]);
    });
});