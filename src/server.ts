import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { ExampleBot } from './assistants/example-bot';
import { purgeThreads } from './utils';
import { Assistant } from './assistants/assistant';
import { ThreadMessage } from 'openai/resources/beta/threads/messages/messages';
import { Scheduler } from './scheduler';

const assistant = new ExampleBot();
assistant.initialise(process.env['ASSISTANT_ID'] ?? '');

purgeThreads();

const onPolled = (assistant: Assistant): Promise<ThreadMessage[]> => new Promise((resolve, error) => {
    const scheduler = Scheduler.getInstance();
    const id = scheduler.add(async () => {
        const result = await assistant.poll();

        if(result.status != 'running') {
            scheduler.remove(id);

            if(result.status == 'complete' && result.messages) {
                resolve(result.messages);
            } else {
                error('Run threw an error');
            }
        }
    });

    setTimeout(() => error('Timed out'), 30000);
});

const handle = (assistant: Assistant) => async (req: express.Request, res: express.Response) => {
    const { query } = req.body;

    if(await assistant.query(query)) {
        const messages: ThreadMessage[] = await onPolled(assistant);

        const data = messages.reverse().map(msg => {
            let content = 'image';
            if(msg.content[0].type == 'text') {
                content = msg.content[0].text.value;
            }
            return { role: msg.role, content };
        });
    
        res.send(JSON.stringify(data));
    } else {
        res.status(500).send('Run in progress, wait a moment');
    }    
}

const app = express();
const port = 3000;
app.use(cors());
app.use(bodyParser.json());

app.post('/api/assistant', handle(assistant));

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
});