import { MigrationInterface, QueryRunner } from 'typeorm';

export default class RemoveQuantityColumnInOrdersTable1610814898889
    implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('orders', 'quantity');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {}
}
