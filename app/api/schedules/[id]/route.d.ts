import { NextRequest, NextResponse } from 'next/server';

export type RouteHandlerContext = {
  params: {
    id: string;
  };
};

export type GetRouteHandler = (
  request: NextRequest,
  context: RouteHandlerContext
) => Promise<NextResponse>;