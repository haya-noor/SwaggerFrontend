import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { StorageService } from './StorageService.ts';
import { GoogleDrive } from './GoogleDrive.ts';

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

async function fetchSwagger(driveService: StorageService) {
  const folderId = process.env['GOOGLE_DRIVE_FOLDER_ID'];
  const branchName = process.env['BRANCH_NAME'];

  if (!folderId || !branchName) {
    console.error('Missing GOOGLE_DRIVE_FOLDER_ID or BRANCH_NAME in environment variables.');
    return;
  }

  const jsonFilePath = path.join(__dirname, `../output/swagger-${branchName}.json`);
  const tsFilePath = path.join(__dirname, `../output/swagger-${branchName}.ts`);
  const localChecksum = getLocalChecksum();

  try {
    const files = await driveService.fetchFile(`swagger-${branchName}-`, folderId);
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

      await driveService.downloadFile(fileId, jsonFilePath);

      // Convert JSON to TypeScript
      convertJsonToTs(jsonFilePath, tsFilePath);

      // Compute new checksum and update .env file
      const newChecksum = computeChecksum(jsonFilePath);
      updateEnvFile(newChecksum);
    } else {
      console.log(`No new swagger file found for branch ${branchName} or the checksum is up-to-date.`);
    }
  } catch (error) {
    console.error('Error fetching files:', error);
  }

  console.log("Branch name: ", branchName);
}

// Dependency injection
const googleDriveService = new GoogleDrive();
fetchSwagger(googleDriveService);
