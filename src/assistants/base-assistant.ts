import OpenAI from 'openai';
import { ThreadMessage } from 'openai/resources/beta/threads/messages/messages';
import { Assistant } from './assistant';

export abstract class BaseAssistant implements Assistant {
    id: string = '';
    created_at: number = 0;
    description: string | null = null;
    file_ids: string[] = [];
    instructions: string | null = null;
    metadata: unknown;
    model: string = '';
    name: string | null = '';
    object: 'assistant' = 'assistant';
    tools: (OpenAI.Beta.Assistants.Assistant.CodeInterpreter | OpenAI.Beta.Assistants.Assistant.Retrieval | OpenAI.Beta.Assistants.Assistant.Function)[] = [];

    protected thread?: OpenAI.Beta.Threads.Thread;
    protected run?: OpenAI.Beta.Threads.Run;

    private static _openai: OpenAI;

    protected get openai() {
        return BaseAssistant._openai;
    }

    constructor() {
        if(!BaseAssistant._openai) {
            BaseAssistant._openai = new OpenAI();
        }

        process.on('exit', async () => {
            if(this.thread) {
                await this.openai.beta.threads.del(this.thread.id);
                console.info('Thread deleted');
            }
        })
    }

    async initialise(id: string): Promise<void> {
        const details = await this.openai.beta.assistants.retrieve(id);
        Object.assign(this, details);
        console.info(`Assistant with name: ${details.name} initialised`);
    }

    async query(prompt: string): Promise<boolean> {
        if(this.run) {
            console.info('The thread has a run in process');
            return false;
        }

        if(!this.thread) {
            this.thread = await this.openai.beta.threads.create();
        }

        await this.openai.beta.threads.messages.create(
            this.thread.id,
            { role: 'user', content: prompt }
        );

        this.run = await this.openai.beta.threads.runs.create(
            this.thread.id,
            { assistant_id: this.id }
        );

        return true;
    }

    async poll(): Promise<{ status: string, messages?: ThreadMessage[] }> {
        if(!this.thread || !this.run) {
            return { status: 'error' }
        }

        const run = await this.openai.beta.threads.runs.retrieve(
            this.thread.id,
            this.run.id
        );

        if(run.completed_at) {
            const threadMessages = await this.openai.beta.threads.messages.list(
                this.thread.id
            );
            delete this.run;
            return { status: 'complete', messages: threadMessages.data }
        } else if(run.failed_at) {
            delete this.run;
            return { status: 'failed' }
        } else {
            return { status: 'running' }
        }
    }

    async clear(): Promise<void> {
        if(!this.thread) {
            console.info('No Thread found');
            return;
        }

        await this.openai.beta.threads.del(this.thread.id);
        delete this.thread;
        delete this.run;
    }
}