const NodeCache = require('node-cache');

// Initialize the cache
const cache = new NodeCache();

// Export the cache instance
module.exports = cache;