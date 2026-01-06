import { Navbar as NextNavbar, NavbarBrand, NavbarContent, NavbarItem, Button } from "@nextui-org/react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

function Navbar() {
  const navigate = useNavigate();

  return (
    <NextNavbar
      isBordered
      maxWidth="xl"
      className="bg-black backdrop-blur-md"
    >
      <NavbarBrand>
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="font-bold text-xl text-white cursor-pointer"
          onClick={() => navigate("/dashboard")}
        >
          DynamoChart
        </motion.div>
      </NavbarBrand>

      <NavbarContent className="hidden sm:flex gap-6 text-white" justify="center">
        {[
          { label: "Dashboard", path: "/dashboard" },
          { label: "Chat", path: "/chat" },
          { label: "Users", path: "/users" },
        ].map((item) => (
          <NavbarItem key={item.path}>
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `transition-colors ${
                  isActive
                    ? "text-red font-semibold"
                    : "text-white hover:text-foreground"
                }`
              }
            >
              {item.label}
            </NavLink>
          </NavbarItem>
        ))}
      </NavbarContent>

      <NavbarContent justify="end">
        <NavbarItem>
          <motion.div whileTap={{ scale: 0.95 }}>
            <Button
              color="danger"
              variant="flat"
              onPress={() => navigate("/")}
            >
              Logout
            </Button>
          </motion.div>
        </NavbarItem>
      </NavbarContent>
    </NextNavbar>
  );
}

export default Navbar;
