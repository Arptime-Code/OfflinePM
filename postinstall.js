#!/usr/bin/env node
const fs = require('fs/promises');
const os = require('os');
const path = require('path');

async function createFolder() {
  const homeDir = os.homedir();
  const folderPath = path.join(homeDir, '.offlinepm');
  try {
    await fs.mkdir(folderPath, { recursive: true });
    console.log(`Created .offlinepm folder at ${folderPath}`);
  } catch (err) {
    if (err.code !== 'EEXIST') {
      console.error('Error creating folder:', err.message);
      process.exit(1);
    }
  }
}

createFolder();
