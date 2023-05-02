enum PathEnum {
    Completions = "/v1/completions",
    Chat = "/v1/chat/completions",
    Edit = "/v1/edits",
    Image = "/v1/images/generations",
    Image_edit = "/v1/images/edits",
    Iimage_variation = "/v1/images/variations",
    Embeddings = "/v1/embeddings",
    Audio_transcriptions = "/v1/audio/transcriptions",
    Audio_translations = "/v1/audio/translations",

}
enum MethodEnum {
    POST = "POST",
    GET = "GET"
}
export { PathEnum ,MethodEnum}