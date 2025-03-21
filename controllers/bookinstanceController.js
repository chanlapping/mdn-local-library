const BookInstance = require('../models/bookinstance');
const Book = require('../models/book');
const { body, validationResult } = require('express-validator');

exports.bookinstance_list = async (req, res, next) => {
  const allBookInstances = await BookInstance.find({}).populate('book').exec();
  res.render('bookinstance_list', {
    title: 'Book Instance List',
    bookinstance_list: allBookInstances,
  });
};

exports.bookinstance_detail = async (req, res, next) => {
  const bookinstance = await BookInstance.findById(req.params.id)
    .populate('book')
    .exec();
  if (bookinstance === null) {
    const err = new Error('Book copy not found');
    err.status = 404;
    next(err);
  }

  res.render(`bookinstance_detail`, {
    title: 'Book:',
    bookinstance: bookinstance,
  });
};

exports.bookinstance_create_get = async (req, res, next) => {
  const allBooks = await Book.find({}, 'title').sort({ title: 1 }).exec();
  res.render('bookinstance_form', {
    title: 'Create BookInstance',
    book_list: allBooks,
  });
};

exports.bookinstance_create_post = [
  body('book', 'Book must be specified').trim().isLength({ min: 1 }).escape(),
  body('imprint', 'Imprint must be specified')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('status').escape(),
  body('due_back', 'Invalid date')
    .optional({ values: 'falsy' })
    .isISO8601()
    .toDate(),
  async (req, res, next) => {
    const errors = validationResult(req);
    const bookinstance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
      due_back: req.body.due_back,
    });
    if (!errors.isEmpty()) {
      const allBooks = await Book.find({}, 'title').sort({ title: 1 }).exec();
      res.render('bookinstance_form', {
        title: 'Create BookInstance',
        book_list: allBooks,
        selected_book: bookinstance.book._id,
        errors: errors.array(),
        bookinstance: bookinstance,
      });
      return;
    } else {
      await bookinstance.save();
      res.redirect(bookinstance.url);
    }
  },
];

exports.bookinstance_delete_get = async (req, res, next) => {
  const bookinstance = await BookInstance.findById(req.params.id).exec();
  if (bookinstance === null) {
    res.redirect('/catalog/bookinstances');
  }
  res.render('bookinstance_delete', {
    title: 'Delete BookInstance',
    bookinstance: bookinstance,
  });
};

exports.bookinstance_delete_post = async (req, res, next) => {
  await BookInstance.findByIdAndDelete(req.body.bookinstanceid);
  res.redirect('/catalog/bookinstances');
};

exports.bookinstance_update_get = async (req, res, next) => {
  const [bookinstance, allBooks] = await Promise.all([
    BookInstance.findById(req.params.id),
    Book.find({}, 'title').sort({ title: 1 }).exec(),
  ]);
  if (bookinstance === null) {
    const err = new Error('Bookinstance not found');
    err.status = 404;
    next(err);
  }
  res.render('bookinstance_form', {
    title: 'Update Bookinstance',
    book_list: allBooks,
    selected_book: bookinstance.book._id,
    bookinstance: bookinstance,
  });
};

exports.bookinstance_update_post = [
  body('book', 'Book must be specified').trim().isLength({ min: 1 }).escape(),
  body('imprint', 'Imprint must be specified')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('status').escape(),
  body('due_back', 'Invalid date')
    .optional({ values: 'falsy' })
    .isISO8601()
    .toDate(),
  async (req, res, next) => {
    const errors = validationResult(req);
    const bookinstance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
      due_back: req.body.due_back,
      _id: req.params.id,
    });
    if (!errors.isEmpty()) {
      const allBooks = await Book.find({}, 'title').sort({ title: 1 }).exec();
      res.render('bookinstance_form', {
        title: 'Update Bookinstance',
        book_list: allBooks,
        selected_book: bookinstance.book,
        bookinstance: bookinstance,
        errors: errors.array(),
      });
      return;
    } else {
      const updatedBookinstance = await BookInstance.findByIdAndUpdate(
        req.params.id,
        bookinstance,
        {}
      );
      res.redirect(updatedBookinstance.url);
    }
  },
];
