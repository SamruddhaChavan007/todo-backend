const crypto = require("crypto");

function generateRawToken() {
    return crypto.randomBytes(32).toString("hex")
}

function sha256Hex(raw) {
    return crypto.createHash("sha256").update(raw, "utf-8").digest("hex")
}

module.exports = {generateRawToken, sha256Hex}