import React, { useMemo } from "react";
import { IoIosSearch } from "react-icons/io";
import User from "./User";
import { useDispatch, useSelector } from "react-redux";
import { getOtherUsersThunk, logoutUserThunk } from "../store/user/user.thunk";
import { useNavigate } from "react-router-dom";

const Siedbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { otherUsers, userProfile } = useSelector((state) => state.userReducer);
  const { notificationIds } = useSelector((state) => state.socketReducer);
  const handleLogout = async () => {
    const response = await dispatch(logoutUserThunk());
    if (response.payload?.success) {
      navigate("/login");
    }
  };

  const sortedUsers = useMemo(() => {
    if (!otherUsers?.length) return [];
    if (!notificationIds?.length) return otherUsers;

    const notificationMap = new Map();
    notificationIds.forEach((n) =>
      notificationMap.set(n.senderId, n.unreadCount)
    );

    return [...otherUsers].sort((a, b) => {
      const aCount = notificationMap.get(a._id) || 0;
      const bCount = notificationMap.get(b._id) || 0;

      // Users with notifications come first, sorted by unreadCount desc
      return bCount - aCount;
    });
  }, [otherUsers, notificationIds]);

  console.log("sortedUsers", otherUsers);
  return (
    <div className="w-full h-full flex flex-col border-r border-[#484848] lg:max-w-[25rem]">
      <div className="text-[#5957df] text-2xl pl-5 p-3">gup sup</div>

      <div className="p-3">
        <label className="input">
          <input type="search" required placeholder="Search" />
          <IoIosSearch className="text-2xl" />
        </label>
      </div>

      <div className="h-full overflow-y-auto px-2">
        {sortedUsers.map((userDetails) => (
          <User key={userDetails?._id} userDetails={userDetails} />
        ))}
      </div>

      <div className="flex justify-between items-center p-3">
        <div className="flex items-center gap-2">
          <div className="avatar">
            <div className="ring-primary ring-offset-base-100 w-12 rounded-full ring ring-offset-2">
              <img src={userProfile?.profile?.avatar} alt="User" />
            </div>
          </div>
          <h2 className="text-sm font-medium">
            {userProfile?.profile?.username}
          </h2>
        </div>
        <button
          className="btn btn-soft btn-primary text-sm px-4 py-1"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Siedbar;
