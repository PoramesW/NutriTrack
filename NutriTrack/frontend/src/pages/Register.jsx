
export default function Register() {
  return (
    <div className="page-container">
      <h1>Create Account</h1>
      <p>Create your NutriTrack account.</p>

      <form>
        <div>
          <label htmlFor="name">Name</label>
          <input
            id="name"
            type="text"
            placeholder="Enter your name"
            required
          />
        </div>

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
            placeholder="Create a password"
            required
          />
        </div>

        <button type="submit">Register</button>
      </form>
    </div>
  );
}
