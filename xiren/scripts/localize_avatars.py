"""Download remote portraits, verify them, and switch data.json to local assets.

Requires Pillow: python -m pip install Pillow
Existing local portraits and original source metadata are preserved.
"""

import concurrent.futures
import hashlib
import io
import json
from pathlib import Path
import time
import urllib.request
import urllib.parse

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = ROOT / "data.json"
EXTENSIONS = {"JPEG": ".jpg", "PNG": ".png", "WEBP": ".webp", "GIF": ".gif"}


def download(person):
    avatar = person["avatar"]
    url = avatar if isinstance(avatar, str) else avatar["url"]
    for attempt in range(3):
        try:
            headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36"}
            host = urllib.parse.urlparse(url).hostname or ""
            if host.endswith(".doubanio.com"):
                headers["Referer"] = "https://www.douban.com/"
            request = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(request, timeout=30) as response:
                content = response.read()
            with Image.open(io.BytesIO(content)) as image:
                extension = EXTENSIONS[image.format]
                image.verify()
            # Preserve downloaded bytes; the hash also avoids unsafe filename characters.
            filename = hashlib.sha256(content).hexdigest()[:24] + extension
            relative = "avatars/" + filename
            (ROOT / relative).write_bytes(content)
            metadata = dict(avatar) if isinstance(avatar, dict) else {}
            metadata.update(url="./" + relative, originalUrl=url)
            return person, metadata
        except Exception as error:
            if attempt == 2:
                raise RuntimeError(f"Download failed for {person['id']!a}: {url}: {error}") from error
            time.sleep(2 ** attempt)


def main():
    data = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    candidates = []
    for person in data["people"]:
        avatar = person.get("avatar")
        url = avatar if isinstance(avatar, str) else (avatar or {}).get("url", "")
        if url.startswith(("https://", "http://")):
            candidates.append(person)
    (ROOT / "avatars").mkdir(exist_ok=True)
    # Update the manifest only after every download succeeds.
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        results = list(pool.map(download, candidates))
    for person, metadata in results:
        person["avatar"] = metadata
    if results:
        DATA_PATH.write_text(
            json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
        )
    print(f"Localized {len(results)} portraits.")


if __name__ == "__main__":
    main()
