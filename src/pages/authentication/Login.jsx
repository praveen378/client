import { Link, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { FaRegUser } from "react-icons/fa";
import { IoKeyOutline } from "react-icons/io5";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { loginUserThunk } from "../../pages/store/user/user.thunk";

const Login = () => {
  const { isAuthenticated } = useSelector((state) => state.userReducer);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [LoginData, setLoginData] = useState({
    username: "",
    password: "",
  });

  const handleInputChange = (e) => {
    console.log(e.target.value);
    setLoginData({
      ...LoginData,
      [e.target.name]: e.target.value,
      [e.target.name]: e.target.value,
    });
  };
  const handleLogin = async (e) => {
    e.preventDefault();
    const response = await dispatch(loginUserThunk(LoginData));
    if (response.payload?.success) {
      {
        navigate("/");
      }
    }
  };
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="card w-96 bg-base-100 shadow-xl">
        <h1>Please Login !!</h1>
        <div className="card-body flex gap-8">
          <div>
            <label className="input validator">
              <span className="label">
                <FaRegUser />
              </span>
              <input
                name="username"
                type="input"
                required
                placeholder="Username"
                pattern="[A-Za-z][A-Za-z0-9\-]*"
                minLength="3"
                maxLength="30"
                title="Only letters, numbers or dash"
                onChange={handleInputChange}
              />
            </label>
            <p className="validator-hint hidden">
              Must be 3 to 30 characters
              <br />
              containing only letters, numbers or dash
            </p>
          </div>
          <div>
            <label className="input validator">
              <span>
                <IoKeyOutline />
              </span>
              <input
                name="password"
                type="password"
                required
                placeholder="Password"
                // minLength="8"
                // pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
                title="Must be more than 8 characters, including number, lowercase letter, uppercase letter"
                onChange={handleInputChange}
              />
            </label>
            <p className="validator-hint hidden">
              Must be more than 8 characters, including
              <br />
              At least one number
              <br />
              At least one lowercase letter
              <br />
              At least one uppercase letter
            </p>
          </div>
          <div>
            <button onClick={handleLogin} className="btn btn-soft btn-primary">
              Login
            </button>
          </div>
        </div>
        <p>
          {" "}
          Don't have account ?{" "}
          <span>
            <Link to="/signup">Sign Up</Link>
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
