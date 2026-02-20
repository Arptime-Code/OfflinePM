#!/usr/bin/env node

const fs = require('fs/promises');
const fsc = require('fs');
const path = require('path');
const os = require('os');

const OFFLINEPM_DIR = path.join(os.homedir(), '.offlinepm');

function showHelp() {
  console.log(`
OfflinePM - Offline Package Manager

Usage:
  offlinepm init              Initialize a new project with README.md and package.offlinepm.json
  offlinepm -s                Save current directory and subdirectories to ~/.offlinepm
  offlinepm -r                Convert package.offlinepm.json to README.md documentation
  offlinepm -c <project>      Copy a saved project from ~/.offlinepm to current directory
  offlinepm --help | -h       Show this help message
  offlinepm --version | -v    Show version

Examples:
  offlinepm init
  offlinepm -s
  offlinepm -r
  offlinepm -c my-awesome-project
`);
}

async function getPackageVersion() {
  const packagePath = path.join(__dirname, 'package.json');
  const content = await fs.readFile(packagePath, 'utf-8');
  return JSON.parse(content).version;
}

async function init() {
  const cwd = process.cwd();
  const projectName = path.basename(cwd);
  
  const packageJson = {
    name: projectName,
    description: "",
    functions: [
      {
        name: "exampleFunction",
        parameters: ["param1", "param2"],
        import: "const { exampleFunction } = require('./path/to/module')",
        description: "Description of what this function does"
      }
    ]
  };
  
  const readmeContent = `# ${projectName}

## Description
<!-- Add your project description here -->

## Functions

<!-- List your functions below -->
| Function | Parameters | Import | Description |
|----------|-----------|--------|-------------|
| exampleFunction | param1, param2 | \`import { exampleFunction } from './path'\` | Description of what it does |

## Installation

\`\`\`bash
offlinepm -c ${projectName}
\`\`\`

## Usage

<!-- Add usage examples here -->
`;

  const packagePath_target = path.join(cwd, 'package.offlinepm.json');
  const readmePath = path.join(cwd, 'README.md');
  
  try {
    await fs.access(packagePath_target);
    console.log('package.offlinepm.json already exists');
  } catch {
    await fs.writeFile(packagePath_target, JSON.stringify(packageJson, null, 2));
    console.log('Created package.offlinepm.json');
  }
  
  try {
    await fs.access(readmePath);
    console.log('README.md already exists');
  } catch {
    await fs.writeFile(readmePath, readmeContent);
    console.log('Created README.md');
  }
}

async function saveProject() {
  const cwd = process.cwd();
  const projectName = path.basename(cwd);
  const targetDir = path.join(OFFLINEPM_DIR, projectName);
  
  await fs.mkdir(OFFLINEPM_DIR, { recursive: true });
  
  try {
    await fs.rm(targetDir, { recursive: true, force: true });
  } catch {}
  
  await copyDirectory(cwd, targetDir);
  console.log(`Saved project "${projectName}" to ${targetDir}`);
}

async function copyDirectory(src, dest) {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.name === 'node_modules' || entry.name === '.git') {
      continue;
    }
    
    if (entry.isDirectory()) {
      await copyDirectory(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

async function convertJsonToReadme() {
  const cwd = process.cwd();
  const packagePath = path.join(cwd, 'package.offlinepm.json');
  const readmePath = path.join(cwd, 'README.md');
  
  let packageJson;
  try {
    const content = await fs.readFile(packagePath, 'utf-8');
    packageJson = JSON.parse(content);
  } catch (err) {
    console.error('Error: package.offlinepm.json not found or invalid JSON');
    process.exit(1);
  }
  
  const { name, description, functions } = packageJson;
  
  let functionsTable = '';
  if (functions && functions.length > 0) {
    functionsTable = `| Function | Parameters | Import | Description |
|----------|-----------|--------|-------------|
${functions.map(fn => {
  const params = fn.parameters ? fn.parameters.join(', ') : '';
  return `| ${fn.name} | ${params} | \`${fn.import || ''}\` | ${fn.description || ''} |`;
}).join('\n')}`;
  }
  
  const readmeContent = `# ${name || 'Project'}

## Description
${description || 'No description provided.'}

## Functions

${functionsTable || 'No functions defined.'}

## Installation

\`\`\`bash
offlinepm -c ${name || 'project-name'}
\`\`\`

## Usage

<!-- Add usage examples here -->
`;

  await fs.writeFile(readmePath, readmeContent);
  console.log('Converted package.offlinepm.json to README.md');
}

async function checkoutProject(projectName) {
  if (!projectName) {
    console.error('Error: Project name is required');
    console.log('Usage: offlinepm -c <project-name>');
    process.exit(1);
  }
  
  const sourceDir = path.join(OFFLINEPM_DIR, projectName);
  const cwd = process.cwd();
  const targetDir = path.join(cwd, projectName);
  
  try {
    await fs.access(sourceDir);
  } catch {
    console.error(`Error: Project "${projectName}" not found in ~/.offlinepm`);
    console.log('Available projects:');
    try {
      const projects = await fs.readdir(OFFLINEPM_DIR);
      projects.forEach(p => console.log(`  - ${p}`));
    } catch {
      console.log('  (none)');
    }
    process.exit(1);
  }
  
  await copyDirectory(sourceDir, targetDir);
  console.log(`Checked out project "${projectName}" to ${targetDir}`);
}

async function listProjects() {
  try {
    const projects = await fs.readdir(OFFLINEPM_DIR);
    if (projects.length === 0) {
      console.log('No saved projects found.');
    } else {
      console.log('Saved projects:');
      projects.forEach(p => console.log(`  - ${p}`));
    }
  } catch {
    console.log('No saved projects found.');
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    showHelp();
    return;
  }
  
  const command = args[0];
  
  try {
    switch (command) {
      case 'init':
        await init();
        break;
      case '-s':
      case '--save':
        await saveProject();
        break;
      case '-r':
      case '--read':
        await convertJsonToReadme();
        break;
      case '-c':
      case '--checkout':
        await checkoutProject(args[1]);
        break;
      case '-l':
      case '--list':
        await listProjects();
        break;
      case '-h':
      case '--help':
        showHelp();
        break;
      case '-v':
      case '--version':
        const version = await getPackageVersion();
        console.log(`offlinepm v${version}`);
        break;
      default:
        console.error(`Unknown command: ${command}`);
        showHelp();
        process.exit(1);
    }
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

main();
