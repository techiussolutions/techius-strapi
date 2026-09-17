'use strict';

const FRONTEND_URL = 'https://techius-next.vercel.app';

module.exports = {
  register({ strapi }) {
    // Register server-side preview URL handlers for the content-manager
    strapi.hook('content-manager.preview.register').call({
      uid: 'api::case-study.case-study',
      async getPreviewUrl(documentId) {
        const doc = await strapi
          .documents('api::case-study.case-study')
          .findOne({ documentId, fields: ['slug'] });
        if (!doc?.slug) return null;
        const secret = process.env.PREVIEW_SECRET;
        return `${FRONTEND_URL}/api/draft?secret=${secret}&type=case-study&slug=${doc.slug}`;
      },
    });

    strapi.hook('content-manager.preview.register').call({
      uid: 'api::blog-post.blog-post',
      async getPreviewUrl(documentId) {
        const doc = await strapi
          .documents('api::blog-post.blog-post')
          .findOne({ documentId, fields: ['slug'] });
        if (!doc?.slug) return null;
        const secret = process.env.PREVIEW_SECRET;
        return `${FRONTEND_URL}/api/draft?secret=${secret}&type=blog-post&slug=${doc.slug}`;
      },
    });
  },

  bootstrap(/*{ strapi }*/) {},
};
