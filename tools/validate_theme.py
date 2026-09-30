#!/usr/bin/env python3
"""Catch the theme mistakes Shopify rejects silently on import.

Shopify's theme import drops a bad file and, with it, every JSON template that
references the section it defines -- without saying which file or why. This
checks the rules that bit us, before an upload:

  * every .json file parses
  * every {% schema %} block parses
  * a schema declares presets OR default, never both
  * section, preset and theme_info.theme_name are <= 25 characters
  * setting ids are unique within a schema
  * block types named by a JSON template exist in that section's schema
  * no {% ... %} or {{ ... }} tag delimiter is left inside a comment block

Usage: python3 tools/validate_theme.py [theme_dir]
"""
import json
import re
import sys
from pathlib import Path

NAME_LIMIT = 25
SCHEMA_RE = re.compile(r"\{%-?\s*schema\s*-?%\}(.*?)\{%-?\s*endschema\s*-?%\}", re.S)
COMMENT_RE = re.compile(r"\{%-?\s*comment\s*-?%\}(.*?)\{%-?\s*endcomment\s*-?%\}", re.S)

errors = []
warnings = []


def fail(path, msg):
    errors.append(f"{path}: {msg}")


def load_schema(path):
    text = path.read_text(encoding="utf-8")

    # A tag delimiter inside a comment block confuses the Liquid parser.
    for body in COMMENT_RE.findall(text):
        if "{%" in body or "{{" in body:
            fail(path, "a Liquid tag delimiter is left inside a {% comment %} block")

    blocks = SCHEMA_RE.findall(text)
    if len(blocks) > 1:
        fail(path, f"{len(blocks)} schema blocks; a section may have only one")
    if not blocks:
        return None
    try:
        return json.loads(blocks[-1])
    except json.JSONDecodeError as exc:
        fail(path, f"schema is not valid JSON -- {exc}")
        return None


def check_schema(path, schema):
    name = schema.get("name", "")
    if len(name) > NAME_LIMIT:
        fail(path, f'section name "{name}" is {len(name)} chars (limit {NAME_LIMIT})')

    if "presets" in schema and "default" in schema:
        fail(path, "declares both presets and default; Shopify allows only one")

    for preset in schema.get("presets", []):
        pname = preset.get("name", "")
        if len(pname) > NAME_LIMIT:
            fail(path, f'preset name "{pname}" is {len(pname)} chars (limit {NAME_LIMIT})')

    ids = [s["id"] for s in schema.get("settings", []) if isinstance(s, dict) and "id" in s]
    dupes = {i for i in ids if ids.count(i) > 1}
    if dupes:
        fail(path, f"duplicate setting ids: {sorted(dupes)}")

    for block in schema.get("blocks", []):
        bids = [s["id"] for s in block.get("settings", []) if isinstance(s, dict) and "id" in s]
        bdupes = {i for i in bids if bids.count(i) > 1}
        if bdupes:
            fail(path, f'duplicate setting ids in block "{block.get("type")}": {sorted(bdupes)}')


def main(root):
    root = Path(root)
    if not root.is_dir():
        print(f"not a directory: {root}")
        return 1

    for path in sorted(root.rglob("*.json")):
        try:
            json.loads(path.read_text(encoding="utf-8"))
        except json.JSONDecodeError as exc:
            fail(path, f"invalid JSON -- {exc}")

    # theme_info.theme_name shares the 25-char limit, and a violation makes
    # Shopify reject the whole file -- silently, if it arrives by staged upload.
    schema_path = root / "config" / "settings_schema.json"
    if schema_path.exists():
        try:
            groups = json.loads(schema_path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            groups = []
        for group in groups:
            if isinstance(group, dict) and group.get("name") == "theme_info":
                tname = group.get("theme_name", "")
                if len(tname) > NAME_LIMIT:
                    fail(schema_path,
                         f'theme_name "{tname}" is {len(tname)} chars (limit {NAME_LIMIT})')

    block_types = {}
    for path in sorted((root / "sections").glob("*.liquid")):
        schema = load_schema(path)
        if schema is None:
            continue
        check_schema(path, schema)
        block_types[path.stem] = {
            b.get("type") for b in schema.get("blocks", []) if isinstance(b, dict)
        }

    for path in sorted((root / "templates").rglob("*.json")):
        try:
            tpl = json.loads(path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            continue  # already reported above
        for sid, section in (tpl.get("sections") or {}).items():
            stype = section.get("type")
            if stype not in block_types:
                fail(path, f'section "{sid}" uses unknown section type "{stype}"')
                continue
            for bid, block in (section.get("blocks") or {}).items():
                btype = block.get("type")
                if btype not in block_types[stype]:
                    fail(path, f'section "{sid}" block "{bid}" uses type "{btype}", '
                               f"which {stype}.liquid does not define")

    for line in warnings:
        print("warn:", line)
    for line in errors:
        print("FAIL:", line)
    if errors:
        print(f"\n{len(errors)} problem(s) found.")
        return 1
    print(f"OK -- {len(block_types)} sections validated, no problems found.")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1] if len(sys.argv) > 1 else "theme"))
