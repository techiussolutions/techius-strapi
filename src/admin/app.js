import { AiWriterPanel } from './extensions/AiWriterPanel';

export default {
  config: {},
  bootstrap(app) {
    app.addEditViewSidePanel([
      {
        name: 'ai-writer',
        title: 'AI Writer',
        Content: AiWriterPanel,
      },
    ]);
  },
};
