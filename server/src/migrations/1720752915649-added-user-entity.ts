import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedUserEntity1720752915649 implements MigrationInterface {
    name = 'AddedUserEntity1720752915649'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "skip"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "skip" boolean NOT NULL DEFAULT false`);
    }

}
