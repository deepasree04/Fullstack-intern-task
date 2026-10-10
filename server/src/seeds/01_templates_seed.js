/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  // Clear dependent tables first to maintain foreign key integrity
  await knex('favorites').del();
  await knex('templates').del();

  await knex('templates').insert([
    {
      id: 1,
      name: 'Nova Analytics Dashboard',
      description: 'Enterprise-grade real-time SaaS analytics platform featuring cohort retention tracking, revenue forecasting, MRR breakdown, and custom KPI visualization.',
      thumbnail_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
      category: 'Analytics'
    },
    {
      id: 2,
      name: 'CognitiveAI Workspace',
      description: 'Comprehensive generative AI application workspace with multi-model playground, streaming prompt responses, token usage billing, and vector embeddings management.',
      thumbnail_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
      category: 'Artificial Intelligence'
    },
    {
      id: 3,
      name: 'Apex Flow CRM',
      description: 'Full-cycle sales pipeline manager equipped with automated deal staging, interactive kanban boards, contact enrichment, and conversion funnel analytics.',
      thumbnail_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
      category: 'CRM & Sales'
    },
    {
      id: 4,
      name: 'SyncPulse Workspaces',
      description: 'Modern agile project management hub featuring sprint planning, live team velocity burndown charts, task dependencies, and asynchronous status reports.',
      thumbnail_url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80',
      category: 'Productivity'
    },
    {
      id: 5,
      name: 'ShopPulse Headless Commerce',
      description: 'Ultra-fast next-generation e-commerce storefront with integrated catalog filtering, multi-currency checkout flows, order fulfillment workflows, and customer lifetime value metrics.',
      thumbnail_url: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=800&q=80',
      category: 'E-Commerce'
    },
    {
      id: 6,
      name: 'CloudForge DevOps Platform',
      description: 'Cloud infrastructure operations portal featuring real-time cluster telemetry, automated CI/CD deployment pipelines, alerting webhooks, and centralized audit logs.',
      thumbnail_url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
      category: 'DevOps & Cloud'
    }
  ]);
};
