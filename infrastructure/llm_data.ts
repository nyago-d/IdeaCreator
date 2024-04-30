import { ChatOpenAI } from "@langchain/openai";
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatAnthropic } from "@langchain/anthropic";
import { ChatCohere } from "@langchain/cohere";
import { ChatPromptTemplate, HumanMessagePromptTemplate, SystemMessagePromptTemplate } from '@langchain/core/prompts';
import { LLMChain } from "langchain/chains";
import { CommaSeparatedListOutputParser } from '@langchain/core/output_parsers';
import { StructuredOutputParser } from "langchain/output_parsers";
import { z } from 'zod';
import { LlmResult } from '../application/entity';
import { ILLMData } from "../application/interfaces";
import { ModelType } from "../application/idea_creator";

/**
 * チャットモデル
 */
export type ChatModel = ChatOpenAI | ChatGoogleGenerativeAI | ChatAnthropic | ChatCohere;

/**
 * LLM
 */
export class LLMData implements ILLMData {
    
    // モデル名
    readonly modelName: string;

    // チャットモデル
    private readonly model: ChatModel;

    /**
     * LLM
     * @param modelType モデルの種別
     */
    constructor(modelType: ModelType) {
        if (modelType === "GPT-3.5") {
            this.modelName = "gpt-3.5-turbo";
            this.model = new ChatOpenAI({
                modelName: this.modelName
            });
        } else if (modelType === "GPT-4") {
            this.modelName = "gpt-4-turbo";
            this.model = new ChatOpenAI({
                modelName: this.modelName
            });
        } else if (modelType === "Gemini") {
            this.modelName = "gemini-pro";
            this.model = new ChatGoogleGenerativeAI({
                modelName: this.modelName
            });
        } else if (modelType === "claude3-haiku") {
            this.modelName = "claude-3-haiku-20240307";
            this.model = new ChatAnthropic({
                modelName: this.modelName
            });
        } else if (modelType === "Command-R-Plus") {
            this.modelName = "command-r-plus";
            this.model = new ChatCohere({
                model: this.modelName // なんでmodelNameじゃないんだろう…
            });
        } else {
            throw new Error("Invalid model type");
        }
    }

    /**
     * キーワードを生成します
     */
    async createKeywords(size: number) : Promise<string[]> {

        // StructuredOutputParser使うほどでもないので、カンマ区切りで出力してでごまかす
        const chatTemplate = ChatPromptTemplate.fromMessages([
            SystemMessagePromptTemplate.fromTemplate("You are a creative assistant. Use Japanese as the language. Your response should be a list of comma separated values, eg: `foo, bar, baz`."),
            HumanMessagePromptTemplate.fromTemplate(`Please output {size} one-word keywords in Japanese to generate ideas for new services. Should not output number! only keyword.`)
        ]);

        const chain = new LLMChain({
            llm: this.model,
            prompt: chatTemplate,
            outputParser: new CommaSeparatedListOutputParser()
        });

        const result = await chain.invoke({ size: size });
        return result.text as string[];
    }

    /**
     * コンセプトを生成します
     */
    async createConcept(cnt: number, keywords: string[]) : Promise<LlmResult[]> {

        const keyword: string = keywords.join(",");

        // こういうのも外に出すのがいいのかもしれないけど、発想としてはSQLと変わらないしまぁいいかなという気持ち
        const chatTemplate = ChatPromptTemplate.fromMessages([
            SystemMessagePromptTemplate.fromTemplate("You are a creative assistant; output results in JSON. Use Japanese as the language."),
            HumanMessagePromptTemplate.fromTemplate(`In the context of generative AI, create a concept that does not exist in reality, name it and output a brief description of it.
Below are some random keywords, and I hope you will use 0 to 2 of them as hints if necessary (you don't necessarily have to use them).
{keyword}

Please submit {cnt} ideas.
{formatInstructions}`)
        ]);

        // 出力の構造を定義
        const outputParser = new StructuredOutputParser(
            z.object({
                ideas: z.array(z.object({
                    name_en: z.string().describe("English name of the concept"),
                    name_jp: z.string().describe("Japanese name of the concept"),
                    description_jp: z.string().describe("Description of the concept about 200 token"),
                    tags_jp: z.array(z.string()).describe("Tags for this concept"),
                }))
            })
        );
        const formatInstructions = outputParser.getFormatInstructions();

        const chain = new LLMChain({
            llm: this.model,
            prompt: chatTemplate,
            outputParser: outputParser
        });

        const result = await chain.invoke({ keyword: keyword, cnt: cnt, formatInstructions: formatInstructions });
        return result.text.ideas as LlmResult[];
    }
}