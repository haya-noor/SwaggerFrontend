
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
  console.log(`Local checksum for ${localFilePath}: ${localChecksum}`);

  try {
    const listResponse = await drive.files.list({
      q: `name contains 'swagger-${branchName}-' and '${folderId}' in parents and trashed=false`,
      fields: 'files(id, name)',
    });

    const files = listResponse.data.files ?? [];
    console.log(`Found ${files.length} files in Google Drive`);

    // Find the latest file with a different checksum
    const latestFile = files.find(file => {
      const fileName = file.name ?? '';
      const match = fileName.match(/swagger-[\w-]+-([a-f0-9]{32})\.ts/);
      if (match && match[1]) {
        const checksum = match[1];
        return checksum !== localChecksum;
      }
      return false;
    });

    if (latestFile) {
      const fileId = latestFile.id!;
      const fileName = latestFile.name!;
      console.log(`Found file ${fileName} with ID: ${fileId}. Downloading it...`);

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
  const content = fs.readFileSync(filePath, 'utf-8');
  return crypto.createHash('md5').update(content).digest('hex');
}

// Get the local checksum
function getLocalChecksum(): string {
  const storedHash = process.env['SWAGGER_HASH'];
  return storedHash || '';
}

// Function to update the .env file with the new hash
function updateEnvFile(newHash: string) {
  const envFilePath = path.join(__dirname, '../../.env'); // Adjusted path
  let envContent = fs.readFileSync(envFilePath, 'utf-8');

  if (envContent.includes('SWAGGER_HASH=')) {
    envContent = envContent.replace(/SWAGGER_HASH=.*/, `SWAGGER_HASH=${newHash}`);
  } else {
    envContent += `\nSWAGGER_HASH=${newHash}`;
  }

  fs.writeFileSync(envFilePath, envContent, 'utf-8');
}

// Convert JSON to TypeScript
function convertJsonToTs(jsonFilePath: string, tsFilePath: string) {
  const jsonContent = fs.readFileSync(jsonFilePath, 'utf-8');
  const jsonObject = JSON.parse(jsonContent);
  const tsContent = `const swaggerSpec = ${JSON.stringify(jsonObject, null, 2)} as const;\nexport default swaggerSpec;\n`;
  fs.writeFileSync(tsFilePath, tsContent, 'utf-8');
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

  const jsonFilePath = path.join(__dirname, `../output/swagger-${branchName}.json`);
  const tsFilePath = path.join(__dirname, `../output/swagger-${branchName}.ts`);
  const localChecksum = getLocalChecksum();

  try {
    const listResponse = await drive.files.list({
      q: `name contains 'swagger-${branchName}-' and '${folderId}' in parents and trashed=false`,
      fields: 'files(id, name)',
    });

    const files = listResponse.data.files ?? [];
    console.log(`Found ${files.length} files in Google Drive`);

    // Find the latest file with a different checksum
    const latestFile = files.find(file => {
      const fileName = file.name ?? '';
      const match = fileName.match(/swagger-[\w-]+-([a-f0-9]{32})\.json/);
      if (match && match[1]) {
        const checksum = match[1];
        return checksum !== localChecksum;
      }
      return false;
    });

    if (latestFile) {
      const fileId = latestFile.id!;
      const fileName = latestFile.name!;
      console.log(`Found file ${fileName} with ID: ${fileId}. Downloading it...`);

      const dest = fs.createWriteStream(jsonFilePath);

      const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
      const headers = {
        Authorization: `Bearer ${await auth.getAccessToken()}`,
      };

      const response = await fetch(url, { headers });

      if (response.ok) {
        const stream = response.body.pipe(dest);
        stream.on('finish', () => {
          console.log(`File downloaded successfully for branch ${branchName}.`);

          // Convert JSON to TypeScript
          convertJsonToTs(jsonFilePath, tsFilePath);

          // Compute new checksum and update .env file
          const newChecksum = computeChecksum(jsonFilePath);
          updateEnvFile(newChecksum);
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
