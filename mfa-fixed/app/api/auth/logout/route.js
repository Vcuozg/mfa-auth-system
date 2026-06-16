// [FIX 3] API logout xóa httpOnly cookie từ server-side
export async function POST() {
  const response = Response.json({ message: "Logged out successfully" });
  response.headers.set(
    "Set-Cookie",
    "token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict"
  );
  return response;
}
