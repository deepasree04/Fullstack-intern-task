/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // 1. Users table
  await knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('email').notNullable().unique();
    table.string('password_hash').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

  // 2. Templates table
  await knex.schema.createTable('templates', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.text('description').notNullable();
    table.text('thumbnail_url').notNullable();
    table.string('category').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

  // 3. Favorites table
  await knex.schema.createTable('favorites', (table) => {
    table.increments('id').primary();
    table
      .integer('user_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');
    table
      .integer('template_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('templates')
      .onDelete('CASCADE');
    table.timestamp('created_at').defaultTo(knex.fn.now());

    // Composite unique constraint to prevent duplicate favorites per user and template
    table.unique(['user_id', 'template_id']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('favorites');
  await knex.schema.dropTableIfExists('templates');
  await knex.schema.dropTableIfExists('users');
};
