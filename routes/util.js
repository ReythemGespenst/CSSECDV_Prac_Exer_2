function isUserLoggedIn(req) {
    const cookieHeader = req.headers.cookie || '';
    const cookies = Object.fromEntries(cookieHeader.split('; ').map(c => c.split('=')));

    return !!cookies.username;

}

module.exports = { isUserLoggedIn };
