-- Change claimed_stages from INTEGER[] to TEXT[] to support string values like "cherry_1"
ALTER TABLE love_points 
ALTER COLUMN claimed_stages TYPE TEXT[] USING claimed_stages::TEXT[];
