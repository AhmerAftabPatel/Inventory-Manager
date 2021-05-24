import React, { useEffect, useState } from "react";
import {
  //getAllProducts,
  updateStock
} from "./helper/adminapicall";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { isAuthenticated } from "../auth/helper";
import moment from "moment";
import Checkbox from '@material-ui/core/Checkbox';
toast.configure();
const {
  user
  //token
} = isAuthenticated();

const AddStock = props => {
  //const [isDisabled, setDisabled] = useState(true);
  const [checked, setChecked] = React.useState(false);
  const [values, setValues] = useState({
    isStockIn: "",
    stock: "",
    price: "",
    stockIn: "",
    wastage: "",
    sample: "",
    sold: "",
    date: moment(new Date()).format("D MM YYYY"),
    formData: new FormData()
  });
  const [data, setData] = useState({
    product: "",
    loading: false,
    error: "",
    updatedProduct: ""
  });
  const {
    //loading,
    error,
    updatedProduct,
    //getaRedirect,
    product
    // formData
  } = data;
  const [errors, setErrors] = useState({
    isStockInerr: 'Stock Type Required',
    stockerr: 'Stock Required',
    //priceerr: 'category is required',
    productErr: 'Product Required',
    // imageFormatErr: 'incorrect image format',
    // popularErr: 'Popular type required',
    // descriptionErr: 'description is required'
  })
  const {
    productErr,
    //priceerr
  } = errors;
  const { isStockIn, stock, price, formData, stockIn, wastage, sold, sample } = values;
  const handleChangeStockCLose = (event) => {
    setChecked(event.target.checked);
  };
  const onSubmit = event => {
    event.preventDefault();
    if (isValid()) {
      //setData({ ...data, error: "", loading: true });
      setData({ ...data, error: '', loading: true });
      setErrors({ ...errors, nameErr: data.error })
      updateStock(product, user._id, formData)
        .then(data => {
          console.log("ss", data)
          if (data.error) {
            toast.warning(data.data.error, {
              position: toast.POSITION.TOP_RIGHT
            });
            console.log(data)
            setData({ ...values, error: data.error });

          } else {
            props.onSuccessClose();
            toast.success("Stock added Successfully", {
              position: toast.POSITION.TOP_RIGHT
            });
            props.preloadonSucess();

            setValues({
              ...values,
              isStockIn: "",
              stock: ""
            });
            setData({
              ...data,
              loading: false,
              updatedProduct: data.data.name
            });
          }
        })
        .catch(err => toast.warning(err.response.data.error, {
          position: toast.POSITION.TOP_RIGHT
        }));
    }
  };
  useEffect(() => {
    if (product) {
      const filter = props.products.filter(gg => gg._id === product);
      setValues({ ...values, price: filter[0].price ? filter[0].price : 0 });
      if (filter[0].price && !checked) {
        formData.append("price", filter[0].price)
      }
    }
    // eslint-disable-next-line
  }, [product]);
  const handleImageChange = name => event => {
    const value = Object.values(event.target.files)
    value.map((val, index) => {
      return formData.append("stock_images", value[index], value[index].name);
    });
    formData.append("date", moment(new Date()).format("D MM YYYY"));
  };
  const hanldeProductIdChange = name => event => {
    const value = event.target.value;
    setData({
      ...data,
      [name]: value
    });
    formData.append(name, value);
  }
  const handleChange = name => event => {
    const value = event.target.value;
    setValues({
      ...values,
      [name]: value
    });
    formData.append(name, value);
  };
  const isValid = () => {
    if (!stock.length > 0 && !isStockIn > 0 && !product > 0) {
      toast.error('All Fields Are Mandatory', {
        position: toast.POSITION.TOP_RIGHT,
      });
      return false;
    }
    // else if (!isStockIn > 0) {
    //   toast.error(isStockInerr, {
    //     position: toast.POSITION.TOP_RIGHT,
    //   });
    //   return false;
    // }
    // else if (!stock.length > 0) {
    //   toast.error(stockerr, { position: toast.POSITION.TOP_RIGHT });
    //   return false;
    // }
    else if (!product > 0) {
      toast.error(productErr, { position: toast.POSITION.TOP_RIGHT });
      return false;
    }
    return true;
  };

  const stockClose = () => {
    return (
      <>
        <div className="form-group">
          <input
            // disabled={product ? false : true}
            type="number"
            value={stockIn}
            onChange={handleChange("stockIn")}
            className="form-control"
            placeholder="Amount Of Stock In for the day"
          />
        </div>
        <div className="form-group">
          <input
            // disabled={product ? false : true}
            type="number"
            value={wastage}
            onChange={handleChange("wastage")}
            className="form-control"
            placeholder="wasted stock"
          />
        </div>
        <div className="form-group">
          <input
            //disabled={product ? false : true}
            type="number"
            value={sample}
            onChange={handleChange("sample")}
            className="form-control"
            placeholder="sampled stock"
          />
        </div>
        <div className="form-group">
          <input
            //disabled={product ? false : true}
            type="number"
            value={sold}
            onChange={handleChange("sold")}
            className="form-control"
            placeholder="solded stock"
          />
        </div>
      </>
    )
  }

  const createStockForm = () => (
    <form>
      {error}
      <br />

      <h2 style={{ textAlign: "center" }}>
        <b>Stock in/out</b>
      </h2>
      <br />
      {checked ? stockClose() : ""}
      <div className="form-group">
        <select
          onChange={hanldeProductIdChange("product")}
          className="form-control"
          placeholder="product"
        >
          <option value="">Products</option>
          {props.products &&
            props.products.map((product, index) => (
              <option key={index} value={product._id}>
                {product.name}({product.grade})
              </option>
            ))}
        </select>
      </div>
      {!checked && <>
        <div className="form-group">
          <select
            className="form-control"
            placeholder="Stock In/Out"
            onChange={handleChange("isStockIn")}
          >
            <option value="">Select</option>
            <option value={"true"}>Stock In</option>
            <option value={"false"}>Stock Out</option>
          </select>
        </div>
        <div className="form-group">
          <input
            disabled={isStockIn.length > 0 ? false : true}
            type="number"
            value={stock}
            onChange={handleChange("stock")}
            className="form-control"
            placeholder="Amount Of Stock In/Out"
          />
        </div>
        <div className="form-group">
          <input
            disabled={product ? false : true}
            type="number"
            value={price}
            onChange={handleChange("price")}
            className="form-control"
            placeholder="Change price"
          />
        </div></>}
      {checked && <div className="form-group" style={{ overflow: "hidden" }}>
        <label>Stock Images</label>
        <label className="btn btn-block btn-success">
          <input
            multiple
            onChange={handleImageChange("stock_images")}
            type="file"
            name="stock_images"
            accept="image"
            placeholder="choose a file"
          />
        </label>
      </div>}
      {/* <div className = "row"> */}
      <button
        type="submit"
        onClick={onSubmit}
        className="btn btn-outline-success mb-3"
      >
        Add Stock
      </button>
      <Checkbox
        checked={checked}
        onChange={handleChangeStockCLose}
        inputProps={{ 'aria-label': 'primary checkbox' }}
      />
      <lable>Log the stock for the day?</lable>

      {/* </div> */}
    </form>
  );
  const successMessage = () => (
    <div
      className="alert alert-success mt-3"
      style={{ display: updatedProduct ? "" : "none" }}
    >
      <h4>{updatedProduct}Product created successfully</h4>
    </div>
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
      {successMessage()}
      <div className="row bg-dark text-white rounded">
        <div className="col-md-8 offset-md-2">
          {/* {errorMessage()} */}
          {createStockForm()}
        </div>
      </div>
    </div>
  );
};

export default AddStock;
