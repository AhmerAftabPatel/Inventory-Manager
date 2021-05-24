import axios from "axios";

const { API } = require("../../backend");

export const createCategory = (userId, token, category) => {
  return fetch(`${API}/category/create`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(category)
  })
    .then(res => {
      return res.json();
    })
    .catch(err => console.log(err));
};

export const getAllCategory = () => axios.get(`${API}/categories`);
export const getProductforview = id => axios.get(`${API}/product/${id}`);
//product calls

export const createaProduct = (userId, product) =>
  axios.post(`${API}/product/create`, product);

export const createOrderClicked = (data, address, amount,date) =>
  axios.post(`${API}/order/create`, {
    order: { products: data, address: address.address,user: address.id, amount: amount, createdAt : date},
    
  });

//get all products call
export const getAllProducts = () => axios.get(`${API}/products`);

export const getAllUsers = page =>
  page === "get"
    ? axios.get(`${API}/users`)
    : axios.get(`${API}/users?page=${page}&limit=5`);

export const getAllUsersForCash = () => axios.get(`${API}/users`);
export const collectCash = async (data, orderId, userId) =>
  await axios.patch(`${API}/order/${orderId}/cash`,data);

export const getAllOrders = (userId, page) =>
  page === "all"
    ? axios.get(`${API}/order/all`)
    : axios.get(`${API}/order/all?page=${page}&limit=5`);

export const getOrderByid = (id, userId) =>
  axios.get(`${API}/order/${id}/single`);
export const getUserOrders = userId =>
  axios.get(`${API}/orders/user/${userId}`);

export const updateOrderStatus = (orderId, userId, data) =>
  axios.put(`${API}/order/${orderId}/status`, { status: data });
export const getUserByid = userId => axios.get(`${API}/user/${userId}`);

export const deleteProduct = (id, userId) =>
  axios.delete(`${API}/product/${id}`);

export const deleteOrder = (id, userId) =>
  axios.delete(`${API}/order/${id}/delete`);

//get a product

export const getProduct = productId => {
  return fetch(`${API}/product/${productId}`, {
    method: "GET"
  })
    .then(res => {
      return res.json();
    })
    .catch(err => console.log(err));
};
export const getCategory = categoryId => {
  return fetch(`${API}/category/${categoryId}`, {
    method: "GET"
  })
    .then(res => {
      return res.json();
    })
    .catch(err => console.log(err));
};
//update a product
export const updateProduct = (productId, userId, data) =>
  axios.put(`${API}/product/${productId}`, data);

export const updateStock = (productId, userId, data) =>
  axios.put(`${API}/product/${productId}/stock`, data);

export const updateCategory = (categoryId, userId, token, category) => {
  return fetch(`${API}/category/${categoryId}`, {
    method: "PUT",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`
    },
    body: category
  })
    .then(response => {
      return response.json();
    })
    .catch(err => console.log(err));
};
export const preloadStatus = userId =>
  axios.get(`${API}/order/status/${userId}`);
export const deleteCategory = (categoryId, userId, token) => {
  return fetch(`${API}/category/${categoryId} `, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`
    }
  })
    .then(response => {
      return response.json();
    })
    .catch(error => console.log(error));
};
