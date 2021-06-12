const User = require("../models/user");
const { Order } = require("../models/oder");
const Pin = require("../models/pin_sp");

const Product = require("../models/product");

exports.getUserById = (req, res, next, id) => {
  User.findById(id).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "user not found in database"
      });
    }
    req.profile = user;
    next();
  });
};
exports.createVendorCategory = (req, res) => {
  const category = new Category(req.body);
  category.save((error, cate) => {
    if (error) {
      return res.status(400).json({
        error: "not able to save category in DB"
      });
    }
    res.category = cate;
    res.json({ category });
  });
};
exports.getUser = (req, res) => {
  req.profile.salt = undefined;
  req.profile.encry_password = undefined;
  return res.json(req.profile);
};

exports.updateUser = (req, res) => {
  if (req.body.address && req.body.address.pincode) {
    Pin.findOne({ pincode: req.body.address.pincode }).exec((err, result) => {
      if (!result) {
        const newPin = new Pin({ pincode: req.body.address.pincode });
        newPin.save((err, response) => {
          if (err) {
            console.log(err);
          }
        });
      }
    });
  }
  User.findByIdAndUpdate(
    { _id: req.profile._id },
    { $set: req.body },
    { new: true, useFindAndModify: false },
    (err, user) => {
      console.log(err);
      if (err) {
        return res.status(400).json({
          error: "you are not authorised"
        });
      }
      user.salt = undefined;
      user.encry_password = undefined;
      res.json(user);
    }
  );
};

exports.userPurchaseList = (req, res) => {
  let status = req.query.status;
  Order.find({ user: req.profile._id })
    .populate("user", "_id name")
    .exec((err, order) => {
      if (err) {
        return res.status(400).json({
          error: "no orders in your account"
        });
      }
      if (status) {
        return res.json(order.filter(ord => ord.status === status));
      }
      return res.json(order);
    });
};
exports.checkorderStock = (req, res, next) => {
  if (req.body.status === req.order.status) {
    return res.status(400).json({
      error: `already ${req.body.status}`
    });
  }
  if (req.body.status === "Confirmed") {
    let list = [];
    let products = req.order.products;
    const totalStock = [];
    products.forEach(product => {
      totalStock.push({ _id: product._id, count: product.count });
    });
    products.forEach(product => {
      list.push(product._id);
    });
    Product.find({ _id: { $in: list } }, function (err, array) {
      const totalStockInside = [];
      array.forEach(product => {
        totalStockInside.push({ _id: product._id, count: product.stock });
      });
      let proceed = true;
      totalStockInside.map(total => {
        totalStock.map(stk => {
          if (JSON.stringify(total._id) === JSON.stringify(stk._id)) {
            if (stk.count > total.count) {
              proceed = false;
            }
          }
        });
      });
      if (proceed) {
        next();
      } else {
        return res.status(400).json({
          error: "Not enough stock"
        });
      }
    });
  } else next();
};
exports.pushOrderInPurchaseList = (req, res, next) => {
  if (req.body.status === "Confirmed") {
    let purchases = [];
    req.order.products.forEach(product => {
      purchases.push(req.order._id);
    });
    User.findOneAndUpdate(
      { _id: req.order.user },
      { $push: { purchases: purchases } },
      { new: true },
      (err, purchases) => {
        console.log(err);
        if (err) {
          return res.status(400).json({
            error: "cannot purchase your item"
          });
        }
        next();
      }
    );
  } else next();
};
