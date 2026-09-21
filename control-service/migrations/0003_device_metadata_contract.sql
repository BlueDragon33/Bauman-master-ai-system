ALTER TABLE bm_devices ADD COLUMN platform TEXT;
ALTER TABLE bm_devices ADD COLUMN browser TEXT;

UPDATE bm_devices
SET display_code =
  'BM-' || UPPER(SUBSTR(device_id, 1, 4)) ||
  '-' || UPPER(SUBSTR(device_id, 5, 4)) ||
  '-' || UPPER(SUBSTR(device_id, 9, 4)) ||
  '-' || UPPER(SUBSTR(device_id, 13, 4))
WHERE display_code <> (
  'BM-' || UPPER(SUBSTR(device_id, 1, 4)) ||
  '-' || UPPER(SUBSTR(device_id, 5, 4)) ||
  '-' || UPPER(SUBSTR(device_id, 9, 4)) ||
  '-' || UPPER(SUBSTR(device_id, 13, 4))
);
