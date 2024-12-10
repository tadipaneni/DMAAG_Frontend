// src/utils/testGraphQL.js
import { fetchGraphQL } from './graphql';

export const testConnection = async () => {
  try {
    const result = await fetchGraphQL(`
      query {
        gsuRecords(limit: 1) {
          deed_state
          deed_county
        }
      }
    `);
    console.log('GraphQL Connection Test:', result);
    return result;
  } catch (error) {
    console.error('GraphQL Connection Error:', error);
    throw error;
  }
};