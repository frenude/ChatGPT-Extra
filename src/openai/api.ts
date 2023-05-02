// 为什么不直接用openai，因为openai 提供的是node的版本，里面使用的是axios，浏览器axios 不支持stream
import { Configuration, CreateChatCompletionRequest, CreateChatCompletionResponse, CreateCompletionRequest, CreateCompletionResponse } from 'openai'

import { MethodEnum, PathEnum, streamWise } from './typing';

import { createParser, ParsedEvent, ReconnectInterval } from "eventsource-parser";

const env = import.meta.env
const OPENAI_URL = "https://api.openai.com";
const BASE_URL = env.VITE_BASE_URL ?? OPENAI_URL


export class OpenAiAPI {
    configuration: Configuration;
    constructor(configuration: Configuration) {
        this.configuration = configuration
    }
    async fetchOpenai<T extends streamWise, U>(path: string, method: string, body: T): Promise<Response | U> {
        const res = await fetch(`${this.configuration.basePath ? this.configuration.basePath : BASE_URL}${path}`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.configuration.apiKey}`,
                ...(this.configuration.organization && {
                    "OpenAI-Organization": this.configuration.organization,
                }),
            },
            cache: "no-store",
            method: method,
            body: JSON.stringify(body),
        });
        if (body.stream) {
            return new Response(this.stream(res));
        } else {
            return JSON.parse(await res.text()) as U
        }

    }
    stream(res: Response): ReadableStream {
        return new ReadableStream({
            async start(controller) {
                function onParse(event: ParsedEvent | ReconnectInterval) {
                    if (event.type === "event") {
                        const data = event.data;
                        if (data === "[DONE]") {
                            controller.close();
                            return;
                        }
                        try {
                            const queue = new TextEncoder().encode(JSON.parse(data));
                            controller.enqueue(queue);
                        } catch (e) {
                            controller.error(e);
                        }
                    }
                }

                const parser = createParser(onParse);
                const reader = res.body?.pipeThrough(new TextDecoderStream()).getReader() as ReadableStreamDefaultReader
                // eslint-disable-next-line no-constant-condition
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    parser.feed(value);
                }

            },
        });

    }

    async createCompletion(req: CreateCompletionRequest): Promise<CreateCompletionResponse | Response> {
        return await this.fetchOpenai<CreateCompletionRequest, CreateCompletionResponse>(PathEnum.Completions, MethodEnum.POST, req)
    }
    async createChatCompletion(req: CreateChatCompletionRequest): Promise<CreateChatCompletionResponse | Response> {
        return await this.fetchOpenai<CreateChatCompletionRequest, CreateChatCompletionResponse>(PathEnum.Chat, MethodEnum.POST, req)
    }
}

