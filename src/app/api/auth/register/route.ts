import { NextResponse } from "next/server";
import UserService from "@/services/auth.service";
import { errorHandler } from "@/lib/apiErrorHandler";

export const POST = errorHandler(async (request) => {
  const body = await request.json();
  const user = await UserService.localSignup(body);

  return NextResponse.json(user, { status: 201 });
});