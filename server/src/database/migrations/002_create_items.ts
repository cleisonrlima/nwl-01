import Knex from "knex";

export async function up(knex: Knex) {
    //CREATE TABLE
    return knex.schema.createTable('items', table => {
        table.increments('id').primary();
        table.string('title').notNullable();
        table.string('image').notNullable();
        table.timestamps(false, true);
        table.timestamp('deleted_at').defaultTo(knex.fn.now());
    });
}
export async function down(knex: Knex) {
    return knex.schema.dropTable('items');
}