const { Order, ProductCart } = require("../models/oder");
const Discount = require("../models/discount");
const Procure = require("../models/procurement");
const Product = require("../models/product");
const Pin = require("../models/pin_sp");
const formidable = require("formidable");
const User = require("../models/user");
const fast2sms = require("fast-two-sms");
const moment = require("moment");
exports.getOrderById = (req, res, next, id) => {
  Order.findById(id)
    // .populate("user", "_id username shop_name phone_number")
    .exec((err, order) => {
      if (err) {
        console.log(err);
        return res.status(400).json({
          error: "no order found"
        });
      }
      req.order = order;
      next();
    });
};
exports.getProcureById = (req, res, next, id) => {
  Procure.findById(id)
    // .populate("user", "_id username shop_name phone_number")
    .exec((err, proc) => {
      if (err) {
        console.log(err);
        return res.status(400).json({
          error: "no procuremnt list found"
        });
      }
      req.procurement = proc;
      next();
    });
};
exports.CouponVerification = (req, res, next) => {
  // req.body.order.user = req.order.user;

  let coupon = req.order.coupon;
  if (coupon && req.body.status === "Confirmed") {
    Discount.findOne({ _id: req.order.coupon }).exec((err, disc) => {
      if (!disc) {
        return res.status(400).json({
          error: "coupon does not exist"
        });
      }
      if (disc.order_limit) {
        User.findById({ _id: req.order.user }).exec((err, user) => {
          if (!user) {
            return res.status(400).json({
              error: "User not found"
            });
          }
          if ((user.purchases.length + 1) % disc.order_limit === 0) {
            return res.status(400).json({
              error: `discount not applicable`
            });
          }
          req.coupon = disc;
          req.smsuser = user;
          next();
        });
      }
    });
  } else {
    User.findById({ _id: req.order.user }).exec((err, user) => {
      if (!user) {
        return res.status(400).json({
          error: "User not found"
        });
      }
      req.smsuser = user;
      next();
    });
  }
};
exports.discountverify = (req,res,next) => {
  if(req.body.order.coupon){
  Discount.findOne({ _id: req.body.order.coupon }).exec((err, disc) => {
    if (!disc) {
      return res.status(400).json({
        error: "coupon does not exist"
      });
    }
    if (disc.order_limit) {
      User.findById({ _id: req.body.order.user }).exec((err, user) => {
        if (!user) {
          return res.status(400).json({
            error: "User not found"
          });
        }
        if ((user.purchases.length + 1) % disc.order_limit === 0) {
          return res.status(400).json({
            error: `discount not applicable`
          });
        }
        next();
      });
    }
  });
} else {
  next();
}
}
exports.createOrder = (req, res) => {
  let coupon = req.body.order.coupon;
  let productList = [];
  req.body.order.products.forEach(product => {
    productList.push(product.name);
  });
  
  const fastSms = async () => {
    // if (req.body.sms) {
    var options = {
      authorization: process.env.SMS_API,
      message: `Your Order is Placed with ${productList.join(",")} of Rs.${
        req.body.order.amount
      }
regards
Way-D,Pohulabs`,
      numbers: [req.semuser.phone_number]
    };
    // }
    await fast2sms.sendMessage(options);
  };
  // else {
  const order = new Order(req.body.order);
  order.originalAmount = order.amount;
  order.save((err, order) => {
    if (err) {
      console.log(err);
      return res.status(400).json({
        error: "failed to save order in DB"
      });
    }
    if (req.body.sms) {
      fastSms();
    }
    res.json(order);
  });
  // }
};
exports.getAllOrders = (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = req.query.limit ? parseInt(req.query.limit) : 8;
  sortBy = req.query.limit ? parseInt(req.query.limit) : "_id";
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  Order.find()
    .populate("user", "_id username shop_name phone_number")
    .sort({ createdAt: -1 })
    .exec((err, order) => {
      if (err) {
        return res.status(400).json({
          error: "no orders found in DB"
        });
      }
      const results = {};
      if (endIndex < order.length) {
        results.next = {
          page: page + 1,
          limit: limit
        };
      }
      results.total = {
        total_records: order.length
      };
      if (startIndex > 0) {
        results.previous = {
          page: page - 1,
          limit: limit
        };
      }

      results.results = order.slice(startIndex, endIndex);
      if (!req.query.limit) {
        res.json(order);
      } else {
        res.json(results);
      }
    });
};
exports.getOrderStatus = (req, res) => {
  let order = req.order;
  let array = [
    "Ordered",
    "Confirmed",
    "Cancelled",
    "Shipped",
    "Processing",
    "Recieved",
    "Delivered"
  ];
  console.log(order.status);
  let index1 = array.indexOf(order.status);
  array.splice(0, index1);
  res.json(array);
};
exports.updatePrice = (req, res, next) => {
  let date = moment(new Date()).format("YYYY MM DD").replace(/ /g, "-");
  let ids = [];
  req.order.products.forEach(product => {
    ids.push(product._id);
  });
  Product.find({ _id: { $in: ids } }, function (err, array) {
    let prices = [];
    if (err) {
      console.log(err);
    }
    array.map(arr => {
      prices.push({ _id: arr._id, price: arr.price });
    });
    let amountVal = [];
    if (req.body.status === "Confirmed") {
      let myOperations = req.order.products.map((prod, index) => {
        let priceTobeAdded = prices.filter(
          prc => JSON.stringify(prc._id) === JSON.stringify(prod._id)
        );
        amountVal.push(
          parseInt(prod.count) *
            (priceTobeAdded[0].price)
        );
        let addperc = req.areaPrice ? req.areaPrice.percent_add : 0
        console.log("prod",
          parseInt(prod.count) ,
              priceTobeAdded[0].price + addperc,
        )
        return {
          updateOne: {
            filter: { _id: req.order._id, "products._id": prod._id },
            update: {
              $set: {
                "products.$.total": Math.ceil(
                  parseInt(prod.count) *
                    parseInt(
                      priceTobeAdded[0].price + addperc
                    )
                )
              }
            }
          }
        };
      });
      let sum = amountVal.reduce((a, b) => {
        return a + b;
      });

      Order.bulkWrite(myOperations, {}, (err, products) => {
        if (err) {
          return res.status(400).json({
            error: "bulk operation failed"
          });
        }
        // req.coupon
        //   ? Math.ceil(sum - parseInt(req.coupon.discount))
        //   :
        req.totalAmount = Math.ceil(sum);
        next();
      });
    } else next();
  });
};
exports.getAllUniqueCategories = () => {
  Product.distinct("category", {}, (err, category) => {
    if (err) {
      return res.status(400).json({
        error: "category not found"
      });
    }
    res.json(category);
  });
};
exports.updateStatus = (req, res) => {
  let productList = [];
  req.order.products.forEach(product => {
    productList.push(product.name);
  });
  const order = req.order;
  order.status = req.body.status;
  order.amount = req.totalAmount;
  order.originalAmount = req.totalAmount;
  let coupon = req.order.coupon;
  if (coupon && req.body.status === "Confirmed") {
    let disc = req.coupon;
    let discount = disc.discount;
    let discountValue = discount / 100;
    order.originalAmount = order.amount;
    let discountValueAmount = parseInt(req.totalAmount) - parseInt(req.coupon.discount);
    order.discountedAmount = discountValueAmount;
    // order.coupon = disc._id;
    order.amount = discountValueAmount;
  }

  const fastSms = () => {
    User.findById({ _id: req.order.user }).exec((err, user) => {
      if (!user) {
        return res.status(400).json({
          error: "User not found"
        });
      }

      var options = {
        authorization: process.env.SMS_API,
        message: `Your Order with ${productList.join(",")} of Rs.${
          req.order.originalAmount
        } is ${req.body.status}
regards,
Way-D,Pohulabs
${new Date()}`,

        numbers: [user.phone_number]
      };
      // }
      fast2sms.sendMessage(options);
    });
  };
  if (req.body.status === "Delivered") {
    if (req.body.amount > order.amount) {
      return res.status(400).json({
        error: "provide a valid amount "
      });
    }
    if (req.body.amount === order.amount) {
      order.payment_status = "PAID";
    }
    order.amount = order.amount - req.body.amount;
  }
  order.save((err, UpdateOrder) => {
    console.log(err);
    if (err) {
      return res.status(400).json({
        error: "failed to update the order status"
      });
    }
    if (req.body.sms) {
      fastSms();
    }
    res.json(UpdateOrder);
  });
};
exports.checkStatusValidation = (req, res, next) => {
  let status = req.body.status;
  let order = req.order;
  if (!status) {
    return res.status(404).json({
      error: "status is required"
    });
  }
  if (order.status === "Cancelled") {
    return res.status(404).json({
      error: "The Order has been cancelled"
    });
  }
  const statusList = Order.schema.path("status").enumValues;
  let index1 = statusList.indexOf(status);
  let index2 = statusList.indexOf(order.status);
  if (status !== "Cancelled") {
    if (index1 <= index2) {
      return res.status(404).json({
        error: "status cannot be reverted back once it it confirmed"
      });
    }
  }
  next();
};
exports.CashCollected = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, (err, fields) => {
    const order = req.order;
    if (err) {
      return res.status(400).json({
        error: "problem with images"
      });
    }
    const { remark, cash, ids } = fields;
    console.log(fields)
    if (!remark) {
      return res.status(400).json({
        error: "please provide remark"
      });
    }
    if (!cash) {
      return res.status(400).json({
        error: "please provide cash value"
      });
    }
    let cashIn = parseInt(cash);
    Order.find({ _id: { $in: JSON.parse(ids) } }, function (err, array) {
      if (err) {
        console.log(err);
        // handle error
      } else {
        recursionAlgo(0, cashIn);
        function recursionAlgo(index, cashRecus) {
          if (cashRecus === 0 || index === ids.length) {
            return res.json("cash collected successfully");
          } else {
            const ord = array[index];
            const addAmount = parseInt(ord.amount) - cashRecus;
            let amount = addAmount < 0 ? 0 : addAmount;
            ord.payment_status = amount === 0 ? "PAID" : "UNPAID";
            ord.remark = remark;
            const cashRecusgg =
            parseInt(ord.amount) > cashRecus ? 0 : cashRecus - parseInt(ord.amount);
            Order.findByIdAndUpdate(array[index]._id, {
              $set: { amount: amount, remark: remark }
            }).exec((err, result) => {
              if (err) {
                return res.status(400).json({
                  error: err
                });
              } else {
                return recursionAlgo(index + 1, parseInt(cashRecusgg));
              }
            });
            ord.save((err, UpdateOrder) => {
                if (err) {
                  return res.status(400).json({
                    error: "failed to update the order status"
                  });
                }
                });
          }
        }
      }
    });
    // }

    // order.save((err, UpdateOrder) => {
    //   if (err) {
    //     return res.status(400).json({
    //       error: "failed to update the order status"
    //     });
    //   }
    //   res.json(UpdateOrder);
    // });
  });
};
exports.getOrder = (req, res) => {
  Order.findOne({ _id: req.order._id })
    .populate("coupon", "_id code")
    .exec((err, order) => {
      res.json(order);
    });
};

