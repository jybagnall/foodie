import UserLanding from "../pages/Home/UserLanding";
import BackToAdminDash from "../UI/BackToAdminDash";

export default function MenuLiveView() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex p-6">
        <div className="mb-4">
          <BackToAdminDash title="Menu Preview" />
        </div>
      </div>

      <main className="p-4">
        <UserLanding />
      </main>
    </div>
  );
}
