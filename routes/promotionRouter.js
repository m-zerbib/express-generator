const express = require('express');
const bodyParser = require('body-parser');

const promotionsRouter = express.Router();

promotionsRouter.use(bodyParser.json());

promotionsRouter.route('/')
.all((req, res, next) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  next();
})
.get((req, res) => {
  res.end('Will send all the promotions to you');
})
.post((req, res) => {
  res.end(`Will add the promotion: ${req.body.name} with description: ${req.body.description}`);
})
.put((req, res) => {
  res.statusCode = 403;
  res.end('PUT operation not supported on /promotions');
})
.delete((req, res) => {
  res.end('Deleting all promotions');
});

promotionsRouter.route('/:promotionId')
.all((req, res, next) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  next();
})
.get((req, res) => {
  res.end('Will send the promotion ID to you');
})
.post((req, res) => {
  res.statusCode = 403;
  res.end(`POST operation not supported on promotion ID`);
})
.put((req, res) => {
  res.end(`Updating promotion ID to ${req.params.promotionId}.`);
})
.delete((req, res) => {
  res.end(`Deleting promotion ID`);
});

module.exports = promotionsRouter;