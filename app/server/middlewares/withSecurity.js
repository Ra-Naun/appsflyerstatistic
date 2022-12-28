const isAuth = req => {
  return req.cookies?.dkgs2frff4rgh43 === 'dk2gsf2rf4frgh';
};

export const withSecurity = (req, res, next) => {
  if (!isAuth(req)) {
    console.log('Unauthorized access attempt');
    res.statusCode = 403;
    return res.send('');
  }

  next();
};
