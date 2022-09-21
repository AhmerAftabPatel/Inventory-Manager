require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const morgan = require("morgan");
const server = require("http").Server(app);
//my routes
const photo = require("./public/products/ProductPhoto");
const authRoutes = require("./routes/authentication");
const userRoutes = require("./routes/user");
const categoryRoutes = require("./routes/category");
const productRoutes = require("./routes/product");
const orderRoutes = require("./routes/order");
const pinRoutes = require("./routes/pin_sp");
const discountRoutes = require("./routes/discount");

const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUI = require("swagger-ui-express");
// const { isSignedIn } = require('./controllers/authentication');

// DBconnected
app.use(express.static("public"));
mongoose.set("useFindAndModify", false);
mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
  })
  .then(() => {
    console.log("DB Connected");
  });
// middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(morgan("dev"));
app.use(cors());
app.use("/api", photo);
app.get("/", (req,res) => {
  res.send("it works")
});

// My routes
app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", categoryRoutes);
app.use("/api", productRoutes);
app.use("/api", orderRoutes);
app.use("/api", discountRoutes);
app.use("/api", pinRoutes);
const swaggerOptions = {
  swaggerDefinition: {
    info: {
      version: "1.0.0",
      title: "WAY-D API",
      description: "WAY-D API Information",
      contact: {
        name: "PohuLabs"
      },
    },
    servers: [{url : "http://localhost:8000"}]
  },
  // ['.routes/*.js']
  apis: ["./routes/*.js"]
};
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocs));
// port
const port = process.env.PORT || 8000;

server.listen(port, () => {
  console.log(`app is running at ${port}`);
});
