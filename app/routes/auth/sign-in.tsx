import {
  Form,
  Link,
  redirect,
  useActionData,
  useNavigation,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { callAuthEndpoint, getAuthErrorMessage } from "@/lib/auth-endpoint.server";
import { getServerSession } from "@/lib/auth.server";

export const meta: MetaFunction = () => {
  return [{ title: "Sign In | Mini Patro" }];
};

export async function loader({ request, context }: LoaderFunctionArgs) {
  const session = await getServerSession(request, context.cloudflare.env);

  if (session?.user) {
    throw redirect("/auth/session");
  }

  return null;
}

export async function action({ request, context }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const authResponse = await callAuthEndpoint({
    request,
    env: context.cloudflare.env,
    path: "/api/auth/sign-in/email",
    body: {
      email,
      password,
      rememberMe: true,
      callbackURL: "/auth/session",
    },
  });

  if (!authResponse.ok) {
    return { error: await getAuthErrorMessage(authResponse) };
  }

  const headers = new Headers();
  const setCookie = authResponse.headers.get("set-cookie");

  if (setCookie) {
    headers.set("set-cookie", setCookie);
  }

  throw redirect("/auth/session", { headers });
}

export default function SignIn() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-4 py-10">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
        </CardHeader>
        <CardContent>
          <Form className="space-y-4" method="post">
            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="email">
                Email
              </label>
              <Input id="email" name="email" required type="email" />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="password">
                Password
              </label>
              <Input id="password" name="password" required type="password" />
            </div>

            {actionData?.error ? (
              <p className="text-sm text-destructive">{actionData.error}</p>
            ) : null}

            <Button className="w-full" disabled={isSubmitting} type="submit">
              {isSubmitting ? "Signing in..." : "Sign In"}
            </Button>
          </Form>

          <p className="mt-4 text-sm text-muted-foreground">
            New here?{" "}
            <Link className="underline underline-offset-2" to="/auth/sign-up">
              Create an account
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
