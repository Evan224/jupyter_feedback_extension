const db = require('../models'); // Adjust the path to your models directory

async function ensureUserExists(user_id) {
    let user = await db.User.findByPk(user_id);
    if (!user) {
        user = await db.User.create({
            user_id: user_id,
            user_type: 'student' // default user type
        });
    }
    return user;
}

module.exports = ensureUserExists;
