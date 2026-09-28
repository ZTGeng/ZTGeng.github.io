"""Fill empty avatar fields in data.json from linked Baidu or Douban profiles."""

import argparse
import concurrent.futures
import json
from pathlib import Path
import urllib.parse
import urllib.request

from bs4 import BeautifulSoup


ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = ROOT / "data.json"
USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 Chrome/124 Safari/537.36"
)


def fetch_url(profile_url):
    parsed = urllib.parse.urlparse(profile_url)
    if parsed.netloc.endswith("baidu.com"):
        return profile_url.replace("baike.baidu.com", "bkso.baidu.com")
    if parsed.netloc.endswith("douban.com"):
        return profile_url.replace("www.douban.com", "m.douban.com")
    return profile_url


def find_avatar(profile_url):
    request = urllib.request.Request(
        fetch_url(profile_url),
        headers={"User-Agent": USER_AGENT},
    )
    with urllib.request.urlopen(request, timeout=25) as response:
        soup = BeautifulSoup(response.read(), "html.parser")
    for tag, attrs, attribute in (
        ("meta", {"property": "og:image"}, "content"),
        ("meta", {"name": "og:image"}, "content"),
        ("link", {"rel": "image_src"}, "href"),
    ):
        element = soup.find(tag, attrs=attrs)
        url = element.get(attribute) if element else None
        if (
            url
            and url.startswith("http")
            and "personage-default" not in url
        ):
            return url
    image = soup.select_one('[class*="summaryPic"] img')
    if image and image.get("src", "").startswith("http"):
        return image["src"]
    return None


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    data = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    candidates = [
        person
        for person in data["people"]
        if person.get("baike") and not person.get("avatar")
    ]

    def load(person):
        profile_url = person["baike"]
        try:
            avatar_url = find_avatar(profile_url)
        except Exception as error:
            return person, None, str(error)
        if not avatar_url:
            return person, None, "页面未提供可识别的头像"
        return person, avatar_url, None

    filled = []
    failed = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
        results = pool.map(load, candidates)
    for person, avatar_url, error in results:
        if error:
            failed.append((person["name"], error))
            continue
        profile_url = person["baike"]
        person["avatar"] = {"url": avatar_url, "sourceUrl": profile_url}
        filled.append(person["name"])
    if not args.dry_run:
        DATA_PATH.write_text(
            json.dumps(data, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )
    print(f"Filled {len(filled)} portraits: {'、'.join(filled)}")
    for name, error in failed:
        print(f"Unavailable: {name}: {error}")


if __name__ == "__main__":
    main()
