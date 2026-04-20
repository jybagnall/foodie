import UserLanding from "../pages/Home/UserLanding";
import BackToDash from "../UI/BackToDash";

export default function MenuLiveView() {
  return (
    <div className="min-h-screen">
      <div className="flex p-6">
        <div className="mb-4">
          <BackToDash
            url="/admin"
            dashboardName="Back to admin dashboard"
            title="Send invite"
          />
        </div>
      </div>

      <main className="p-4">
        <UserLanding />
      </main>
    </div>
  );
}
