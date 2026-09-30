import os
import logging

logger = logging.getLogger(__name__)

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads")

def delete_uploaded_file(file_url: str | None) -> None:
    """Delete a file from the uploads directory given its /static/uploads/<name> URL."""
    if not file_url:
        return
    # file_url looks like /static/uploads/abc123.pdf
    filename = os.path.basename(file_url)
    if not filename:
        return
    file_path = os.path.join(UPLOAD_DIR, filename)
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
            logger.info("Deleted uploaded file: %s", file_path)
    except OSError as e:
        logger.error("Failed to delete uploaded file %s: %s", file_path, e)

