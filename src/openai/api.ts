// 为什么不直接用openai，因为openai 提供的是node的版本，里面使用的是axios，浏览器axios 不支持stream
import { Configuration, CreateChatCompletionRequest, CreateChatCompletionResponse, CreateCompletionRequest, CreateCompletionResponse, CreateEditRequest, CreateEditResponse, CreateEmbeddingRequest, CreateEmbeddingResponse, CreateFineTuneRequest, CreateImageRequest, CreateModerationRequest, CreateModerationResponse, CreateTranscriptionResponse, CreateTranslationResponse, DeleteFileResponse, DeleteModelResponse, Engine, FineTune, ImagesResponse, ListEnginesResponse, ListFilesResponse, ListFineTuneEventsResponse, ListFineTunesResponse, ListModelsResponse, Model, OpenAIFile } from 'openai'

import { CreateFileRequest, CreateImageEditRequest, CreateImageImageVariationRequest, CreateTranscriptionRequest, CreateTranslationRequest, FineTuneEventsRequest, MethodEnum, PathEnum, streamWise } from './typing';

import { createParser, ParsedEvent, ReconnectInterval } from "eventsource-parser";
import { serialize } from 'object-to-formdata';

const env = import.meta.env
const OPENAI_URL = "https://api.openai.com";
const BASE_URL = env.VITE_BASE_URL ?? OPENAI_URL


