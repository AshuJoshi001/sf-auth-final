import NextAuth, { DefaultSession, Account, User } from "next-auth";
import SalesforceProvider from "next-auth/providers/salesforce";
import axios from "axios";
import qs from "qs";
import { JWT } from "next-auth/jwt";


interface ExtendedSession extends DefaultSession {
    accessToken?: string;
    instanceUrl?: string;
    idToken?: string;
  }
  
  // Extend the built-in token types
  interface ExtendedToken extends JWT {
    accessToken?: string;
    idToken?: string;
    instanceUrl?: string;
  }

const tokenIntrospection = async (tokenObject: any) => {
    try {
        const data = qs.stringify({
            'token': tokenObject.accessToken,
            'token_type_hint': 'access_token',
            'client_id': process.env.SALESFORCE_CLIENT_ID,
            'client_secret': process.env.SALESFORCE_CLIENT_SECRET
        });

        const tokenResponse = await axios({
            method: 'post',
            url: `${process.env.SALESFORCE_URL_LOGIN}/services/oauth2/introspect`,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
            },
            data: data
        }).catch(error => {
            console.error('API Request Failed:', error);
            return null;
        });

        if (!tokenResponse) {
            return {
                error: "APIRequestError",
            }
        }

        console.log('Token Introspection Response:', tokenResponse.data);
        return tokenResponse.data;
    } catch (error) {
        console.error('Token Introspection Error:', error);
        return {
            error: "TokenIntrospectionError",
        }
    }
};

const refreshAccessToken = async (tokenObject: any) => {
    try {
        var data = qs.stringify({
            'grant_type': 'refresh_token',
            'client_id': process.env.SALESFORCE_CLIENT_ID,
            'client_secret': process.env.SALESFORCE_CLIENT_SECRET,
            'refresh_token': tokenObject.refreshToken
        });

        const tokenResponse = await axios({
            method: 'post',
            url: `${process.env.SALESFORCE_URL_LOGIN}/services/oauth2/token`,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: data
        });

        const { access_token, refresh_token, instance_url } = await tokenResponse.data;

        // Get expire date from token introspection end point.
        tokenObject.accessToken = access_token;
        const { exp } = await tokenIntrospection(tokenObject);

        return {
            accessToken: access_token,
            refreshToken: refresh_token ?? tokenObject.refreshToken,
            accessTokenExpires: exp,
            instanceUrl: instance_url
        };
    } catch (error) {
        return {
            error: "RefreshAccessTokenError",
        }
    }
}



export const authOptions = {
    providers: [
      SalesforceProvider({
        name: 'Salesforce',
        clientId: process.env.SALESFORCE_CLIENT_ID || '',
        clientSecret: process.env.SALESFORCE_CLIENT_SECRET || '',
        idToken: true,
        wellKnown: `${process.env.SALESFORCE_URL_LOGIN}/.well-known/openid-configuration`,
        authorization: { params: { scope: 'openid api refresh_token' } },
        userinfo: {
          async request({ provider, tokens, client }: { provider: any, tokens: any, client: any }) {
            return await client.userinfo(tokens, {
              params: provider.userinfo?.params,
            });
          },
        },
        profile(profile: any) {
          return { id: profile.email, ...profile };
        }
      })
    ],
    callbacks: {
        async jwt({ token, account }: { token: ExtendedToken, account: Account | null }) {
            console.log('JWT Account', account);            
            if (account) {
              token.accessToken = account.access_token as string;
              token.idToken = account.id_token as string;
              token.instanceUrl = account.instance_url as string;
            }
            const introspection = await tokenIntrospection(token);
            if (introspection.error) {
              throw new Error(introspection.error);
            }
            console.log('JWT Token from route', token);
            
            return token;
          },
      async session({ session, token }: { session: ExtendedSession, token: ExtendedToken }) {
        session.accessToken = token.accessToken;
        session.idToken = token.idToken;
        session.instanceUrl = token.instanceUrl
        console.log('Token in auth', token);
        return session;
      }
    },
    pages: {
      signIn: '/signin'
    }
  };
  
  const handler = NextAuth(authOptions);
  
  export { handler as GET, handler as POST };