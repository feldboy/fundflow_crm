export default function Home() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🎲 MCP Dice Server</h1>
      <p>This is an MCP (Model Context Protocol) server that provides a dice rolling tool.</p>
      <p><strong>MCP Endpoint:</strong> <code>/api/mcp</code></p>
      <p><strong>Available Tools:</strong></p>
      <ul>
        <li><code>roll_dice</code> - Rolls an N-sided die</li>
      </ul>
    </div>
  );
}
