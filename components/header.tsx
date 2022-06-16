import Link from "next/link";
import React from "react";

function Header() {
  return (
    <header className="flex justify-between p-5 max-w-7xl mx-auto">
      <div className="flex items-center space-x-9 sm:ml-['-25px']">
        <Link href="/">
          <img
            src="https://links.papareact.com/yvf"
            className="w-44 object-contain cursor-pointer"
            alt="medium-logo"
          />
        </Link>
        <div className="hidden md:inline-flex items-center space-x-5">
          <h3 className="cursor-pointer">About</h3>
          <h3 className="cursor-pointer">Contact</h3>
          <h3 className="text-white bg-green-600 px-4 py-1 rounded-full cursor-pointer">Follow</h3>
        </div>
      </div>
      <div className="flex items-center space-x-5 text-green-600 cursor-pointer">
        <h3>Log In</h3>
        <h3 className="border px-4 py-2 rounded-full border-full cursor-pointer">Sign In</h3>
      </div>
    </header>
  );
}

export default Header;
