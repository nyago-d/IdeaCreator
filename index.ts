import { MySQL } from "./infrastructure/database";
import { DBData } from "./infrastructure/db_data";
import { IdeaCreater } from "./application/idea_creator";
import { LLMData } from "./infrastructure/llm_data";
import { DateTimeProvider } from "./infrastructure/datetime_provider";

(async () => {

    // DIするけどコンテナは使わない
    using db = await MySQL.create();
    const creator = new IdeaCreater(
        new LLMData("Command-R-Plus"), 
        new DBData(db),
        new DateTimeProvider(),
        console.log,
        true
    );

    await creator.createKeywords(100);

    const keywords = await creator.getKeywords(10);

    await creator.createConcept(5, keywords);

    const keywords2 = await creator.getKeywords(10);

    await creator.createConcept(5, keywords2);

})();