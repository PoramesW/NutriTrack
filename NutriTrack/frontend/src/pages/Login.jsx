
export default function Login() {
  return (
    <div className="page-container">
      <h1>Login</h1>
      <p>Welcome back to NutriTrack.</p>

      <form>
        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            required
          />
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            required
          />
        </div>

        <button type="submit">Login</button>
      </form>
    </div>
  );
}