from pydantic import BaseModel


class JobResponse(BaseModel):
    id: str
    filename: str
    format: str
    status: str
    progress: float
    error: str | None = None
    download_url: str | None = None
