## Quick Start

`npm install`

`npm start`

The server should be up and running on **http://localhost:3000**, responding to POST request to **api/assistant** with body:

`{ "query": "hello there" }`

And responding with:

`[{ "role": "user", "content": "hello there" }, { "role": "assistant", "content": "How can I help you?" }]`

## Environment Variable to set

In **.env** file, add the following:

`ASSISTANT_ID=asst_1234`

`OPENAI_API_KEY=sk-1234`