-- Make placeId nullable since we're using placeName directly
ALTER TABLE "sadhaks" ALTER COLUMN "place_id" DROP NOT NULL;