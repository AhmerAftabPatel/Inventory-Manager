const Product = require("../models/product");
const Proc = require("../models/procurement");
const Pin = require("../models/pin_sp");
const formidable = require("formidable");
const _ = require("lodash");
const fs = require("fs");
const moment = require("moment");
const path = require("path");
function checkFileType(file, cb) {
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb("Error: Images Only!");
  }
}


exports.getProductById = (req, res, next, id) => {
  Product.findById(id)
    .populate("Category")
    .exec((error, product) => {
      if (error) {
        return res.status(400).json({
          error: " Product Not Found"
        });
      }
      req.product = product;
      next();
    });
};
exports.createProductPackage = (req, res) => {
  let package = req.body.package;
  // const { stock, value, price } = package;
  Product.findByIdAndUpdate(
    req.body.productId,
    { $push: { packages: package } },
    { new: true }
  ).exec((err, result) => {
    if (err) {
      return res.status(400).json({
        error: err
      });
    } else {
      console.log(result);
      res.json(result);
    }
  });
};

exports.stockInOut = (req, res, next) => {
  let product = req.product;
  let user = req.user;

  // uploadsBusinessGallery(req, res, error => {
  //   if (req.files.length > 0) {
  //     if (error) {
  //       // res.json({ error: error });
  //     } else {
  //       // If File not found
  //       if (req.files === undefined) {
  //         res.json("Error: No File Selected");
  //       } else {
  //         // If Success
  //         let fileArray = req.files,
  //           fileLocation;
  //         const galleryImgLocationArray = [];
  //         for (let i = 0; i < fileArray.length; i++) {
  //           fileLocation = fileArray[i].location;
  //           galleryImgLocationArray.push(fileLocation);
  //         }

  //         Product.findByIdAndUpdate(
  //           product._id,
  //           {
  //             $push: {
  //               stock_images: {
  //                 photos: galleryImgLocationArray,
  //                 date: req.body.date,
  //                 stockIn: req.body.stockIn,
  //                 wastage: req.body.wastage,
  //                 samples: req.body.sample,
  //                 sold: req.body.sold,
  //                 addedBy: user._id,
  //                 name: user.username
  //               }
  //             }
  //           },
  //           { new: true }
  //         ).exec((err, result) => {
  //           console.log(err);
  //           if (err) {
  //             // return res.status(400).json({
  //             //   error: err
  //             // });
  //             console.log(err);
  //           }
  //           // res.json(result);
  //         });
  //       }
  //     }
  //   }
  // });
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, (err, fields, file) => {
    if (err) {
      return res.status(400).json({
        error: "problem with image"
      });
    }

    // let isStockIn = req.body.isStockIn;
    // let stock = req.body.stock;
    const { isStockIn, stock, price, date } = fields;
    let proceed = false;
    let claimed = 0;
    req.product.stock_daily.map(stk => {
      if (stk.date === date) {
        proceed = true;
        claimed = stk.claimed_stock;
        // break;
      }
    });
    if (proceed) {
      if (stock > claimed) {
        return res.status(400).json({
          error: "actual stock cannot be more than claimed stock"
        });
      }
      let isStock = isStockIn;
      let stockValue = stock ? parseInt(stock) : "";
      let priceValue = price ? price : product.price;
      let value =
        isStock == "false"
          ? product.stock - stockValue
          : product.stock + stockValue;
      Product.findByIdAndUpdate(product._id, {
        $set: { stock: value, price: priceValue }
      }).exec((err, result) => {
        if (err) {
          return res.status(400).json({
            error: err
          });
        } else {
          req.productvalue = fields;
          next();
        }
      });
    } else {
      return res.status(400).json({
        error: "claimed stock not found, log claimed stock first"
      });
    }
  });
};
exports.pushStockDaily = (req, res, next) => {
  let product = req.product;
  let fields = req.fields;
  let proceed = false;
  if (fields.claimed_stock) {
    product.stock_daily.map(stk => {
      if (stk.date === fields.date) {
        proceed = true;
      }
    });
    let claimed =
      parseInt(fields.price_total) /
      (parseInt(fields.claimed_stock) + parseInt(fields.extra));
    let extraValues = fields.extra ? fields.extra : 0;
    let stockList = {
      date: fields.date,
      claimed_stock: parseInt(fields.claimed_stock) + parseInt(extraValues),
      claimed_price: claimed,
      selling_price: claimed + 5,
      extra_stock: extraValues,
      claimed_total_price: fields.price_total
    };
    let date = moment(new Date()).format("YYYY MM DD").replace(/ /g, "-");
    let id = JSON.stringify(req.product._id);
    Proc.findOneAndUpdate(
      { date: date, "list._id": req.product._id },
      {
        $set: {
          "list.$.extra_stock": extraValues,
          "list.$.price_generated": true
        }
      },
      (err, gg) => {
        console.log(err);
        if (err) {
          return res.status(400).json({
            error: "cannot update the stock"
          });
        }
      }
    );
    Product.findOneAndUpdate(
      { _id: req.product._id },
      {
        $push: { stock_daily: stockList },
        $set: { price: Math.ceil(claimed + 5) }
      },
      { new: true },
      (err, product) => {
        if (err) {
          return res.status(400).json({
            error: "cannot update the stock"
          });
        }

        // console.log(req.product._id)

        res.json(product);
      }
    );
  } else {
    res.json(product);
  }
};
exports.pushStockinProductList = (req, res, next) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, (err, fields, file) => {
    if (err) {
      return res.status(400).json({
        error: "problem with image"
      });
    }

    const {
      isStockIn,
      stock,
      price,
      date,
      sampled_stock,
      extra_stock,
      waste_stock
    } = fields;
    if (!date) {
      return res.status(400).json({
        error: "provide date of stock in"
      });
    }
    let proceed = false;
    let claimed = 0;
    let actual = 0;
    let sampled = 0;
    let waste = 0;
    let extra = 0;
    let sold = 0;
    req.product.stock_daily.map(stk => {
      if (stk.date === date) {
        // proceed only when claimed stock founf
        proceed = true;
        claimed = stk.claimed_stock;
        actual = stk.actual_stock;
        sampled = stk.sampled_stock;
        waste = stk.waste_stock;
        extra = stk.extra_stock;
        sold = stk.sold;
        // break;
      }
    });
    let total = parseInt(sold) + parseInt(sampled) + parseInt(waste);
    if (total === parseInt(actual) && JSON.parse(isStockIn) === false) {
      return res.status(400).json({
        error: "no stock left"
      });
    }

    // if (isStockIn) {
    //   if (!stock) {
    //     // return res.status(400).json({
    //     //   error: "provide stock value"
    //     // });
    //     stock = req.product.stock;
    //   }
    // }
    if (proceed) {
      // if (stock > claimed) {
      //   return res.status(400).json({
      //     error: "actual stock cannot be more than claimed stock"
      //   });
      // }
      console.log(isStockIn);
      let Stock = stock ? stock : 0;
      let Extra = extra_stock ? extra_stock : 0;
      // let valueStockExtra = actual > 0 ? Stock : 0
      if (JSON.parse(isStockIn) === true) {
        console.log("extra", parseInt(extra) + parseInt(Extra));
        console.log(
          "actual stock",
          parseInt(actual) + parseInt(Stock) + parseInt(Extra)
        );
        console.log(
          "stock",
          parseInt(req.product.stock) + parseInt(Stock) + parseInt(Extra)
        );
        let EXXtra = extra;
        const extraStock = extra_stock ? extra_stock : 0;
        console.log("dddddd", extra_stock);
        if (stock > claimed) {
          EXXtra = parseInt(stock) - parseInt(claimed);
        }
        // if(total === parseInt(actual)){
        //     EXXtra = parseInt(EXXtra) + parseInt(Stock)
        // }
        Product.findOneAndUpdate(
          { _id: req.product._id, "stock_daily.date": date },
          {
            $set: {
              "stock_daily.$.actual_stock": parseInt(actual) + parseInt(Stock),
              "stock_daily.$.extra_stock":
                parseInt(EXXtra) + parseInt(extraStock),
              stock:
                parseInt(req.product.stock) +
                parseInt(Stock) +
                parseInt(extraStock)
            }
          },
          function (err, result) {
            if (err) {
              console.log(err);
              return res.status(400).json({
                error: "not able to save stock"
              });
            }
            res.json(result);
          }
        );
      } else if (JSON.parse(isStockIn) === false) {
        let wasteStock = waste_stock
          ? parseInt(waste) + parseInt(waste_stock)
          : parseInt(waste);
        let sampledStock = sampled_stock
          ? parseInt(sampled) + parseInt(sampled_stock)
          : parseInt(sampled);
        let stockValue = req.product.stock;
        if (sampled_stock && !waste_stock) {
          stockValue = stockValue - sampled_stock;
        } else if (waste_stock && !sampled_stock) {
          stockValue = stockValue - waste_stock;
        } else if (sampled_stock && waste_stock) {
          stockValue = stockValue - sampled_stock - waste_stock;
        }
        console.log(wasteStock + sampledStock + sold);
        if (wasteStock + sampledStock + parseInt(sold) > actual) {
          return res.status(400).json({
            error: `not enough stock,${
              actual - (wasteStock + sampledStock + parseInt(sold))
            } `
          });
        }
        console.log("waste", wasteStock);
        console.log("sampled", sampledStock);
        console.log("stockValue", stockValue);
        Product.findOneAndUpdate(
          { _id: req.product._id, "stock_daily.date": date },
          {
            $set: {
              "stock_daily.$.waste_stock": wasteStock,
              "stock_daily.$.sampled_stock": sampledStock,
              stock: stockValue
            }
          },
          function (err, result) {
            if (err) {
              console.log(err);
              return res.status(400).json({
                error: "not able to save stock"
              });
            }
            res.json(result);
          }
        );
      }
    } else {
      return res.status(400).json({
        error: "claimed stock not found, log claimed stock first"
      });
    }
  });
};
exports.stockImages = (req, res, next) => {
  let product = req.product;
  // comment.postedBy = req.body.userId;
};
exports.createProduct = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, (err, fields, file) => {
    if (err) {
      return res.status(400).json({
        error: "problem with images"
      });
    }
    const { name, description, price, category, stock, grade } = fields;

    if (!name || !description || !price || !category || !stock || !grade) {
      return res.status(400).json({
        error: "Please include all fields"
      });
    }
    if (!file.photo) {
      return res.status(400).json({
        error: "photo is missing"
      });
    }

    //restrictions on field
    const product = new Product(fields);
    //handle files here
    if (file.photo) {
      if (file.photo.size > 3000000) {
        return res.status(400).json({
          error: "File size too big"
        });
      }
      product.photo.data = fs.readFileSync(file.photo.path);
      product.photo.contentType = file.photo.type;
    }

    product.save((error, product) => {
      if (error) {
        res.status(400).json({
          error: " saving product to DB is failed"
        });
      }
      res.json(product);
    });
  });
};

