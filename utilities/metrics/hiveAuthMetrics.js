const createFailureBucket = () => Object.create(null);

const metrics = {
  challenge: {
    total: 0,
    success: 0,
    failures: createFailureBucket(),
  },
  login: {
    total: 0,
    success: 0,
    failures: createFailureBucket(),
  },
};

const incrementFailure = (scope, errorCode) => {
  if (!errorCode) return;
  const current = metrics[scope].failures[errorCode] || 0;
  metrics[scope].failures[errorCode] = current + 1;
};

const recordChallenge = ({ success, errorCode }) => {
  metrics.challenge.total += 1;
  if (success) {
    metrics.challenge.success += 1;
    return;
  }
  incrementFailure('challenge', errorCode);
};

const recordLogin = ({ success, errorCode }) => {
  metrics.login.total += 1;
  if (success) {
    metrics.login.success += 1;
    return;
  }
  incrementFailure('login', errorCode);
};

const getMetricsSnapshot = () => JSON.parse(JSON.stringify(metrics));

module.exports = {
  recordChallenge,
  recordLogin,
  getMetricsSnapshot,
};
