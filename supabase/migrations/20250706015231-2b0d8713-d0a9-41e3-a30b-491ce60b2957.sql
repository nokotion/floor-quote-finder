-- Remove Home's Pro brand logo
UPDATE flooring_brands 
SET logo_url = NULL
WHERE name = 'Home''s Pro';