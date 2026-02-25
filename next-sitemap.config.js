/**
 * next-sitemap configuration
 * https://github.com/iamvishnusankar/next-sitemap
 */
/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://www.tennispool.com.br',
  generateRobotsTxt: true, // will create public/robots.txt
  changefreq: 'daily',
  priority: 0.7,
  sitemapSize: 7000,
  excludes: ['/admin/*'],
};
