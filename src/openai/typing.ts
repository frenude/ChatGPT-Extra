export enum PathEnum {
    Model = "/v1/models",
    Completions = "/v1/completions",
    Chat = "/v1/chat/completions",
    Edit = "/v1/edits",
    Image = "/v1/images/generations",
    ImageEdit = "/v1/images/edits",
    IimageVariation = "/v1/images/variations",
    Embeddings = "/v1/embeddings",
    Transcriptions = "/v1/audio/transcriptions",
    Translations = "/v1/audio/translations",
    Files = "/v1/files",
    FineTune = "/v1/fine-tunes",
    Moderations = '/v1/moderations',
    Engines = '/v1/engines'
}
export enum MethodEnum {
    POST = "POST",
    GET = "GET",
    PUT = "PUT",
    DELETE = "DELETE"

}

export interface streamWise {
    stream?: boolean | null;
}
/** 
*   
* @summary Creates an edited or extended image given an original image and a prompt.
* @param {File} image The image to edit. Must be a valid PNG file, less than 4MB, and square. If mask is not provided, image must have transparency, which will be used as the mask.
* @param {string} prompt A text description of the desired image(s). The maximum length is 1000 characters.
* @param {File} [mask] An additional image whose fully transparent areas (e.g. where alpha is zero) indicate where &#x60;image&#x60; should be edited. Must be a valid PNG file, less than 4MB, and have the same dimensions as &#x60;image&#x60;.
* @param {number} [n] The number of images to generate. Must be between 1 and 10.
* @param {string} [size] The size of the generated images. Must be one of &#x60;256x256&#x60;, &#x60;512x512&#x60;, or &#x60;1024x1024&#x60;.
* @param {string} [responseFormat] The format in which the generated images are returned. Must be one of &#x60;url&#x60; or &#x60;b64_json&#x60;.
* @param {string} [user] A unique identifier representing your end-user, which can help OpenAI to monitor and detect abuse. [Learn more](/docs/guides/safety-best-practices/end-user-ids).
*/
export type CreateImageEditRequest = {
    image: File,
    prompt: string,
    mask?: File,
    n?: number,
    size?: string,
    responseFormat?: string,
    user?: string
}
/**
*
* @summary Creates a variation of a given image.
* @param {File} image The image to use as the basis for the variation(s). Must be a valid PNG file, less than 4MB, and square.
* @param {number} [n] The number of images to generate. Must be between 1 and 10.
* @param {string} [size] The size of the generated images. Must be one of &#x60;256x256&#x60;, &#x60;512x512&#x60;, or &#x60;1024x1024&#x60;.
* @param {string} [responseFormat] The format in which the generated images are returned. Must be one of &#x60;url&#x60; or &#x60;b64_json&#x60;.
* @param {string} [user] A unique identifier representing your end-user, which can help OpenAI to monitor and detect abuse. [Learn more](/docs/guides/safety-best-practices/end-user-ids).
 */
export type CreateImageImageVariationRequest = {
    image: File,
    n?: number,
    size?: string,
    responseFormat?: string,
    user?: string
}

/**
*
* @summary Transcribes audio into the input language.
* @param {File} file The audio file to transcribe, in one of these formats: mp3, mp4, mpeg, mpga, m4a, wav, or webm.
* @param {string} model ID of the model to use. Only &#x60;whisper-1&#x60; is currently available.
* @param {string} [prompt] An optional text to guide the model\\\&#39;s style or continue a previous audio segment. The [prompt](/docs/guides/speech-to-text/prompting) should match the audio language.
* @param {string} [responseFormat] The format of the transcript output, in one of these options: json, text, srt, verbose_json, or vtt.
* @param {number} [temperature] The sampling temperature, between 0 and 1. Higher values like 0.8 will make the output more random, while lower values like 0.2 will make it more focused and deterministic. If set to 0, the model will use [log probability](https://en.wikipedia.org/wiki/Log_probability) to automatically increase the temperature until certain thresholds are hit.
* @param {string} [language] The language of the input audio. Supplying the input language in [ISO-639-1](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) format will improve accuracy and latency.
*/
export type CreateTranscriptionRequest = {
    file: File,
    model: string,
    prompt?: string,
    responseFormat?: string,
    temperature?: number,
    language?: string,
}

/**
   *
   * @summary Translates audio into into English.
   * @param {File} file The audio file to translate, in one of these formats: mp3, mp4, mpeg, mpga, m4a, wav, or webm.
   * @param {string} model ID of the model to use. Only &#x60;whisper-1&#x60; is currently available.
   * @param {string} [prompt] An optional text to guide the model\\\&#39;s style or continue a previous audio segment. The [prompt](/docs/guides/speech-to-text/prompting) should be in English.
   * @param {string} [responseFormat] The format of the transcript output, in one of these options: json, text, srt, verbose_json, or vtt.
   * @param {number} [temperature] The sampling temperature, between 0 and 1. Higher values like 0.8 will make the output more random, while lower values like 0.2 will make it more focused and deterministic. If set to 0, the model will use [log probability](https://en.wikipedia.org/wiki/Log_probability) to automatically increase the temperature until certain thresholds are hit.
   */
export type CreateTranslationRequest = {
    file: File,
    model: string,
    prompt?: string,
    responseFormat?: string,
    temperature?: number,
}

/**
   *
   * @summary Upload a file that contains document(s) to be used across various endpoints/features. Currently, the size of all the files uploaded by one organization can be up to 1 GB. Please contact us if you need to increase the storage limit.
   * @param {File} file Name of the [JSON Lines](https://jsonlines.readthedocs.io/en/latest/) file to be uploaded.  If the &#x60;purpose&#x60; is set to \\\&quot;fine-tune\\\&quot;, each line is a JSON record with \\\&quot;prompt\\\&quot; and \\\&quot;completion\\\&quot; fields representing your [training examples](/docs/guides/fine-tuning/prepare-training-data).
   * @param {string} purpose The intended purpose of the uploaded documents.  Use \\\&quot;fine-tune\\\&quot; for [Fine-tuning](/docs/api-reference/fine-tunes). This allows us to validate the format of the uploaded file.
   */
export type CreateFileRequest = {
    file: File,
    purpose: string
}
/**
    *
    * @summary Get fine-grained status updates for a fine-tune job.
    * @param {boolean} [stream] Whether to stream events for the fine-tune job. If set to true, events will be sent as data-only [server-sent events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events#Event_stream_format) as they become available. The stream will terminate with a &#x60;data: [DONE]&#x60; message when the job is finished (succeeded, cancelled, or failed).  If set to false, only events generated so far will be returned.
    */
export type FineTuneEventsRequest = {
    stream?: boolean | null
}