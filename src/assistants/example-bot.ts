import { BaseAssistant } from './base-assistant';

export class ExampleBot extends BaseAssistant {
    async query(prompt: string): Promise<boolean> {
        const result = await super.query(prompt);
        console.info('Overriding the base assistant with Example...')

        return result;
    }
}