export class OpenAiAPI {
    configuration: Configuration;
    constructor(configuration: Configuration) {
        this.configuration = configuration
    }
    async doFetch<T>(path: string, method: string, body: T): Promise<Response> {
        return await fetch(`${this.configuration.basePath ? this.configuration.basePath : BASE_URL}${path}`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.configuration.apiKey}`,
                ...(this.configuration.organization && {
                    "OpenAI-Organization": this.configuration.organization,
                }),
            },
            cache: "no-store",
            method: method,
            body: body ? JSON.stringify(body) : null,
        });
    }
    async fetchOpenaiStream<T extends streamWise, U>(path: string, method: string, body: T): Promise<Response | U> {
        const res = await this.doFetch(path, method, body)
        if (body.stream) {
            return new Response(this.stream(res));
        }
        return JSON.parse(await res.text()) as U
    }
    async fetchOpenai<T, U>(path: string, method: string, body: T): Promise<U> {
        const res = await this.doFetch(path, method, body)
        return JSON.parse(await res.text()) as U
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

    async retrieveModel(model: string): Promise<Model> {
        return await this.fetchOpenai<null, Model>(`${PathEnum.Model}/${model}`, MethodEnum.GET, null)
    }
    async listModels(): Promise<ListModelsResponse> {
        return await this.fetchOpenai<null, ListModelsResponse>(PathEnum.Model, MethodEnum.GET, null)
    }

    async createCompletion(req: CreateCompletionRequest): Promise<CreateCompletionResponse | Response> {
        return await this.fetchOpenaiStream<CreateCompletionRequest, CreateCompletionResponse>(PathEnum.Completions, MethodEnum.POST, req)
    }
    async createChatCompletion(req: CreateChatCompletionRequest): Promise<CreateChatCompletionResponse | Response> {
        return await this.fetchOpenaiStream<CreateChatCompletionRequest, CreateChatCompletionResponse>(PathEnum.Chat, MethodEnum.POST, req)
    }
    async createEdit(req: CreateEditRequest): Promise<CreateEditResponse> {
        return await this.fetchOpenai<CreateEditRequest, CreateEditResponse>(PathEnum.Edit, MethodEnum.POST, req)
    }

    async createEmbedding(req: CreateEmbeddingRequest): Promise<CreateEmbeddingResponse> {
        return await this.fetchOpenai<CreateEmbeddingRequest, CreateEmbeddingResponse>(PathEnum.Embeddings, MethodEnum.POST, req)
    }

    async createImage(req: CreateImageRequest): Promise<ImagesResponse> {
        return await this.fetchOpenai<CreateImageRequest, ImagesResponse>(PathEnum.Image, MethodEnum.POST, req)
    }

    async createImageEdit(req: CreateImageEditRequest): Promise<ImagesResponse> {
        return await this.fetchOpenai<FormData, ImagesResponse>(PathEnum.ImageEdit, MethodEnum.POST, serialize(req))
    }

    async createImageVariation(req: CreateImageImageVariationRequest): Promise<ImagesResponse> {
        return await this.fetchOpenai<FormData, ImagesResponse>(PathEnum.IimageVariation, MethodEnum.POST, serialize(req))
    }
    async createTranscription(req: CreateTranscriptionRequest): Promise<CreateTranscriptionResponse> {
        return await this.fetchOpenai<FormData, CreateTranscriptionResponse>(PathEnum.Transcriptions, MethodEnum.POST, serialize(req))
    }
    async createTranslation(req: CreateTranslationRequest): Promise<CreateTranslationResponse> {
        return await this.fetchOpenai<FormData, CreateTranslationResponse>(PathEnum.Translations, MethodEnum.POST, serialize(req))
    }
    async listFiles(): Promise<ListFilesResponse> {
        return await this.fetchOpenai<null, ListFilesResponse>(PathEnum.Files, MethodEnum.GET, null)
    }
    async createFile(req: CreateFileRequest): Promise<OpenAIFile> {
        return await this.fetchOpenai<FormData, OpenAIFile>(PathEnum.Files, MethodEnum.POST, serialize(req))
    }
    async deleteFile(fileId: string): Promise<DeleteFileResponse> {
        return await this.fetchOpenai<null, DeleteFileResponse>(`${PathEnum.Files}/${fileId}`, MethodEnum.DELETE, null)
    }
    async retrieveFile(fileId: string): Promise<OpenAIFile> {
        return await this.fetchOpenai<null, OpenAIFile>(`${PathEnum.Files}/${fileId}`, MethodEnum.GET, null)
    }
    async downloadFile(fileId: string): Promise<string> {
        return await this.fetchOpenai<null, string>(`${PathEnum.Files}/${fileId}/content`, MethodEnum.GET, null)
    }
    async createFineTune(req: CreateFineTuneRequest): Promise<FineTune> {
        return await this.fetchOpenai<CreateFineTuneRequest, FineTune>(PathEnum.FineTune, MethodEnum.POST, req)
    }
    async listFineTunes(): Promise<ListFineTunesResponse> {
        return await this.fetchOpenai<null, ListFineTunesResponse>(PathEnum.FineTune, MethodEnum.GET, null)
    }
    async retrieveFineTune(fineTuneId: string): Promise<FineTune> {
        return await this.fetchOpenai<null, FineTune>(`${PathEnum.FineTune}/${fineTuneId}`, MethodEnum.GET, null)
    }
    async cancelFineTune(fineTuneId: string): Promise<FineTune> {
        return await this.fetchOpenai<null, FineTune>(`${PathEnum.FineTune}/${fineTuneId}/cancel`, MethodEnum.POST, null)
    }
    async listFineTuneEvents(fineTuneId: string, stream?: FineTuneEventsRequest): Promise<ListFineTuneEventsResponse | Response> {
        if (stream?.stream) {
            return await this.fetchOpenaiStream<FineTuneEventsRequest, ListFineTuneEventsResponse>(`${PathEnum.FineTune}/${fineTuneId}/events`, MethodEnum.POST, stream)
        }
        return await this.fetchOpenai<null, ListFineTuneEventsResponse>(`${PathEnum.FineTune}/${fineTuneId}/events`, MethodEnum.POST, null)
    }
    async deleteModel(model: string): Promise<DeleteModelResponse> {
        return await this.fetchOpenai<null, DeleteModelResponse>(`${PathEnum.Model}/${model}`, MethodEnum.DELETE, null)
    }
    async createModeration(req: CreateModerationRequest): Promise<CreateModerationResponse> {
        return await this.fetchOpenai<CreateModerationRequest, CreateModerationResponse>(PathEnum.Moderations, MethodEnum.POST, req)
    }
    /**
     * @deprecated
     */
    async listEngines(): Promise<ListEnginesResponse> {
        return await this.fetchOpenai<null, ListEnginesResponse>(PathEnum.Engines, MethodEnum.GET, null)
    }
    /**
     * @deprecated
     */
    async retrieveEngine(engineId: string): Promise<Engine> {
        return await this.fetchOpenai<null, Engine>(`${PathEnum.Engines}/${engineId}`, MethodEnum.GET, null)
    }
}


