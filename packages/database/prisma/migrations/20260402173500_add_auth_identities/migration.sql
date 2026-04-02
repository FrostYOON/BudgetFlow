CREATE TYPE "AuthIdentityProvider" AS ENUM ('GOOGLE', 'KAKAO', 'APPLE');

CREATE TABLE "auth_identities" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "provider" "AuthIdentityProvider" NOT NULL,
    "provider_subject" TEXT NOT NULL,
    "email" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "auth_identities_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "auth_identities_provider_provider_subject_key" ON "auth_identities"("provider", "provider_subject");
CREATE UNIQUE INDEX "auth_identities_user_id_provider_key" ON "auth_identities"("user_id", "provider");
CREATE INDEX "auth_identities_user_id_idx" ON "auth_identities"("user_id");

ALTER TABLE "auth_identities"
ADD CONSTRAINT "auth_identities_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
