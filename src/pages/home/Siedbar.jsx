import React, { useEffect } from "react";
import { IoIosSearch } from "react-icons/io";
import User from "./User";
import { useDispatch, useSelector } from "react-redux";
import { getOtherUsersThunk, logoutUserThunk } from "../store/user/user.thunk";
import { useNavigate } from "react-router-dom";

const Siedbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { otherUsers, userProfile } = useSelector((state) => state.userReducer);

  const handleLogout = async () => {
    const response = await dispatch(logoutUserThunk());
    if (response.payload?.success) {
      {
        navigate("/login");
      }
    }
  };

  return (
    <div className="max-w-[30rem] w-[25rem] flex h-screen   flex-col border-r border-[#484848]">
      <div className="text-[#5957df] text-2xl pl-5 p-3"> gup sup</div>
      <div className="p-3">
        <label className="input">
          <input type="search" required placeholder="Search" />
          <IoIosSearch className="text-2xl" />
        </label>
      </div>
      <div className="h-full overflow-y-auto  ">
        {otherUsers?.map((userDetails) => {
          return (
            <User
              key={userDetails?._id}
              userDetails={userDetails}
              className="flex gap-2"
            />
          );
        })}
      </div>

      <div className="  flex justify-between items-center p-3">
        <div className="avatar">
          <div className="ring-primary ring-offset-base-100 w-14 rounded-full ring ring-offset-2">
            <img src={userProfile?.profile?.avatar} />
          </div>
          <h2>{userProfile?.profile?.username}</h2>
        </div>
        <button className="btn btn-soft btn-primary" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Siedbar;
