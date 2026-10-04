import { NextRequest, NextResponse } from "next/server";
import { getSession, SessionUser } from "./auth";

export type TAuthUser = {
  user: SessionUser
}
export function withAuth<TParams = {}>(
  handler: (
    req: NextRequest,
    auth: TAuthUser,
    context: { params?: TParams }
  ) => Promise<NextResponse | void | Response> | NextResponse | Response
) {
  return async (req: NextRequest, context: { params: Promise<TParams> }) => {
    const auth = await getSession();
    console.log(auth)
    if (!auth) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const resolvedParams = await context.params

    return handler(req, { user: auth }, {
      ...context,
      params: resolvedParams,
    })
  };
}