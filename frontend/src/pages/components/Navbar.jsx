import { Link, useNavigate } from 'react-router-dom';
import { Button, Nav, Navbar, Container } from 'react-bootstrap';
import { useState, useEffect } from "react";
import LogoutButton from "../components/LogoutButton.jsx";

function NavbarComp() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        setIsLoggedIn(!!token);
}, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        setIsLoggedIn(false);
        navigate("/login");
};

    return (
    <Navbar expand="lg" bg="dark" data-bs-theme="dark">
      <Container>
      <Navbar.Brand as={Link} to="/">Balea</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className='me-auto'>
                        <Nav.Link as={Link} to="/home">Home</Nav.Link>
                    </Nav>
                    <Nav className="ms-auto">
                        {!isLoggedIn ? (
                            <>
                                <Nav.Link as={Link} to="/login">Bejelentkezés</Nav.Link>
                                <Nav.Link as={Link} to="/register">Regisztráció</Nav.Link>
                            </>
                            ) : (
                            <>
                                <Nav.Link as={Link} to="/profile">Profil</Nav.Link>
                                <LogoutButton onLogout={handleLogout} />
                            </>
                        )}
                    </Nav>
            </Navbar.Collapse>
        </Container>
    </Navbar>
  );
}

export default NavbarComp;