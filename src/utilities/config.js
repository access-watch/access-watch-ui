import config from '../app_config';

export const hasElasticSearch = () => config.modules.elasticsearch.active;
export const hasSessionTimerangeSupport = () => config.session.timerange;
const elasticsearchOverwrites = type =>
  ['session', 'metrics'].indexOf(type) !== -1;
export const getExpiration = type => {
  if (hasElasticSearch() && elasticsearchOverwrites(type)) {
    return config.elasticsearch.expiration * 24 * 3600;
  }
  return config[type].expiration;
};
