import { createParser, ParsedEvent, ReconnectInterval } from 'eventsource-parser'

const onParse = (event: ParsedEvent | ReconnectInterval) => {
    if (event.type === 'event') {
        console.log('Received event!')
        console.log('id: %s', event.id || '<none>')
        console.log('type: %s', event.type || '<none>')
        console.log('data: %s', event.data)
    } else if (event.type === 'reconnect-interval') {
        console.log('We should set reconnect interval to %d milliseconds', event.value)
    }
}


const parser = createParser(onParse)
export { parser }