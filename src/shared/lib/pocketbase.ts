import PocketBase from 'pocketbase';

const getPocketBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return (
    process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://5.53.125.238:8090'
  );
};

export const pb = new PocketBase(getPocketBaseUrl());