exports.getProduct = (req, res) => {
  req.product.photo = undefined;
  return res.json(req.product);
};

exports.photo = (req, res, next) => {
  if (req.product.photo.data) {
    res.set("Content-Type", req.product.photo.contentType);
    return res.send(req.product.photo.data);
  }
  next();
};
exports.deleteProduct = (req, res) => {
  let product = req.product;
  product.remove((err, deletedProduct) => {
    if (err) {
      return res.status(400).json({
        error: "failed to delete the product"
      });
    }
    res.json({
      message: "deleted successfully"
    });
  });
};

exports.updateProductPackage = (req, res) => {
  let package = req.body.package;
  const { price, stock, value } = package;
  if (!price || !stock || !value) {
    return res.status(400).json({
      error: "Please include all fields"
    });
  } else {
    Product.findByIdAndUpdate(req.body.productId, {
      $pull: { packages: { _id: package._id } }
    }).exec((err, result) => {
      if (err) {
        return res.status(400).json({
          error: err
        });
      } else {
        Product.findByIdAndUpdate(
          req.body.productId,
          { $push: { packages: package } },
          { new: true }
        ).exec((err, result) => {
          if (err) {
            return res.status(400).json({
              error: err
            });
          } else {
            res.json(result);
          }
        });
      }
    });
  }
};
// );
exports.deleteProductPackage = (req, res) => {
  let package = req.body.package;

  Product.findOneAndDelete(
    req.body.productId,
    { $pull: { packages: { _id: package._id } } }
    // { new: true }
  ).exec((err, result) => {
    console.log(err);
    if (err) {
      return res.status(400).json({
        error: err
      });
    } else {
      res.json("deleted succussfully");
    }
  });
};
exports.updateProduct = (req, res, next) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, (err, fields, file) => {
    if (err) {
      return res.status(400).json({
        error: "problem with image"
      });
    }

    //updation code
    let product = req.product;
    console.log(req.product);
    product = _.extend(product, fields);

    product.save((err, product) => {
      if (err) {
        console.log(err);
        return res.status(400).json({
          error: "Updation of product failed"
        });
      }
      // res.json(product);
      req.fields = fields;
      next();
    });
  });
};
//get all of our products
exports.getAllProducts = (req, res) => {
  let limit = req.query.limit ? parseInt(req.query.limit) : 8;
  sortBy = req.query.limit ? parseInt(req.query.limit) : "_id";

  Product.find()
    .select("-photo")
    .select("-stock_images")
    // .limit(limit)
    .populate("Category")
    // .sort([[sortBy, "asc"]])
    .exec((err, products) => {
      if (err) {
        return res.status(400).json({
          error: "Product NOT Found"
        });
      }else {
        res.json(products);
      }
    });
};

