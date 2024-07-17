import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedUserEntity1721255411667 implements MigrationInterface {
    name = 'AddedUserEntity1721255411667'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "iam"."users" DROP COLUMN "deleted_at"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "iam"."users" ADD "deleted_at" TIMESTAMP WITH TIME ZONE`);
    }

}
