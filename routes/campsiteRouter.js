const express = require('express');
const Campsite = require('../models/campsite');

const authenticate = require('../authenticate');
const cors = require('./cors');

const campsiteRouter = express.Router();

  // 1. THE ROUTE FOR THE CAMPSITES LIST //

campsiteRouter.route('/')
.options(cors.corsWithOption, (req, res) => {res.sendStatus(200)})
.get(cors.cors, (req, res, next) => {
  Campsite.find()
  .populate('comments.author')
  .then(campsites => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(campsites);
  })
  .catch(err => next(err));
})
.post(cors.corsWithOption, authenticate.verifyAdmin, (req, res, next) => {
  Campsite.create(req.body)
  .then(campsite => {
    console.log('Campsite Created:', campsite);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(campsite);
  })
  .catch(err => next(err));
})
.put(cors.corsWithOption, authenticate.verifyAdmin, (req, res) => {
  res.statusCode = 403;
  res.end('PUT operation not supported on /campsites');
})
.delete(cors.corsWithOption, authenticate.verifyAdmin, (req, res, next) => {
  Campsite.deleteMany()
  .then(response => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(response);
  })
  .catch(err => next(err));
});

  // 2. THE ROUTE FOR INDIVIDUAL CAMPSITE BY ID //

campsiteRouter.route('/:campsiteId')
.options(cors.corsWithOption, (req, res) => {res.sendStatus(200)})
.get(cors.cors, (req, res, next) => {
  Campsite.findById(req.params.campsiteId)
  .populate('comments.author')
  .then(campsite => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(campsite);
  })
  .catch(err => next(err));
})
.post(cors.corsWithOption, authenticate.verifyUser, (req, res) => {
  res.statusCode = 403;
  res.end(`POST operation not supported on /campsites/${req.params.campsiteId}`);
})
.put(cors.corsWithOption, authenticate.verifyAdmin, (req, res, next) => {
  Campsite.findByIdAndUpdate(req.params.campsiteId, {
    $set: req.body
  }, {
    new: true
  })
  .then(campsite => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(campsite);
  })
  .catch(err => next(err));
})
.delete(cors.corsWithOption, authenticate.verifyAdmin, (req, res, next) => {
  Campsite.findByIdAndDelete(req.params.campsiteId)
  .then(response => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(response);
  })
  .catch(err => next(err));
});

  // 3. THE ROUTE FOR ALL COMMENTS ON INDIVIDUAL CAMPSITE BY ID //

campsiteRouter.route('/:campsiteId/comments')
.options(cors.corsWithOption, (req, res) => {res.sendStatus(200)})
.get(cors.cors, (req, res, next) => {
  Campsite.findById(req.params.campsiteId)
  .populate('comments.author')
  .then(campsite => {
    if (campsite) {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(campsite.comments);
    } else {
      err = new Error(`Campsite ${req.params.campsiteId} not found`);
      res.status = 404;
      return next(err);
    }
  })
  .catch(err => next(err));
})
.post(cors.corsWithOption, authenticate.verifyUser, (req, res, next) => {
  Campsite.findById(req.params.campsiteId)
  .then(campsite => {
    if (campsite) {
      req.body.author = req.user._id;
      campsite.comments.push(req.body);
      campsite.save()
      .then(campsite => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(campsite);
      })
      .catch(err => next(err));
    } else {
      err = new Error(`Campsite ${req.params.campsiteId} not found`);
      res.status = 404;
      return next(err);
    }
  })
  .catch(err => next(err));
})
.put(cors.corsWithOption, authenticate.verifyUser, (req, res) => {
  res.statusCode = 403;
  res.end(`PUT operation not supported on /campsites/${req.params.campsiteId}/comments`);
})
.delete(cors.corsWithOption, authenticate.verifyAdmin, (req, res, next) => {
  Campsite.findById(req.params.campsiteId)
  .then(campsite => {
    if (campsite) {
      for (let i = (campsite.comments.length-1); i >= 0; i--) {
        campsite.comments.id(campsite.comments[i]._id).remove();
      }
      campsite.save()
      .then(campsite => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(campsite);
      })
      .catch(err => next(err));
    } else {
      err = new Error(`Campsite ${req.params.campsiteId} not found`);
      res.status = 404;
      return next(err);
    }
  })
  .catch(err => next(err));
});

  // 4. THE ROUTE FOR INDIVIDUAL COMMENTS ON INDIVIDUAL CAMPSITE BY ID //

campsiteRouter.route('/:campsiteId/comments/:commentId')
.options(cors.corsWithOption, (req, res) => {res.sendStatus(200)})
.get(cors.cors, (req, res, next) => {
  Campsite.findById(req.params.campsiteId)
  .populate('comments.author')
  .then(campsite => {
    if (campsite && campsite.comments.id(req.params.commentId)) {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(campsite.comments.id(req.params.commentId));
    } else if (!campsite) {
      err = new Error(`Campsite ${req.params.campsiteId} not found`);
      res.status = 404;
      return next(err);
    } else {
      err = new Error(`Comment ${req.params.commentId} not found`);
      res.status = 404;
      return next(err);
    }
  })
  .catch(err => next(err));
})

.post(cors.corsWithOption, authenticate.verifyUser, (req, res) => {
  req.statusCode = 403
  res.end(`POST operation not supported on /campsites/${req.params.campsiteId}/comments/${req.params.commentId}`);
})

.put(cors.corsWithOption, authenticate.verifyUser, (req, res, next) => {

  Campsite.findById(req.params.campsiteId)
  .then(campsite => {
    if (campsite && campsite.comments.id(req.params.commentId)) {
      const isAuthor = req.user._id.equals(campsite.comments.id(req.params.commentId).author._id)
      if(isAuthor) {
      if (req.body.rating) {
        campsite.comments.id(req.params.commentId).rating = req.body.rating;
      }
      if (req.body.text) {
        campsite.comments.id(req.params.commentId).text = req.body.text;
      }
      campsite.save()
      .then(campsite => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(campsite);
      })
      .catch(err => next(err));
    } 
    } else if (!campsite) {
      const err = new Error(`Campsite ${req.params.campsiteId} not found`);
      res.status = 404;
      return next(err);
    } else {
      const err = new Error(`Comment ${req.params.commentId} not found`);
      res.status = 404;
      return next(err);
    }
  })
  .catch(err => next(err));

})

.delete(cors.corsWithOption, authenticate.verifyUser, (req, res, next) => {
  Campsite.findById(req.params.campsiteId)
  .then(campsite => {
    if (campsite && campsite.comments.id(req.params.commentId)) {
      const isAuthor = req.user._id.equals(campsite.comments.id(req.params.commentId).author._id)
      if (isAuthor) {
        campsite.comments.id(req.params.commentId).remove();
        campsite.save()
        .then(campsite => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(campsite);
        })
        .catch(err => next(err));
      } else {
        err = new Error("You're an impostor!");
        err.status = 403;
        return next(err);
      }       
    } else if (!campsite) {
      err = new Error(`Campsite ${req.params.campsiteId} not found`);
      err.status = 404;
      return next(err);
    } else {
      err = new Error(`Comment ${req.params.commentId} not found`);
      err.status = 404;
      return next(err);
    }
  })
  .catch(err => next(err));
  });



module.exports = campsiteRouter;
