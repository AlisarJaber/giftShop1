from fastapi import APIRouter, UploadFile, File
import os, uuid, shutil

router = APIRouter(prefix="/api/uploads", tags=["uploads"])

@router.post("/image")
async def upload_image(image_file: UploadFile = File(...)):
    os.makedirs("static/images", exist_ok=True)
    filename = f"{uuid.uuid4()}_{image_file.filename}".replace(" ", "_")
    path = f"static/images/{filename}"

    with open(path, "wb") as buffer:
        shutil.copyfileobj(image_file.file, buffer)

    return {"url": f"http://localhost:8000/static/images/{filename}"}
