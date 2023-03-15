import React, { useEffect, useState, Fragment, useContext } from "react";
import { Menu, Transition } from "@headlessui/react";
import { Link } from "react-router-dom";
import { ReactComponent as Logo } from "../../assets/logo.svg";
import avatar from "../../assets/avatar.png";
import { ModalContext } from "../../contexts/ModalContext";
import { AuthContext } from "../../contexts/AuthContext";

const NavBar = () => {
  const { pushModal } = useContext(ModalContext);
  const [user, setUser] = useState({});
  const { token, setToken } = useContext(AuthContext);

  const getUser = async () => {
    if (token) {
      const response = await fetch("/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.status !== 200) {
        // error
      } else {
        window.localStorage.setItem("token", data.token);
        setToken(data.token);
        setUser(data.user);
      }
    }
  };

  useEffect(() => {
    getUser();
  }, []);

  const logout = () => {
    window.localStorage.removeItem("token");
    setToken(null);
    pushModal({
      message: "Successfully logged out",
      type: "success",
    });
  };

  const classNames = (...classes) => classes.filter(Boolean).join(" ");

  return (
    <div className="shadow-md">
      <div className="mx-auto px-2">
        <div className="relative flex h-16 items-center justify-between">
          <div className="flex shrink-0 items-center">
            <Link to="/">
              <Logo className="mx-auto h-8 w-auto stroke-blue-600" />
            </Link>
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2">
            {/* Profile dropdown */}
            <Menu as="div" className="relative ml-3">
              <div>
                <Menu.Button
                  data-cy="profile_button"
                  className="flex items-center rounded-full border border-gray-300 p-1 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                >
                  <span className="sr-only">Open user menu</span>
                  <p data-cy="user" className="mx-2">
                    {user.name}
                  </p>
                  <img
                    className="h-8 w-8 rounded-full"
                    src={avatar}
                    alt="Avatar"
                  />
                </Menu.Button>
              </div>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items
                  data-cy="menu_items"
                  className="absolute right-0 z-10 mt-2 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                >
                  {/* <Menu.Item> */}
                  {/*  {({ active }) => ( */}
                  {/*    <a */}
                  {/*      href="#" */}
                  {/*      className={classNames( */}
                  {/*        active ? "bg-gray-100" : "", */}
                  {/*        "block px-4 py-2 text-sm text-gray-700" */}
                  {/*      )} */}
                  {/*    > */}
                  {/*      Your Profile */}
                  {/*    </a> */}
                  {/*  )} */}
                  {/* </Menu.Item> */}
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        type="button"
                        onClick={logout}
                        className={classNames(
                          active ? "bg-gray-100" : "",
                          "block w-full px-4 py-2 text-left text-sm text-gray-700"
                        )}
                      >
                        Sign out
                      </button>
                    )}
                  </Menu.Item>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavBar;