exports.deleteOrder = (req, res) => {
  let order = req.order;
  order.remove((err, deletedOrder) => {
    if (err) {
      return res.status(400).json({
        error: "failed to delete the order"
      });
    }
    res.json({
      message: "deleted successfully"
    });
  });
};

exports.ProcurementList = (req, res) => {
  let orderList = req.body.order_list;
  let procurement = [];
  let procurements = [];
  let ConditionStatus = true;
  let date = moment(new Date()).format("YYYY MM DD").replace(/ /g, "-");
  // console.log(JSON.parse(orderList));
  Order.find({ _id: { $in: orderList } }, function (err, array) {
    if (err) {
      console.log(err);
    } else {
      console.log(array);
      array.map((arr, index) => {
        if (arr.status !== "Ordered") {
          ConditionStatus = false;
        }
        for (let i = 0; i < arr.products.length; i++) {
          let insideproduct = arr.products[i];

          procurement.push({
            _id: arr.products[i]._id.toString(),
            name: insideproduct.name,
            count: insideproduct.count
          });
        }
      });
    }
    const duplicate = id => {
      let values = procurements.filter(proc => proc._id === id);
      if (values.length > 0) {
        return true;
      }
      return false;
    };
    procurement.forEach((procure, index) => {
      if (duplicate(procure._id)) {
        let pos = procurements
          .map(function (e) {
            return e._id;
          })
          .indexOf(procure._id);
        procurements[pos].count += procure.count;
      } else {
        procurements.push({
          _id: procure._id,
          name: procure.name,
          count: procure.count
        });
      }
    });
    let date = moment(new Date()).format("YYYY MM D").replace(/ /g, "-");
    if (ConditionStatus) {
      Procure.findOne({ date: date }).exec((err, found) => {
        if (!found) {
          const procure = new Procure({
            list: procurements,
            date: date
          });
          procure.save((error, proc) => {
            if (error) {
              console.log(error);
              res.status(400).json({
                error: " saving product to DB is failed"
              });
            }
          });
        }
      });
      res.json(procurements);
    } else {
      return res.status(404).json({
        error: "List is genenated only for Ordered Orders"
      });
    }
  });
};

exports.GetProcurementList = (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = req.query.limit ? parseInt(req.query.limit) : 8;
  sortBy = req.query.limit ? parseInt(req.query.limit) : "_id";
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  Procure.find()
    .sort({ createdAt: -1 })
    .exec((err, proc) => {
      if (err) {
        return res.status(400).json({
          error: "no list found in DB"
        });
      }
      const results = {};
      if (endIndex < proc.length) {
        results.next = {
          page: page + 1,
          limit: limit
        };
      }
      results.total = {
        total_records: proc.length
      };
      if (startIndex > 0) {
        results.previous = {
          page: page - 1,
          limit: limit
        };
      }

      results.results = proc.slice(startIndex, endIndex);
      if (!req.query.limit) {
        res.json(proc);
      } else {
        res.json(results);
      }
    });
};
