from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI(title="FundFlow CRM API Test")

# Very permissive CORS for testing
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Very permissive for testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "FundFlow CRM API is running!", "status": "ok"}

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "fundflow-crm-test"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", "8000")))
