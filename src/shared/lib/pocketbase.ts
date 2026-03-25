import PocketBase from 'pocketbase';

const getPocketBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin.replace(':3000', ':8090');
  }
  return process.env.POCKETBASE_URL || 'http://127.0.0.1:8090';
};

export const pb = new PocketBase(getPocketBaseUrl());
