import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedUserEntity1720750711373 implements MigrationInterface {
    name = 'AddedUserEntity1720750711373'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "skip" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "skip"`);
    }

}
