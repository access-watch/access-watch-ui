import config from '../app_config';

export const hasElasticSearch = () => config.modules.elasticsearch.active;
export const hasSessionTimerangeSupport = () => config.session.timerange;
