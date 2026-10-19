#!/usr/bin/env python3
"""Generate crawler-friendly static pages from writing-data.json."""
import base64, html, json, mimetypes, re
from pathlib import Path
ROOT = Path(__file__).resolve().parent
SITE_URL = "https://patrick-sang.is-a.dev"
DATA_FILE = ROOT / "writing-data.json"
SITE = ROOT / "_site"

def slugify(value):
    value = str(value or "writing").lower()
    value = re.sub(r"[^a-z0-9]+", "-", value).strip("-")
    return value or "writing"

def esc(v): return html.escape(str(v or ""), quote=True)
def body_blocks(value):
    if isinstance(value, list): return value
    return [x.strip() for x in re.split(r"\n\s*\n", str(value or "")) if x.strip()]
def render_body(value):
    out=[]
    for block in body_blocks(value):
        if block.startswith("## "):
            out.append(f'<h2 class="display-sm" style="padding-top:2rem">{esc(block[3:])}</h2>')
        elif block.startswith("> "):
            out.append(f'<blockquote class="story-quote" style="margin:2rem 0">{esc(block[2:])}</blockquote>')
        else:
            text=esc(block)
            text=re.sub(r"\*([^*]+)\*", r"<em>\1</em>", text)
            out.append(f'<p class="body" style="padding-top:1.25rem">{text}</p>')
    return "\n".join(out)
def main():
    data=json.loads(DATA_FILE.read_text(encoding="utf-8"))
    notes=data.get("notes", [])
    (SITE/"writing").mkdir(parents=True, exist_ok=True)
    for note in notes:
        slug=slugify(note.get("slug") or note.get("title"))
        title=note.get("title", "Untitled")
        url=f"{SITE_URL}/writing/{slug}/"
        cover=str(note.get("cover") or f"{SITE_URL}/img/two.png")
        cover_url=str(note.get("coverUrl") or "").strip()
        if not cover.startswith("data:image/") and cover_url:
            cover=cover_url
        # If Mavo stores a local image as a data URL, materialize it as a file.
        if cover.startswith("data:image/"):
            header, encoded=cover.split(",",1)
            mime=header.split(";")[0][5:]
            ext=mimetypes.guess_extension(mime) or ".png"
            rel=f"img/writing/{slug}{ext}"
            target=SITE/rel
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(base64.b64decode(encoded))
            cover=f"{SITE_URL}/{rel}"
        elif cover.startswith("/"):
            cover=SITE_URL+cover
        elif not re.match(r"^https?://", cover):
            cover=SITE_URL+"/"+cover.lstrip("./")
        date=note.get("date", "")
        tags=note.get("tags", [])
        if isinstance(tags, str): tags=[t.strip() for t in tags.split(",") if t.strip()]
        tags_html=" ".join(f'<span class="label">{esc(t)}</span>' for t in tags)
        reading=note.get("reading", "")
        standfirst=note.get("standfirst", "")
        body=render_body(note.get("body", ""))
        css="../../writing-style.css"
        page=f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>{esc(title)} — Writing | Patrick Sang</title>
<meta name="description" content="{esc(standfirst)}"><meta name="author" content="Patrick Sang">
<link rel="canonical" href="{esc(url)}">
<meta property="og:url" content="{esc(url)}"><meta property="og:locale" content="en_US"><meta property="og:type" content="article">
<meta property="og:title" content="{esc(title)}"><meta property="og:description" content="{esc(standfirst)}"><meta property="og:image" content="{esc(cover)}"><meta property="og:image:alt" content="Cover image for {esc(title)}">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="{esc(title)}"><meta name="twitter:description" content="{esc(standfirst)}"><meta name="twitter:image" content="{esc(cover)}">
<link rel="stylesheet" href="{css}"><style>body{{background:var(--ink);color:var(--paper)}}.article-cover{{width:100%;max-height:520px;object-fit:cover;margin-top:2rem;border:1px solid var(--rule)}}.body em{{font-style:italic}}</style>
</head><body><main class="gutter top"><a href="/writingg.html" class="ui-link">← All writing</a>
<div style="padding-top:2rem"><span class="label">WRITING</span> <span class="label">{esc(date)} · {esc(reading)}</span></div>
<h1 class="display-lg" style="max-width:20ch;padding-top:2rem">{esc(title)}</h1>
<p class="story muted" style="font-size:1.3rem;line-height:1.4;max-width:48ch;padding-top:1.75rem">{esc(standfirst)}</p>
<div style="padding-top:2rem">{tags_html}</div>
<img class="article-cover" src="{esc(cover)}" alt="Cover image for {esc(title)}" loading="eager">
<div class="article-body" style="max-width:66ch;padding:3rem 0 6rem">{body}</div>
<div class="rule-t" style="padding:2rem 0 5rem"><a href="/writingg.html" class="ui-link">← Back to all writing</a></div></main></body></html>"""
        folder=SITE/"writing"/slug
        folder.mkdir(parents=True, exist_ok=True)
        (folder/"index.html").write_text(page, encoding="utf-8")
    print(f"Generated {len(notes)} writing pages in {SITE}")
if __name__ == "__main__": main()
