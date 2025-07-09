import { ofetch } from 'ofetch';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:13100';

export const api = ofetch.create({
  baseURL,
  mode: 'cors',
});