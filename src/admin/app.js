const FRONTEND_URL = 'https://techius-next.vercel.app';
const PREVIEW_SECRET = process.env.PREVIEW_SECRET || '4a114fae2bda3fe2856ff044082d79ecd393931f21dd5130d2894d1b6955e553';

export default {
  config: {},
  bootstrap(app) {
    app.getPlugin('content-manager').apis.addEditViewSidePanel([
      ({ model, document }) => {
        if (!document?.slug) return null;

        let type = null;
        if (model.uid === 'api::case-study.case-study') type = 'case-study';
        if (model.uid === 'api::blog-post.blog-post')   type = 'blog-post';
        if (!type) return null;

        const url = `${FRONTEND_URL}/api/draft?secret=${PREVIEW_SECRET}&type=${type}&slug=${document.slug}`;

        return {
          title: 'Preview',
          content: () =>
            React.createElement(
              'a',
              {
                href: url,
                target: '_blank',
                rel: 'noopener noreferrer',
                style: {
                  display: 'block',
                  padding: '8px 16px',
                  background: '#FF4D00',
                  color: '#fff',
                  borderRadius: '4px',
                  textAlign: 'center',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '14px',
                },
              },
              'Open Preview →'
            ),
        };
      },
    ]);
  },
};
