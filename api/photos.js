/*
 * API sub-router for recipes collection endpoints.
 */

const router = require("express").Router();
const multer = require('multer');
const crypto = require('crypto');

const { requireAuthentication } = require("../lib/auth");
const { validateAgainstSchema } = require("../lib/validation");
const {
  PhotoSchema,
  // insertNewPhoto,
  savePhotoInfo,
  getPhotoInfoById,
  getPhotoById,
  // replacePhotoById,
  updatePhotoById,
  deletePhotoById,
} = require("../models/photo");
const acceptedFileTypes = {
  'image/jpeg': 'jpg',
  'image/png': 'png'
}

/*
 * Multer middleware function 
 */
const upload = multer({
  storage: multer.diskStorage({
    destination: `${_direname}/uploads' }`,
    filename: (req, file, callback) => {
      const filename = crypto.pseudoRandomBytes(16).toString('hex');
      const extension = acceptedFileTypes(file.mimetype);
      callback(null, `${filename}.${extension}`);
    }
  }),
    fileFilter: (req, file, callback) => {
      callback(null, !!acceptedFileTypes[file.mimetype])
    }
});

/*
 * Route to create a new photo.
 */
router.post("/", upload.single('image'), async (req, res) => {
  if (req.file && req.body && req.body.userid, req.body.recipeid){
    const image = {
      contentType: req.file.mimetype,
      filename: req.file.filename,
      path: req.file.path,
      userid: req.body.userid,
      recipeid: req.body.recipeid,
      photourl: `/media/images/${image.filename}`
    };
    try {
      const id = await savePhotoInfo(image);
      res.status(200).send({
        id: id
      });
    } catch (err) {
        next();
    }
  } else {
    res.status(400).send({
      error: "Request body is not a valid photo object",
    });
  }
});

/*
 * Error handling for multer file handling.
 */
router.use('*', (err, req, res, next) => {
  console.error(err);
  res.status(500).send({
    error: "An error occurred with uploading the photo file. Try again later."
  });
});

/*
 * Route to fetch info about a specific photo.
 */
// router.get("/:id", async (req, res, next) => {
//   try {
//     const photo = await getPhotoById(parseInt(req.params.id));
//     if (photo) {
//       res.status(200).send(photo);
//     } else {
//       next();
//     }
//   } catch (err) {
//     console.error(err);
//     res.status(500).send({
//       error: "Unable to fetch photo.  Please try again later.",
//     });
//   }
// });

router.get('/:id', async (req, res, next) => {
  try {
    const image = await getPhotoInfoById(req.params.id);
    if (image) {
      // delete image.path;
      // image.url = `/media/images/${image.filename}`;
      const responseBody = {
        _id: image._id,
        filename: image.filename,
        userid: image.userid,
        recipeid: image.recipeid,
        photourl: image.photourl
      };
      delete image.path;
      image.photourl = `/media/images/${image.filename}`;
      res.status(200).send(responseBody);
    } else {
      next();
    }
  } catch (err) {
    next(err);
  }
});


/*
 * Route to update a photo.
 */
router.put("/:id", requireAuthentication, async (req, res, next) => {
  if (validateAgainstSchema(req.body, PhotoSchema)) {
    try {
      /*
       * Make sure the updated photo has the same recipeID and userID as
       * the existing photo.  If it doesn't, respond with a 403 error.  If the
       * photo doesn't already exist, respond with a 404 error.
       */
      const id = parseInt(req.params.id);
      const existingPhoto = await getPhotoById(id);
      if (existingPhoto) {
        if (
          req.body.recipeid === existingPhoto.recipeid &&
          req.body.userid === existingPhoto.userid
        ) {
          const updateSuccessful = await
            updatePhotoById(parseInt(req.params.id), req.body);
          if (updateSuccessful) {
            res.status(200).send({
              links: {
                recipe: `/recipes/${req.body.recipeid}`,
                photo: `/photos/${id}`,
              },
            });
          } else {
            next();
          }
        } else {
          res.status(403).send({
            error: "Updated photo must have the same recipeID and userID",
          });
        }
      } else {
        next();
      }
    } catch (err) {
      console.error(err);
      res.status(500).send({
        error: "Unable to update photo.  Please try again later.",
      });
    }
  } else {
    res.status(400).send({
      error: "Request body is not a valid photo object.",
    });
  }
});

/*
 * Route to delete a photo.
 */
// router.delete("/:id", requireAuthentication, async (req, res, next) => {
//   const photo = await getPhotoById(req.params.id);
//   try {
//     const deleteSuccessful = await deletePhotoById(parseInt(req.params.id));
//     if (deleteSuccessful) {
//       res.status(204).end();
//     } else {
//       next();
//     }
//   } catch (err) {
//     console.error(err);
//     res.status(500).send({
//       error: "Unable to delete photo.  Please try again later.",
//     });
//   }
// });

router.delete("/:id", requireAuthentication, async (req, res, next) => {
  const photo = await getPhotoById(req.params.id);
  try {
    const deleteSuccessful = await
      deletePhotoById(parseInt(req.params.id));
    if (deleteSuccessful) {
       res.status(204).end();
    } else {
      next();
    }
  } catch (err) {
    res.status(500).send({
      error: "Unable to delete photo."
    });
  }
});

module.exports = router;
