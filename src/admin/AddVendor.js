import React, { useEffect, useState } from "react";
import { signup } from "../auth/helper";
//import Base from "../core/Base";
import {
  // addItemToMinMax,
  removeItemFromMinMax
} from "../core/helper/coreapicalls";
import Menu from "../core/Menu";
// import { getAllProducts } from "./helper/adminapicall";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

toast.configure();

/**
 * @author
 * @function AddVendor
 **/

const AddVendor = props => {
  // const [products, setProducts] = useState([]);
  //const [mMproducts, setmMproducts] = [];
  const preloadedUser = props.user ? props.user : "";
  // const [minMax, setMinmax] = useState({
  //   name: "",
  //   minprice: "",
  //   maxprice: ""
  // });
  // const {
  //   // name,
  //   minprice,
  //   maxprice
  // } = minMax;
  const [values, setValues] = useState({
    username: "",
    location: "",
    email: "",
    phone_number: "",
    shop_name: "",
    photo: "",
    d_product: [{}],
    transport_cost: [],
    order_frequency: "",
    vendor_category: "",
    role: "",
    password: "",
    loading: false,
    error: "",
    createdVendor: "",
    getaRedirect: false,
    formData: new FormData()
  });
  const {
    username,
    phone_number,
    location,
    shop_name,
    email,
    password,
    //d_product,
    formData,
    photo,
    vendor_category,
    //role,
    //order_frequency,
    //transport_cost,
    createdVendor
  } = values;

  // const preloadProducts = () => {
  //   getAllProducts().then(data => {
  //     if (data.error) {
  //       setValues({ ...values, error: data.error });
  //     } else {
  //       setProducts(data.data);
  //       // preloadUserProfile();
  //     }
  //   });
  // };
  const onSubmit = event => {
    event.preventDefault();
    if (isValid()) {
      setValues({ ...values, error: "", loading: true });
      signup(values)
        .then(data => {
          if (data.error) {
            setValues({ ...values, error: data.error });
          } else {
            toast.success("Vendor Created Successfully", {
              position: toast.POSITION.TOP_RIGHT
            });
            setValues({
              ...values,
              username: "",
              email: "",
              location: "",
              photo: "",
              vendor_category: "",
              shop_name: "",
              phone_number: "",
              password: "",
              loading: false,
              createdVendor: data.data.username
            });
          }
        })
        .catch(err => console.log(err));
    }
  };
  // const onSubmitUpdate = event => {
  //   event.preventDefault();
  //   // if (isValid()) {
  //   setValues({ ...values, error: "", loading: true });
  //   signup(formData)
  //     .then(data => {
  //       if (data.error) {
  //         setValues({ ...values, error: data.error });
  //       } else {
  //         toast.success("Vendor Created Successfully", {
  //           position: toast.POSITION.TOP_RIGHT
  //         });
  //         setValues({
  //           ...values,
  //           username: "",
  //           email: "",
  //           location: "",
  //           photo: "",
  //           password: "",
  //           vendor_category: "",
  //           shop_name: "",
  //           phone_number: "",
  //           loading: false,
  //           createdVendor: data.data.username
  //         });
  //       }
  //     })
  //     .catch(err => console.log(err));
  //   // }
  // };

  const successMessage = () => (
    <div
      className="alert alert-success mt-3"
      style={{ display: createdVendor ? "" : "none" }}
    >
      <h4>{createdVendor} Vendor created successfully</h4>
    </div>
  );
  const isValid = () => {
    if (
      !username.length > 0 &&
      !email.length > 0 &&
      !vendor_category > 0 &&
      photo === "" &&
      !location.length > 0 &&
      !phone_number.length > 0 &&
      !shop_name.length > 0
    ) {
      toast.error("All Fields Are Mandatory", {
        position: toast.POSITION.TOP_RIGHT
      });
      return false;
    }
    // else if (photo === "") {
    //   toast.error("Image Required", { position: toast.POSITION.TOP_RIGHT });
    //   return false;
    // }
    // else if (photo.size > 1000000) {
    //   toast.error("image size larger than 1mb", {
    //     position: toast.POSITION.TOP_RIGHT
    //   });
    //   return false;
    // } else if (!photo.name.match(/\.(jpg|png|jpeg)$/)) {
    //   toast.error("Invalid Image Format", {
    //     position: toast.POSITION.TOP_RIGHT
    //   });
    //   return false;

    // }
    else if (!username.length > 0) {
      toast.error("Username Required", { position: toast.POSITION.TOP_RIGHT });
      return false;
    } else if (!email.length > 0) {
      toast.error("Email required", {
        position: toast.POSITION.TOP_RIGHT
      });
      return false;
    } else if (!vendor_category > 0) {
      toast.error("Category Required", { position: toast.POSITION.TOP_RIGHT });
      return false;
    } else if (!phone_number > 0) {
      toast.error("Number Required", {
        position: toast.POSITION.TOP_RIGHT
      });
      return false;
    } else if (!location > 0) {
      toast.error("Location required", { position: toast.POSITION.TOP_RIGHT });
      return false;
    } else if (!password > 0) {
      toast.error("Password required", { position: toast.POSITION.TOP_RIGHT });
      return false;
    }
    return true;
  };

  const handleChange = name => event => {
    const value = name === "photo" ? event.target.files[0] : event.target.value;
    formData.set(name, value);
    setValues({ ...values, [name]: value });
  };
  // const handleMinMaxChange = name => event => {
  //   const value = event.target.value;
  //   // formData.set(name, value);
  //   setMinmax({ ...minMax, [name]: value });
  // };

  // const onMinMaxSave = () => {
  //   addItemToMinMax(minMax, () => localMinmaxShow());
  //   setMinmax({
  //     name: "",
  //     minprice: "",
  //     maxprice: ""
  //   });
  // };


  const removeMinMaxClicked = name => {
    removeItemFromMinMax(name, () => localMinmaxShow());
  };

  const localMinmaxShow = () => {
    let minmax = [];
    if (typeof window !== undefined) {
      if (localStorage.getItem("minmax")) {
        minmax = JSON.parse(localStorage.getItem("minmax"));
      }
      return (
        <>
          <table class="table table-dark">
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">product</th>
                <th scope="col">Min price</th>
                <th scope="col">Max Price</th>
                <th scope="col">Delete</th>
                <th scope="col">Update</th>
              </tr>
            </thead>
            {minmax.map((mm, index) => {
              return (
                <>
                  <tbody>
                    <tr>
                      <th scope="row">{index}</th>
                      <td>{mm.name}</td>
                      <td>{mm.minprice}</td>
                      <td>{mm.maxprice}</td>
                      <td>
                        <button
                          className="btn btn-danger mr-2"
                          onClick={() => removeMinMaxClicked(mm.name)}
                        >
                          Remove
                        </button>
                      </td>
                      <td>
                        <button className="btn btn-success">Update</button>
                      </td>
                    </tr>
                  </tbody>
                </>
              );
            })}
          </table>
        </>
      );
    }
  };

  const form = () => {
    return (
      <>
        <div className="container wd-lg-50">
          <div className="row">
            <div className="col">
              {/* <form> */}
              <br />
              <h2 style={{ textAlign: "center",textDecoration : "underline" }}>
                <b>
                  {props.update
                    ? `Edit ${preloadedUser.username}'s Profile`
                    : "Add Vendor"}
                </b>
              </h2>
              <br />
              <div className="form-group" style={{ overflow: "hidden" }}>
                <label>Vendor Image</label>
                <label className="btn btn-block btn-success">
                  <input
                    onChange={handleChange("photo")}
                    type="file"
                    name="photo"
                    accept="image"
                    placeholder="choose a file"
                  />
                </label>
              </div>
              <div className="row">
                <div className="form-group col col-sm">
                  <label>Username</label>
                  <input
                    onChange={handleChange("username")}
                    name="photo"
                    className="form-control"
                    placeholder="Name"
                    value={username}
                  />
                </div>
                <div className="form-group col col-sm">
                  <label>password</label>
                  <input
                    onChange={handleChange("password")}
                    name="photo"
                    className="form-control"
                    placeholder="password"
                    value={password}
                  />
                </div>
                <div className="form-group col col-sm">
                  <label>Email</label>
                  <input
                    onChange={handleChange("email")}
                    name="email"
                    type="email"
                    className="form-control"
                    placeholder="Enter email"
                    value={email}
                  />
                </div>
                <div className="form-group col col-sm">
                  <label>Number</label>
                  <input
                    onChange={handleChange("phone_number")}
                    type="number"
                    name="phone_number"
                    className="form-control"
                    placeholder="Enter number"
                    value={phone_number}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Location</label>
                <textarea
                  onChange={handleChange("location")}
                  type="text"
                  className="form-control"
                  placeholder="location"
                  value={location}
                />
              </div>
              <div className="row">
                <div className="form-group col">
                  <label>Category</label>
                  <select
                    onChange={handleChange("vendor_category")}
                    className="form-control"
                    placeholder="Category"
                  >
                    <option value="">Category</option>
                    <option value="Juice">Juice</option>
                    <option value="Grocery">Grocery</option>
                    <option value="Street">Street</option>
                  </select>
                </div>
                <div className="form-group col">
                  <label>Select role</label>
                  <select
                    onChange={handleChange("role")}
                    className="form-control"
                    placeholder="Category"
                  >
                    <option value="">Role</option>
                    <option value="1">Admin</option>
                    <option value="0">User</option>

                    {/* {categories &&
                      categories.map((cate, index) => (
                        <option key={index} value={cate.name}>
                          {cate.name}
                        </option>
                      ))} */}
                  </select>
                </div>
                <div className="form-group col">
                  <label>Shop name</label>
                  <input
                    onChange={handleChange("shop_name")}
                    className="form-control"
                    placeholder="Shop name"
                    value={shop_name}
                  />
                </div>
              </div>

              {/* <div className="row"> */}
                {/* <div className="form-group col-3">
                  <label>Select product</label>
                  <select
                    onChange={handleMinMaxChange("name")}
                    className="form-control"
                    placeholder="Category"
                  >
                    <option value="">select</option>
                    {products &&
                      products.map((product, index) => (
                        <option key={index} value={product.name}>
                          {product.name}
                        </option>
                      ))}
                  </select>
                </div> */}
                {/* <div className="form-group col-3">
                  <label>Min price</label>
                  <input
                    onChange={handleMinMaxChange("minprice")}
                    type="number"
                    className="form-control"
                    placeholder="Min"
                    value={minprice}
                  />
                </div> */}
                {/* <div className="form-group col-3">
                  <label>Max price</label>
                  <input
                    onChange={handleMinMaxChange("maxprice")}
                    type="number"
                    className="form-control"
                    placeholder="Max"
                    value={maxprice}
                  />
                </div> */}
                {/* <div className="form-group col-3">
                  <button
                    //   type="submit"
                    onClick={() => onMinMaxSave()}
                    className="btn btn-outline-success mt-4"
                  >
                    Save
                  </button>
                </div> */}
              {/* </div> */}
              {/* <div className="container">{localMinmaxShow()}</div> */}

              <div className="text-center">
                <button
                  // type="submit"
                  onClick={onSubmit}
                  className="btn btn-outline-success mb-3"
                >
                  Submit
                </button>
              </div>
              {/* </form> */}
            </div>
          </div>
        </div>
      </>
    );
  };
  // const preloadUserProfile = () => {};
  useEffect(() => {
    // preloadProducts();
    // localMinmaxShow();
    if (props.update && props.update === true) {
      setValues({
        ...values,
        username: preloadedUser.username,
        email: preloadedUser.email,
        location: preloadedUser.location,
        password: preloadedUser.password,
        vendor_category: preloadedUser.vendor_category,
        shop_name: preloadedUser.shope_name,
        phone_number: preloadedUser.phone_number
      });
    }
    // eslint-disable-next-line 
  }, [preloadedUser]);
  return (
    <>
      {!props.update ? (
        <>
          <Menu />
          <div className="container-fluid">
            {successMessage()}
            {form()}
          </div>
        </>
      ) : (
        <>{form()}</>
      )}
    </>
  );
};

export default AddVendor;
