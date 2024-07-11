import { MigrationInterface, QueryRunner } from "typeorm";

export class RevertCoffeeTitle1720456078441 implements MigrationInterface {
    name = 'RevertCoffeeTitle1720456078441'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "coffee" RENAME COLUMN "title" TO "name"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "coffee" RENAME COLUMN "name" TO "title"`);
    }

}
