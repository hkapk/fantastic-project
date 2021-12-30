const router = require('express').Router();
const sequelize = require('../../config/connection');
const withAuth = require('../../utils/auth');

//include models here: 
const { Post, Comment, User, Location, Activity, Cuisine, PostLocation } = require('../../models');

// get all posts
router.get('/', (req, res) => {
  //console.log('======================');
  Post.findAll({
    attributes: [
      'id',
      'user_id',
      'title',
      'description',
      'start_date',
      'end_date'
    ],
    order: [['end_date', 'DESC']],
    include: [
      {
        model: User,
        attributes: ['first_name', 'last_name']
      },
      { 
        model: Comment,
        attributes: ['id','comment_text', 'post_id', 'user_id', 'created_at'],
        include: {
          model: User,
          attributes: ['first_name', 'last_name']
        }
      },
      'locations',
      'activities',
      'cuisine',
      'codes'
    ]
  })
    .then(dbPostData => res.json(dbPostData))
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});

router.get('/:id', (req, res) => {
  Post.findOne({
    where: {
      id: req.params.id
    },
    attributes: [
      'id',
      'user_id',
      'title',
      'description',
      'start_date',
      'end_date'
    ],
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
      if (!dbPostData) {
        res.status(404).json({ message: 'No post found with this id' });
        return;
      }
      res.json(dbPostData);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});

router.post('/', withAuth, (req, res) => {
  Post.create({
    user_id: req.session.user_id,
    title: req.body.title,
    description: req.body.description,
    content: req.body.content,
    start_date: req.body.start_date,
    end_date: req.body.end_date,
    locations: [ 
      {city: req.body.city, country: req.body.country }
    ],
    activities: [
      { name: req.body.activity }
    ],
    cuisine: [
      { name: req.body.cuisine }
    ]
  }, {
    include: [ 'locations', 'activities', 'cuisine' ]
  })
    .then(dbPostData => res.json(dbPostData))
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});


router.put('/:id', withAuth, (req, res) => {
  Post.update(
    {
      title: req.body.title,
      description: req.body.description,
      start_date: req.body.start_date,
      end_date: req.body.end_date
    },
    {
      where: {
        user_id: req.params.user_id
      }
    }
  )
    .then(dbPostData => {
      if (!dbPostData) {
        res.status(404).json({ message: 'No post found with this id' });
        return;
      }
      res.json(dbPostData);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});

router.delete('/:id', withAuth, (req, res) => {
  Post.destroy({
    where: {
      id: req.params.id
    }
  })
    .then(dbPostData => {
      if (!dbPostData) {
        res.status(404).json({ message: 'No post found with this id' });
        return;
      }
      res.json(dbPostData);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});

module.exports = router;
