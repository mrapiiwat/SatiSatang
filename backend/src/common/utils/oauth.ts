import { Facebook, Google } from "arctic";

if (
  !Bun.env.GOOGLE_CLIENT_ID ||
  !Bun.env.GOOGLE_CLIENT_SECRET ||
  !Bun.env.GOOGLE_CALLBACK_URL
) {
  throw new Error("Missing Google OAuth Credentials");
}
if (
  !Bun.env.FACEBOOK_CLIENT_ID ||
  !Bun.env.FACEBOOK_CLIENT_SECRET ||
  !Bun.env.FACEBOOK_CALLBACK_URL
) {
  throw new Error("Missing Facebook OAuth Credentials");
}

export const googleAuth = new Google(
  Bun.env.GOOGLE_CLIENT_ID,
  Bun.env.GOOGLE_CLIENT_SECRET,
  Bun.env.GOOGLE_CALLBACK_URL
);

export const facebookAuth = new Facebook(
  Bun.env.FACEBOOK_CLIENT_ID,
  Bun.env.FACEBOOK_CLIENT_SECRET,
  Bun.env.FACEBOOK_CALLBACK_URL
);
