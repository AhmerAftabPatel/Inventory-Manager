import React, { useState, useEffect } from "react";
//import Base from "../core/Base";
//import { Link } from "react-router-dom";
import { createaProduct, getAllCategory } from "./helper/adminapicall";
import { isAuthenticated } from "../auth/helper/index";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';

toast.configure();

const AddProduct = props => {
  const {
    user
    // token
  } = isAuthenticated();

  const [values, setValues] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    grade: "",
    photo: "",
    isPiece: "false",
    categories: [],
    category: "",
    loading: false,
    error: "",
    createdProduct: "",
    getaRedirect: false,
    formData: ""
  });

  const {
    name,
    description,
    price,
    stock,
    categories,
    grade,
    photo,
    category,
    //loading,
    // error,
    createdProduct,
    //getaRedirect,
    formData
  } = values;

  const preload = () => {
    getAllCategory().then(data => {
      if (data.error) {
        setValues({ ...values, error: data.error });
      } else {
        setValues({
          ...values,
          categories: data.data,
          formData: new FormData()
        });
      }
    });
  };

  useEffect(() => {
    preload();
    // eslint-disable-next-line
  }, []);


  const onSubmit = event => {
    event.preventDefault();
    if (isValid()) {
      setValues({ ...values, error: "", loading: true });
      createaProduct(user._id, formData)
        .then(data => {
          console.log(formData);
          if (data.error) {
            setValues({ ...values, error: data.error });
          } else {
            props.onSuccessClose();
            toast.success("Product Created Successfully", {
              position: toast.POSITION.TOP_RIGHT
            });
            props.onReload();

            setValues({
              ...values,
              name: "",
              description: "",
              price: "",
              photo: "",
              stock: "",
              grade: "",
              loading: false,
              createdProduct: data.data.name
            });
          }
        })
        .catch(err => console.log(err));
    }
  };
  const onClose = () => {
    props.onSuccessClose()
  }
  const isValid = () => {
    if (
      !name.length > 0 &&
      !description.length > 0 &&
      !category > 0 &&
      photo === "" &&
      !grade.length > 0 &&
      !stock.length > 0 &&
      !price.length > 0
    ) {
      toast.error("All Fields Are Mandatory", {
        position: toast.POSITION.TOP_RIGHT
      });
      console.log("all fields are mandatory");
      return false;
    } else if (photo === "") {
      toast.error("Image Required", { position: toast.POSITION.TOP_RIGHT });
      return false;
    } else if (photo.size > 1000000) {
      toast.error("image size larger than 1mb", {
        position: toast.POSITION.TOP_RIGHT
      });
      return false;
    } else if (!photo.name.match(/\.(jpg|png|jpeg)$/)) {
      toast.error("Invalid Image Format", {
        position: toast.POSITION.TOP_RIGHT
      });
      return false;
    } else if (!name.length > 0) {
      toast.error("Name Required", { position: toast.POSITION.TOP_RIGHT });
      return false;
    } else if (!description.length > 0) {
      toast.error("description required", {
        position: toast.POSITION.TOP_RIGHT
      });
      return false;
    } else if (!price > 0) {
      toast.error("Price Required", { position: toast.POSITION.TOP_RIGHT });
      return false;
    } else if (!category > 0) {
      toast.error("Category Required", {
        position: toast.POSITION.TOP_RIGHT
      });
      return false;
    } else if (!stock > 0) {
      toast.error("stock required", { position: toast.POSITION.TOP_RIGHT });
      return false;
    } else if (!grade > 0) {
      toast.error("Grade required", { position: toast.POSITION.TOP_RIGHT });
      return false;
    }
    return true;
  };
  const handleChange = name => event => {
    const value = name === "photo" ? event.target.files[0] : event.target.value;
    formData.set(name, value);
    setValues({ ...values, [name]: value });
  };
  const successMessage = () => (
    <div
      className="alert alert-success mt-3"
      style={{ display: createdProduct ? "" : "none" }}
    >
      <h4>{createdProduct}Product created successfully</h4>
    </div>
  );

  const createProductForm = () => (
    <form>
      <br />
      <IconButton style={{ float: 'right' }}
        onClick={onClose}
      >
        <CloseIcon />
      </IconButton>
      <h2 style={{ textAlign: "center" }}>
        <b>Add Product</b>
      </h2>
      <br />
      <div className="form-group" style={{ overflow: "hidden" }}>
        <label>Product Image</label>
        <label className="btn btn-block btn-success">
          <input
            onChange={handleChange("photo")}
            type="file"
            name="photo"
            required="required"
            accept="image"
            placeholder="choose a file"
          />
        </label>
      </div>
      <div className="form-group">
        <label>Product Name</label>
        <input
          onChange={handleChange("name")}
          name="photo"
          className="form-control"
          placeholder="Name"
          value={name}
        />
      </div>
      <div className="form-group">
        <label>Description</label>
        <textarea
          onChange={handleChange("description")}
          name="photo"
          className="form-control"
          placeholder="Description"
          value={description}
        />
      </div>
      <div className="form-group">
        <label>Price</label>
        <input
          onChange={handleChange("price")}
          type="number"
          className="form-control"
          placeholder="Price"
          value={price}
        />
      </div>
      <div className="form-group">
        <label>Category</label>
        <select
          onChange={handleChange("category")}
          className="form-control"
          placeholder="Category"
        >
          <option value="">Category</option>
          <option value="FRUIT">Fruit</option>
          <option value="VEG">VEg</option>
          {categories &&
            categories.map((cate, index) => (
              <option key={index} value={cate.name}>
                {cate.name}
              </option>
            ))}
        </select>
      </div>

      <div className="form-group">
        <label>Stock</label>
        <input
          onChange={handleChange("stock")}
          type="number"
          className="form-control"
          placeholder="Stock"
          value={stock}
        />
      </div>
      <div className="form-group">
        <label>Grade</label>
        <select
          onChange={handleChange("grade")}
          className="form-control"
          placeholder="Grade"
        >
          <option>Grade</option>
          <option value={"A"}>A</option>
          <option value={"B"}>B</option>
          <option value={"C"}>C</option>
        </select>
      </div>
      <div className="form-group">
        <input
          onChange={handleChange("isPiece")}
          type="checkbox"
          value="true"
          aria-label="Checkbox for following text input"
        />
        <label> &nbsp;&nbsp; &nbsp;is piece</label>
      </div>
      <button
        type="submit"
        onClick={onSubmit}
        className="btn btn-outline-success mb-3"
      >
        Create Product
      </button>
    </form>
  );

  return (
    // <Base
    //   title="Add a product here!"
    //   description="Welcome to product creation section"
    //   className="container bg-info p-4"
    // >
    <div>
      {/* <Link to="/admin/dashboard" className="btn btn-md btn-dark mb-3">
        Admin Home
      </Link> */}
      <div className="row bg-dark text-white rounded">
        <div className="col-md-8 offset-md-2">
          {successMessage()}

          {/* {errorMessage()} */}
          {createProductForm()}
        </div>
      </div>
    </div>
  );
};

export default AddProduct;
