import { poll, api } from './api';
import { sToMs, msToS } from '../utilities/time';
import { convertObjValues } from '../utilities/object';

const getTimeSerieBoundaries = timeSerie => ({
  start: timeSerie[0][0],
  end: timeSerie[timeSerie.length - 1][0],
});

const defaultByKey = 'all';
const getTagsKey = tags =>
  tags
    ? Object.keys(tags)
        .sort()
        .reduce((acc, k) => `${acc};${k}:${tags[k]}`, '')
        .slice(1)
    : 'noTags';

class MetricsCache {
  cache = {};

  put({ metric, by = defaultByKey, tags, value }) {
    const { cache } = this;
    const tagsKey = getTagsKey(tags);
    if (!cache[metric]) {
      cache[metric] = {};
    }
    if (!cache[metric][by]) {
      cache[metric][by] = {};
    }
    if (!cache[metric][by][tagsKey]) {
      cache[metric][by][tagsKey] = {};
    }
    cache[metric][by][tagsKey] = value;
  }

  get({ metric, by = defaultByKey, tags }) {
    const { cache } = this;
    const tagsKey = getTagsKey(tags);
    if (!cache[metric] || !cache[metric][by] || !cache[metric][by][tagsKey]) {
      return null;
    }
    return cache[metric][by][tagsKey];
  }

  clearCache() {
    this.cache = {};
  }
}

const valueIntersects = (v, min, max) => v >= min && v <= max;

export const mergeTimeSerieMetrics = origMetric => {
  let metrics = origMetric.reduce((acc, m) => [...acc, [...m]], []);
  const mergedTimeSerie = [];
  metrics = metrics.filter(m => m.length);
  const mergeMetric = (mergedMetric, i) => ({
    ...mergedMetric,
    ...metrics[i].shift()[1],
  });
  while (metrics.length) {
    const min = Math.min(...metrics.map(m => m[0][0]));
    const indexesToShift = metrics.reduce(
      (acc, m, i) => (m[0][0] === min ? [...acc, i] : acc),
      []
    );
    if (indexesToShift.length) {
      mergedTimeSerie.push([min, indexesToShift.reduce(mergeMetric, {})]);
    }
    metrics = metrics.filter(m => m.length);
  }
  return mergedTimeSerie;
};

const mergeTimeSerie = (t1, t2) => ({
  start: Math.min(t1.start, t2.start),
  end: Math.max(t1.end, t2.end),
  values: mergeTimeSerieMetrics([t1.values, t2.values]),
});

const getRoundedBoundary = ({ step }) => {
  const now = new Date().getTime();
  const rounding = typeof step === 'number' ? step * 1000 : 1000;
  return now - now % rounding;
};

class TimeSerieMetricsClass {
  cache = new MetricsCache();
  cacheTimeout = 60000;

  put({ metric, by, tags, timeFilter, value: values }) {
    const { cache } = this;
    const { step = 'all' } = timeFilter;
    const { start, end } = getTimeSerieBoundaries(values);
    const allStepsCachedValues = cache.get({ metric, by, tags }) || {};
    const cachedValues = allStepsCachedValues[step];
    const newValue = {
      start,
      end,
      values: [...values],
      receivedAt: new Date().getTime(),
    };
    let endValue;
    if (!cachedValues) {
      endValue = {
        ...allStepsCachedValues,
        [step]: [newValue],
      };
    } else {
      const timeIntersections = cachedValues.filter(
        v =>
          valueIntersects(start, v.start, v.end) ||
          valueIntersects(end, v.start, v.end)
      );
      const restCachedValues = cachedValues.filter(
        v => timeIntersections.indexOf(v) === -1
      );
      endValue = {
        ...allStepsCachedValues,
        [step]: [
          ...restCachedValues,
          timeIntersections.reduce(
            (acc, val) => mergeTimeSerie(val, acc),
            newValue
          ),
        ],
      };
    }
    cache.put({ metric, by, tags, value: endValue });
  }

  get({ metric, by, tags, timeFilter }) {
    if (!timeFilter.step) {
      return this.getPrecisionLess({ metric, by, tags, timeFilter });
    }
    const { cache, cacheTimeout } = this;
    const { start, step = 'all' } = timeFilter;
    const now = new Date().getTime();
    const { end = getRoundedBoundary({ step }) } = timeFilter;
    const allCachedValues = cache.get({ metric, by, tags }) || {};
    const cachedValues = allCachedValues[step] || [];
    const matching = cachedValues.find(v => v.start <= start && v.end >= end);
    if (matching && (now - matching.receivedAt < cacheTimeout || end < now)) {
      const matchingValues = matching.values.filter(
        ([v]) => v >= start && (!end || v <= end)
      );
      if (matchingValues.length) {
        return matchingValues;
      }
    }
    return null;
  }

