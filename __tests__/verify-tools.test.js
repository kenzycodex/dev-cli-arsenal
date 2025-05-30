const { checkTool } = require('../scripts/verify-tools');

describe('Tool Verification', () => {
  test('should verify tool existence', async () => {
    const mockTool = {
      name: 'node',
      command: 'node --version',
      platforms: ['win32', 'darwin', 'linux']
    };
    
    const result = await checkTool(mockTool);
    expect(result.status).toBe('verified');
  });
});