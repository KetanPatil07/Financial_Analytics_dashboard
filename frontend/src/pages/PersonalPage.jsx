import { useAuth } from "../context/AuthContext.jsx";

export default function PersonalPage() {
  const { user } = useAuth();
  return (
    <div className="page">
      <article className="panel profile-card">
        <img src={user?.avatar} alt="" />
        <div>
          <h2>{user?.name}</h2>
          <p>{user?.email}</p>
        </div>
      </article>
    </div>
  );
}
