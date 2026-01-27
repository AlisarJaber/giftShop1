import Navigation from "./navigation";

const Layout = ({ children }) => {
  return (
    <>
      <Navigation />
      <main>
        {children}
      </main>
    </>
  );
};

export default Layout;
