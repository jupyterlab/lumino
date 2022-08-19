import { createRollupConfig } from '../../rollup.src.config';

const pkg = require('./package.json');
const config = createRollupConfig(pkg);

export default config;
