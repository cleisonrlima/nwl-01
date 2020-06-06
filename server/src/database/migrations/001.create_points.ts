import Knex from "knex";

export async function up(knex: Knex) {
    //CREATE TABLE
    return knex.schema.createTable('points', table => {
        table.increments('id').primary();
        table.string('image').notNullable();
        table.string('name').notNullable();
        table.string('email').notNullable();
        table.string('whatsapp').notNullable();
        table.decimal('latitude').notNullable();
        table.decimal('longitude').notNullable();
        table.string('city').notNullable();
        table.string('uf', 2).notNullable();
        table.timestamps(false, true);
      table.timestamp('deleted_at').defaultTo(knex.fn.now());

    });
}
export async function down(knex: Knex) {
    return knex.schema.dropTable('point');
}