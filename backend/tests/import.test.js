import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Import controller (direct)', () => {
  const billsFile = path.join(__dirname, 'fixtures', 'bills_sample.csv');
  const donationsFile = path.join(__dirname, 'fixtures', 'donations_sample.csv');

  test('previewImport parses billing CSV buffer', async () => {
    const { previewImport } = await import('../controllers/importController.js');
    const buffer = fs.readFileSync(billsFile);
    const req = { file: { buffer, originalname: 'bills_sample.csv' }, params: { entity: 'billing' } };
    let jsonResult = null;
    const res = { json: (data) => { jsonResult = data; } };
    await previewImport(req, res);
    expect(jsonResult).not.toBeNull();
    expect(Array.isArray(jsonResult.headers)).toBe(true);
    expect(Array.isArray(jsonResult.rows)).toBe(true);
  });

  test('previewImport parses donation CSV buffer', async () => {
    const { previewImport } = await import('../controllers/importController.js');
    const buffer = fs.readFileSync(donationsFile);
    const req = { file: { buffer, originalname: 'donations_sample.csv' }, params: { entity: 'donation' } };
    let jsonResult = null;
    const res = { json: (data) => { jsonResult = data; } };
    await previewImport(req, res);
    expect(jsonResult).not.toBeNull();
    expect(Array.isArray(jsonResult.headers)).toBe(true);
  });
});
