# 🎲 MCP Dice Server

This is a Model Context Protocol (MCP) server that provides a dice rolling tool, built with Next.js and deployable on Vercel.

## Features

- **`roll_dice`** tool - Rolls an N-sided die and returns the result

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. The server will be available at `http://localhost:3000`

## Testing the MCP Server

### Using MCP Inspector

1. Install and run the MCP inspector:
   ```bash
   npx @modelcontextprotocol/inspector@latest http://localhost:3000
   ```

2. Open the inspector interface at: `http://127.0.0.1:6274`

3. Connect to your MCP server:
   - Select "Streamable HTTP" in the dropdown
   - Use URL: `http://localhost:3000/api/mcp`
   - Click "Connect"

4. Test the tools:
   - Click "List Tools" under Tools
   - Click on the `roll_dice` tool
   - Test it with different parameters

## Deployment on Vercel

1. Deploy to Vercel:
   ```bash
   vercel --prod
   ```

2. Your MCP server will be available at: `https://your-app.vercel.app/api/mcp`

## Using with MCP Clients

### Cursor Configuration

Add to your Cursor MCP configuration:

```json
{
  "mcpServers": {
    "dice-server": {
      "url": "https://your-app.vercel.app/api/mcp"
    }
  }
}
```

### Claude Desktop Configuration

Add to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "dice-server": {
      "url": "https://your-app.vercel.app/api/mcp"
    }
  }
}
```

## API Endpoints

- **Homepage**: `/` - Information about the MCP server
- **MCP Endpoint**: `/api/mcp` - The main MCP server endpoint

## Tools Available

- **`roll_dice`**: 
  - Description: Rolls an N-sided die
  - Parameters: `{ sides: number }` (minimum 2)
  - Returns: Result with dice emoji and rolled value
