// backend/routes/api/session.js
const express = require('express');
const {Op} = require('sequelize');
const bcrypt = require('bcryptjs');
const {OAuth2Client} = require('google-auth-library');
const oauthClient = process.env.CLIENT_ID
const oauthSecret = process.env.CLIENT_SECRET

const { setTokenCookie, restoreUser } = require('../../utils/auth');
const { User, Membership } = require('../../db/models');

//used to validate request bodies
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

/*********************** OAUTH TOOLS ********* */
// saves state, PKCE (Proof Key for Code Exchange)
let oAuthState = {
  codeVerifier: '',
  nonce: '',
  state: ''
}

// generate random string, used for state and nonce
function generateRandomString(length) {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let randString = ''

  for (let i = 0; i < length; i++) {
    // charset.length is 62
    const randIndex = Math.floor(Math.random() * 62)
    randString += charset[randIndex]
  }

  return randString
}

/******************* MIDDLEWARE *************** */
const validateLogin = [
    check('credential')
      .exists({ checkFalsy: true })
      .notEmpty()
      .withMessage('Please provide a valid email or username.'),
    check('password')
      .exists({ checkFalsy: true })
      .withMessage("Password is required"),
    handleValidationErrors
];

/***************** ROUTE HANDLERS *********** */

const router = express.Router();

//Login: POST /api/session
router.post('/', validateLogin, async(req,res,next) => {
    const {credential, password} = req.body;

    const user = await User.unscoped().findOne({
        where: {
            [Op.or]: {
                username: credential,
                email: credential,
            }
        },
        include: {
          model: Membership,
          attributes: ['groupId', 'status']
        }
    });

    if (!user || !bcrypt.compareSync(password, user.hashedPassword.toString())) {
        const err = new Error('Invalid credentials');
        err.status = 401;
        err.title = 'Login failed';
        err.errors = { credential: 'The provided credentials were invalid.' };
        return next(err);
    }

    const safeUser = {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        memberships: user.Memberships.map(member => {
          return {groupId: member.groupId, status: member.status}
        })
    }

    //set cookies based on safe user info
    await setTokenCookie(res, safeUser);

    return res.json({
        user: safeUser,
    })
});


//Logout: DELETE /api/session
router.delete('/', (_req,res,_next) => {
    res.clearCookie('token');
    res.json({message: "Successfully logged out"});
})


//OAUTH redirect url: initialize oauth flow
router.get('/oauth_login', async(req,res,next) => {
  return
})


//Get session user: GET /api/session
router.get('/', async (req, res) => {
    //req.user is assigned when restoreUser middleware is called
    const { user } = req;
    if (user) {
      const safeUser = {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        memberships: user.Memberships.map(member => {
          return {groupId: member.groupId, status: member.status}
        })
      };

      return res.json({
        user: safeUser
      });
    } else return res.json({ user: null });
}
);

module.exports = router;
