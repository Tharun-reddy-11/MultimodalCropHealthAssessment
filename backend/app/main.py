"""VerdantAI development API. Production deployments should move JWT secrets to a vault and SQLite to MySQL."""
from __future__ import annotations

import csv, io, os, sqlite3, time, uuid
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Annotated

import jwt
from fastapi import Depends, FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from passlib.context import CryptContext
from PIL import Image, UnidentifiedImageError

from .model import ModelNotReady, predict_image, model_status

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "runtime_data"
UPLOADS = DATA / "uploads"
DB = DATA / "verdantai.db"
UPLOADS.mkdir(parents=True, exist_ok=True)
SECRET = os.getenv("VERDANTAI_JWT_SECRET", "development-only-change-me-before-deploy")
ALGO, EXPIRES = "HS256", 60 * 60 * 8
pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")
bearer = HTTPBearer()

app = FastAPI(title="VerdantAI API", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:5173"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

def conn():
    c = sqlite3.connect(DB); c.row_factory = sqlite3.Row; return c

def setup():
    with conn() as c:
        c.executescript("""
        CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE,
          password_hash TEXT NOT NULL, created_at TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS assessments (id TEXT PRIMARY KEY, user_id INTEGER NOT NULL, crop_type TEXT NOT NULL,
          observation_date TEXT NOT NULL, image_path TEXT NOT NULL, original_filename TEXT NOT NULL, mode TEXT NOT NULL,
          temperature REAL, humidity REAL, rainfall REAL, solar_radiation REAL, wind_speed REAL, prediction TEXT,
          confidence REAL, alternatives TEXT, model_version TEXT, status TEXT NOT NULL, error TEXT, created_at TEXT NOT NULL,
          FOREIGN KEY(user_id) REFERENCES users(id));
        """)

@app.on_event("startup")
def startup(): setup()

def token(user: sqlite3.Row):
    return jwt.encode({"sub": str(user["id"]), "exp": datetime.now(timezone.utc) + timedelta(seconds=EXPIRES)}, SECRET, algorithm=ALGO)

def current(auth: Annotated[HTTPAuthorizationCredentials, Depends(bearer)]):
    try: uid = int(jwt.decode(auth.credentials, SECRET, algorithms=[ALGO])["sub"])
    except Exception: raise HTTPException(401, "Your session is invalid or has expired. Please sign in again.")
    with conn() as c: user = c.execute("SELECT * FROM users WHERE id=?", (uid,)).fetchone()
    if not user: raise HTTPException(401, "Account not found.")
    return user

def user_payload(user): return {"id": user["id"], "name": user["name"], "email": user["email"]}

@app.get("/api/health")
def health(): return {"status": "ok", "model": model_status()}

@app.post("/api/auth/register", status_code=201)
def register(body: dict):
    name, email, password, confirm = (str(body.get(k, "")).strip() for k in ("name", "email", "password", "confirmPassword"))
    if len(name) < 2: raise HTTPException(422, "Enter your full name.")
    if "@" not in email or len(email) > 254: raise HTTPException(422, "Enter a valid email address.")
    if len(password) < 8 or not any(c.isdigit() for c in password): raise HTTPException(422, "Use at least 8 characters including a number.")
    if password != confirm: raise HTTPException(422, "Passwords do not match.")
    with conn() as c:
        try:
            c.execute("INSERT INTO users(name,email,password_hash,created_at) VALUES(?,?,?,?)", (name, email.lower(), pwd.hash(password), datetime.now(timezone.utc).isoformat()))
            user = c.execute("SELECT * FROM users WHERE email=?", (email.lower(),)).fetchone()
        except sqlite3.IntegrityError: raise HTTPException(409, "An account with this email already exists.")
    return {"token": token(user), "user": user_payload(user)}

@app.post("/api/auth/login")
def login(body: dict):
    email, password = str(body.get("email", "")).lower().strip(), str(body.get("password", ""))
    with conn() as c: user = c.execute("SELECT * FROM users WHERE email=?", (email,)).fetchone()
    if not user or not pwd.verify(password, user["password_hash"]): raise HTTPException(401, "Email or password is incorrect.")
    return {"token": token(user), "user": user_payload(user)}

@app.get("/api/me")
def me(user=Depends(current)): return user_payload(user)

def assessment_payload(row):
    d = dict(row); d["alternatives"] = __import__('json').loads(d["alternatives"] or "[]"); d["image_url"] = f"/api/assessments/{d['id']}/image"; return d

@app.get("/api/overview")
def overview(user=Depends(current)):
    with conn() as c:
        rows = c.execute("SELECT * FROM assessments WHERE user_id=? ORDER BY created_at DESC", (user["id"],)).fetchall()
    done = [r for r in rows if r["status"] == "completed"]
    healthy = sum(1 for r in done if (r["prediction"] or "").lower() == "healthy")
    return {"stats": {"total": len(rows), "completed": len(done), "healthy": healthy, "needs_review": len(done)-healthy}, "recent": [assessment_payload(r) for r in rows[:5]], "model": model_status()}

@app.get("/api/assessments")
def list_assessments(q: str = "", status: str = "", user=Depends(current)):
    sql, params = "SELECT * FROM assessments WHERE user_id=?", [user["id"]]
    if q: sql += " AND (crop_type LIKE ? OR prediction LIKE ?)"; params += [f"%{q}%", f"%{q}%"]
    if status: sql += " AND status=?"; params.append(status)
    sql += " ORDER BY created_at DESC"
    with conn() as c: rows = c.execute(sql, params).fetchall()
    return [assessment_payload(r) for r in rows]

@app.get("/api/assessments/{assessment_id}")
def get_assessment(assessment_id: str, user=Depends(current)):
    with conn() as c: r = c.execute("SELECT * FROM assessments WHERE id=? AND user_id=?", (assessment_id, user["id"])).fetchone()
    if not r: raise HTTPException(404, "Assessment not found.")
    return assessment_payload(r)

@app.get("/api/assessments/{assessment_id}/image")
def image(assessment_id: str, user=Depends(current)):
    from fastapi.responses import FileResponse
    with conn() as c: r = c.execute("SELECT * FROM assessments WHERE id=? AND user_id=?", (assessment_id, user["id"])).fetchone()
    if not r: raise HTTPException(404)
    return FileResponse(r["image_path"])

@app.post("/api/assessments", status_code=201)
async def create_assessment(
    image: UploadFile = File(...), crop_type: str = Form(...), observation_date: str = Form(...), mode: str = Form("image"),
    temperature: float | None = Form(None), humidity: float | None = Form(None), rainfall: float | None = Form(None),
    solar_radiation: float | None = Form(None), wind_speed: float | None = Form(None), user=Depends(current)):
    if mode != "image": raise HTTPException(422, "Multimodal inference is unavailable: no paired environmental training dataset has been configured.")
    if image.content_type not in {"image/jpeg", "image/png"}: raise HTTPException(422, "Upload a JPG, JPEG, or PNG image.")
    content = await image.read()
    if not content or len(content) > 10 * 1024 * 1024: raise HTTPException(422, "Image must be between 1 byte and 10 MB.")
    try:
        im = Image.open(io.BytesIO(content)); im.verify()
    except (UnidentifiedImageError, OSError): raise HTTPException(422, "This file is not a valid image.")
    for val, low, high, label in [(temperature,-30,70,"Temperature"),(humidity,0,100,"Humidity"),(rainfall,0,1000,"Rainfall"),(solar_radiation,0,2000,"Solar radiation"),(wind_speed,0,100,"Wind speed")]:
        if val is not None and not low <= val <= high: raise HTTPException(422, f"{label} is outside the accepted range.")
    aid = str(uuid.uuid4()); suffix = ".png" if image.content_type == "image/png" else ".jpg"; path = UPLOADS / f"{aid}{suffix}"
    path.write_bytes(content); now = datetime.now(timezone.utc).isoformat()
    with conn() as c:
        c.execute("INSERT INTO assessments(id,user_id,crop_type,observation_date,image_path,original_filename,mode,temperature,humidity,rainfall,solar_radiation,wind_speed,status,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)", (aid,user["id"],crop_type.strip(),observation_date,path.as_posix(),image.filename or "upload",mode,temperature,humidity,rainfall,solar_radiation,wind_speed,"processing",now))
    started = time.perf_counter()
    try:
        result = predict_image(path)
        elapsed = round((time.perf_counter()-started)*1000)
        with conn() as c:
            c.execute("UPDATE assessments SET prediction=?,confidence=?,alternatives=?,model_version=?,status=? WHERE id=?", (result["label"],result["confidence"],__import__('json').dumps(result["alternatives"]),result["version"]+f" ({elapsed}ms)","completed",aid))
    except ModelNotReady as e:
        with conn() as c: c.execute("UPDATE assessments SET status=?,error=? WHERE id=?", ("failed",str(e),aid))
        raise HTTPException(503, str(e))
    return get_assessment(aid, user)

@app.delete("/api/assessments/{assessment_id}", status_code=204)
def delete_assessment(assessment_id: str, user=Depends(current)):
    with conn() as c: r=c.execute("SELECT image_path FROM assessments WHERE id=? AND user_id=?", (assessment_id,user["id"])).fetchone()
    if not r: raise HTTPException(404, "Assessment not found.")
    Path(r["image_path"]).unlink(missing_ok=True)
    with conn() as c: c.execute("DELETE FROM assessments WHERE id=? AND user_id=?", (assessment_id,user["id"]))

@app.get("/api/assessments/{assessment_id}/report.csv")
def report(assessment_id: str, user=Depends(current)):
    row = get_assessment(assessment_id, user); out = io.StringIO(); w=csv.writer(out); w.writerow(["VerdantAI Crop Health Assessment"])
    for key in ["created_at","crop_type","observation_date","mode","prediction","confidence","model_version","status","temperature","humidity","rainfall","solar_radiation","wind_speed"]: w.writerow([key, row.get(key)])
    w.writerow(["limitation", "Prediction is a model output, not a diagnosis. Confirm concerning results with a qualified agricultural professional."])
    return StreamingResponse(iter([out.getvalue()]), media_type="text/csv", headers={"Content-Disposition":f'attachment; filename="assessment-{assessment_id}.csv"'})
