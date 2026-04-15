jest.mock('pocketbase', () => {
  const mockInstance = {
    collection: jest.fn(),
    authStore: {
      isValid: false,
      record: null,
    },
  };
  return jest.fn(() => mockInstance);
});

describe('pocketbase.ts', () => {
  const originalWindow = global.window;
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    delete (global as unknown as { window: undefined }).window;
  });

  afterEach(() => {
    global.window = originalWindow;
    process.env = originalEnv;
  });

  test('экспортирует pb объект', async () => {
    const { pb } = await import('./pocketbase');
    expect(pb).toBeDefined();
  });

  test('pb имеет метод authStore', async () => {
    const { pb } = await import('./pocketbase');
    expect(pb.authStore).toBeDefined();
  });

  test('pb имеет метод collection', async () => {
    const { pb } = await import('./pocketbase');
    expect(pb.collection).toBeDefined();
  });
});
