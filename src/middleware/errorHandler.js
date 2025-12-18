function errorHandler (err, req, res, next) {
    const statusCode = err.statusCode || err.status || 500;

    if (process.env.NODE_ENV === "production") {
        return res.status(statusCode).json({
            error:
            statusCode === 500
            ? "Internal Server Error"
            : err.message || "Request Failed",
        });
    }

    return res.status(statusCode).json({
        error: err.message || "Internal Server Error",
        stack: err.stack,
    });
}

module.exports = errorHandler;