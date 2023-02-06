// To do
// GET /videos (for testing purposes)
// POST /videos
// GET /videos/:videoID
// PUT /videos/:videoID
// DELETE /videos/:videoID 

/*
 * API sub-router for videos collection endpoints.
 */

const router = require("express").Router();

const { requireAuthentication } = require("../lib/auth");
const { validateAgainstSchema } = require("../lib/validation");
const { VideoSchema,
    getVideosPage,
    getVideoById,
    insertNewVideo,
    deleteVideoById,
    replaceVideoById } = require("../models/video");
const { userIsAdmin } = require('../models/user');


/*
 * Route to fetch info about a specific video. Must be a cooking app subscribed user.
 */
router.get("/:id", requireAuthentication, async (req, res, next) => {
    try {
        const video = await getVideoById(parseInt(req.params.id));
        if (video) {
            res.status(200).send(video);
        } else {
            next();
        }
    } catch (error) {
        console.error(error);
        res.status(500).send({
            error: "Unable to fetch video.  Please try again later.",
        });
    }
});

/*
 * Route to fetch all videos. Must be a cooking app subscribed user.
 */
router.get("/", requireAuthentication, async (req, res, next) => {
    try {
        const videoPage = await getVideosPage(parseInt(req.query.page) || 1);
        res.status(200).send(videoPage);
    } catch (error) {
        console.error(error);
        res.status(500).send({
            error: "Error fetching videos list.  Please try again later."
        });
    }
});

/*
 * Route to create a new video. Must be an admin.
 */
router.post('/', requireAuthentication, async (req, res) => {
    var admin = await userIsAdmin(req.user);
    if (admin == 0) {
        res.status(403).send({
            error: "Unauthorized to access the specified resource"
        });
    }
    else {
        if (validateAgainstSchema(req.body, VideoSchema)) {

            try {
                const id = await insertNewVideo(req.body);
                res.status(201).send({
                    id: id,
                    links: {
                        video: `/videos/${id}`
                    }
                });
            } catch (error) {
                console.error(error);
                res.status(500).send({
                    error: "Error inserting video into DB.  Please try again later."
                });
            }
        }
        else {
            res.status(400).send({
                error: "Request body is not a valid video object."
            });
        }
    }

});

/*
 * Route to replace data for a video. Must be an admin.
 */
router.put('/:id', requireAuthentication, async (req, res, next) => {
    var admin = await userIsAdmin(req.user);
    if (admin == 0) {
        res.status(403).send({
            error: "Unauthorized to access the specified resource"
        });
    }
    else {
        if (validateAgainstSchema(req.body, VideoSchema)) {
            try {
                const id = parseInt(req.params.id)
                const updateSuccessful = await replaceVideoById(id, req.body);
                if (updateSuccessful) {
                    res.status(200).send({
                        links: {
                            video: `/videos/${id}`
                        }
                    });
                } else {
                    next();
                }
            } catch (err) {
                console.error(err);
                res.status(500).send({
                    error: "Unable to update specified video.  Please try again later."
                });
            }

        }
        else {
            res.status(400).send({
                error: "Request body is not a valid video object"
            });
        }
    }
});

/*
 * Route to delete a video. Must be an admin.
 */
router.delete('/:id', requireAuthentication, async (req, res, next) => {
    var admin = await userIsAdmin(req.user);
    if (admin == 0) {
        res.status(403).send({
            error: "Unauthorized to access the specified resource"
        });
    }
    else {
        try {
            const deleteSuccessful = await deleteVideoById(parseInt(req.params.id));
            if (deleteSuccessful) {
                res.status(204).end();
            } else {
                next();
            }
        } catch (err) {
            console.error(err);
            res.status(500).send({
                error: "Unable to delete video.  Please try again later."
            });
        }
    }

});


module.exports = router;