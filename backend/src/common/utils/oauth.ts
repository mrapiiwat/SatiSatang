import { Facebook, Google } from "arctic";

if (
  !process.env.GOOGLE_CLIENT_ID ||
  !process.env.GOOGLE_CLIENT_SECRET ||
  !process.env.GOOGLE_CALLBACK_URL
) {
  throw new Error("Missing Google OAuth Credentials");
}
if (
  !process.env.FACEBOOK_CLIENT_ID ||
  !process.env.FACEBOOK_CLIENT_SECRET ||
  !process.env.FACEBOOK_CALLBACK_URL
) {
  throw new Error("Missing Facebook OAuth Credentials");
}

export const googleAuth = new Google(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_CALLBACK_URL
);

export const facebookAuth = new Facebook(
  process.env.FACEBOOK_CLIENT_ID,
  process.env.FACEBOOK_CLIENT_SECRET,
  process.env.FACEBOOK_CALLBACK_URL
);
