import React, { useState, useEffect } from "react";
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';
import { Container, Menu } from '@material-ui/core';
import Base from "../core/Base";
import { isAuthenticated } from "../auth/helper";
import { getAllOrders, getAllUsersForCash } from "../admin/helper/adminapicall";
import Modal from "@material-ui/core/Modal";
import Backdrop from "@material-ui/core/Backdrop";
import Fade from "@material-ui/core/Fade";
import UpdateAmount from "./UpdateAmount";
import { Link } from "react-router-dom";

const useStyles = makeStyles(theme => ({
    modal: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    },
    paper: {
        //width: "600px",
        //height: "700px",
        marginTop: "50px",
        width: window.innerWidth <= 800 ? '200px' : '600px',
        height: window.innerWidth <= 800 ? '400px' : '330px',
        overflowY: "scroll",
        backgroundColor: theme.palette.background.paper,
        border: "2px solid #000",
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 2, 3)
    },
    root: {
        maxWidth: 345,
    },
    media: {
        height: 140,
    },
}));


export default function MediaCard() {
    const classes = useStyles();
    const [users, setUsers] = useState([]);
    const [open, setOpen] = useState(false);
    const [id, setId] = useState([]);
    const [success, setSuccess] = useState("");
    const [orders, setOrders] = useState([]);

    // const handleOpen = () => {
    //     setOpen(true);
    // };
    const handleOpen = id => {
        setOpen(true);
        setId(id);
    };

    const { user } = isAuthenticated();
    const PreloadOrders = id => {
        getAllOrders(id, "all")
            .then(data => {
                setOrders(data.data);
            })
            .catch(err => console.log(err));
    };

    const handleCloseSuccess = () => {
        setOpen(false);
        setSuccess("Cash collected success");
    };
    const handleClose = () => {
        setOpen(false);
    };
    const preload = () => {
        getAllUsersForCash().then(data => {
            if (data.error) {
                console.log(data.error);
            } else {
                setUsers(data.data);
                console.log(data.data);
                //setLength(data.data.total);
            }
        });
    };

    useEffect(() => {
        PreloadOrders(user._id);
        preload();
    }, [user._id, success]);

    const ModalUpdateAmount = () => {
        return (
            <div>

                <Modal
                    aria-labelledby="transition-modal-title"
                    aria-describedby="transition-modal-description"
                    className={classes.modal}
                    open={open}
                    onClose={handleClose}
                    closeAfterTransition
                    BackdropComponent={Backdrop}
                    BackdropProps={{
                        timeout: 500
                    }}
                >
                    <Fade in={open}>
                        <div className={classes.paper}>
                            <UpdateAmount
                                id={id}
                                orders={orders.filter(order => order.user._id === id)}
                                onClose={handleClose}
                                onSuccessClose={handleCloseSuccess}
                            />
                            {console.log("ijcheck", id)}
                        </div>
                    </Fade>
                </Modal>
            </div>
        );
    };
    return (
        <>
            <Menu />
            <Base title="Cash Collection" description="manage customer cash collection"></Base>
            <div className="container-fluid">
                <h2 className="mb-4"> </h2>
                {ModalUpdateAmount()}

                <Container >
                    <div class="card-deck justify-content-center">
                        {users.map(user => {
                            return (
                                <>
                                    {
                                        user.role === 0 ? (
                                            <div class=" col-md-3 col-sm-12 ml-3 mb-4 ">

                                                <Card className={classes.root} style={{ height: "320px" }}>
                                                    <CardActionArea>
                                                        <Link to={`/admin/customer/${user._id}`}>
                                                            <CardMedia
                                                                className={classes.media}
                                                                image="data:image/jpeg;base64,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"

                                                            />
                                                        </Link>
                                                        <CardContent>
                                                            <Typography gutterBottom variant="h6" component="h2">
                                                                Name: &nbsp;
                                                 {user.username}
                                                            </Typography>
                                                            <Typography variant="h5" color="textSecondary" component="h2">
                                                                category: &nbsp;{user.vendor_category}
                                                            </Typography>
                                                        </CardContent>
                                                    </CardActionArea>
                                                    <CardActions>

                                                        <button className="btn btn-success" type="button" onClick={() => handleOpen(user._id)}>
                                                            Update Due Amount
                                          </button>


                                                    </CardActions>
                                                </Card>
                                            </div>) : ("")}</>
                            )
                        }
                        )}
                    </div>

                </Container>
            </div>


        </>
    );
}