exports.updateStock = (req, res, next) => {
  let date = moment(new Date()).format("YYYY MM DD").replace(/ /g, "-");
  if (req.body.status === "Confirmed") {
    let myOperations = req.order.products.map(prod => {
      return {
        updateOne: {
          filter: { _id: prod._id, "stock_daily.date": date },
          update: {
            $inc: {
              stock: -prod.count,
              sold: +prod.count,
              "stock_daily.$.sold": +prod.count
            }
          }
        }
      };
    });
    Product.bulkWrite(myOperations, {}, (err, products) => {
      console.log(err);
      if (err) {
        return res.status(400).json({
          error: "bulk operation failed"
        });
      }
      Pin.findOne({ pincode: req.smsuser.address.pincode }).exec((err, pin) => {
        if (pin) {
          req.areaPrice = pin;
        next();
        }
        next()
      });
    });
  } else next();
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

exports.updateStockLogById = (req, res) => {
  const { stockIn, sold, stockId, wastage, samples } = req.body;
  if (!stockId) {
    return res.status(400).json({
      error: "provide stockId"
    });
  }
  if (!stockIn) {
    return res.status(400).json({
      error: "provide stockIn"
    });
  }
  if (!sold) {
    return res.status(400).json({
      error: "provide stock sold"
    });
  }

  if (!wastage) {
    return res.status(400).json({
      error: "provide wasted stock"
    });
  }
  if (!samples) {
    return res.status(400).json({
      error: "provide sampled stock"
    });
  }
  let product = req.product;
  Product.findOneAndUpdate(
    { _id: product._id, "stock_images._id": req.body.stockId },
    {
      $set: {
        "stock_images.$.wastage": req.body.wastage,
        "stock_images.$.stockIn": req.body.stockIn,
        "stock_images.$.sold": req.body.sold,
        "stock_images.$.samples": req.body.samples
      }
    },
    function (err, result) {
      if (err) {
        return res.status(400).json({
          error: "not able to save stock"
        });
      }
      res.json(result);
    }
  );
};
