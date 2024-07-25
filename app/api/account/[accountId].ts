import { NextApiRequest, NextApiResponse } from "next";
import { getSFDCConnection } from "../../util/session";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const conn = await getSFDCConnection();
    console.log('Connection In Account: ', conn);
    
    if (!conn) return;

    const { accountId } = req.query;
    return new Promise(resolve => {
        //@ts-ignored
        conn.sobject("Account").retrieve(accountId, function (err, account) {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Failed to retrieve account' });
                return resolve(null);
            }
            res.status(200).json(account);
            resolve(null);
        });
    });
}