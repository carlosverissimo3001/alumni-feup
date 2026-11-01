"""Exports the agents-api OpenAPI spec to a static file for SDK generation.

app.openapi() is a plain method call, not a request - the X-API-Key check lives in a
Starlette middleware, which only runs on actual HTTP requests, so this needs no auth.
"""

import json
import sys
from pathlib import Path

# Run from outside a package (`uv run python scripts/...`), so the project root
# needs to be on sys.path for `import app` to resolve, same as pytest's config.
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.main import app  # noqa: E402

OUTPUT_PATH = Path(__file__).resolve().parents[2] / "agents-api-openapi-spec.json"


def export() -> None:
    OUTPUT_PATH.write_text(json.dumps(app.openapi(), indent=2))
    print(f"OpenAPI spec written to {OUTPUT_PATH}")


if __name__ == "__main__":
    export()
