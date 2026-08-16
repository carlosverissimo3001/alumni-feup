"""Keyset cursor encoding (CAR-159).

The cursor is opaque to clients, which is the point: encoding it rather than
exposing `created_at` and `id` as query params means the ordering can change
later without breaking a generated SDK that has already shipped.
"""

from datetime import datetime

import pytest

from app.pipeline.cursor import Cursor, decode_cursor, encode_cursor


class TestRoundTrip:
    def test_survives_encoding(self):
        original = Cursor(created_at=datetime(2026, 8, 16, 12, 30, 45, 123456), id="abc-123")
        assert decode_cursor(encode_cursor(original)) == original

    def test_preserves_microseconds(self):
        # Runs created in the same second are common when a batch is seeded, so
        # truncating here would make the tiebreak do all the work and paging
        # would start skipping rows.
        original = Cursor(created_at=datetime(2026, 8, 16, 12, 30, 45, 999999), id="x")
        assert decode_cursor(encode_cursor(original)).created_at.microsecond == 999999

    def test_is_opaque(self):
        encoded = encode_cursor(Cursor(created_at=datetime(2026, 8, 16), id="abc-123"))
        assert "abc-123" not in encoded
        assert "2026" not in encoded

    def test_is_url_safe(self):
        # It travels as a query parameter, so + and / would need escaping and
        # would eventually be mangled by something in the chain.
        encoded = encode_cursor(
            Cursor(created_at=datetime(2026, 8, 16, 12, 30, 45, 123456), id="a/b+c")
        )
        assert "+" not in encoded
        assert "/" not in encoded


class TestRejectsBadInput:
    @pytest.mark.parametrize("bad", ["not-base64!!", "", "YWJj", "eyJhIjoxfQ=="])
    def test_raises_on_malformed(self, bad):
        # A client sending a stale or hand-written cursor must get a clean 400
        # from the endpoint, not a 500 from a stray ValueError deeper in.
        with pytest.raises(ValueError):
            decode_cursor(bad)

    def test_rejects_an_id_containing_the_separator(self):
        # Ids are UUIDs today, but encoding must not silently corrupt if that
        # ever stops being true.
        original = Cursor(created_at=datetime(2026, 8, 16), id="a|b")
        assert decode_cursor(encode_cursor(original)) == original
