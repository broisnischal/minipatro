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
  return [{ title: "Sign Up | Mini Patro" }];
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
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!name || !email || !password) {
    return { error: "Name, email, and password are required." };
  }

  const authResponse = await callAuthEndpoint({
    request,
    env: context.cloudflare.env,
    path: "/api/auth/sign-up/email",
    body: {
      name,
      email,
      password,
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

export default function SignUp() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-4 py-10">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Create account</CardTitle>
        </CardHeader>
        <CardContent>
          <Form className="space-y-4" method="post">
            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="name">
                Full name
              </label>
              <Input id="name" name="name" required />
            </div>

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
              <Input id="password" minLength={8} name="password" required type="password" />
            </div>

            {actionData?.error ? (
              <p className="text-sm text-destructive">{actionData.error}</p>
            ) : null}

            <Button className="w-full" disabled={isSubmitting} type="submit">
              {isSubmitting ? "Creating..." : "Create Account"}
            </Button>
          </Form>

          <p className="mt-4 text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link className="underline underline-offset-2" to="/auth/sign-in">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
