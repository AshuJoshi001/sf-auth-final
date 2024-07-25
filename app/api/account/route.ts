import { NextRequest, NextResponse } from 'next/server';
import { getSFDCConnection } from '../../util/session';

export async function GET(req: NextRequest) {
    const conn = await getSFDCConnection();
    if (!conn) {
        return NextResponse.json({ error: 'No Salesforce connection' }, { status: 500 });
    }

    try {
        const records = await new Promise((resolve, reject) => {
            const results: Array<any> = [];
            conn.query('SELECT Id, Name FROM Account')
                .on('record', (record: any) => {
                    results.push({
                        Name: record.Name,
                        Id: record.Id,
                    });
                })
                .on('end', () => resolve(results))
                .on('error', (err: any) => reject(err))
                .run({ autoFetch: true, maxFetch: 4000 });
        });
        console.log('Account records: ', records);
        

        return NextResponse.json(records);
    } catch (error) {
        console.error('Error fetching accounts:', error);
        return NextResponse.json({ error: 'Failed to fetch accounts' }, { status: 500 });
    }
}