from fastapi import Request
import time
import logging

logger = logging.getLogger(__name__)


async def log_requests(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    duration = round(time.time() - start, 3)

    logger.info(
        f"{request.method} {request.url.path} "
        f"→ {response.status_code} ({duration}s)"
    )

    return response


async def add_security_headers(request: Request, call_next):
    response = await call_next(request)

    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"

    return response
