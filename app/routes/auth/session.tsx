import {
  Form,
  Link,
  redirect,
  useLoaderData,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "react-router";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { callAuthEndpoint } from "@/lib/auth-endpoint.server";
import { getServerSession } from "@/lib/auth.server";

export const meta: MetaFunction = () => {
  return [{ title: "Session | Mini Patro" }];
};

export async function loader({ request, context }: LoaderFunctionArgs) {
  const session = await getServerSession(request, context.cloudflare.env);

  if (!session?.user) {
    throw redirect("/auth/sign-in");
  }

  return { session };
}

export async function action({ request, context }: ActionFunctionArgs) {
  const authResponse = await callAuthEndpoint({
    request,
    env: context.cloudflare.env,
    path: "/api/auth/sign-out",
  });

  const headers = new Headers();
  const setCookie = authResponse.headers.get("set-cookie");

  if (setCookie) {
    headers.set("set-cookie", setCookie);
  }

  throw redirect("/auth/sign-in", { headers });
}

export default function SessionPage() {
  const loaderData = useLoaderData<typeof loader>();
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg items-center px-4 py-10">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Signed In</CardTitle>
          <CardDescription>
            Session data from Better Auth endpoint.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <dl className="space-y-2 text-sm">
            <div>
              <dt className="text-muted-foreground">Name</dt>
              <dd className="font-medium">{loaderData.session.user.name}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Email</dt>
              <dd className="font-medium">{loaderData.session.user.email}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">User ID</dt>
              <dd className="font-mono text-xs">{loaderData.session.user.id}</dd>
            </div>
          </dl>

          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link to="/">Open Calendar</Link>
            </Button>
            <Form method="post">
              <Button type="submit" variant="destructive">
                Sign Out
              </Button>
            </Form>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
