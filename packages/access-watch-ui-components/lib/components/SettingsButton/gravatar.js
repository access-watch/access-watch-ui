export const getGravatarPicture = ({ hash, d = 'retro', size = '80' }) =>
  `//www.gravatar.com/avatar/${hash}?s=${size}&d=${d}`;

export const fetchGravatarPicture = ({ hash, d, size = '80' }) =>
  fetch(getGravatarPicture({ hash, d: '404', size })).then(
    r =>
      r.ok
        ? r.blob().then(blob => URL.createObjectURL(blob))
        : Promise.resolve(d)
  );
