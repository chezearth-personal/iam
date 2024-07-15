import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedUserEntity1721021954484 implements MigrationInterface {
    name = 'AddedUserEntity1721021954484'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "iam"."users_role_enum" AS ENUM('user', 'admin')`);
        await queryRunner.query(`CREATE TABLE "iam"."users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "firstname" character varying NOT NULL, "lastname" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "role" "iam"."users_role_enum" NOT NULL DEFAULT 'user', "verified" boolean NOT NULL DEFAULT false, "verificationcode" text, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "email_index" ON "iam"."users" ("email") `);
        await queryRunner.query(`CREATE INDEX "verificationcode_index" ON "iam"."users" ("verificationcode") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "iam"."verificationcode_index"`);
        await queryRunner.query(`DROP INDEX "iam"."email_index"`);
        await queryRunner.query(`DROP TABLE "iam"."users"`);
        await queryRunner.query(`DROP TYPE "iam"."users_role_enum"`);
    }

}
