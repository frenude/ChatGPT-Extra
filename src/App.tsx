import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Configuration } from 'openai'
import { OpenAiAPI } from './openai/api'
import { parser } from './openai/parse'
function App() {
  const [count, setCount] = useState(0)
  useEffect(() => {
    const fetchData = async () => {
      const configuration = new Configuration({
        basePath: 'https://api.openai.com',
        apiKey: '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',
      });
      const openai = new OpenAiAPI(configuration);

      const completion = await openai.createCompletion({
        model: 'text-davinci-003',
        prompt: '你好'
        // stream: true
      });
      console.log(completion);
      
      // const res = completion as Response

      // const reader = res.body?.pipeThrough(new TextDecoderStream()).getReader() as ReadableStreamDefaultReader
      // // eslint-disable-next-line no-constant-condition
      // while (true) {
      //   const { value, done } = await reader.read();
      //   if (done) {
      //     break;
      //   }
      //   parser.feed(value)
      //   // console.log(value);

      // }
    }
    fetchData()
      // make sure to catch any error
      .catch(console.error);
  }, [])

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
