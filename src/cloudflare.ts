import Cloudflare from "cloudflare"


function genClient(token: string) {
    return new Cloudflare({
        apiToken: token
    })
}

export async function checkDb(env: any) {
    const db = await genClient(env.CF_API_TOKEN).d1.database.get(env.D1_ID!, {
        account_id: env.CF_ACCOUNT_ID!
    })

    console.log(db);
}

export async function query(env: any, query: string) {
    const res = await genClient(env.CF_API_TOKEN).d1.database.query(env.D1_ID!, {
        account_id: env.CF_ACCOUNT_ID!,
        sql: query
    });

    return res;
}