import { Button } from 'react-bootstrap';

export default function LogoutButton({ onLogout }) {
    return (
        <Button variant="outline-danger" onClick={onLogout}>
            Kijelentkezés
        </Button>
    );
}