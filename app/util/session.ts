import { getServerSession } from "next-auth/next";
import jsforce from "jsforce";
import { authOptions } from "../../app/api/auth/[...nextauth]/route";
import { Session } from "next-auth";
import axios from "axios";
import qs from "qs";

interface ExtendedSession extends Session {
  accessToken?: string;
  refreshToken?: string;
  idToken?: string;
  instanceUrl?: string;
}

const refreshAccessToken = async (refreshToken: string): Promise<{accessToken: string} | null> => {
  try {
    const tokenResponse = await axios({
      method: 'post',
      url: `${process.env.SALESFORCE_URL_LOGIN}/services/oauth2/token`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: qs.stringify({
        grant_type: 'refresh_token',
        client_id: process.env.SALESFORCE_CLIENT_ID,
        client_secret: process.env.SALESFORCE_CLIENT_SECRET,
        refresh_token: refreshToken
      })
    });

    return {
      accessToken: tokenResponse.data.access_token
    };
  } catch (error) {
    console.error('Error refreshing access token:', error);
    return null;
  }
};

export const getSFDCConnection = async (): Promise<jsforce.Connection | null> => {
  try {
    let session = await getServerSession(authOptions) as ExtendedSession | null;
    console.log('Initial SFDC Session', session);

    if (!session || !session.accessToken || !session.instanceUrl) {
      console.log('Session is invalid or missing:', session);
      return null;
    }

    let conn = new jsforce.Connection({
      instanceUrl: session.instanceUrl,
      accessToken: session.accessToken,
    });

    // Try to verify the connection
    try {
      await conn.identity();
      console.log('JsForce Connection established');
      return conn;
    } catch (error : any) {
      if (error.errorCode === 'INVALID_SESSION_ID') {
        console.log('Session expired, attempting to refresh...');
        


        // Create a new connection with the refreshed token
        conn = new jsforce.Connection({
          instanceUrl: session.instanceUrl,
          accessToken: session.accessToken,
        });

        // Verify the new connection
        await conn.identity();
        console.log('JsForce Connection established with refreshed token');
        return conn;
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error('SFDC Connection Error:', error);
    return null;
  }
};