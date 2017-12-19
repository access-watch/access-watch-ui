export const getStatusType = ({status}) => status.split('_').pop();

const statusTypeIsWorst = (a, b) => {
  if (a === b) {
    return 0;
  }
  return a === 'exceeded' ? 1 : -1;
};

const statusIsWorst = (...arr) =>
  statusTypeIsWorst(...arr.map(status => getStatusType({status})));

export const getWorstStatus = ({status}) => (status.length > 1 ?
  status.reduce((worst, current) => (statusIsWorst(worst, current) ? worst : current)) :
  status[0]
);

export const getStatusTypeByName = ({status, name}) => {
  const s = status.find(tmpS => tmpS.split('_')[0] === name + 's');
  return s && getStatusType({status: s});
};
