import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedUserEntity1713253101894 implements MigrationInterface {
    name = 'AddedUserEntity1713253101894'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."verificationCode_index"`);
        await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "verificationCode" TO "verificationcode"`);
        await queryRunner.query(`CREATE INDEX "verificationcode_index" ON "users" ("verificationcode") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."verificationcode_index"`);
        await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "verificationcode" TO "verificationCode"`);
        await queryRunner.query(`CREATE INDEX "verificationCode_index" ON "users" ("verificationCode") `);
    }

}
