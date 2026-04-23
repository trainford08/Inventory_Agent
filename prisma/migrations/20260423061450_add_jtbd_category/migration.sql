-- Add category with empty-string default so existing rows satisfy NOT NULL;
-- seed immediately replaces all JtbdEntry rows with canonical data that
-- populates this column, so the '' default is never user-visible.
ALTER TABLE "JtbdEntry" ADD COLUMN "category" TEXT NOT NULL DEFAULT '';
ALTER TABLE "JtbdEntry" ALTER COLUMN "category" DROP DEFAULT;
