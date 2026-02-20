-- Migration script to update foreign key values from user_Unique_id to id
-- Run this script BEFORE applying the schema changes with `prisma db push`
-- 
-- This updates all foreign key references in related tables:
-- - Cart
-- - BulkCart
-- - Address
-- - Order
-- - PasswordReset
-- - SuspensionReason
-- - BillingAddress

-- Update Cart table
UPDATE Cart c
INNER JOIN User u ON c.userId = u.user_Unique_id
SET c.userId = u.id;

-- Update BulkCart table
UPDATE BulkCart bc
INNER JOIN User u ON bc.userId = u.user_Unique_id
SET bc.userId = u.id;

-- Update Address table
UPDATE Address a
INNER JOIN User u ON a.userId = u.user_Unique_id
SET a.userId = u.id;

-- Update Order table (note: Order is a reserved word in MySQL, so we use backticks)
UPDATE `Order` o
INNER JOIN User u ON o.orderBy = u.user_Unique_id
SET o.orderBy = u.id;

-- Update PasswordReset table
UPDATE PasswordReset pr
INNER JOIN User u ON pr.userId = u.user_Unique_id
SET pr.userId = u.id;

-- Update SuspensionReason table
UPDATE SuspensionReason sr
INNER JOIN User u ON sr.userId = u.user_Unique_id
SET sr.userId = u.id;

-- Update BillingAddress table
UPDATE BillingAddress ba
INNER JOIN User u ON ba.userId = u.user_Unique_id
SET ba.userId = u.id;

