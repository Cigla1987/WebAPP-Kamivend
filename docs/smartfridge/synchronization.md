# Synchronization

Push receipts use edge-device event IDs for idempotency. Pull changes use monotonic bigint cursors serialized as strings. Heartbeats update device and SmartFridge status. Lockbox compartments are excluded.
