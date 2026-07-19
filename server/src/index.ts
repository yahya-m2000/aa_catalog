import { createApp } from './app';
import { env, warnOnMissingProductionEnv } from './config/env';

const app = createApp();

warnOnMissingProductionEnv();

app.listen(env.port, () => {
  console.log(`Server listening on port ${env.port}`);
});
