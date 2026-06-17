/**
 * utils/fileStore.js
 * Safe async JSON flat-file store.
 * All data files live under server/data/*.json
 */

const fs   = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');

/**
 * Read a JSON data file. Returns parsed object/array or defaultValue if missing.
 */
async function read(filename, defaultValue = []) {
  const filePath = path.join(DATA_DIR, filename);
  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === 'ENOENT') return defaultValue;
    throw err;
  }
}

/**
 * Write data to a JSON data file (pretty-printed, atomic-ish via temp file).
 */
async function write(filename, data) {
  const filePath = path.join(DATA_DIR, filename);
  const tmpPath  = filePath + '.tmp';
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(tmpPath, JSON.stringify(data, null, 2), 'utf-8');
  await fs.rename(tmpPath, filePath);
}

/**
 * Append an item to a JSON array file.
 */
async function append(filename, item, defaultValue = []) {
  const arr = await read(filename, defaultValue);
  arr.push(item);
  await write(filename, arr);
  return arr;
}

/**
 * Update a key in a JSON object file.
 */
async function updateKey(filename, key, updater, defaultValue = {}) {
  const obj = await read(filename, defaultValue);
  obj[key]  = updater(obj[key]);
  await write(filename, obj);
  return obj;
}

module.exports = { read, write, append, updateKey };
