// Logout
router.get('/logout', function(req, res, next) {
    // remove the req.user property and clear the login session
    req.logout();
    // destroy session data
    req.session = null;
    // redirect to homepage
    res.redirect('/index');
  });