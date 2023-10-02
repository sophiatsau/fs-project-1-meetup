// backend/routes/api/session.js
const express = require('express');
const {Op} = require('sequelize');
const Sequelize = require('sequelize')
const bcrypt = require('bcryptjs');

const { setTokenCookie, restoreUser, requireAuth } = require('../../utils/auth');
const { Group, Membership, GroupImage, sequelize } = require('../../db/models');

//used to validate request bodies
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

/******************* MIDDLEWARE *************** */
const validateGroup = [
    // check('name')
    //   .exists({ checkFalsy: true })
    //   .notEmpty()
    //   .withMessage("Name must be 60 characters or less"),
    // check('about')
    //   .exists({ checkFalsy: true })
    //   .withMessage("About must be 50 characters or more"),
    // check('type')
    //   .exists({ checkFalsy: true })
    //   .withMessage("Type must be 'Online' or 'In person'"),
    // check('private')
    //   .exists({ checkFalsy: false })
    //   .withMessage("Private must be a boolean"),
    // check('city')
    //   .exists({ checkFalsy: true })
    //   .withMessage("City is required"),
    // check('state')
    //   .exists({ checkFalsy: true })
    //   .withMessage("State is required"),
    // handleValidationErrors
];

/***************** ROUTE HANDLERS *********** */

const router = express.Router();

//Returns all the groups.
//authenticate: false
router.get('/', async (req,res,next) => {
    // const query = {
    //     include: [
    //         {
    //             model: Membership,
    //             group: ['groupId'],
    //             // attributes: [[sequelize.fn('COUNT',sequelize.col('Memberships.groupId')), 'numMembers'],],
    //             //where: {groupId: this.id}
    //         },
    //         {
    //             model: GroupImage,
    //             where: {
    //                 preview: true,
    //             },
    //             attributes: ['url'],
    //         }
    //     ],
    // }

    // //include num members
    // //include preview images
    // let groups = await Group.findAll(query);

    // groups = groups.map( group => {
    //     group = group.toJSON();
    //     group.numMembers = group.Memberships.length;
    //     group.previewImage = group.GroupImages[0].url || "Preview not found";
    //     delete group.Memberships;
    //     delete group.GroupImages;
    //     return group
    // })

    res.json({Groups: await Group.findCountMembersGetPreview({numMembers: true, previewImage: true})});
})

//Get all Groups joined or organized by the Current User
//authentication: true
router.get('/current', requireAuth, async (req,res,next) => {
    //include num members
    //include preview images
    //where organizerId = current user's id
    // OR where Membership.userId = groups, groupId = users
    // make membership into join table!
    const userId = req.user.id;
    // const groups = await Group.findCountMembersGetPreview({numMembers: true, previewImage: true, currentUser: userId});

    res.json({Groups: await Group.findCountMembersGetPreview({numMembers: true, previewImage: true, currentUser: userId})});
})

//Get details of a Group from an id
//authenticate: false
router.get('/:groupId', async (req,res,next) => {
    //include numMembers
    //include GroupImages (array)
    //include Organizer id, firstName, lastName
    //include Venues (array)
    const groups = await Group.findByPk(req.params.groupId);

    if (!groups) {
        const err = new Error("Group couldn't be found")
        err.status = 404;
        return next(err)
    }

    res.json({Groups: groups});
})

//Creates and returns a new group.
//authentication: true
//validate body
router.post('/', requireAuth, validateGroup, async (req,res,next) => {
    //get group data from body
    const groupData = req.body;

    //get organizerId. Use req.user?
    groupData.organizerId = req.user.id
    const newGroup = await Group.create(groupData);
    res.status(201).json(newGroup);
})

// Create and return a new image for a group specified by id.
// Require Authentication: true
// Require proper authorization: Current User must be the organizer for the group

// Updates and returns an existing group.
// Require Authentication: true
// Require proper authorization: Group must belong to the current user

// Deletes an existing group.
// Require Authentication: true
// Require proper authorization: Group must belong to the current user

module.exports = router;