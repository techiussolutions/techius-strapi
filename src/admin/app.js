import { AiWriterPage } from './extensions/AiWriterPage';

export default {
  config: {},
  bootstrap(app) {
    app.addMenuLink({
      to: '/ai-writer',
      icon: () => null,
      intlLabel: { id: 'ai-writer.nav', defaultMessage: '✦ AI Writer' },
      Component: AiWriterPage,
      permissions: [],
    });
  },
};
