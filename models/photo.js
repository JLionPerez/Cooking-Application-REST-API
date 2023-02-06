/*
 * Photo schema and data accessor methods.
 */
const { connectedtoDB } = require('./lib/mongo');
const mysqlPool = require("../lib/mysqlPool");
const { extractValidFields } = require("../lib/validation");
const { getDBReference } = require('../lib/mongo');

/*
 * Schema describing required/optional fields of a photo object.
 */
const PhotoSchema = {
  userid: { required: true },
  recipeid: { required: true },
  photourl: { required: true },
};
exports.PhotoSchema = PhotoSchema;

/*
 * Executes a MySQL query to insert a new photo into the database.  Returns
 * a Promise that resolves to the ID of the newly-created photo entry.
 */
// async function insertNewPhoto(photo) {
//   photo = extractValidFields(photo, PhotoSchema);
//   const [result] = await mysqlPool.query("INSERT INTO photos SET ?", photo);
//   return result.insertId;
// }
// exports.insertNewPhoto = insertNewPhoto;

exports.savePhotoInfo = async function (image) {
  const db = getDBReference();
  const collection = db.collection('photos');
  const result = await collection.insertOne(image);
  result.insertedId;
};
exports.getPhotoById = getPhotoById;

/*
 * Executes a MySQL query to fetch a single specified photo based on its ID.
 * Returns a Promise that resolves to an object containing the requested
 * photo.  If no photo with the specified ID exists, the returned Promise
 * will resolve to null.
 */
// async function getPhotoById(id) {
//   const [results] = await mysqlPool.query("SELECT * FROM photos WHERE id = ?", [
//     id,
//   ]);
//   return results[0];
// }
// exports.getPhotoById = getPhotoById;

exports.getPhotoInfoById = async function (id) {
  const db = getDBReference();
  const collection = db.collection('photos');
  if(!ObjectId.isValid(id)) {
    return null;
  } else {
    const results = await collection.find({ _id: new ObjectId(id)})
      .toArray();
      return results[0];
  }
};

/*
 * Executes a MySQL query to replace a specified photo with new data.
 * Returns a Promise that resolves to true if the photo specified by
 * `id` existed and was successfully updated or to false otherwise.
 */
// async function replacePhotoById(id, photo) {
//   photo = extractValidFields(photo, PhotoSchema);
//   const [result] = await mysqlPool.query("UPDATE photos SET ? WHERE id = ?", [
//     photo,
//     id,
//   ]);
//   return result.affectedRows > 0;
// }
// exports.replacePhotoById = replacePhotoById;

async function updatePhotoById(id, photo) {
  const photoValues = {
    userid: photo.userid,
    recipeid: photo.recipeid,
    photourl: photo.url
  };
  const collection = db.collection('photos');
  const result = await collection.replaceOne(
    { _id: new ObjectID(id) },
    photoValues
  );
  return result.matchedCount > 0;
}
exports.updatePhotoById = replacePhotoById;

/*
 * Executes a MySQL query to delete a photo specified by its ID.  Returns
 * a Promise that resolves to true if the photo specified by `id`
 * existed and was successfully deleted or to false otherwise.
 */
// async function deletePhotoById(id) {
//   const [result] = await mysqlPool.query("DELETE FROM photos WHERE id = ?", [
//     id,
//   ]);
//   return result.affectedRows > 0;
// }
// exports.deletePhotoById = deletePhotoById;

async function deletePhotoByID(id) {
  const collection = db.collection('photos');
  const result = await collection.deleteOne({
    _id: new ObjectID(id)
  });
  return result.deletedCount > 0;
}
exports.deletePhotoById = deletePhotoById;
