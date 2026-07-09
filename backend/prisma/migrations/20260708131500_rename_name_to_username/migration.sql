-- Add username column as nullable first
ALTER TABLE "User" ADD COLUMN "username" TEXT;

-- Generate usernames from existing name or email
DO $$
DECLARE
    user_record RECORD;
    base_username TEXT;
    final_username TEXT;
    counter INT;
BEGIN
    FOR user_record IN SELECT id, name, email FROM "User" LOOP
        IF user_record.name IS NOT NULL AND user_record.name <> '' THEN
            base_username := LOWER(REGEXP_REPLACE(user_record.name, '[^a-zA-Z0-9]', '_', 'g'));
        ELSE
            base_username := LOWER(SPLIT_PART(user_record.email, '@', 1));
        END IF;
        
        IF base_username ~ '^[^a-zA-Z]' THEN
            base_username := 'u_' || base_username;
        END IF;
        
        final_username := base_username;
        counter := 1;
        WHILE EXISTS (SELECT 1 FROM "User" WHERE username = final_username AND id <> user_record.id) LOOP
            final_username := base_username || '_' || counter;
            counter := counter + 1;
        END LOOP;
        
        UPDATE "User" SET username = final_username WHERE id = user_record.id;
    END LOOP;
END $$;

-- Make username NOT NULL and add unique constraint
ALTER TABLE "User" ALTER COLUMN "username" SET NOT NULL;
ALTER TABLE "User" ADD CONSTRAINT "User_username_key" UNIQUE ("username");

-- Drop the old name column
ALTER TABLE "User" DROP COLUMN IF EXISTS "name";

-- Make email nullable
ALTER TABLE "User" ALTER COLUMN "email" DROP NOT NULL;
