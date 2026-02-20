# OfflinePM

A simple offline package manager to save, manage, and reuse project templates locally.

## Installation

```bash
npm install -g offlinepm
```

## Commands

### `offlinepm init`

Initialize a new project in the current directory. Creates:
- `package.offlinepm.json` - Project metadata and function definitions
- `README.md` - Documentation template

```bash
offlinepm init
```

### `offlinepm -s` (Save)

Save the current directory and all subdirectories to `~/.offlinepm/<project-name>/`. 
Automatically skips `node_modules` and `.git` directories.

```bash
offlinepm -s
```

### `offlinepm -r` (Read/Convert)

Convert `package.offlinepm.json` to a formatted `README.md` documentation file.

```bash
offlinepm -r
```

### `offlinepm -c <project-name>` (Checkout)

Copy a saved project from `~/.offlinepm/<project-name>/` to the current directory.

```bash
offlinepm -c my-awesome-project
```

### `offlinepm -l` (List)

List all saved projects in `~/.offlinepm/`.

```bash
offlinepm -l
```

### Other Commands

```bash
offlinepm --help     # Show help
offlinepm --version  # Show version
```

## JSON Structure

The `package.offlinepm.json` file structure:

```json
{
  "name": "my-project",
  "description": "A brief description of your project",
  "functions": [
    {
      "name": "functionName",
      "parameters": ["param1", "param2"],
      "import": "import { functionName } from './path/to/file'",
      "description": "What this function does"
    }
  ]
}
```

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Project name (defaults to folder name) |
| `description` | string | Brief project description |
| `functions` | array | List of exported functions |
| `functions[].name` | string | Function name |
| `functions[].parameters` | array | List of parameter names |
| `functions[].import` | string | Import statement to use the function |
| `functions[].description` | string | Description of what the function does |

## README Structure

When using `offlinepm -r`, the generated README includes:

1. **Title** - Project name
2. **Description** - From JSON description field
3. **Functions Table** - Auto-generated from functions array
4. **Installation** - Checkout command for this project
5. **Usage** - Placeholder for examples

## Example Workflow

```bash
# 1. Create a new reusable component
mkdir my-utils && cd my-utils
offlinepm init

# 2. Edit package.offlinepm.json with your function details

# 3. Save to offlinepm registry
offlinepm -s

# 4. Generate README from JSON
offlinepm -r

# 5. Use in another project
cd ../another-project
offlinepm -c my-utils
```

## License

MIT
