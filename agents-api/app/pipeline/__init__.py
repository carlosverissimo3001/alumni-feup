"""The staged pipeline: stage ordering, transition rules and the executor.

`stages`, `sequence` and `state` are pure - no database, no Redis, no arq - so
the rules that decide what runs next can be tested without infrastructure.
`executor` is the only module that bridges them to the services and the tables.
"""
