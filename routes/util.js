function isUserLoggedIn(req) {
    
    return !!(req.session.user);

}

module.exports = { isUserLoggedIn };