  getPrecisionLess({ metric, by, tags, timeFilter }) {
    const { cache } = this;
    const { start, end } = timeFilter;
    const allStepsCached = cache.get({ metric, by, tags }) || {};
    const steps = Object.keys(allStepsCached)
      .sort()
      .filter(
        key =>
          allStepsCached[key].start <= start && allStepsCached[key].end >= end
      );
    if (steps.length) {
      for (let i = 0; i < steps.length; ++i) {
        const result = this.get({
          metric,
          by,
          timeFilter: { ...timeFilter, step: steps[i] },
        });
        if (Object.keys(result).length) {
          return result;
        }
      }
    }
    return null;
  }
}

const sumTimeSerieByKey = timeSerie =>
  timeSerie.reduce(
    (sumObj, [_, values]) => ({
      ...sumObj,
      ...Object.keys(values).reduce(
        (subSumObj, key) => ({
          [key]: (sumObj[key] || 0) + values[key],
          ...subSumObj,
        }),
        {}
      ),
    }),
    {}
  );

const getCountAndPercentage = (obj, total) =>
  Object.keys(obj).reduce(
    (acc, k) => ({
      [k]: {
        count: obj[k],
        percentage: obj[k] / total * 100,
      },
      ...acc,
    }),
    {}
  );

const createSummary = activity => {
  const count = sumTimeSerieByKey(activity);
  return getCountAndPercentage(
    count,
    Object.keys(count).reduce((sum, k) => sum + count[k], 0)
  );
};

const calcSpeedFromTimeSerie = time => timeSerie => {
  const timeSerieSum = sumTimeSerieByKey(timeSerie);
  if (Object.keys(timeSerieSum).length) {
    const totalCount = Object.keys(timeSerieSum).reduce(
      (sum, k) => sum + timeSerieSum[k],
      0
    );
    return Object.keys(timeSerieSum).reduce(
      (acc, k) => ({
        [k]: timeSerieSum[k] / time,
        ...acc,
      }),
      {
        total: totalCount / time,
      }
    );
  }
  const totalCount = Object.keys(timeSerie).reduce(
    (sum, k) => sum + timeSerie[k],
    0
  );
  return {
    total: totalCount / time,
  };
};

const metricsCache = new TimeSerieMetricsClass();

const getMetrics = ({ metric, timeFilter, by, tags }) => {
  let filters = {};
  if (timeFilter) {
    const { start, end } = convertObjValues(msToS)(timeFilter);
    const { step } = timeFilter;
    if (end) {
      if (!start || !step) {
        throw new Error('End was specified but start and/or step was missing');
      }
    }
    filters = { start, end, step };
  }
  if (by) {
    filters.by = by;
  }
  if (tags) {
    filters = {
      ...tags,
      ...filters,
    };
  }
  return api
    .get(`/metrics/${metric}`, filters)
    .then(result => result.map(([time, value]) => [sToMs(time), value]));
};

export const getMetricsObs = (
  { metric, timeFilter, by, tags },
  pollingInterval = 5000
) =>
  poll(_ => {
    const cached = metricsCache.get({ metric, timeFilter, by, tags });
    if (cached) {
      return Promise.resolve([...cached]);
    }

    return getMetrics({
      metric,
      timeFilter: {
        step: Math.floor(
          ((timeFilter.end || new Date().getTime()) - timeFilter.start) / 1000
        ),
        ...timeFilter,
      },
      by,
      tags,
    }).then(value => {
      if (value.length) {
        metricsCache.put({
          metric,
          timeFilter,
          by,
          tags,
          value,
        });
      }
      return [...value];
    });
  }, pollingInterval);

export const getMetricsSummaryObs = (p, interval) =>
  getMetricsObs(p, interval).map(createSummary);

export const getMetricsSpeed = ({
  timeFilter = {
    start: new Date().getTime() - 15 * 60 * 1000,
    end: new Date().getTime(),
    step: 10,
  },
  ...restProps
}) =>
  getMetricsObs({ ...restProps, timeFilter }).map(timeSerie => {
    const { start, end } = timeSerie.length
      ? getTimeSerieBoundaries(timeSerie)
      : { ...timeFilter };
    // If time is 0, step was apparently too big, so estimate it with end being now
    const time = msToS(end - start || new Date().getTime() - start);
    return calcSpeedFromTimeSerie(time)(timeSerie);
  });
