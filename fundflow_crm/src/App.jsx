import React from "react";
import Routes from "./Routes";
import ConnectionStatus from "./components/ConnectionStatus";

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Connection Status Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <ConnectionStatus />
      </div>
      
      {/* Main Application Routes */}
      <Routes />
    </div>
  );
}

export default App;
