import OpenAI from 'openai';

export const getThreads = async () => {
    const url = 'https://api.openai.com/v1/threads';

    const headers = {
        'Authorization': `Bearer ${process.env['OPENAI_SESSION_KEY']}`,
        'Openai-Organization': process.env['OPENAI_ORG'] ?? '',
        'OpenAI-Beta': 'assistants=v1'
    };

    const response = await fetch(url, { method: 'GET', headers });

    return (await response.json()) as { data: Array<{ id: string, object: string, created_at: number, metadata: any }> };
}

export const purgeThreads = async () => {
    const { data } = await getThreads();

    if(data.length == 0) {
        console.log('No thread was found');
        return;
    }

    const openai = new OpenAI();

    for(const thread of data) {
        console.log(`deleting thread: ${thread.id}`);
        await openai.beta.threads.del(thread.id);
        await delay(1000);
    }

    console.log('All threads has been purged');
}

const delay = (time: number) => {
    return new Promise(resolve => setTimeout(resolve, time));
}