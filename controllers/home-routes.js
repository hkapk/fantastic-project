const router = require('express').Router();
const sequelize = require('../config/connection');
//include models below
const { User, PostLocation, PostCuisine, PostActivity, Post, Location, Cuisine, Comment, Activity } = require('../models');

// get all posts for homepage
router.get('/', (req, res) => {
  // console.log(req.session);
  Post.findAll({
    //attributes to include go below  
    attributes: [
      'id',
      'user_id',
      'title',
      'description',
      'content',
      'start_date',
      'end_date',
      'photo_url'
    ],
    order: [['end_date', 'DESC']],
    include: [
      {
        model: User,
        attributes: ['first_name', 'last_name']
      },
      'locations',
      'activities',
      'cuisine'
    ]
  })
    .then(dbPostData => {
      const posts = dbPostData.map(post => post.get({ plain: true }));
      res.render('homepage',
        {
          posts,
          loggedIn: req.session.loggedIn
        }
      );
    })
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});

//login route
router.get('/login', (req, res) => {
  if (req.session.loggedIn) {
    res.redirect('/');
    return;
  }
  res.render('login');
});

//signup route
router.get('/signup', (req, res) => {
  if (req.session.loggedIn) {
    res.redirect('/');
    return;
  }
  res.render('signup');
});

router.get('/post/:id', (req, res) => {
  Post.findOne({
    where: {
      id: req.params.id
    },
    attributes: [
      'id',
      'title',
      'description',
      'content',
      'start_date',
      'end_date',
      'photo_url'
    ],
    include: [
      {
        model: Comment,
        attributes: ['id', 'comment_text', 'post_id', 'user_id', 'created_at'],
        include: {
          model: User,
          attributes: ['first_name', 'last_name']
        }
      },
      {
        model: User,
        attributes: ['first_name', 'last_name']
      },
      'locations',
      'activities',
      'cuisine'
    ]
  })
    .then(dbPostData => {
      if (!dbPostData) {
        res.status(404).json({ message: 'No post found with this id' });
        return;
      }

      // serialize the data
      const post = dbPostData.get({ plain: true });

      // pass data to template
      res.render('single-blog',
        {
          post,
          loggedIn: req.session.loggedIn
        });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});

router.get('/popular', (req, res) => {
  res.render('popular');
});

router.get('/metrics', (req, res) => {
  res.render('metric');
});

router.get('/users', (req, res) => {
  User.findAll({
    attributes: { exclude: ['password'] },
    attributes:[
      'id',
      'first_name',
      'last_name',
      'email',
      'createdAt',
      'updatedAt'
    ],
    include: [
      {
        model: Post,
        attributes: ['title', 'id',]
      },
      {
        model: Comment ,
        attributes: ['comment_text', 'id',],
        include : {
          model: Post,
          attributes: ['title', 'id']

        }
      }
    ]
  })
  .then(dbUserData => {
      const users = dbUserData.map(user => user.get({ plain: true }));
      res.render('users', { users,
          loggedIn: req.session.loggedIn })
  })
  .catch(err => {
      console.log(err);
      res.status(500).json(err);
  });
});


router.get('/users/:id', (req, res) => {
  User.findOne({
    where: {
      id: req.params.id
    },
    attributes: { exclude: ['password'] },
    attributes:[
      'id',
      'first_name',
      'last_name',
      'email',
      'createdAt',
      'updatedAt'
    ],
    include: [
      {
        model: Post,
        attributes: ['title', 'id', 'created_at']
      },
      {
        model: Comment ,
        attributes: ['comment_text', 'id', 'created_at'],
        include : {
          model: Post,
          attributes: ['title', 'id']

        }
      }
    ]
  })
  .then(dbUserData => {
    if (!dbUserData) {
      res.status(404).json({ message: 'No user found with this id' });
      return;
    }

    // serialize the data
    const user = dbUserData.get({ plain: true });

    // pass data to template
    res.render('single-user',
      {
        user,
        loggedIn: req.session.loggedIn
      });
  })
  .catch(err => {
    console.log(err);
    res.status(500).json(err);
  });
});

module.exports = router;