"""Remove em dashes from the site's HTML.

Usage:  python scripts/remove-dashes.py          (rewrites files in place)
        python scripts/remove-dashes.py --check  (lists what would change, exits 1 if any)

Rules, applied in order:
  * Page titles and social titles:  "Products — Ardena"  ->  "Products | Ardena"
  * Numbered labels:                "01 — Mobility"      ->  "01 · Mobility"
  * Everything else:                "word — word"        ->  "word, word"
The HTML entity &mdash; is treated the same as the character.
"""
import pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
DASH = r'(?:—|&mdash;)'

def clean(text: str) -> str:
    # Titles: <title>, og:title, twitter:title, and "name" fields in JSON-LD stay pipe-separated.
    text = re.sub(r'(<title>[^<]*?)\s*' + DASH + r'\s*', r'\1 | ', text)
    text = re.sub(r'((?:og|twitter):title" content="[^"]*?)\s*' + DASH + r'\s*', r'\1 | ', text)
    # Numbered labels such as "01 — Mobility".
    text = re.sub(r'\b(\d{2})\s*' + DASH + r'\s*', r'\1 · ', text)
    # Prose: a dash between words becomes a comma. A placeholder goes in first so
    # the tidy step only touches commas this script inserted, never existing text
    # such as CSS values like rgba(32,32,32,.6).
    mark = '\x00'
    text = re.sub(r'\s*' + DASH + r'\s*', mark, text)
    # Tidy: drop an inserted comma that would land right before punctuation.
    text = re.sub(mark + r'\s*([.,;:!?)])', r'\1', text)
    return text.replace(mark, ', ')

def main() -> int:
    check = '--check' in sys.argv
    changed = []
    for path in sorted(ROOT.glob('*.html')):
        before = path.read_text(encoding='utf-8')
        after = before
        # Repeat until stable so titles with several dashes are all handled.
        while True:
            nxt = clean(after)
            if nxt == after:
                break
            after = nxt
        if after != before:
            changed.append((path.name, len(re.findall(DASH, before))))
            if not check:
                path.write_text(after, encoding='utf-8', newline='')
    for name, n in changed:
        print(f'{name}: {n} dash(es) {"found" if check else "removed"}')
    if not changed:
        print('No em dashes found.')
    return 1 if (check and changed) else 0

if __name__ == '__main__':
    sys.exit(main())
