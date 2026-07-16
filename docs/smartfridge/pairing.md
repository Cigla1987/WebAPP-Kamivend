# Pairing

`POST /api/edge/v1/pair` consumes a short-lived hashed SmartFridge pairing code and returns a random device credential once. PostgreSQL stores only an HMAC hash and prefix. Active second-device pairing is rejected.
