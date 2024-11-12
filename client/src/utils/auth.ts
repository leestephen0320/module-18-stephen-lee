import { jwtDecode } from 'jwt-decode';

interface UserToken {
  name: string;
  exp: number;
  userId: string; // Add userId to token (ensure backend adds it during login)
}

class AuthService {
  // Get user data from token
  getProfile() {
    return jwtDecode<UserToken>(this.getToken() || '');
  }

  // Check if the user is logged in (i.e., token exists and is valid)
  loggedIn() {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }

  // Check if token is expired
  isTokenExpired(token: string) {
    try {
      const decoded = jwtDecode<UserToken>(token);
      return decoded.exp < Date.now() / 1000;
    } catch (err) {
      return false;
    }
  }

  // Retrieve the token from localStorage
  getToken() {
    return localStorage.getItem('id_token');
  }

  // Save the token to localStorage
  login(idToken: string) {
    localStorage.setItem('id_token', idToken);
    window.location.assign('/'); // Redirect to home after login
  }

  // Remove the token from localStorage (logout)
  logout() {
    localStorage.removeItem('id_token');
    window.location.assign('/'); // Redirect to home after logout
  }
}

export default new AuthService();
