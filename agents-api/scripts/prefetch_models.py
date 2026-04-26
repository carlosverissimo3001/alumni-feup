"""Pre-download model weights at build time so cold starts don't pay for it.

Invoked by the `prefetch-models` step in railpack.json. Inlining the same
command in railpack.json's JSON `commands` array does not work — Railpack's
shell-out double-escapes the JSON-escaped `\"` and strips the inner single
quotes, so the python -c invocation fails with a syntax error. A script file
sidesteps the entire quoting problem.

`HF_HOME` must be set in the same step so the cache lands in the layer
that downstream steps inherit.
"""

from sentence_transformers.cross_encoder import CrossEncoder

# Same model used by app/agents/* at runtime; keep in sync.
MODEL_NAME = "cross-encoder/ms-marco-MiniLM-L-6-v2"

if __name__ == "__main__":
    CrossEncoder(MODEL_NAME, device="cpu")
