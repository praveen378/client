import React, { use, useEffect, useState } from "react";
import { CiMail } from "react-icons/ci";
import { FaRegUser } from "react-icons/fa";
import { IoKeyOutline } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { registerUserThunk } from "../store/user/user.thunk";

import { Navigate, useNavigate } from "react-router-dom";

const SignUp = () => {
  const { isAuthenticated } = useSelector((state) => state.userReducer);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [SignUpData, setSignUpData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmpassword: "",
    gender: "male",
  });
  const handleInputChange = (e) => {
    console.log(e.target.value);
    setSignUpData({
      ...SignUpData,
      [e.target.name]: e.target.value,
      [e.target.name]: e.target.value,
    });
  };
  const handleSignUp = async (e) => {
    e.preventDefault();
    console.log("SignUpData", SignUpData);
    if (SignUpData.password !== SignUpData.confirmpassword) {
      return toast.error("Password and Confirm Password do not match");
    }
    const response = await dispatch(registerUserThunk(SignUpData));

    if (response.payload?.success) {
      {
        navigate("/");
      }
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
      toast.error("Logout First");
    }
  }, [isAuthenticated]);
  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="card w-96 bg-base-100 shadow-xl">
        <form onSubmit={handleSignUp} className="card-body flex gap-8">
          <div className="full-name">
            {" "}
            <label className="input validator">
              <span className="label">
                <FaRegUser />
              </span>
              <input
                name="fullName"
                type="input"
                required
                placeholder="Full Name"
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
          <div className="username">
            {" "}
            <label className="input validator">
              <span className="label">
                <FaRegUser />
              </span>
              <input
                name="username"
                type="input"
                required
                placeholder="Username"
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
          <div className="email">
            <label className="input validator">
              <span>
                <CiMail />
              </span>
              <input
                name="email"
                type="email"
                placeholder="mail@site.com"
                required
                onChange={handleInputChange}
              />
            </label>
            <div className="validator-hint hidden">
              Enter valid email address
            </div>
          </div>
          <div className="gender ">
            <label className="input validator">
              Select Gender
              <div className="flex gap-4 ">
                <label htmlFor="male" className="flex gap-2">
                  <input
                    id="male"
                    name="gender"
                    value="male"
                    type="radio"
                    className="radio radio-primary "
                    defaultChecked
                    onChange={handleInputChange}
                  />
                  Male
                </label>

                <label htmlFor="female " className="flex gap-2">
                  <input
                    id="female"
                    name="gender"
                    value="female"
                    type="radio"
                    className="radio radio-primary"
                    onChange={handleInputChange}
                  />
                  Female
                </label>
              </div>
            </label>
          </div>

          <div className="password">
            {" "}
            <label className="input validator ">
              <span>
                <IoKeyOutline />
              </span>
              <input
                name="password"
                type="password"
                required
                placeholder="Password"
                // minlength="8"
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
          <div className="confirm-password">
            {" "}
            <label className="input validator ">
              <span>
                <IoKeyOutline />
              </span>
              <input
                name="confirmpassword"
                type="password"
                required
                placeholder="Confirm Password"
                // minlength="8"
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
          <div className="button">
            {" "}
            <button className="btn btn-soft btn-primary">Login</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
