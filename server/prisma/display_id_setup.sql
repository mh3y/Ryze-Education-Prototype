-- =============================================================================
-- Ryze Education — Per-role display ID setup
-- Run this in the Supabase SQL editor AFTER running `prisma db push`
-- (which adds the nullable display_id column to User and Parent tables)
--
-- ID format:
--   Students  → RYZ-S-0001, RYZ-S-0002, …
--   Tutors    → RYZ-T-0001, RYZ-T-0002, …
--   Admins    → RYZ-A-0001, RYZ-A-0002, …
--   Parents   → RYZ-P-0001, RYZ-P-0002, …
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Sequences (independent counter per role)
-- ---------------------------------------------------------------------------

CREATE SEQUENCE IF NOT EXISTS seq_student_id START 1;
CREATE SEQUENCE IF NOT EXISTS seq_tutor_id   START 1;
CREATE SEQUENCE IF NOT EXISTS seq_admin_id   START 1;
CREATE SEQUENCE IF NOT EXISTS seq_parent_id  START 1;

-- ---------------------------------------------------------------------------
-- 2. Trigger function — User table
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION assign_user_display_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.display_id IS NULL THEN
    IF NEW.role = 'student' THEN
      NEW.display_id := 'RYZ-S-' || LPAD(nextval('seq_student_id')::text, 4, '0');
    ELSIF NEW.role = 'tutor' THEN
      NEW.display_id := 'RYZ-T-' || LPAD(nextval('seq_tutor_id')::text, 4, '0');
    ELSIF NEW.role = 'admin' THEN
      NEW.display_id := 'RYZ-A-' || LPAD(nextval('seq_admin_id')::text, 4, '0');
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_user_display_id ON "User";
CREATE TRIGGER trg_user_display_id
  BEFORE INSERT ON "User"
  FOR EACH ROW EXECUTE FUNCTION assign_user_display_id();

-- ---------------------------------------------------------------------------
-- 3. Trigger function — Parent table
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION assign_parent_display_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.display_id IS NULL THEN
    NEW.display_id := 'RYZ-P-' || LPAD(nextval('seq_parent_id')::text, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_parent_display_id ON "Parent";
CREATE TRIGGER trg_parent_display_id
  BEFORE INSERT ON "Parent"
  FOR EACH ROW EXECUTE FUNCTION assign_parent_display_id();

-- ---------------------------------------------------------------------------
-- 4. Backfill existing records (ordered by id to preserve chronology)
-- ---------------------------------------------------------------------------

-- Students
WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY id) AS rn
  FROM "User"
  WHERE role = 'student' AND display_id IS NULL
)
UPDATE "User" u
SET display_id = 'RYZ-S-' || LPAD(n.rn::text, 4, '0')
FROM numbered n
WHERE u.id = n.id;

-- Tutors
WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY id) AS rn
  FROM "User"
  WHERE role = 'tutor' AND display_id IS NULL
)
UPDATE "User" u
SET display_id = 'RYZ-T-' || LPAD(n.rn::text, 4, '0')
FROM numbered n
WHERE u.id = n.id;

-- Admins
WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY id) AS rn
  FROM "User"
  WHERE role = 'admin' AND display_id IS NULL
)
UPDATE "User" u
SET display_id = 'RYZ-A-' || LPAD(n.rn::text, 4, '0')
FROM numbered n
WHERE u.id = n.id;

-- Parents
WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY id) AS rn
  FROM "Parent"
  WHERE display_id IS NULL
)
UPDATE "Parent" p
SET display_id = 'RYZ-P-' || LPAD(n.rn::text, 4, '0')
FROM numbered n
WHERE p.id = n.id;

-- ---------------------------------------------------------------------------
-- 5. Advance sequences past backfilled counts so new inserts don't collide
-- ---------------------------------------------------------------------------

DO $$
DECLARE
  cnt bigint;
BEGIN
  SELECT COUNT(*) INTO cnt FROM "User" WHERE role = 'student';
  IF cnt > 0 THEN PERFORM setval('seq_student_id', cnt); END IF;

  SELECT COUNT(*) INTO cnt FROM "User" WHERE role = 'tutor';
  IF cnt > 0 THEN PERFORM setval('seq_tutor_id', cnt); END IF;

  SELECT COUNT(*) INTO cnt FROM "User" WHERE role = 'admin';
  IF cnt > 0 THEN PERFORM setval('seq_admin_id', cnt); END IF;

  SELECT COUNT(*) INTO cnt FROM "Parent";
  IF cnt > 0 THEN PERFORM setval('seq_parent_id', cnt); END IF;
END $$;

-- ---------------------------------------------------------------------------
-- Done. Verify with:
--   SELECT id, role, display_id FROM "User" ORDER BY role, id LIMIT 20;
--   SELECT id, display_id FROM "Parent" ORDER BY id LIMIT 10;
-- ---------------------------------------------------------------------------
