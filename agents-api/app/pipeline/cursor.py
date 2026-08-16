"""Keyset pagination cursors.

Opaque by design: clients pass back what they were given rather than a
`created_at` and `id` pair, so the ordering can change without breaking an SDK
that has already been generated and shipped (CAR-162).
"""

import base64
import binascii
from dataclasses import dataclass
from datetime import datetime

SEPARATOR = "|"


@dataclass(frozen=True)
class Cursor:
    created_at: datetime
    id: str


def encode_cursor(cursor: Cursor) -> str:
    # Length-prefixed rather than joined on the separator: an id containing the
    # separator would otherwise decode into a different cursor entirely.
    payload = f"{cursor.created_at.isoformat()}{SEPARATOR}{len(cursor.id)}{SEPARATOR}{cursor.id}"
    return base64.urlsafe_b64encode(payload.encode("utf-8")).decode("ascii").rstrip("=")


def decode_cursor(raw: str) -> Cursor:
    """Parse a cursor, raising ValueError on anything malformed.

    Callers turn that into a 400: a stale or hand-written cursor is a client
    error, and letting it surface as an unhandled decode failure would report it
    as a server one.
    """
    if not raw:
        raise ValueError("Cursor is empty")

    try:
        padded = raw + "=" * (-len(raw) % 4)
        payload = base64.urlsafe_b64decode(padded.encode("ascii")).decode("utf-8")
    except (binascii.Error, UnicodeDecodeError, ValueError) as exc:
        raise ValueError(f"Cursor is not valid base64: {exc}") from exc

    timestamp, _, remainder = payload.partition(SEPARATOR)
    length, _, identifier = remainder.partition(SEPARATOR)

    if not timestamp or not length:
        raise ValueError("Cursor is missing its fields")

    try:
        created_at = datetime.fromisoformat(timestamp)
        expected = int(length)
    except ValueError as exc:
        raise ValueError(f"Cursor fields are malformed: {exc}") from exc

    if len(identifier) != expected:
        raise ValueError("Cursor id length does not match its prefix")

    return Cursor(created_at=created_at, id=identifier)
