ALTER TABLE bm_automation_policy ADD COLUMN auto_reject_devices INTEGER DEFAULT 0 NOT NULL CHECK (auto_reject_devices IN (0, 1));

UPDATE bm_automation_policy
SET auto_reject_devices = 0
WHERE id = 1;
