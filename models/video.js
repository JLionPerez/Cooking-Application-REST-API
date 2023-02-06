/*
 * Video schema and data accessor methods;
 */

const mysqlPool = require('../lib/mysqlPool');
const { extractValidFields } = require('../lib/validation');

const VideoSchema = {
    recipeID: { required: true },
    photoUrl: { required: true }
};
exports.VideoSchema = VideoSchema;

async function getVideoCount() {
    const [results] = await mysqlPool.query(
        'SELECT COUNT(*) AS count FROM videos'
    );
    return results[0].count;
}

async function getVideosPage(page) {
    const numberOfVideos = await getVideoCount();
    const pageSize = 5;
    const lastPage = Math.ceil(numberOfVideos / pageSize);
    page = page > lastPage ? lastPage : page;
    page = page < 1 ? 1 : page;
    const offset = (page - 1) * pageSize;

    const [results] = await mysqlPool.query(
        'SELECT * FROM videos ORDER BY id LIMIT ?,?',
        [offset, pageSize]
    );

    return {
        videos: results,
        page: page,
        totalPages: lastPage,
        pageSize: pageSize,
        count: numberOfVideos
    };

}
exports.getVideosPage = getVideosPage;

async function getVideoById(id) {
    const [results] = await mysqlPool.query(
        'SELECT * FROM videos WHERE id = ?',
        [id]
    );
    return results[0];
}
exports.getVideoById = getVideoById;

async function insertNewVideo(video) {
    video = extractValidFields(video, VideoSchema);
    const [result] = await mysqlPool.query(
        'INSERT INTO videos SET ?',
        video
    );

    return result.insertId;
}
exports.insertNewVideo = insertNewVideo;

async function replaceVideoById(id, video) {
    video = extractValidFields(video, VideoSchema);
    const [result] = await mysqlPool.query(
        'UPDATE videos SET ? WHERE id = ?',
        [video, id]
    );
    return result.affectedRows > 0;
}
exports.replaceVideoById = replaceVideoById;

async function deleteVideoById(id) {
    const [result] = await mysqlPool.query(
        'DELETE FROM videos WHERE id = ?',
        [id]
    );
    return result.affectedRows > 0;
}
exports.deleteVideoById = deleteVideoById;