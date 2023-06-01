/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

const Book = require('../models.js').Book
const mongoose = require('mongoose')

module.exports = function (app) {

  app.route('/api/books')
    .get(async function (req, res){
      //response will be array of book objects
      await Book.aggregate([
        { "$addFields": { "commentcount": {$size: '$comments'} } },
        {
          $project: {
            _id: 1,
            title: 1,
            commentcount: 1
          }
        }
      ]).then((doc) => {
        res.send(doc)
      }).catch((err) => {return console.error(err)})
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
    })
    
    .post(async function (req, res){
      if(!req.body.title){
        res.send('missing required field title')
        return
      }

      let title = req.body.title;

      let myBook = new Book({
        title: title,
        comments: []
      })

      await myBook.save().then((book) => {
        res.json({
          _id: book._id,
          title: book.title
        })
      }).catch((err) => {return console.error(err)})
      //response will contain new book object including atleast _id and title
    })
    
    .delete(async function(req, res){
      //if successful response will be 'complete delete successful'
      await Book.collection.drop().then(() => {
        res.send('complete delete successful')
      })
    });



  app.route('/api/books/:id')
    .get(async function (req, res){
      let bookid = req.params.id;

      await Book.findById({
        _id: new mongoose.Types.ObjectId(bookid)
      }).then((book) => {
        if(book === null){
          res.send('no book exists')
          return
        }

        res.json({
          _id: book._id,
          title: book.title,
          comments: book.comments
        })
      }).catch((err) => {return console.error(err)})
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
    })
    
    .post(async function(req, res){
      if(!req.body.comment){
        res.send('missing required field comment')
        return
      }

      let bookid = req.params.id;
      let comment = req.body.comment;

      Book.findByIdAndUpdate({
        _id: new mongoose.Types.ObjectId(bookid)
      }).then((book) => {
        if(book === null) {
          res.send('no book exists')
          return
        }


        book.comments.push(comment)

        book.save().then((savedBook) => {
          res.json({
            _id: savedBook._id,
            title: savedBook.title,
            comments: savedBook.comments
          })
        }).catch((err) => {return console.error(err)})
      })
      //json res format same as .get
    })
    
    .delete(async function(req, res){
      let bookid = req.params.id;

      Book.findByIdAndDelete({
        _id: new mongoose.Types.ObjectId(bookid)
      }).then((deletedBook) => {
        if(deletedBook === null){
          res.send('no book exists')
          return
        }
        res.send('delete successful')
      }).catch((err) => {return console.error(err)})

      //if successful response will be 'delete successful'
    });
  
};
