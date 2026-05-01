import { authClient } from "@/lib/auth-client";

export default async function Page() {
  //   const session = await authClient.getSession({
  //     fetchOptions: {
  //       headers: await headers(),
  //       throw: true,
  //     },
  //   });

  // if (!session?.user) {
  //   redirect("/login");
  // }

  // const { data: customerState } = await authClient.customer.state({
  //   fetchOptions: {
  //     headers: await headers(),
  //   },
  // });

  return (
    <div>
      <h1>Onboarding</h1>
      <p>Welcome User</p>
      {/* <Dashboard session={session} customerState={customerState} /> */}
    </div>
  );
}
