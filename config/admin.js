const getPreviewPathname = (uid, { document }) => {
  const { slug } = document;
  switch (uid) {
    case 'api::case-study.case-study':
      return slug ? `/work/${slug}` : '/work';
    case 'api::blog-post.blog-post':
      return slug ? `/insights/${slug}` : '/insights';
    default:
      return null;
  }
};

module.exports = ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET'),
  },
  apiToken: {
    salt: env('API_TOKEN_SALT'),
  },
  transfer: {
    token: {
      salt: env('TRANSFER_TOKEN_SALT'),
    },
  },
  secrets: {
    encryptionKey: env('ENCRYPTION_KEY'),
  },
  flags: {
    nps: env.bool('FLAG_NPS', true),
    promoteEE: env.bool('FLAG_PROMOTE_EE', true),
    docLinks: env.bool('FLAG_DOC_LINKS', true),
  },
  preview: {
    enabled: true,
    config: {
      allowedOrigins: env('CLIENT_URL'),
      async handler(uid, { documentId, locale, status }) {
        const document = await strapi.documents(uid).findOne({ documentId });
        const pathname = getPreviewPathname(uid, { locale, document });
        if (!pathname) return null;
        const urlSearchParams = new URLSearchParams({
          url: pathname,
          secret: env('PREVIEW_SECRET'),
          status,
        });
        return `${env('CLIENT_URL')}/api/preview?${urlSearchParams}`;
      },
    },
  },
});
