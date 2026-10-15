'use strict';

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/ai-writer/generate',
      handler: 'ai-writer.generate',
      config: { auth: false },
    },
  ],
};
