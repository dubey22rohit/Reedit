import { EntityManager, IDatabaseDriver, Connection } from "@mikro-orm/core";
import { Request, Response } from "express";
import { Session } from "express-session";
export type MyContext = {
  em: EntityManager<IDatabaseDriver<Connection>>;
  req: Request;
  res: Response;
};

export interface CustomSessionData extends Session {
  userId: number;
  // You can add any additional data here.
}