import OpenAI from 'openai';
import { ThreadMessage } from 'openai/resources/beta/threads/messages/messages';

export interface Assistant extends OpenAI.Beta.Assistants.Assistant {
    initialise(id: string): Promise<void>;

    query(prompt: string): Promise<boolean>;

    poll(): Promise<{ status: string, messages?: ThreadMessage[] }>;

    clear(): Promise<void>;
}