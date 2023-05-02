// 为什么不直接用openai，因为openai 提供的是node的版本，里面使用的是axios，浏览器axios 不支持stream
import { Configuration, CreateChatCompletionRequest, CreateChatCompletionResponse, CreateCompletionRequest, CreateCompletionResponse } from 'openai'

import { MethodEnum, PathEnum } from './config';
// import { parser } from './parse';



import { createParser } from "eventsource-parser";

export class OpenAiAPI {
    configuration: Configuration;
    constructor(configuration: Configuration) {
        this.configuration = configuration
    }
    async fetchOpenai(path: string, method: string, body: unknown): Promise<Response> {
        return fetch(`${this.configuration.basePath}${path}`, {
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
    }
    async createCompletion(req: CreateCompletionRequest): Promise<CreateCompletionResponse | Response> {
        const res = await this.fetchOpenai(PathEnum.Completions, MethodEnum.POST, req)
        if (req.stream) {
            console.log(res.body)
            return res
            // const stream = new ReadableStream({
            //     async start(controller) {
            //         function onParse(event: any) {
            //             if (event.type === "event") {
            //                 const data = event.data;
            //                 // https://beta.openai.com/docs/api-reference/completions/create#completions/create-stream
            //                 if (data === "[DONE]") {
            //                     controller.close();
            //                     return;
            //                 }
            //                 try {
            //                     const json = JSON.parse(data);
            //                     const text = json.choices[0].delta.content;
            //                     const queue = new TextEncoder().encode(text);
            //                     controller.enqueue(queue);
            //                 } catch (e) {
            //                     controller.error(e);
            //                 }
            //             }
            //         }

            //         const parser = createParser(onParse);
            //         for await (const chunk of res.body ) {
            //             parser.feed(new TextDecoder().decode(chunk, { stream: true }));
            //         }
            //     },
            // });
            // return new Response(stream);
        } else {
            return JSON.parse(await res.text()) as CreateChatCompletionResponse
        }

    }
    // async creatChatCompletion(req: CreateChatCompletionRequest): Promise<CreateChatCompletionResponse> {

    // }

}

