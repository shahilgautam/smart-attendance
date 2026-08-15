function authenticate(req, res, next) {

    if (!req.session || !req.session.user) {
        return res.status(401).json({
            success: false,
            message: "Please login first."
        });
    }

    req.user = req.session.user;

    next();
}

module.exports = authenticate;