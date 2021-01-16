import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export default class AddCreatedAtAndUpdatedAtInOrdersTable1610814261355
    implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'orders',
            new TableColumn({
                name: 'created_at',
                type: 'timestamp',
                default: 'now()',
            }),
        );

        await queryRunner.addColumn(
            'orders',
            new TableColumn({
                name: 'updated_at',
                type: 'timestamp',
                default: 'now()',
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('orders', 'updated_at');
        await queryRunner.dropColumn('orders', 'created_at');
    }
}
