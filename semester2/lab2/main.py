from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Path
from datetime import datetime
import re

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["x-test","ngrok-skip-browser-warning", "Content-Type", "Accept", "Access-Control-Allow-Headers"],
)

@app.api_route("/result4/", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
async def result4(request: Request):
    body_bytes = await request.body()
    body_text = body_bytes.decode("utf-8") if body_bytes else ""
    x_test = request.headers.get("x-test", "")

    response = {
        "message": "staffeev409626",
        "x-result": x_test,
        "x-body": body_text
    }

    return JSONResponse(
        content=response,
        headers={
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
            "Access-Control-Allow-Headers": "x-test,ngrok-skip-browser-warning,Content-Type,Accept,Access-Control-Allow-Headers"
        }
    )

@app.get("/{date}")
def get_date(date: str = Path(..., pattern=r"^\d{6}$")):
    dt = datetime.strptime(date, "%d%m%y")
    return JSONResponse(
            content={
                "date": dt.strftime("%d-%m-%Y"),
                "login": "staffeev409626"
            },
            media_type="application/json"
        )

@app.get("/api/rv/{text}")
def reverse_text(text: str = Path(..., pattern=r"^[a-z]+$")):
    return JSONResponse(content=text[::-1])