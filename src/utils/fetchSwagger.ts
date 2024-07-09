

//using hashing 

import fs from 'fs';
import { google } from 'googleapis';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import fetch from 'node-fetch';

// Load environment variables from .env file
dotenv.config();

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Compute MD5 checksum of a file
function computeChecksum(filePath: string): string {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('md5').update(content).digest('hex');
}

// Get the local checksum
function getLocalChecksum(filePath: string): string {
  if (fs.existsSync(filePath)) {
    return computeChecksum(filePath);
  }
  return ''; // Return an empty string if the file doesn't exist
}

async function fetchSwagger() {
  const keyFile = process.env['GOOGLE_SERVICE_ACCOUNT_KEY'];
  const folderId = process.env['GOOGLE_DRIVE_FOLDER_ID'];
  const branchName = process.env['BRANCH_NAME'];

  if (!keyFile || !folderId || !branchName) {
    console.error('Missing GOOGLE_SERVICE_ACCOUNT_KEY, GOOGLE_DRIVE_FOLDER_ID, or BRANCH_NAME in environment variables.');
    return;
  }

  const auth = new google.auth.GoogleAuth({
    keyFile: keyFile,
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  });

  const drive = google.drive({ version: 'v3', auth });

  const localFilePath = path.join(__dirname, `../output/swagger-${branchName}.ts`);
  const localChecksum = getLocalChecksum(localFilePath);

  try {
    const listResponse = await drive.files.list({
      q: `name contains 'swagger-${branchName}-' and '${folderId}' in parents and trashed=false`,
      fields: 'files(id, name)',
    });

    const files = listResponse.data.files ?? [];
    const latestFile = files.reduce<{
      id: string;
      name: string;
    } | null>((latest, file) => {
      const fileName = file.name ?? '';
      const match = fileName.match(/swagger-[\w-]+-([a-f0-9]{32})\.ts/);
      if (match && match[1]) {
        const checksum = match[1];
        if (!latest || checksum !== localChecksum) {
          return { id: file.id!, name: file.name! };
        }
      }
      return latest;
    }, null);

    if (latestFile && latestFile.name) {
      const fileId = latestFile.id;
      console.log(`Found file ${latestFile.name} with ID: ${fileId}. Downloading it...`);

      const dest = fs.createWriteStream(localFilePath);

      const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
      const headers = {
        Authorization: `Bearer ${await auth.getAccessToken()}`,
      };

      const response = await fetch(url, { headers });

      if (response.ok) {
        const stream = response.body.pipe(dest);
        stream.on('finish', () => {
          console.log(`File downloaded successfully for branch ${branchName}.`);
        });
        stream.on('error', (err) => {
          console.error('Error downloading file:', err);
        });
      } else {
        console.error('Unexpected response format.', response.status, response.statusText);
      }
    } else {
      console.log(`No new swagger file found for branch ${branchName} or the checksum is up-to-date.`);
    }
  } catch (error) {
    console.error('Error fetching files:', error);
  }

  console.log("Branch name: ", branchName);
}

fetchSwagger();




//using openapi fetch middleware 
/*
import fs from 'fs';
import { google } from 'googleapis';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import fetch from 'node-fetch';

// Load environment variables from .env file
dotenv.config();

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Compute MD5 checksum of a file
function computeChecksum(filePath: string): string {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('md5').update(content).digest('hex');
}

// Get the local checksum
function getLocalChecksum(filePath: string): string {
  if (fs.existsSync(filePath)) {
    return computeChecksum(filePath);
  }
  return ''; // Return an empty string if the file doesn't exist
}

async function fetchSwagger() {
  const keyFile = process.env['GOOGLE_SERVICE_ACCOUNT_KEY'];
  const folderId = process.env['GOOGLE_DRIVE_FOLDER_ID'];
  const branchName = process.env['BRANCH_NAME'];

  if (!keyFile || !folderId || !branchName) {
    console.error('Missing GOOGLE_SERVICE_ACCOUNT_KEY, GOOGLE_DRIVE_FOLDER_ID, or BRANCH_NAME in environment variables.');
    return;
  }

  const auth = new google.auth.GoogleAuth({
    keyFile: keyFile,
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  });

  const drive = google.drive({ version: 'v3', auth });

  const localFilePath = path.join(__dirname, `../output/swagger-${branchName}.ts`);
  const localChecksum = getLocalChecksum(localFilePath);

  try {
    const listResponse = await drive.files.list({
      q: `name contains 'swagger-${branchName}-' and '${folderId}' in parents and trashed=false`,
      fields: 'files(id, name)',
    });

    const files = listResponse.data.files ?? [];
    const latestFile = files.reduce<{
      id: string;
      name: string;
    } | null>((latest, file) => {
      const fileName = file.name ?? '';
      const match = fileName.match(/swagger-[\w-]+-([a-f0-9]{32})\.ts/);
      if (match && match[1]) {
        const checksum = match[1];
        if (!latest || checksum !== localChecksum) {
          return { id: file.id!, name: file.name! };
        }
      }
      return latest;
    }, null);

    if (latestFile && latestFile.name) {
      const fileId = latestFile.id;
      console.log(`Found file ${latestFile.name} with ID: ${fileId}. Downloading it...`);

      const dest = fs.createWriteStream(localFilePath);

      const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
      const headers = {
        Authorization: `Bearer ${await auth.getAccessToken()}`,
      };

      const response = await fetch(url, { headers });

      if (response.ok) {
        const stream = response.body.pipe(dest);
        stream.on('finish', () => {
          console.log(`File downloaded successfully for branch ${branchName}.`);
        });
        stream.on('error', (err) => {
          console.error('Error downloading file:', err);
        });
      } else {
        console.error('Unexpected response format.', response.status, response.statusText);
      }
    } else {
      console.log(`No new swagger file found for branch ${branchName} or the checksum is up-to-date.`);
    }
  } catch (error) {
    console.error('Error fetching files:', error);
  }

  console.log("Branch name: ", branchName);
}

fetchSwagger();
*/